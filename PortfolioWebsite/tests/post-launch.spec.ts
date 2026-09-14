import { test, expect } from "@playwright/test";

test("blocked storage shows recovery guidance instead of crashing studio and preview", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Storage denied", "SecurityError"); };
  });
  await page.goto("/studio");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Browser storage is unavailable");
  await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Recoverable draft");
  await page.getByRole("button", { name: "Preview portfolio", exact: true }).click();
  await expect(page.getByText("Not saved · download a backup", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/studio$/);
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/studio/preview");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Browser storage is unavailable");
  expect(errors).toEqual([]);
});

test("projects precede the complete biography and mobile studio keeps the first field in view", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 960 });
  await page.goto("/");
  const work = page.getByRole("region", { name: "Projects", exact: true });
  const biography = page.getByRole("region", { name: "Behind the work", exact: true });
  await expect(work).toBeVisible(); await expect(biography).toBeVisible();
  expect((await work.boundingBox())!.y).toBeLessThan((await biography.boundingBox())!.y);
  await page.goto("/studio");
  const name = page.getByRole("textbox", { name: "Your name", exact: true });
  await expect(name).toBeInViewport();
  const navigation = page.getByRole("navigation", { name: "Portfolio setup" });
  await expect(navigation.getByRole("button")).toHaveCount(9);
  for (const button of await navigation.getByRole("button").all()) await expect(button).toBeInViewport();
  await expect(page.getByText(/this does not edit the site’s homepage/)).toBeVisible();
});
