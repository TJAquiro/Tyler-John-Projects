import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

test("preview and project errors clear on edits and every navigation path", async ({ page }) => {
  await page.goto("/studio");
  const preview = page.getByRole("button", { name: "Preview portfolio" });
  const error = page.getByRole("main").getByRole("alert").filter({ hasText: "Add your name" });
  await preview.click(); await expect(error).toBeVisible();
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Name corrected"); await expect(error).toHaveCount(0);
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("");
  await preview.click(); await expect(error).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click(); await expect(error).toHaveCount(0);
  await preview.click(); await expect(error).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click(); await expect(error).toHaveCount(0);
  await preview.click(); await expect(error).toBeVisible();
  await page.getByRole("button", { name: "08 Projects" }).click(); await expect(error).toHaveCount(0);
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.getByRole("button", { name: "Save project to draft" }).click(); await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Details", exact: true }).click(); await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});

test("all studio sections and populated controls fit narrow phones through desktop", async ({ page }) => {
  fs.mkdirSync(".qa/screenshots", { recursive: true });
  await page.goto("/studio");
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("A".repeat(100));
  const checkLayout = async () => {
    const overflow = await page.evaluate(() => Array.from(document.querySelectorAll("main input, main button, main fieldset, main .studio-panel, main .setup-step")).filter(e => {
      const r = e.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1 || e.scrollWidth > e.clientWidth + 2 && !e.matches("input"));
    }).map(e => e.textContent?.slice(0, 70) || e.tagName));
    expect(overflow).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  };
  for (const width of [320, 375, 390, 640, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ["01 Your name", "02 Headshot", "03 Biography", "04 Education", "05 Tools", "06 Experience", "07 Homepage", "08 Projects", "09 Publish"]) {
      await page.getByRole("button", { name, exact: true }).click();
      if (name === "04 Education" && await page.getByRole("button", { name: "+ Add education" }).isVisible() && !await page.getByLabel("Institution", { exact: false }).count()) await page.getByRole("button", { name: "+ Add education" }).click();
      if (name === "06 Experience" && !await page.getByLabel("Company", { exact: false }).count()) await page.getByRole("button", { name: "+ Add experience" }).click();
      if (name === "08 Projects" && await page.getByRole("button", { name: "Add project", exact: true }).isVisible()) await page.getByRole("button", { name: "Add project", exact: true }).click();
      if (name === "08 Projects") {
        await page.getByRole("button", { name: "Images", exact: true }).click();
        if (!await page.getByAltText("Thumbnail preview").count()) {
          const png = await page.evaluate(() => { const c=document.createElement("canvas"); c.width=120; c.height=80; const x=c.getContext("2d")!; x.fillStyle="#4e654f"; x.fillRect(0,0,120,80); return c.toDataURL("image/png").split(",")[1]; });
          await page.getByLabel("Upload thumbnail", {exact:true}).setInputFiles({ name:"responsive.png", mimeType:"image/png", buffer:Buffer.from(png,"base64") });
          await page.getByRole("button", {name:"Use this crop"}).click(); await expect(page.getByRole("dialog")).not.toBeVisible();
        }
        await checkLayout();
        if ([320,768,1440].includes(width)) await page.screenshot({path: `.qa/screenshots/fixes-gallery-${width}.png`, fullPage:true});
        await page.getByRole("button", {name:"Review",exact:true}).click(); await checkLayout();
        await page.getByRole("button", {name:"Details",exact:true}).click();
      }
      await checkLayout();
      if ([320,768,1440].includes(width) && ["04 Education","08 Projects","09 Publish"].includes(name)) {
        await page.screenshot({ path: `.qa/screenshots/fixes-${name.slice(3).toLowerCase()}-${width}.png`, fullPage: true });
      }
    }
  }
  for (const width of [320,768,1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("button", { name: "04 Education", exact: true }).click();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "Preview portfolio" }).click();
    await checkLayout();
    await page.screenshot({ path: `.qa/screenshots/fixes-preview-${width}.png`, fullPage: true });
    await page.getByRole("link", { name: "Back to studio", exact: true }).click();
  }
});

test("an image above 5 MB opens the cropper and oversized source gets the 500 MB message", async ({ page }) => {
  await page.goto("/studio"); await page.getByRole("button", { name: "02 Headshot" }).click();
  const png = await page.evaluate(() => { const c = document.createElement("canvas"); c.width = 120; c.height = 80; const ctx=c.getContext("2d")!; ctx.fillStyle="#4e654f"; ctx.fillRect(0,0,120,80); return c.toDataURL("image/png").split(",")[1]; });
  await page.getByLabel("Upload headshot").setInputFiles({ name: "large.png", mimeType: "image/png", buffer: Buffer.concat([Buffer.from(png,"base64"), Buffer.alloc(6 * 1024 * 1024)]) });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  await page.screenshot({ path: ".qa/screenshots/fixes-crop-320.png" });
  await page.getByRole("button", { name: "Use this crop" }).click(); await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByAltText("Headshot preview")).toBeVisible();
  await page.getByLabel("Upload headshot").evaluate((input: HTMLInputElement) => {
    const file = new File(["test"], "oversized.png", { type: "image/png" }); Object.defineProperty(file,"size",{ value: 500*1024*1024+1 });
    const data = new DataTransfer(); data.items.add(file); input.files = data.files; input.dispatchEvent(new Event("change",{bubbles:true}));
  });
  await expect(page.getByRole("main").getByRole("alert")).toContainText("500 MB");
  await page.getByRole("button", { name: "03 Biography" }).click(); await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});
