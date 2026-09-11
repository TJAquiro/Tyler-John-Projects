import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

test("a stale tab cannot overwrite a newer device draft", async ({ page, context }) => {
  await page.goto("/studio");
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("First version");
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  const other = await context.newPage(); await other.goto("/studio");
  await expect(other.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("First version");
  await expect(other.getByText("Saved on this device", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Newer version");
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible();
  await other.getByRole("textbox", { name: "Your name", exact: true }).fill("Older tab edit");
  await expect(other.getByRole("alert").filter({ hasText: "Another tab saved" })).toBeVisible();
  await expect(other.getByText("Not saved · download a backup", { exact: true })).toBeVisible();
  other.on("dialog", dialog => dialog.accept());
  await other.reload(); await expect(other.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Newer version");
  await other.close();
});

test("device draft persists offline, crops locally, previews, and backs up without server writes", async ({ page, context }) => {
  const writes: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/") && request.method() !== "GET") writes.push(request.url()); });
  await page.goto("/studio");
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Jamie Rivers");
  await page.getByRole("button", { name: "Biography", exact: false }).click();
  await context.setOffline(true);
  await page.getByLabel("Biography", { exact: true }).fill("I design thoughtful experiences for people.");
  await expect(page.getByRole("status", { name: "" }).filter({ hasText: "Saved on this device" })).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByLabel("Biography", { exact: true })).toHaveValue("I design thoughtful experiences for people.");
  await page.getByRole("button", { name: "Headshot" }).click();
  const png = await page.evaluate(() => { const c = document.createElement("canvas"); c.width = 100; c.height = 80; const x = c.getContext("2d")!; x.fillStyle = "#65806a"; x.fillRect(0,0,100,80); return c.toDataURL("image/png").split(",")[1]; });
  await page.getByLabel("Upload headshot").setInputFiles({ name: "portrait.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await page.getByRole("button", { name: "Use this crop" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByAltText("Headshot preview")).toBeVisible();
  const download = page.waitForEvent("download"); if (!(await page.getByRole("button", { name: "Download draft backup" }).isVisible())) await page.getByText("Draft backups & storage", { exact: true }).click(); await page.getByRole("button", { name: "Download draft backup" }).click();
  const downloaded = await download; const backup = JSON.parse(fs.readFileSync((await downloaded.path())!, "utf8"));
  expect(backup.profile.name).toBe("Jamie Rivers"); expect(Object.values(backup.images)[0]).toMatch(/^data:image\/webp/);
  await page.getByRole("button", { name: "Preview portfolio" }).click();
  await expect(page.getByText("I design thoughtful experiences for people.")).toBeVisible();
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page.getByAltText("Jamie Rivers", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to studio", exact: true }).click();
  await page.getByRole("button", { name: "09 Publish", exact: true }).click();
  await expect(page.getByText("Online publishing is not connected yet.")).toBeVisible();
  expect(writes).toEqual([]);
});

test("backup imports preserve unfinished work, reject unsafe data, and studio fits all widths", async ({ page }) => {
  await page.goto("/studio");
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Taylor Studio");
  const d = page.waitForEvent("download"); if (!(await page.getByRole("button", { name: "Download draft backup" }).isVisible())) await page.getByText("Draft backups & storage", { exact: true }).click(); await page.getByRole("button", { name: "Download draft backup" }).click();
  const backup = fs.readFileSync((await (await d).path())!);
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Unpublished change");
  page.on("dialog", dialog => dialog.accept());
  await page.getByLabel("Import draft backup").setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: backup });
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Taylor Studio");
  const bad = JSON.parse(backup.toString()); bad.profile.headshotImage = "https://tracker.invalid/image.png";
  await page.getByLabel("Import draft backup").setInputFiles({ name: "unsafe.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(bad)) });
  await expect(page.getByRole("alert").filter({ hasText: "Choose an image" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toHaveValue("Taylor Studio");
  await page.getByRole("button", { name: "Projects", exact: false }).click();
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await page.getByRole("textbox", { name: "Project title", exact: true }).fill("Unfinished study");
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible(); await page.reload();
  await expect(page.getByRole("textbox", { name: "Project title", exact: true })).toHaveValue("Unfinished study");
  fs.mkdirSync(".qa/screenshots", { recursive: true });
  for (const width of [375,768,1440]) {
    await page.setViewportSize({ width, height: 960 });
    await expect(page.getByRole("combobox", { name: "Portfolio section", exact: true })).toHaveCount(0);
    const navigation = page.getByRole("navigation", { name: "Portfolio setup" });
    await expect(navigation.getByRole("button")).toHaveCount(9);
    for (const button of await navigation.getByRole("button").all()) await expect(button).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze()).violations).toEqual([]);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.screenshot({ path: `.qa/screenshots/local-studio-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "09 Publish", exact: true }).click();
    await page.screenshot({ path: `.qa/screenshots/local-publish-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Projects", exact: false }).click();
  }
});
