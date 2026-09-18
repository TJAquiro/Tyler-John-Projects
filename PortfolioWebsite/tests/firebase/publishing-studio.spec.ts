import { IMAGE_CHUNK_BYTES } from "../../lib/portfolio-snapshot";
import http from "node:http";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { account, blank, db, expect, fixturePNG, loginStudio, publishRequest, test } from "./fixtures";

test.describe.configure({ mode: "serial" });
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
