import { getStorage } from "firebase-admin/storage";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { account, addCompleteProject, app, auth, blank, db, expect, publishRequest, test } from "./fixtures";

test.describe.configure({ mode: "serial" });
test.describe("hosted authentication and account lifecycle", () => {
test("AUTH-001 landing signup starts blank, verifies, publishes, counts creators, and resumes the correct draft", async ({ page, request }) => {
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

test("AUTH-002 hosted auth screenshots, keyboard access, duplicate signup, and verification-email recovery", async ({ page }) => {
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

test("AUTH-003 cancelled account replacement preserves both drafts and restore asks only once", async ({ page, request }) => {
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

test("AUTH-004 account deletion confirms identity, removes all hosted data and this device draft, and isolates others", async ({ page, request }) => {
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
