import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

test("LAND-001 service homepage, real-count states, redirects, and signup entry", async ({ page, request }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.route("**/api/public-stats", route => route.fulfill({ json: { publishedCreators: 0 } }));
  await page.goto("/");
  await expect(page).toHaveTitle("Portfolio studio | Create your free portfolio");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your work deserves a place of its own.");
  await expect(page.locator("body")).not.toContainText("Tyler Aquiro");
  await expect(page.getByText("portfolios published—be the first")).toBeVisible();
  await expect(page.locator("#how-it-works li")).toHaveCount(4);
  await expect(page.locator("#personalize article")).toHaveCount(6);
  const calls = page.getByRole("link", { name: "Create your free portfolio", exact: true });
  await expect(calls).toHaveCount(3);
  for (const link of await calls.all()) await expect(link).toHaveAttribute("href", "/signup");
  await page.getByRole("link", { name: "See how it works" }).click(); await expect(page).toHaveURL(/#how-it-works$/);
  await calls.first().click(); await expect(page).toHaveURL("/signup");
  await expect(page.getByText("Account creation and sign-in are temporarily unavailable.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Retry connection" }).click();
  await expect(page.getByRole("button", { name: "Retry connection" })).toBeVisible();
  for (const route of ["/about", "/projects/any-legacy-project"]) {
    const response = await request.get(route, { maxRedirects: 0 }); expect(response.status()).toBe(308); expect(response.headers().location).toBe("/");
  }
  const unavailable = await request.get("/api/public-stats"); expect(unavailable.status()).toBe(503); expect(await unavailable.json()).toEqual({ publishedCreators: null });
  for (const count of [1, 1284, null]) {
    await page.route("**/api/public-stats", route => route.fulfill({ json: { publishedCreators: count } }));
    await page.goto("/");
    if (count === null) await expect(page.getByText("Creator count temporarily unavailable")).toBeVisible();
    else { await expect(page.locator(".creator-count strong")).toHaveText(count.toLocaleString("en-US")); await expect(page.locator(".creator-count")).toContainText(count === 1 ? "creator has" : "creators have"); }
  }
  expect(errors).toEqual([]);
});

test("LAND-002 landing and unavailable auth remain accessible at all widths", async ({ page }) => {
  fs.mkdirSync(".qa/screenshots", { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of ["/", "/signup", "/login"]) {
      await page.goto(route); await page.evaluate(() => document.fonts.ready);
      if (route === "/") await expect(page.getByText("Creator count temporarily unavailable")).toBeVisible();
      else await expect(page.getByRole("button", { name: "Retry connection" })).toBeVisible();
      await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      await page.screenshot({ path: `.qa/screenshots/${route === "/" ? "landing" : route.slice(1) + "-unavailable"}-${width}.png`, fullPage: true, animations: "disabled" });
    }
  }
  await page.goto("/"); await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator(".hero-copy")).toHaveCSS("animation-duration", "1e-05s");
});
