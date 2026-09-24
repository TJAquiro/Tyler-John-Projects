import { MAX_SERVICE_STORAGE_BYTES } from "../../lib/portfolio-snapshot";
import http from "node:http";
import { getStorage } from "firebase-admin/storage";
import { account, app, blank, db, draftBody, expect, fixturePNG, publishRequest, test } from "./fixtures";

test.describe.configure({ mode: "serial" });
test.describe("image uploads and draft API", () => {
test("MEDIA-001 chunked images cross the old limit, preserve bytes, and enforce ownership and 500 MB boundary", async ({ request }) => {
  const owner=await account(request,"large-image@example.com"), other=await account(request,"other-image@example.com");
  const cap=500*1024*1024;
  const boundary=await request.post("/api/publish/image/chunks",{headers:owner.headers,data:{size:cap}}); expect(boundary.status()).toBe(200);
  const abandonedId=(await boundary.json()).id as string;
  await db.collection("publishers").doc(owner.uid).collection("assets").doc(abandonedId).update({expiresAt:0});
  const replacement=await request.post("/api/publish/image/chunks",{headers:owner.headers,data:{size:cap}}); expect(replacement.status()).toBe(200);
  expect((await db.collection("publishers").doc(owner.uid).collection("assets").doc(abandonedId).get()).exists).toBe(false);
  expect((await request.delete(`/api/publish/image/chunks?id=${(await replacement.json()).id}`,{headers:owner.headers})).status()).toBe(200);
  expect((await request.post("/api/publish/image/chunks",{headers:owner.headers,data:{size:cap+1}})).status()).toBe(413);
  const image=Buffer.alloc(9*1024*1024,73); Buffer.from([137,80,78,71,13,10,26,10]).copy(image);
  expect((await request.post("/api/publish/image", { headers: owner.headers, data: image })).status()).toBe(413);
  const started=await request.post("/api/publish/image/chunks",{headers:owner.headers,data:{size:image.length}}); const {id}=await started.json(); const path=`/api/publish/image/chunks?id=${id}`;
  expect((await request.put(path+"&part=0",{headers:other.headers,data:image.subarray(0,8*1024*1024)})).status()).toBe(409);
  expect((await request.put(path+"&part=0",{headers:owner.headers,data:image.subarray(0,8*1024*1024)})).status()).toBe(200);
  expect((await request.put(path+"&part=0",{headers:owner.headers,data:image.subarray(0,8*1024*1024)})).status()).toBe(409);
  expect((await request.put(path+"&part=1",{headers:owner.headers,data:image.subarray(8*1024*1024)})).status()).toBe(200);
  const completed=await request.patch(path,{headers:owner.headers}); expect(await completed.text()).toContain(id); expect(completed.status()).toBe(200);
  const asset=(await db.collection("publishers").doc(owner.uid).collection("assets").doc(id).get()).data()!;
  expect(asset.size).toBe(image.length); expect(await (await request.get(asset.url)).body()).toEqual(image);
  const snapshot=blank("Large image"); snapshot.profile.headshotImage="/images/large.png";
  expect((await publishRequest(request,{headers:owner.headers,data:{handle:"large-image",snapshot,revision:0,assets:{"/images/large.png":id}}})).status()).toBe(200);
  const unverified=await account(request,"delete-unverified@example.com",false);
  expect((await request.delete("/api/account",{headers:{...unverified.headers,"X-Confirm-Delete":"delete-account"}})).status()).toBe(200);
});

test("MEDIA-002 global image quotas and admission leases bound cross-account resource use", async ({ request }) => {
  const owner = await account(request, "global-limits@example.com");
  const quota = db.collection("serviceState").doc("imageQuota");
  await quota.set({ storageBytes: MAX_SERVICE_STORAGE_BYTES - 4, uploadDay: new Date().toISOString().slice(0, 10), uploads: 0 });
  expect((await request.post("/api/publish/image/chunks", { headers: owner.headers, data: { size: 5 } })).status()).toBe(413);
  const future = Date.now() + 60000;
  await db.collection("serviceState").doc("uploadAdmission").set({ leases: {
    a: { uid: "a", bytes: 1, expiresAt: future }, b: { uid: "b", bytes: 1, expiresAt: future },
    c: { uid: "c", bytes: 1, expiresAt: future }, d: { uid: "d", bytes: 1, expiresAt: future }
  } });
  expect((await request.post("/api/publish/image", { headers: owner.headers, data: fixturePNG })).status()).toBe(429);
  await db.collection("serviceState").doc("uploadAdmission").set({ leases: { stale: { uid: "x", bytes: 8 * 1024 * 1024, expiresAt: Date.now() - 1 } } });
  await quota.set({ storageBytes: 0, uploadDay: new Date().toISOString().slice(0, 10), uploads: 0 });
  expect((await request.post("/api/publish/image", { headers: owner.headers, data: fixturePNG })).status()).toBe(200);
});

test("MEDIA-003 an upload started before deletion cannot recreate the account's image library", async ({ request }) => {
  const owner=await account(request,"upload-delete-race@example.com");
  let finishBody!: () => void;
  const response = new Promise<number>((resolve,reject)=>{
    const req=http.request("http://127.0.0.1:3102/api/publish/image",{method:"POST",headers:{...owner.headers,"Content-Type":"image/png","Transfer-Encoding":"chunked"}},res=>{res.resume();res.on("end",()=>resolve(res.statusCode!));});
    req.on("error",reject); req.write(Buffer.from([137,80,78,71,13,10,26,10])); finishBody=()=>req.end(Buffer.alloc(1024));
  });
  // Allow authentication to finish while the request body is deliberately incomplete.
  await new Promise(resolve=>setTimeout(resolve,500));
  try { expect((await request.delete("/api/account",{headers:{...owner.headers,"X-Confirm-Delete":"delete-account"}})).status()).toBe(200); }
  finally { finishBody(); }
  expect([401,409]).toContain(await response);
  expect((await db.collection("publishers").doc(owner.uid).get()).exists).toBe(false);
  expect((await getStorage(app).bucket("demo-portfolio.firebasestorage.app").getFiles({prefix:`portfolios/${owner.uid}/`}))[0]).toHaveLength(0);
});

test("MEDIA-004 drafts save incomplete content while cloud images require verification and remain private", async ({ request }) => {
  const owner = await account(request, "draft-owner@example.com"), other = await account(request, "draft-other@example.com"), unverified = await account(request, "draft-unverified@example.com", false);
  expect((await request.put("/api/draft", { data: draftBody() })).status()).toBe(401);
  expect((await request.put("/api/draft", { headers: unverified.headers, data: draftBody("Unverified text") })).status()).toBe(200);
  expect((await request.post("/api/draft/image", { headers: unverified.headers, data: fixturePNG })).status()).toBe(403);
  expect((await request.post("/api/draft/image/chunks", { headers: unverified.headers, data: { size: fixturePNG.length } })).status()).toBe(403);
  const image = await request.post("/api/draft/image", { headers: owner.headers, data: fixturePNG }); expect(image.status()).toBe(200);
  const { id } = await image.json();
  expect((await request.get(`/api/draft/image?id=${id}`)).status()).toBe(401);
  expect((await request.get(`/api/draft/image?id=${id}`, { headers: other.headers })).status()).toBe(404);
  expect(await (await request.get(`/api/draft/image?id=${id}`, { headers: owner.headers })).body()).toEqual(fixturePNG);
  const large = Buffer.alloc(9 * 1024 * 1024, 73); fixturePNG.subarray(0, 8).copy(large);
  const started = await request.post("/api/draft/image/chunks", { headers: owner.headers, data: { size: large.length } }); expect(started.status()).toBe(200);
  const chunkPath = `/api/draft/image/chunks?id=${(await started.json()).id}`;
  expect((await request.put(chunkPath + "&part=0", { headers: other.headers, data: large.subarray(0, 8 * 1024 * 1024) })).status()).toBe(409);
  expect((await request.put(chunkPath + "&part=0", { headers: owner.headers, data: large.subarray(0, 8 * 1024 * 1024) })).status()).toBe(200);
  expect((await request.put(chunkPath + "&part=1", { headers: owner.headers, data: large.subarray(8 * 1024 * 1024) })).status()).toBe(200);
  const finished = await request.patch(chunkPath, { headers: owner.headers }); expect(finished.status()).toBe(200);
  expect(await (await request.get(`/api/draft/image?id=${(await finished.json()).id}`, { headers: owner.headers })).body()).toEqual(large);
  const object = getStorage(app).bucket("demo-portfolio.firebasestorage.app").file(`portfolios/${owner.uid}/draft/${id}`);
  const [metadata] = await object.getMetadata(); expect(metadata.metadata?.firebaseStorageDownloadTokens).toBeUndefined();
  const direct = `http://127.0.0.1:9199/v0/b/demo-portfolio.firebasestorage.app/o/${encodeURIComponent(object.name)}?alt=media`;
  expect((await request.get(direct)).ok()).toBe(false);
  const body = draftBody(""); body.content.projectDraft = { id:"unfinished", title:"", thumbnail:"/images/private.png", images:[], date:"", description:"", technologies:[], link:"", slug:"" }; body.assets["/images/private.png"] = id;
  expect((await request.put("/api/draft", { headers: owner.headers, data: body })).status()).toBe(200);
  expect((await request.put("/api/draft", { headers: owner.headers, data: body })).status()).toBe(409);
  expect((await request.put("/api/draft", { headers: other.headers, data: body })).status()).toBe(400);
  const saved = await (await request.get("/api/draft", { headers: owner.headers })).json();
  expect(saved.draft.content).toEqual({ ...body.content, feedback: { touched: [], attempted: false } }); expect(saved.draft.revision).toBe(1); expect(saved.publication).toBeNull();
  expect(JSON.stringify(saved.draft)).not.toContain("base64");
  expect((await request.put("/api/draft", { headers: owner.headers, data: { ...body, revision: 1, version: 2 } })).status()).toBe(400);
  expect((await request.put("/api/draft", { headers: owner.headers, data: { ...body, revision: 1, content: { ...body.content, projectDraft: { ...body.content.projectDraft, link: "javascript:alert(1)" } } } })).status()).toBe(400);
  const asset = db.collection("publishers").doc(owner.uid).collection("draftAssets").doc(id);
  await asset.update({ writingUntil: Date.now() + 60000 });
  expect((await request.delete("/api/account", { headers: { ...owner.headers, "X-Confirm-Delete":"delete-account" } })).status()).toBe(409);
  await asset.update({ writingUntil: 0 });
  expect((await request.delete("/api/account", { headers: { ...owner.headers, "X-Confirm-Delete":"delete-account" } })).status()).toBe(200);
  expect((await object.exists())[0]).toBe(false);
  expect((await db.collection("publishers").doc(owner.uid).collection("drafts").doc("current").get()).exists).toBe(false);
  expect((await request.put("/api/draft", { headers: owner.headers, data: { ...body, revision: 1 } })).status()).toBe(401);
});

test("MEDIA-005 restore repairs missing and foreign mappings using UID and rejects ambiguous or dangling records", async ({ request }) => {
  const owner = await account(request, "restore-owner@example.com"), other = await account(request, "restore-other@example.com");
  for (const [user, handle] of [[owner, "restore-owner"], [other, "restore-other"]] as const) expect((await publishRequest(request, { headers: user.headers, data: { handle, snapshot: blank(handle), assets: {}, revision: 0 } })).status()).toBe(200);
  const ownerRef = db.collection("publishers").doc(owner.uid);
  await ownerRef.delete();
  expect((await (await request.get("/api/publish", { headers: owner.headers })).json()).publication.handle).toBe("restore-owner");
  expect((await ownerRef.get()).data()?.handle).toBe("restore-owner");
  await ownerRef.update({ handle: "restore-other" });
  expect((await (await request.get("/api/publish", { headers: owner.headers })).json()).publication.profile.name).toBe("restore-owner");
  const site = (await db.collection("publishedPortfolios").doc("restore-owner").get()).data()!;
  await db.collection("publishedPortfolios").doc("duplicate-owner").set(site);
  expect((await request.get("/api/publish", { headers: owner.headers })).status()).toBe(409);
  await db.collection("publishedPortfolios").doc("duplicate-owner").delete();
  await db.collection("publishedPortfolios").doc("restore-owner").delete();
  expect((await request.get("/api/publish", { headers: owner.headers })).status()).toBe(409);
  const fresh = await account(request, "never-published@example.com");
  expect((await (await request.get("/api/publish", { headers: fresh.headers })).json()).publication).toBeNull();
});

});
