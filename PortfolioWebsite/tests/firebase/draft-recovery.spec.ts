import { spawn } from "node:child_process";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { account, blank, db, draftBody, expect, fixturePNG, fixtureProject, loginStudio, publishRequest, test } from "./fixtures";

test.describe.configure({ mode: "serial" });
test.describe("cloud draft recovery and conflicts", () => {
test("CLOUD-001 account drafts open when the obsolete active-draft localStorage key throws", async ({ page, request }) => {
  const owner = await account(request, "storage-pointer-failure@example.com");
  expect((await request.put("/api/draft", { headers: owner.headers, data: draftBody("Pointer-free account draft") })).status()).toBe(200);
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    const removeItem = Storage.prototype.removeItem;
    Storage.prototype.getItem = function (key) {
      if (key === "portfolio-active-draft") throw new Error("obsolete active-draft storage is unavailable");
      return getItem.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "portfolio-active-draft") throw new Error("obsolete active-draft storage is unavailable");
      return setItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function (key) {
      if (key === "portfolio-active-draft") throw new Error("obsolete active-draft storage is unavailable");
      return removeItem.call(this, key);
    };
  });
  await loginStudio(page, "storage-pointer-failure@example.com");
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Pointer-free account draft");
  await expect(page.getByText("Saved to your account", { exact: true })).toBeVisible();
});

