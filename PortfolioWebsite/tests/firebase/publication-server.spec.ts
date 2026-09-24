import { account, blank, db, expect, fixturePNG, fixtureProject, publishRequest, test } from "./fixtures";

test.describe.configure({ mode: "serial" });
test.describe("publication ownership and server validation", () => {
test("SERVER-001 URL ownership regression: missing indexes, atomic rename, retries, and released names", async ({ request }) => {
  const owner = await account(request, "url-owner@example.com"), other = await account(request, "url-other@example.com");
  const publish = (handle: string, user = owner, revision = 0) => publishRequest(request, { headers: user.headers, data: { handle, snapshot: blank(handle), assets: {}, revision } });
  expect((await publish("url-original")).status()).toBe(200);
  const before = (await db.collection("publishedPortfolios").doc("url-original").get()).data()!;
  await db.collection("publishers").doc(owner.uid).delete();
  expect((await publish("url-second")).status()).toBe(409);
  expect((await db.collection("publishedPortfolios").where("uid", "==", owner.uid).get()).size).toBe(1);
  expect((await publish("url-occupied", other)).status()).toBe(200);
  const rename = (handle: string, currentHandle = "url-original", revision = 1) => request.patch("/api/publish", { headers: owner.headers, data: { handle, currentHandle, revision } });
  expect((await rename("url-occupied")).status()).toBe(409);
  expect((await request.get("/p/url-original")).status()).toBe(200);
  expect((await rename("url-renamed")).status()).toBe(200);
  expect((await rename("url-renamed")).status()).toBe(200);
  const moved = (await db.collection("publishedPortfolios").doc("url-renamed").get()).data()!;
  expect(moved.profile).toEqual(before.profile); expect(moved.projects).toEqual(before.projects); expect(moved.assets).toEqual(before.assets);
  expect(moved.revision).toBe(2); expect(moved.contentRevision).toBe(1);
  expect((await db.collection("publishers").doc(owner.uid).get()).data()?.handle).toBe("url-renamed");
  for (const suffix of ["", "/about", "/projects/considered-project"]) expect((await request.get("/p/url-original" + suffix)).status()).toBe(404);
  expect((await publish("url-original", owner, 1)).status()).toBe(409);
  const newcomer = await account(request, "url-new@example.com");
  expect((await publish("url-original", newcomer)).status()).toBe(200);
  await db.collection("publishers").doc(owner.uid).set({ handle: "url-occupied", lastPublish: 0 }, { merge: true });
  expect((await publish("url-renamed", owner, 2)).status()).toBe(200);
  expect((await db.collection("publishers").doc(owner.uid).get()).data()?.handle).toBe("url-renamed");
  await db.collection("publishedPortfolios").doc("url-duplicate").set({ ...moved, handle: "url-duplicate" });
  expect((await rename("url-third", "url-renamed", 3)).status()).toBe(409);
  expect((await publish("url-renamed", owner, 3)).status()).toBe(409);
});

test("SERVER-002 URL races and deletion retries never take another account's reused name", async ({ request }) => {
  const owner = await account(request, "reuse@example.com"), other = await account(request, "rival@example.com");
  const publish = (handle: string, user = owner, revision = 0) => publishRequest(request, { headers: user.headers, data: { handle, snapshot: blank(user.uid), assets: {}, revision } });
  await publish("race-original"); await publish("race-rival", other);
  const rename = (user: typeof owner, currentHandle: string, handle: string, revision = 1) => request.patch("/api/publish", { headers: user.headers, data: { currentHandle, handle, revision } });
  const race = await Promise.all([rename(owner, "race-original", "race-target"), rename(other, "race-rival", "race-target")]);
  expect(race.map(r => r.status()).sort()).toEqual([200, 409]);
  const current = (await (await request.get("/api/publish", { headers: owner.headers })).json()).publication;
  await db.collection("publishers").doc(owner.uid).set({ lastPublish: 0 }, { merge: true });
  const concurrent = await Promise.all([rename(owner, current.handle, "race-final", current.revision), publish(current.handle, owner, current.revision)]);
  expect(concurrent.map(r => r.status()).sort()).toEqual([200, 409]);
  expect((await db.collection("publishedPortfolios").where("uid", "==", owner.uid).get()).size).toBe(1);
  const final = (await (await request.get("/api/publish", { headers: owner.headers })).json()).publication;
  const deletion = () => request.delete("/api/account", { headers: { ...owner.headers, "X-Confirm-Delete": "delete-account" } });
  const deleteRace = await Promise.all([deletion(), rename(owner, final.handle, "deleted-race", final.revision)]);
  expect(deleteRace[0].status()).toBe(200);
  expect([200, 401, 409]).toContain(deleteRace[1].status());
  expect((await db.collection("publishedPortfolios").where("uid", "==", owner.uid).get()).size).toBe(0);
  const recreated = await account(request, "reuse@example.com"); expect(recreated.uid).not.toBe(owner.uid);
  expect((await publish(final.handle, recreated)).status()).toBe(200);
  // The Auth emulator always checks account existence, even for verifyIdToken(false).
  // A token from a fully removed account is rejected, and cannot affect its successor.
  expect((await deletion()).status()).toBe(401);
  expect((await db.collection("publishedPortfolios").doc(final.handle).get()).data()?.uid).toBe(recreated.uid);
  expect((await request.get("/api/publish", { headers: recreated.headers })).status()).toBe(200);
});

test("SERVER-003 simultaneous first publishes keep one website per account", async ({ request }) => {
  const owner = await account(request, "same-owner-race@example.com");
  const uploaded = await request.post("/api/publish/image", { headers: owner.headers, data: fixturePNG });
  expect(uploaded.status()).toBe(200);
  const id = (await uploaded.json()).id as string, src = "/images/required-project.png";
  const data = { snapshot: { ...blank("One account"), projects: [fixtureProject(src)] }, assets: { [src]: id }, revision: 0 };
  const attempts = await Promise.all([
    request.post("/api/publish", { headers: owner.headers, data: { ...data, handle: "same-owner-first" } }),
    request.post("/api/publish", { headers: owner.headers, data: { ...data, handle: "same-owner-second" } })
  ]);
  expect(attempts.map(response => response.status()).sort()).toEqual([200, 409]);
  expect((await db.collection("publishedPortfolios").where("uid", "==", owner.uid).get()).size).toBe(1);
});

test("SERVER-004 partial account deletion cleanup is UID-scoped after another account claims its name", async ({ request }) => {
  const owner = await account(request, "partial-delete@example.com"), other = await account(request, "claim-partial@example.com");
  const data = { handle: "partial-reuse", snapshot: blank("Original"), assets: {}, revision: 0 };
  expect((await publishRequest(request, { headers: owner.headers, data })).status()).toBe(200);
  // Reproduce the persisted state after the first deletion transaction but before cleanup.
  await db.runTransaction(async tx => {
    tx.set(db.collection("publishers").doc(owner.uid), { deleting: true, handle: data.handle }, { merge: true });
    tx.delete(db.collection("publishedPortfolios").doc(data.handle));
  });
  expect((await publishRequest(request, { headers: other.headers, data: { ...data, snapshot: blank("New owner") } })).status()).toBe(200);
  expect((await request.delete("/api/account", { headers: { ...owner.headers, "X-Confirm-Delete": "delete-account" } })).status()).toBe(200);
  const publication = (await (await request.get("/api/publish", { headers: other.headers })).json()).publication;
  expect(publication.profile.name).toBe("New owner");
  expect((await db.collection("publishedPortfolios").doc(data.handle).get()).data()?.uid).toBe(other.uid);
});

test("SERVER-005 publication requirements reject missing biography and projects on the server", async ({ request }) => {
  const owner = await account(request, "requirements@example.com");
  const body = { handle: "requirements", snapshot: blank("Required name"), revision: 0, assets: {} };
  const empty = await request.post("/api/publish", { headers: owner.headers, data: body });
  expect(empty.status()).toBe(400); expect((await empty.json()).error).toContain("at least one completed project");
  const biography = await publishRequest(request, { headers: owner.headers, data: { ...body, snapshot: { ...body.snapshot, profile: { ...body.snapshot.profile, biography: "  " } } } });
  expect(biography.status()).toBe(400); expect((await biography.json()).error).toContain("Biography is required");
  expect((await publishRequest(request, { headers: owner.headers, data: body })).status()).toBe(200);
});

});
