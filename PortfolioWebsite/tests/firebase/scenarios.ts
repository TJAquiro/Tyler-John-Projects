import { IMAGE_CHUNK_BYTES, MAX_SERVICE_STORAGE_BYTES } from "../../lib/portfolio-snapshot";
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { getStorage } from "firebase-admin/storage";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { account, addCompleteProject, app, auth, blank, db, draftBody, expect, fixturePNG, fixtureProject, loginStudio, publishRequest, test } from "./fixtures";

export function registerPublicationServerTests() {
test.describe("publication ownership and server validation", () => {
test("URL ownership regression: missing indexes, atomic rename, retries, and released names", async ({ request }) => {
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

test("URL races and deletion retries never take another account's reused name", async ({ request }) => {
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

test("simultaneous first publishes keep one website per account", async ({ request }) => {
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

test("partial account deletion cleanup is UID-scoped after another account claims its name", async ({ request }) => {
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

test("publication requirements reject missing biography and projects on the server", async ({ request }) => {
  const owner = await account(request, "requirements@example.com");
  const body = { handle: "requirements", snapshot: blank("Required name"), revision: 0, assets: {} };
  const empty = await request.post("/api/publish", { headers: owner.headers, data: body });
  expect(empty.status()).toBe(400); expect((await empty.json()).error).toContain("at least one completed project");
  const biography = await publishRequest(request, { headers: owner.headers, data: { ...body, snapshot: { ...body.snapshot, profile: { ...body.snapshot.profile, biography: "  " } } } });
  expect(biography.status()).toBe(400); expect((await biography.json()).error).toContain("Biography is required");
  expect((await publishRequest(request, { headers: owner.headers, data: body })).status()).toBe(200);
});

});
}

export function registerPublishingStudioTests() {
test.describe("publishing studio workflow", () => {
test("draft indicators, actionable publishing errors, automatic project commit, and URL editor", async ({ page, request, browser }) => {
  const owner = await account(request, "feedback@example.com");
  await loginStudio(page, "feedback@example.com");
  const nav = page.getByRole("navigation", { name: "Portfolio setup" });
  await expect(nav.getByText("Needs attention")).toHaveCount(0);
  await page.getByLabel("Your name", { exact: true }).focus(); await page.keyboard.press("Tab");
  await expect(nav.getByRole("button", { name: /Your name/ })).toContainText("Needs attention");
  await page.getByLabel("Your name", { exact: true }).fill("Case Study Designer");
  await expect(nav.getByText("Needs attention")).toHaveCount(0);
  await nav.getByRole("button", { name: /Homepage/ }).click();
  await page.getByLabel("Homepage tagline").focus(); await page.keyboard.press("Tab");
  await expect(nav.getByRole("button", { name: /Homepage/ })).not.toContainText("Needs attention");
  await nav.getByRole("button", { name: /Education/ }).click(); await page.getByRole("button", { name: "+ Add education" }).click();
  await page.getByLabel("Institution", { exact: true }).focus(); await page.keyboard.press("Tab");
  await expect(nav.getByRole("button", { name: /Education/ })).toContainText("Needs attention");
  await page.getByRole("button", { name: "Remove education 1" }).click();
  await expect(nav.getByRole("button", { name: /Education/ })).not.toContainText("Needs attention");
  await nav.getByRole("button", { name: /Publish/ }).click(); await page.getByLabel("Portfolio address", { exact: true }).fill("feedback-site");
  let uploads = 0; page.on("request", req => { if (req.url().includes("/api/publish/image")) uploads++; });
  await page.getByRole("button", { name: "Publish portfolio", exact: true }).click();
  const errors = page.getByRole("region", { name: "A few things need attention before publishing" });
  await expect(errors).toBeVisible(); expect(uploads).toBe(0);
  await expect(nav.getByRole("button", { name: /Biography/ })).toContainText("Needs attention");
  await expect(nav.getByRole("button", { name: /Projects/ })).toContainText("Needs attention");
  await errors.getByRole("button", { name: /Biography:/ }).click();
  await expect(page.getByLabel("Biography", { exact: true })).toBeFocused();
  await page.getByLabel("Biography", { exact: true }).fill("I design clear, useful experiences.");
  await expect(page.getByText("Saved to your account", { exact: true })).toBeVisible();
  await page.reload(); await expect(errors).toBeVisible();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `.qa/screenshots/url-draft-errors-${width}.png`, fullPage: true });
  }
  await errors.getByRole("button", { name: /Add project:/ }).click(); await expect(page.getByLabel("Project title", { exact: true })).toBeFocused();
  await nav.getByRole("button", { name: /Publish/ }).click(); await page.getByRole("button", { name: "Publish portfolio", exact: true }).click();
  await errors.getByRole("button", { name: /Untitled project: Project title/ }).click();
  await page.getByLabel("Project title", { exact: true }).fill("Project under construction");
  await page.getByLabel("Project description", { exact: true }).fill("A complete study saved automatically at publication.");
  await page.getByRole("button", { name: "Images", exact: true }).click();
  const png = await page.evaluate(() => { const c = document.createElement("canvas"); c.width = 900; c.height = 600; const x = c.getContext("2d")!; x.fillStyle = "#335d51"; x.fillRect(0, 0, 900, 600); x.fillStyle = "#f8f5ec"; x.font = "48px serif"; x.fillText("A considered experience", 100, 300); return c.toDataURL("image/png").split(",")[1]; });
  await page.getByLabel("Upload thumbnail", { exact: true }).setInputFiles({ name: "case-study.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await page.getByRole("button", { name: "Use this crop" }).click(); await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.getByRole("button", { name: "Add Figma", exact: true }).click();
  await nav.getByRole("button", { name: /Publish/ }).click(); await page.getByRole("button", { name: "Publish portfolio", exact: true }).click();
  await expect(page.getByRole("link", { name: /\/p\/feedback-site/ })).toBeVisible();
  const saved = (await (await request.get("/api/draft", { headers: owner.headers })).json()).draft;
  expect(saved.content.projectDraft).toBeNull(); expect(saved.content.projects).toHaveLength(1);
  await nav.getByRole("button", { name: /Biography/ }).click(); await page.getByLabel("Biography", { exact: true }).fill("Private biography stays unpublished.");
  await nav.getByRole("button", { name: /Publish/ }).click(); await page.getByRole("button", { name: "Edit URL", exact: true }).click();
  await page.getByLabel("New portfolio address").fill("feedback-renamed");
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `.qa/screenshots/url-draft-rename-${width}.png`, fullPage: true });
  }
  // Lose the response after the transaction committed; retry must be safe.
  await page.route("**/api/publish", async route => {
    if (route.request().method() !== "PATCH") return route.continue();
    await route.fetch(); await route.abort(); await page.unroute("**/api/publish");
  });
  await page.getByRole("button", { name: "Save URL", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(/fetch|network|Failed/i);
  await page.getByRole("button", { name: "Save URL", exact: true }).click();
  await expect(page.getByRole("link", { name: /\/p\/feedback-renamed/ })).toBeVisible();
  expect((await request.get("/p/feedback-site")).status()).toBe(404);
  const live = (await db.collection("publishedPortfolios").doc("feedback-renamed").get()).data()!;
  expect(live.profile.biography).toBe("I design clear, useful experiences."); expect(live.feedback).toBeUndefined();
  await page.reload(); await nav.getByRole("button", { name: /Biography/ }).click();
  await expect(page.getByLabel("Biography", { exact: true })).toHaveValue("Private biography stays unpublished.");
  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  await publicPage.goto("http://127.0.0.1:3102/p/feedback-renamed/projects/project-under-construction");
  for (const width of [375, 768, 1440]) {
    await publicPage.setViewportSize({ width, height: 960 });
    const title = await publicPage.getByRole("heading", { level: 1 }).boundingBox(), scope = await publicPage.getByRole("heading", { name: "Scope & tools" }).boundingBox(), firstImage = await publicPage.locator("main figure img").first().boundingBox();
    expect(scope!.y).toBeGreaterThan(title!.y + title!.height); expect(scope!.y + scope!.height).toBeLessThan(firstImage!.y);
    expect((await new AxeBuilder({ page: publicPage }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await publicPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await publicPage.screenshot({ path: `.qa/screenshots/url-draft-case-study-${width}.png`, fullPage: true });
  }
  await publicContext.close();
});
test("publishing enforces identity, verification, address ownership, revision checks, and database rules", async ({ request }) => {
  const first = await account(request, "first@example.com"), second = await account(request, "second@example.com"), unverified = await account(request, "unverified@example.com", false);
  const body = { handle: "shared-address", snapshot: blank("First Owner"), revision: 0, assets: {} };
  expect((await publishRequest(request, { data: body })).status()).toBe(401);
  expect((await publishRequest(request, { data: body, headers: { Authorization: "Bearer fake-token" } })).status()).toBe(401);
  expect((await publishRequest(request, { data: body, headers: unverified.headers })).status()).toBe(403);
  const results = await Promise.all([publishRequest(request, { data: body, headers: first.headers }), publishRequest(request, { data: { ...body, snapshot: blank("Second Owner") }, headers: second.headers })]);
  expect(results.map(r => r.status()).sort()).toEqual([200,409]);
  const winner = results[0].status() === 200 ? first : second, loser = winner === first ? second : first;
  expect((await publishRequest(request, { data: body, headers: winner.headers })).status()).toBe(409);
  expect((await publishRequest(request, { data: { ...body, revision: 1 }, headers: loser.headers })).status()).toBe(409);
  expect((await request.get("/api/publish", { headers: loser.headers })).ok()).toBe(true);
  expect((await (await request.get("/api/publish", { headers: loser.headers })).json()).publication).toBeNull();
  const html = await (await request.get("/p/shared-address")).text();
  expect(html).toContain(winner === first ? "First Owner" : "Second Owner");
  expect((await request.get("/p/no-such-portfolio")).status()).toBe(404);
  const direct = await request.get("http://127.0.0.1:8080/v1/projects/demo-portfolio/databases/(default)/documents/publishedPortfolios/shared-address");
  expect(direct.status()).toBe(403);
  const snapshot = blank("Image theft") as ReturnType<typeof blank>;
  snapshot.profile.headshotImage = "/images/stolen.webp";
  expect((await publishRequest(request, { headers: loser.headers, data: { ...body, handle: "image-theft", snapshot, assets: { "/images/stolen.webp": "a".repeat(64) } } })).status()).toBe(400);
  expect((await request.post("/api/publish/image", { headers: first.headers, data: "not-an-image" })).status()).toBe(400);
  const oversizedDirect = Buffer.alloc(IMAGE_CHUNK_BYTES + 1); fixturePNG.copy(oversizedDirect);
  const oversizedResponse = await request.post("/api/publish/image", { headers: first.headers, data: oversizedDirect });
  expect(oversizedResponse.status()).toBe(413);
  expect((await oversizedResponse.json()).error).toContain("chunked upload");
  const streamedStatus = await new Promise<number>((resolve, reject) => {
    const req = http.request("http://127.0.0.1:3102/api/publish/image", { method: "POST", headers: { ...first.headers, "Content-Type": "image/png", "Transfer-Encoding": "chunked" } }, response => { response.resume(); response.on("end", () => resolve(response.statusCode!)); });
    req.on("error", reject); req.write(fixturePNG);
    for (let index = 0; index < 9; index++) req.write(Buffer.alloc(1024 * 1024));
    req.end();
  });
  expect(streamedStatus).toBe(413);
  expect((await request.post("/api/publish/image/chunks", { headers: first.headers, data: { size: 500 * 1024 * 1024 + 1 } })).status()).toBe(413);
  expect((await request.post("/api/auth/register", { data: { name: "No hosted files", email: "legacy@example.com", password: "qa-password-only", handle: "legacy" } })).status()).toBe(403);
});

test("create locally, publish images, update the same link, restore on another device, and isolate accounts", async ({ page, request, browser }) => {
  const owner = await account(request, "designer@example.com");
  await page.goto("/studio"); await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Jamie Rivers");
  await page.getByRole("button", { name: "Biography", exact: false }).click(); await page.getByLabel("Biography", { exact: true }).fill("Thoughtful digital experiences.");
  await page.getByRole("button", { name: "Projects", exact: false }).click(); await page.getByRole("button", { name: "Add project", exact: true }).click();
  await page.getByRole("textbox", { name: "Project title", exact: true }).fill("A Useful Study"); await page.getByRole("textbox", { name: "Project description", exact: true }).fill("A project about making everyday tasks clearer.");
  await page.getByRole("button", { name: "Images", exact: true }).click();
  const png = await page.evaluate(() => { const c=document.createElement("canvas"); c.width=240; c.height=180; const x=c.getContext("2d")!; x.fillStyle="#355f52"; x.fillRect(0,0,240,180); return c.toDataURL("image/png").split(",")[1]; });
  await page.getByLabel("Upload thumbnail", { exact: true }).setInputFiles({ name: "study.png", mimeType: "image/png", buffer: Buffer.from(png,"base64") });
  await page.getByRole("button", { name: "Use this crop" }).click(); await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click(); await page.getByRole("button", { name: "Save project to draft" }).click();
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await page.getByRole("textbox", { name: "Email address", exact: true }).fill("designer@example.com"); await page.getByLabel("Password", { exact: true }).fill("qa-password-only"); await page.getByRole("button", { name: "Sign in to publish" }).click();
  await page.getByRole("button", { name: "Use this device draft" }).click();
  await page.getByLabel("Portfolio address", { exact: true }).fill("jamie-rivers");
  await page.getByRole("button", { name: "Publish portfolio", exact: true }).click();
  await expect(page.getByRole("link", { name: /\/p\/jamie-rivers/ })).toBeVisible();
  const publicPage = await browser.newPage();
  await publicPage.goto("http://127.0.0.1:3102/p/jamie-rivers");
  await expect(publicPage.getByText("Thoughtful digital experiences.")).toBeVisible();
  await publicPage.getByRole("link", { name: /A Useful Study/ }).click();
  await expect(publicPage.getByRole("heading", { level: 1 })).toHaveText("A Useful Study");
  await expect.poll(() => publicPage.locator("img").evaluateAll(images => images.every(img => (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
  // Editing changes only the browser draft until the explicit update.
  await page.getByRole("button", { name: "Biography", exact: false }).click(); await page.getByLabel("Biography", { exact: true }).fill("New private biography.");
  expect((await request.get("/p/jamie-rivers")).status()).toBe(200);
  expect((await db.collection("publishedPortfolios").doc("jamie-rivers").get()).data()!.profile.biography).toBe("Thoughtful digital experiences.");
  await db.collection("publishers").doc(owner.uid).set({ lastPublish: 0 }, { merge: true });
  await page.getByRole("button", { name: "09 Publish", exact: true }).click(); await page.getByRole("button", { name: "Publish updates", exact: true }).click();
  await expect(page.getByText("Your portfolio is published. Copy the link to share it.")).toBeVisible();
  await publicPage.goto("http://127.0.0.1:3102/p/jamie-rivers"); await expect(publicPage.getByText("New private biography.")).toBeVisible();
  fs.mkdirSync(".qa/screenshots", { recursive: true });
  for (const width of [375,768,1440]) {
    await page.setViewportSize({ width, height: 960 }); await publicPage.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.screenshot({ path: `.qa/screenshots/firebase-published-${width}.png`, fullPage: true });
    await publicPage.screenshot({ path: `.qa/screenshots/firebase-public-${width}.png`, fullPage: true });
  }
  await publicPage.close();
  const secondDevice = await browser.newContext(); const restored = await secondDevice.newPage(); restored.on("dialog", dialog => dialog.accept());
  await restored.goto("http://127.0.0.1:3102/studio"); await restored.getByRole("button", { name: "09 Publish", exact: true }).click();
  await restored.getByRole("textbox", { name: "Email address", exact: true }).fill("designer@example.com"); await restored.getByLabel("Password", { exact: true }).fill("qa-password-only"); await restored.getByRole("button", { name: "Sign in to publish" }).click();
  await restored.getByRole("button", { name: "Restore last published version" }).click();
  await expect(restored.getByText("Published version restored on this device.")).toBeVisible();
  await restored.getByRole("button", { name: "Biography", exact: false }).click(); await expect(restored.getByLabel("Biography", { exact: true })).toHaveValue("New private biography.");
  await restored.getByRole("button", { name: "Preview portfolio" }).click(); await expect(restored.getByRole("link", { name: /A Useful Study/ })).toBeVisible();
  await secondDevice.close();
});

});
}

export function registerAccountLifecycleTests() {
test.describe("hosted authentication and account lifecycle", () => {
test("landing signup starts blank, verifies, publishes, counts creators, and resumes the correct draft", async ({ page, request }) => {
  await page.goto("/studio");
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Guest draft to preserve");
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  await page.goto("/"); await page.getByRole("link", { name: "Create your free portfolio", exact: true }).first().click();
  await page.getByLabel("Email address", { exact: true }).fill("landing@example.com");
  await page.getByLabel("Password", { exact: true }).fill("qa-password-only");
  await page.getByLabel("Confirm password", { exact: true }).fill("not-matching-yet");
  await page.getByRole("button", { name: "Create account & start setup" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("passwords do not match");
  await page.getByLabel("Confirm password", { exact: true }).fill("qa-password-only");
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Create account & start setup" }).click();
  await expect(page).toHaveURL(/\/studio\?welcome=verify-email$/);
  await expect(page.getByText("Account created. Check your inbox", { exact: false })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("");
  const owner = await auth.getUserByEmail("landing@example.com");
  expect(await page.evaluate(() => localStorage.getItem("portfolio-active-draft"))).toBeNull();
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Landing Creator");
  await page.getByRole("button", { name: "03 Biography", exact: true }).click();
  await page.getByLabel("Biography", { exact: true }).fill("A portfolio created from the landing page.");
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await expect(page.getByRole("button", { name: "Publish portfolio", exact: true })).toBeDisabled();
  await auth.updateUser(owner.uid, { emailVerified: true });
  await page.getByRole("button", { name: "Check verification", exact: true }).click();
  await addCompleteProject(page);
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await page.getByLabel("Portfolio address", { exact: true }).fill("landing-creator");
  await page.getByRole("button", { name: "Publish portfolio", exact: true }).click();
  await expect(page.getByRole("link", { name: /\/p\/landing-creator/ })).toBeVisible();
  await expect.poll(async () => (await (await request.get("/api/public-stats")).json()).publishedCreators).toBe(1);
  const stats = await request.get("/api/public-stats"); expect(stats.headers()["cache-control"]).toContain("max-age=300"); expect(Object.keys(await stats.json())).toEqual(["publishedCreators"]);
  await db.collection("publishers").doc(owner.uid).set({ lastPublish: 0 }, { merge: true });
  await page.getByRole("button", { name: "Publish updates", exact: true }).click();
  await expect(page.getByText("Your portfolio is published. Copy the link to share it.")).toBeVisible();
  expect((await (await request.get("/api/public-stats")).json()).publishedCreators).toBe(1);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByRole("button", { name: "01 Your name", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Guest draft to preserve");
  await page.goto("/login"); await page.getByLabel("Email address", { exact: true }).fill("landing@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password"); await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("email or password is incorrect");
  await page.getByLabel("Password", { exact: true }).fill("qa-password-only"); await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/studio$/); await expect(page.getByRole("button", { name: "Publish updates", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "01 Your name", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Landing Creator");
  await expect(page.getByText("Saved to your account", { exact: true })).toBeVisible();
  await page.goto("/signup"); await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Landing Creator");
  const second = await account(request, "second-landing@example.com");
  expect((await publishRequest(request, { headers: second.headers, data: { handle: "second-landing", snapshot: blank("Another Creator"), assets: {}, revision: 0 } })).status()).toBe(200);
  await expect.poll(async () => (await (await request.get("/api/public-stats")).json()).publishedCreators).toBe(2);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/"); await expect(page.locator(".creator-count strong")).toHaveText("2");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `.qa/screenshots/landing-live-${width}.png`, fullPage: true, animations: "disabled" });
  }
});

test("hosted auth screenshots, keyboard access, duplicate signup, and verification-email recovery", async ({ page }) => {
  fs.mkdirSync(".qa/screenshots", { recursive: true });
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of ["/signup", "/login"]) {
      await page.goto(route); await expect(page.getByLabel("Email address", { exact: true })).toBeVisible(); await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      await page.screenshot({ path: `.qa/screenshots/${route.slice(1)}-${width}.png`, fullPage: true });
    }
  }
  await auth.createUser({ email: "existing@example.com", password: "qa-password-only" });
  await page.goto("/signup"); await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.getByLabel("Email address", { exact: true }).fill("existing@example.com"); await page.getByLabel("Password", { exact: true }).fill("qa-password-only"); await page.getByLabel("Confirm password", { exact: true }).fill("qa-password-only");
  await page.getByRole("button", { name: "Create account & start setup" }).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("already uses this email");
  await page.route("**/accounts:sendOobCode?**", route => route.fulfill({ status: 400, json: { error: { code: 400, message: "TOO_MANY_ATTEMPTS_TRY_LATER" } } }));
  await page.getByLabel("Email address", { exact: true }).fill("mail-failure@example.com");
  await page.getByRole("button", { name: "Create account & start setup" }).click();
  await expect(page).toHaveURL(/welcome=verification-pending$/);
  await expect(page.getByText("Your account was created, but the verification email could not be sent.", { exact: false })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("");
});

test("cancelled account replacement preserves both drafts and restore asks only once", async ({ page, request }) => {
  await account(request, "cancel@example.com");
  await page.goto("/studio");
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Account original");
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await page.getByRole("textbox", { name: "Email address", exact: true }).fill("cancel@example.com");
  await page.getByLabel("Password", { exact: true }).fill("qa-password-only");
  await page.getByRole("button", { name: "Sign in to publish", exact: true }).click();
  await page.getByRole("button", { name: "Use this device draft" }).click();
  await page.getByRole("button", { name: "03 Biography", exact: true }).click();
  await page.getByLabel("Biography", { exact: true }).fill("My creative practice.");
  await addCompleteProject(page);
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await page.getByLabel("Portfolio address", { exact: true }).fill("cancel-study");
  await page.getByRole("button", { name: "Publish portfolio", exact: true }).click();
  await expect(page.getByRole("link", { name: /\/p\/cancel-study/ })).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByRole("button", { name: "01 Your name", exact: true }).click();
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Guest replacement");
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await page.getByRole("textbox", { name: "Email address", exact: true }).fill("cancel@example.com");
  await page.getByLabel("Password", { exact: true }).fill("qa-password-only");
  await page.getByRole("button", { name: "Sign in to publish", exact: true }).click();
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Use this device draft" }).click();
  await expect(page.getByRole("button", { name: "Use this device draft" })).toBeEnabled();
  await expect(page.getByText("This draft is now linked to your account. Check the save status before leaving.")).toHaveCount(0);
  await page.getByRole("button", { name: "Open my account draft" }).click();
  await page.getByRole("button", { name: "01 Your name", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Account original");
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Unpublished account edit");
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Restore last published version" }).click();
  await expect(page.getByRole("button", { name: "Restore last published version" })).toBeEnabled();
  await expect(page.getByText("Published version restored on this device.")).toHaveCount(0);
  let confirmations = 0;
  page.on("dialog", dialog => { confirmations++; void dialog.accept(); });
  await page.getByRole("button", { name: "Restore last published version" }).click();
  await expect(page.getByText("Published version restored on this device.")).toBeVisible();
  expect(confirmations).toBe(1);
  await page.getByRole("button", { name: "01 Your name", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Account original");
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByRole("button", { name: "01 Your name", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Guest replacement");
});

test("account deletion confirms identity, removes all hosted data and this device draft, and isolates others", async ({ page, request }) => {
  const owner = await account(request, "delete-me@example.com"), other = await account(request, "keep-me@example.com");
  const body = { handle: "delete-me", snapshot: blank("Delete Me"), assets: {}, revision: 0 };
  expect((await publishRequest(request, { headers: owner.headers, data: body })).status()).toBe(200);
  expect((await publishRequest(request, { headers: other.headers, data: { ...body, handle:"keep-me" } })).status()).toBe(200);
  const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==","base64");
  const uploaded=await request.post("/api/publish/image",{headers:owner.headers,data:png}); expect(uploaded.status()).toBe(200);
  const id=(await uploaded.json()).id, assetRef=db.collection("publishers").doc(owner.uid).collection("assets").doc(id), url=(await assetRef.get()).data()!.url;
  expect((await request.get(url)).status()).toBe(200);
  expect((await request.delete("/api/account")).status()).toBe(401);
  expect((await request.delete("/api/account",{headers:owner.headers})).status()).toBe(400);
  await assetRef.update({writingUntil:Date.now()+60000});
  expect((await request.delete("/api/account",{headers:{...owner.headers,"X-Confirm-Delete":"delete-account"}})).status()).toBe(409);
  expect((await request.get("/p/delete-me")).status()).toBe(200);
  await assetRef.update({writingUntil:0});
  await page.goto("/login"); await page.getByLabel("Email address",{exact:true}).fill("delete-me@example.com"); await page.getByLabel("Password",{exact:true}).fill("qa-password-only"); await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await page.getByRole("button", { name: "01 Your name", exact: true }).click();
  await page.getByRole("textbox",{name:"Your name",exact:true}).fill("Private draft to remove");
  await page.getByRole("button",{name:"09 Publish",exact:true}).click();
  await page.getByRole("button",{name:"Delete account",exact:true}).click();
  await expect(page.getByRole("dialog")).toBeVisible(); await page.getByRole("button",{name:"Keep my account"}).click();
  await expect(page.getByRole("dialog")).not.toBeVisible(); expect((await request.get("/p/delete-me")).status()).toBe(200);
  await page.getByRole("button",{name:"Delete account",exact:true}).click();
  await page.getByLabel("Confirm your password").fill("wrong-password"); await page.getByRole("button",{name:"Permanently delete account"}).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("password is incorrect");
  await page.getByLabel("Confirm your password").fill("qa-password-only"); await expect(page.getByRole("dialog").getByRole("alert")).toHaveCount(0);
  for(const width of [320,768,1440]) { await page.setViewportSize({width,height:900}); expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]); await page.getByLabel("Confirm your password").focus(); await page.screenshot({path:`.qa/screenshots/fixes-delete-${width}.png`}); }
  let lostResponse = false;
  await page.route("**/api/account", async route => {
    if (lostResponse) return route.continue();
    lostResponse = true;
    await route.fulfill({status:503,json:{error:"Deletion request interrupted. Retry to finish."}});
  });
  await page.getByRole("button",{name:"Permanently delete account"}).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Retry to finish");
  await page.getByRole("button",{name:"Permanently delete account"}).click();
  await expect(page).toHaveURL(/\/login\?deleted=1/); await expect(page.getByText("Your account, website, and uploaded images have been deleted.")).toBeVisible();
  await expect(auth.getUser(owner.uid)).rejects.toMatchObject({code:"auth/user-not-found"});
  expect((await db.collection("publishers").doc(owner.uid).get()).exists).toBe(false); expect((await assetRef.get()).exists).toBe(false);
  expect((await request.get("/p/delete-me")).status()).toBe(404); expect((await request.get(url)).ok()).toBe(false);
  expect((await getStorage(app).bucket("demo-portfolio.firebasestorage.app").getFiles({prefix:`portfolios/${owner.uid}/`}))[0]).toHaveLength(0);
  expect((await request.get("/p/keep-me")).status()).toBe(200); expect((await auth.getUser(other.uid)).email).toBe("keep-me@example.com");
  expect((await publishRequest(request, {headers:owner.headers,data:body})).status()).toBe(401);
  expect(await page.evaluate(uid=>new Promise(resolve=>{const req=indexedDB.open("portfolio-browser-studio"); req.onsuccess=()=>{const db=req.result;const get=db.transaction("drafts").objectStore("drafts").get(uid);get.onsuccess=()=>{resolve(get.result??null);db.close();};};}),owner.uid)).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem("portfolio-active-draft"))).toBeNull();
});

});
}

export function registerImageAndDraftApiTests() {
test.describe("image uploads and draft API", () => {
test("chunked images cross the old limit, preserve bytes, and enforce ownership and 500 MB boundary", async ({ request }) => {
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

test("global image quotas and admission leases bound cross-account resource use", async ({ request }) => {
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

test("an upload started before deletion cannot recreate the account's image library", async ({ request }) => {
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

test("drafts save incomplete content while cloud images require verification and remain private", async ({ request }) => {
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

test("restore repairs missing and foreign mappings using UID and rejects ambiguous or dangling records", async ({ request }) => {
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
}

export function registerDraftRecoveryTests() {
test.describe("cloud draft recovery and conflicts", () => {
test("account drafts open when the obsolete active-draft localStorage key throws", async ({ page, request }) => {
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

test("account autosave resumes unpublished work and images on a new browser and after local storage is cleared", async ({ page, request, browser }) => {
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

test("offline edits retry and divergent devices preserve both versions with an explicit choice", async ({ page, request, browser }) => {
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

test("published-only accounts recover automatically and failed lookups never create a blank cloud draft", async ({ page, request }) => {
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

test("legacy device edits migrate and image failure leaves restore untouched", async ({ page, request }) => {
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

test("a replacement production server reads existing cloud drafts without seeding or resetting them", async ({ request }) => {
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

test("opening an old account draft does not silently adopt a newer publication revision", async ({ page, request }) => {
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
}
