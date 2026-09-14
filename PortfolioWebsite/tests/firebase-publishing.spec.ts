import http from "node:http";
import { test, expect, type APIRequestContext } from "@playwright/test";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
const app = initializeApp({ projectId: "demo-portfolio" }, "qa-publishing-tests"), auth = getAuth(app), db = getFirestore(app);
const blank = (name: string) => ({ profile: { name, biography: "I make useful things.", headshotImage: "", education: [], tools: [], jobs: [] }, projects: [] });
async function account(request: APIRequestContext, email: string, verified = true) {
  const user = await auth.createUser({ email, password: "qa-password-only", emailVerified: verified });
  const response = await request.post("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-test-key", { data: { email, password: "qa-password-only", returnSecureToken: true } });
  const { idToken } = await response.json(); return { uid: user.uid, headers: { Authorization: `Bearer ${idToken}` } };
}
test.beforeEach(async ({ request }) => {
  await request.delete("http://127.0.0.1:9099/emulator/v1/projects/demo-portfolio/accounts");
  await request.delete("http://127.0.0.1:8080/emulator/v1/projects/demo-portfolio/databases/(default)/documents");
});
test("publishing enforces identity, verification, address ownership, revision checks, and database rules", async ({ request }) => {
  const first = await account(request, "first@example.com"), second = await account(request, "second@example.com"), unverified = await account(request, "unverified@example.com", false);
  const body = { handle: "shared-address", snapshot: blank("First Owner"), revision: 0, assets: {} };
  expect((await request.post("/api/publish", { data: body })).status()).toBe(401);
  expect((await request.post("/api/publish", { data: body, headers: { Authorization: "Bearer fake-token" } })).status()).toBe(401);
  expect((await request.post("/api/publish", { data: body, headers: unverified.headers })).status()).toBe(403);
  const results = await Promise.all([request.post("/api/publish", { data: body, headers: first.headers }), request.post("/api/publish", { data: { ...body, snapshot: blank("Second Owner") }, headers: second.headers })]);
  expect(results.map(r => r.status()).sort()).toEqual([200,409]);
  const winner = results[0].status() === 200 ? first : second, loser = winner === first ? second : first;
  expect((await request.post("/api/publish", { data: body, headers: winner.headers })).status()).toBe(409);
  expect((await request.post("/api/publish", { data: { ...body, revision: 1 }, headers: loser.headers })).status()).toBe(409);
  expect((await request.get("/api/publish", { headers: loser.headers })).ok()).toBe(true);
  expect((await (await request.get("/api/publish", { headers: loser.headers })).json()).publication).toBeNull();
  const html = await (await request.get("/p/shared-address")).text();
  expect(html).toContain(winner === first ? "First Owner" : "Second Owner");
  expect((await request.get("/p/no-such-portfolio")).status()).toBe(404);
  const direct = await request.get("http://127.0.0.1:8080/v1/projects/demo-portfolio/databases/(default)/documents/publishedPortfolios/shared-address");
  expect(direct.status()).toBe(403);
  const snapshot = blank("Image theft") as ReturnType<typeof blank>;
  snapshot.profile.headshotImage = "/images/stolen.webp";
  expect((await request.post("/api/publish", { headers: loser.headers, data: { ...body, handle: "image-theft", snapshot, assets: { "/images/stolen.webp": "a".repeat(64) } } })).status()).toBe(400);
  expect((await request.post("/api/publish/image", { headers: first.headers, data: "not-an-image" })).status()).toBe(400);
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
  expect(await page.evaluate(() => localStorage.getItem("portfolio-active-draft"))).toBe(owner.uid);
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Landing Creator");
  await page.getByRole("button", { name: "03 Biography", exact: true }).click();
  await page.getByLabel("Biography", { exact: true }).fill("A portfolio created from the landing page.");
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await expect(page.getByRole("button", { name: "Publish portfolio", exact: true })).toBeDisabled();
  await auth.updateUser(owner.uid, { emailVerified: true });
  await page.getByRole("button", { name: "Check verification", exact: true }).click();
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
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  await page.goto("/signup"); await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Landing Creator");
  const second = await account(request, "second-landing@example.com");
  expect((await request.post("/api/publish", { headers: second.headers, data: { handle: "second-landing", snapshot: blank("Another Creator"), assets: {}, revision: 0 } })).status()).toBe(200);
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
  await expect(page.getByText("This draft is now saved for your account on this device.")).toHaveCount(0);
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
  expect((await request.post("/api/publish", { headers: owner.headers, data: body })).status()).toBe(200);
  expect((await request.post("/api/publish", { headers: other.headers, data: { ...body, handle:"keep-me" } })).status()).toBe(200);
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
  expect((await request.post("/api/publish", {headers:owner.headers,data:body})).status()).toBe(401);
  expect(await page.evaluate(uid=>new Promise(resolve=>{const req=indexedDB.open("portfolio-browser-studio"); req.onsuccess=()=>{const db=req.result;const get=db.transaction("drafts").objectStore("drafts").get(uid);get.onsuccess=()=>{resolve(get.result??null);db.close();};};}),owner.uid)).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem("portfolio-active-draft"))).toBeNull();
});

test("chunked images cross the old limit, preserve bytes, and enforce ownership and 500 MB boundary", async ({ request }) => {
  const owner=await account(request,"large-image@example.com"), other=await account(request,"other-image@example.com");
  const cap=500*1024*1024;
  const boundary=await request.post("/api/publish/image/chunks",{headers:owner.headers,data:{size:cap}}); expect(boundary.status()).toBe(200);
  expect((await request.delete(`/api/publish/image/chunks?id=${(await boundary.json()).id}`,{headers:owner.headers})).status()).toBe(200);
  expect((await request.post("/api/publish/image/chunks",{headers:owner.headers,data:{size:cap+1}})).status()).toBe(413);
  const image=Buffer.alloc(9*1024*1024,73); Buffer.from([137,80,78,71,13,10,26,10]).copy(image);
  const started=await request.post("/api/publish/image/chunks",{headers:owner.headers,data:{size:image.length}}); const {id}=await started.json(); const path=`/api/publish/image/chunks?id=${id}`;
  expect((await request.put(path+"&part=0",{headers:other.headers,data:image.subarray(0,8*1024*1024)})).status()).toBe(409);
  expect((await request.put(path+"&part=0",{headers:owner.headers,data:image.subarray(0,8*1024*1024)})).status()).toBe(200);
  expect((await request.put(path+"&part=1",{headers:owner.headers,data:image.subarray(8*1024*1024)})).status()).toBe(200);
  const completed=await request.patch(path,{headers:owner.headers}); expect(await completed.text()).toContain(id); expect(completed.status()).toBe(200);
  const asset=(await db.collection("publishers").doc(owner.uid).collection("assets").doc(id).get()).data()!;
  expect(asset.size).toBe(image.length); expect(await (await request.get(asset.url)).body()).toEqual(image);
  const snapshot=blank("Large image"); snapshot.profile.headshotImage="/images/large.png";
  expect((await request.post("/api/publish",{headers:owner.headers,data:{handle:"large-image",snapshot,revision:0,assets:{"/images/large.png":id}}})).status()).toBe(200);
  const unverified=await account(request,"delete-unverified@example.com",false);
  expect((await request.delete("/api/account",{headers:{...unverified.headers,"X-Confirm-Delete":"delete-account"}})).status()).toBe(200);
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