test("CLOUD-002 account autosave resumes unpublished work and images on a new browser and after local storage is cleared", async ({ page, request, browser }) => {
  const owner = await account(request, "autosave@example.com");
  await loginStudio(page, "autosave@example.com");
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Returning Designer");
  await page.getByRole("button", { name: "08 Projects", exact: true }).click();
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await page.getByRole("textbox", { name: "Project title", exact: true }).fill("An unfinished idea");
  await page.getByRole("button", { name: "Images", exact: true }).click();
  const cropPng = await page.evaluate(() => { const c = document.createElement("canvas"); c.width = 240; c.height = 180; const ctx = c.getContext("2d")!; ctx.fillStyle = "#355f52"; ctx.fillRect(0, 0, 240, 180); return c.toDataURL("image/png").split(",")[1]; });
  await page.getByLabel("Upload thumbnail", { exact: true }).setInputFiles({ name:"private.png", mimeType:"image/png", buffer:Buffer.from(cropPng, "base64") });
  await page.getByRole("button", { name: "Use this crop", exact: true }).click();
  await expect(page.getByText("Saved to your account", { exact: true })).toBeVisible();
  const remote = await (await request.get("/api/draft", { headers: owner.headers })).json();
  expect(remote.draft.content.projectDraft.title).toBe("An unfinished idea"); expect(remote.publication).toBeNull();
  const secondContext = await browser.newContext(), second = await secondContext.newPage();
  await loginStudio(second, "autosave@example.com");
  await expect(second.getByRole("button", { name: "Images", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => second.locator("img").evaluateAll(imgs => imgs.length > 0 && imgs.every(img => (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
  // Remove only the disposable editor cache, retaining Firebase Auth, and reopen the production app.
  await second.evaluate(() => new Promise<void>((resolve, reject) => { const r = indexedDB.deleteDatabase("portfolio-browser-studio"); r.onsuccess = () => resolve(); r.onerror = () => reject(r.error); }));
  await second.reload();
  await second.getByRole("button", { name: "Details", exact: true }).click();
  await expect(second.getByRole("textbox", { name: "Project title", exact: true })).toHaveValue("An unfinished idea");
  await second.getByRole("button", { name: "01 Your name", exact: true }).click();
  await expect(second.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Returning Designer");
  await expect(second.getByText("Saved to your account", { exact: true })).toBeVisible();
  for (const width of [375, 768, 1440]) {
    await second.setViewportSize({ width, height: 960 });
    expect(await second.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page: second }).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
    await second.screenshot({ path: `.qa/screenshots/autosave-resume-${width}.png`, fullPage: true });
  }
  await secondContext.close();
});

test("CLOUD-003 offline edits retry and divergent devices preserve both versions with an explicit choice", async ({ page, request, browser }) => {
  const owner = await account(request, "conflicts@example.com");
  expect((await request.put("/api/draft", { headers: owner.headers, data: draftBody("Starting draft") })).status()).toBe(200);
  await loginStudio(page, "conflicts@example.com");
  const context = await browser.newContext(), other = await context.newPage(); await loginStudio(other, "conflicts@example.com");
  await expect(other.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Starting draft");
  await page.route("**/api/draft", route => route.request().method() === "PUT" ? route.abort("internetdisconnected") : route.continue());
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Offline work");
  await expect(page.getByText("Saved on this device—sync pending", { exact: true })).toBeVisible();
  await other.getByRole("textbox", { name: "Your name", exact: true }).fill("Other device work");
  await expect(other.getByText("Saved to your account", { exact: true })).toBeVisible();
  await page.unroute("**/api/draft"); await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByRole("heading", { name: "Choose which draft to continue" })).toBeVisible();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `.qa/screenshots/autosave-conflict-${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Continue device version", exact: true }).click();
  await expect(page.getByText("Saved to your account", { exact: true })).toBeVisible();
  expect((await (await request.get("/api/draft", { headers: owner.headers })).json()).draft.content.profile.name).toBe("Offline work");
  await page.getByText("Draft backups & storage", { exact: true }).click();
  await expect(page.getByRole("button", { name: /Download recovery 1/ })).toBeVisible();
  await page.reload(); await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Offline work");
  await other.getByRole("textbox", { name: "Your name", exact: true }).fill("Another competing edit");
  await expect(other.getByRole("heading", { name: "Choose which draft to continue" })).toBeVisible();
  await other.getByRole("button", { name: "Continue account version", exact: true }).click();
  await expect(other.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Offline work");
  await expect(other.getByText("Saved to your account", { exact: true })).toBeVisible();
  await context.close();
});

test("CLOUD-004 published-only accounts recover automatically and failed lookups never create a blank cloud draft", async ({ page, request }) => {
  const owner = await account(request, "published-only@example.com");
  expect((await publishRequest(request, { headers: owner.headers, data: { handle:"published-only", snapshot:blank("Existing published work"), assets:{}, revision:0 } })).status()).toBe(200);
  await page.route("**/api/draft", route => route.fulfill({ status:503, json:{error:"Account lookup temporarily unavailable. Retry."} }));
  await loginStudio(page, "published-only@example.com");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("temporarily unavailable");
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveCount(0);
  expect((await db.collection("publishers").doc(owner.uid).collection("drafts").doc("current").get()).exists).toBe(false);
  await page.unroute("**/api/draft"); await page.getByRole("button", { name:"Retry opening portfolio" }).click();
  await expect(page.getByRole("button", { name:"Publish updates", exact:true })).toBeVisible();
  await page.getByRole("button", { name:"01 Your name", exact:true }).click();
  await expect(page.getByRole("textbox", { name:"Your name", exact:true })).toHaveValue("Existing published work");
  await page.getByRole("textbox", { name:"Your name", exact:true }).fill("Private revision");
  await expect(page.getByText("Saved to your account", { exact:true })).toBeVisible();
  expect((await db.collection("publishedPortfolios").doc("published-only").get()).data()?.profile.name).toBe("Existing published work");
});

test("CLOUD-005 legacy device edits migrate and image failure leaves restore untouched", async ({ page, request }) => {
  const owner = await account(request, "migration@example.com");
  await page.goto("/studio");
  await page.evaluate(async uid => {
    const value = { format:"portfolio-draft", version:1, profile:{name:"Legacy device work",biography:"Unpublished notes",headshotImage:"",education:[],tools:[],jobs:[]}, projects:[], images:{}, section:0, projectDraft:null, publication:null, ownerUid:uid, updatedAt:new Date().toISOString() };
    await new Promise<void>((resolve,reject) => {
      const r=indexedDB.open("portfolio-browser-studio",2);
      r.onupgradeneeded=()=>{for(const name of ["drafts","deletedAccounts"])if(!r.result.objectStoreNames.contains(name))r.result.createObjectStore(name);};
      r.onerror=()=>reject(r.error);
      r.onsuccess=()=>{const d=r.result;try{const t=d.transaction("drafts","readwrite");t.objectStore("drafts").put(value,uid);t.oncomplete=()=>{d.close();resolve();};t.onerror=t.onabort=()=>{d.close();reject(t.error);};}catch(error){d.close();reject(error);}};
    });
  }, owner.uid);
  await loginStudio(page, "migration@example.com");
  await expect(page.getByRole("textbox", { name:"Your name",exact:true })).toHaveValue("Legacy device work");
  await expect(page.getByText("Saved to your account",{exact:true})).toBeVisible();
  const uploaded = await request.post("/api/publish/image",{headers:owner.headers,data:fixturePNG}); const {id}=await uploaded.json();
  const snapshot=blank("Public snapshot");snapshot.profile.headshotImage="/images/published.png";
  expect((await publishRequest(request,{headers:owner.headers,data:{handle:"migration",snapshot,revision:0,assets:{"/images/published.png":id}}})).status()).toBe(200);
  await page.getByRole("button",{name:"09 Publish",exact:true}).click();
  page.on("dialog",d=>d.accept());
  await page.route("**/v0/b/**",route=>route.fulfill({status:503,body:"Image unavailable"}));
  await page.getByRole("button",{name:"Restore last published version",exact:true}).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("image could not be restored");
  await page.getByRole("button",{name:"01 Your name",exact:true}).click();
  await expect(page.getByRole("textbox",{name:"Your name",exact:true})).toHaveValue("Legacy device work");
  await expect(page.getByText("Saved to your account",{exact:true})).toBeVisible();
  expect((await (await request.get("/api/draft",{headers:owner.headers})).json()).draft.content.profile.name).toBe("Legacy device work");
});

test("CLOUD-006 a replacement production server reads existing cloud drafts without seeding or resetting them", async ({ request }) => {
  const owner = await account(request,"restart@example.com");
  expect((await request.put("/api/draft",{headers:owner.headers,data:draftBody("Survives application replacement")})).status()).toBe(200);
  const env = { ...process.env, PORTFOLIO_CONTENT_DIR:path.resolve(".qa/firebase-content"), PORTFOLIO_ACCOUNT_DIR:path.resolve(".qa/firebase-accounts"), PORTFOLIO_BUILD_DIR:".next-qa-firebase", PORTFOLIO_DISABLE_LOCAL_EDITOR:"1", PORTFOLIO_FIREBASE_EMULATORS:"1", FIREBASE_PROJECT_ID:"demo-portfolio", FIREBASE_STORAGE_BUCKET:"demo-portfolio.firebasestorage.app", FIREBASE_WEB_API_KEY:"demo-test-key", FIREBASE_WEB_APP_ID:"demo-test-app", FIREBASE_AUTH_DOMAIN:"localhost" };
  const child = spawn(process.execPath,[path.resolve("node_modules/next/dist/bin/next"),"start","--hostname","127.0.0.1","--port","3103"],{env,stdio:"ignore"});
  try {
    await expect.poll(async()=>{try{return (await request.get("http://127.0.0.1:3103/api/draft",{headers:owner.headers,timeout:1500})).status();}catch{return 0;}}).toBe(200);
    const saved=await (await request.get("http://127.0.0.1:3103/api/draft",{headers:owner.headers})).json();
    expect(saved.draft.content.profile.name).toBe("Survives application replacement");expect(saved.draft.revision).toBe(1);
  } finally { child.kill("SIGTERM"); await new Promise<void>(resolve=>{if(child.exitCode!==null)resolve();else child.once("exit",()=>resolve());}); }
});

test("CLOUD-007 opening an old account draft does not silently adopt a newer publication revision", async ({ page, request }) => {
  const owner=await account(request,"publication-revision@example.com");
  const first=await publishRequest(request,{headers:owner.headers,data:{handle:"publication-revision",snapshot:blank("First public version"),assets:{},revision:0}});
  const publication=await first.json();
  const privateImage = await request.post("/api/draft/image", { headers: owner.headers, data: fixturePNG });
  const privateAsset = (await privateImage.json()).id;
  const privateDraft = draftBody("Private work based on version one");
  const readyContent = { ...privateDraft.content, projects: [fixtureProject("/images/required-project.png")] };
  expect((await request.put("/api/draft",{headers:owner.headers,data:{...privateDraft, content: readyContent, assets: { "/images/required-project.png": privateAsset },publication:{handle:publication.handle,revision:publication.revision,publishedAt:publication.publishedAt}}})).status()).toBe(200);
  await db.collection("publishers").doc(owner.uid).update({lastPublish:0});
  expect((await publishRequest(request,{headers:owner.headers,data:{handle:"publication-revision",snapshot:blank("Newer public version"),assets:{},revision:1}})).status()).toBe(200);
  await loginStudio(page,"publication-revision@example.com");
  await page.getByRole("button",{name:"09 Publish",exact:true}).click();
  await page.getByRole("button",{name:"Publish updates",exact:true}).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("A newer version was published");
  expect((await db.collection("publishedPortfolios").doc("publication-revision").get()).data()?.profile.name).toBe("Newer public version");
});
});
