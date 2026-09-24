import { type Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { todayISO, inputDate } from "../lib/dates";
const profile = JSON.parse(fs.readFileSync("tests/fixtures/profile.json", "utf8"));
const projects = JSON.parse(fs.readFileSync("tests/fixtures/projects.json", "utf8"));
const fixture = path.resolve(".qa/content/portfolios/11111111-1111-4111-8111-111111111111");
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(fixture, file + ".json"), "utf8"));
test.beforeEach(() => {
  for (const [file, value] of Object.entries({ profile, projects, studio: { completed: true, step: 7, projectDraft: null } })) fs.writeFileSync(path.join(fixture, file + ".json"), JSON.stringify(value));
});
async function login(page: Page) {
  await page.goto("/admin/login"); await page.getByLabel("Email address").fill("qa@example.com"); await page.getByLabel("Password", { exact: true }).fill("qa-password-only");
  await page.getByRole("button", { name: "Sign in" }).click(); await expect(page).toHaveURL(/dashboard/);
}
async function saveProfile(page: Page) {
  await page.getByRole("button", { name: "Save profile", exact: true }).click(); await expect(page.locator(".form-actions [role=status]")).toContainText("Saved to your portfolio");
}
test("HOME-001 biography and homepage content persist, preview together, and can be removed", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (/hydration|hydrated/i.test(m.text())) errors.push(m.text()); });
  await login(page);
  await page.getByRole("button", { name: "Biography", exact: true }).click();
  await page.getByLabel("Biography", { exact: true }).fill("I design thoughtful digital experiences.\n\nThis second paragraph has been updated, too."); await saveProfile(page);
  await page.getByRole("button", { name: "Homepage", exact: true }).click();
  await page.getByLabel("Homepage tagline", { exact: true }).fill("Good ideas. Thoughtfully made.");
  await page.getByLabel("Homepage banner", { exact: true }).fill("/images/common-ground-detail.svg"); await saveProfile(page);
  await page.reload(); await page.getByRole("button", { name: "Homepage", exact: true }).click();
  await expect(page.getByLabel("Homepage tagline", { exact: true })).toHaveValue("Good ideas. Thoughtfully made.");
  await expect(page.getByLabel("Homepage banner", { exact: true })).toHaveValue("/images/common-ground-detail.svg");
  for (const view of ["/", "/about"]) {
    await page.goto("/admin/preview?view=" + encodeURIComponent(view));
    await expect(page.getByText("This second paragraph has been updated, too.")).toBeVisible();
  }
  await page.goto("/admin/preview"); await expect(page.getByRole("heading", { level: 1 })).toHaveText("Good ideas. Thoughtfully made.");
  await expect(page.getByRole("img", { name: "Homepage banner for " + profile.name })).toBeVisible();
  await page.goto("/u/qa-portfolio"); await expect(page.getByText("This second paragraph has been updated, too.")).toHaveCount(0);
  await page.goto("/admin/dashboard"); await page.getByRole("button", { name: "Homepage", exact: true }).click();
  await page.getByRole("button", { name: "Remove banner" }).click(); await page.getByLabel("Homepage tagline", { exact: true }).fill(""); await saveProfile(page);
  await page.goto("/admin/preview"); await expect(page.getByRole("img", { name: /Homepage banner/ })).toHaveCount(0); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.name);
  expect(errors).toEqual([]);
});
test("HOME-002 shared calendars validate dates, default to today, preserve legacy records, and format every view", async ({ page }) => {
  await login(page);
  // Existing ambiguous owner-style dates can survive unrelated edits, but new invalid dates cannot.
  const legacy = { ...profile, jobs: [{ company: "Legacy studio", position: "Designer", description: "", startDate: "march 1", endDate: "Present" }] };
  fs.writeFileSync(path.join(fixture, "profile.json"), JSON.stringify(legacy));
  await page.reload(); await page.getByLabel("Your name").fill("Updated name"); await saveProfile(page);
  expect(read("profile").jobs[0].startDate).toBe("march 1");
  await page.getByRole("button", { name: "Experience", exact: true }).click();
  await page.getByLabel("Start date", { exact: true }).fill("02/30/2026");
  await page.getByRole("button", { name: "Save profile", exact: true }).click(); await expect(page.locator(".form-error")).toContainText("real date");
  await page.getByLabel("Start date", { exact: true }).fill("01/12/2026"); await saveProfile(page);
  expect(read("profile").jobs[0].startDate).toBe("2026-01-12");
  await page.getByRole("button", { name: "Education", exact: true }).click(); await page.getByRole("button", { name: "Add education" }).click();
  await expect(page.getByLabel("Start date", { exact: true })).toHaveValue(inputDate(todayISO()));
  await page.getByRole("textbox", { name: "Institution", exact: true }).fill("Design school");
  await page.getByRole("button", { name: "Open calendar for start date" }).click();
  await expect(page.getByRole("dialog").getByRole("button", { pressed: true })).toHaveAttribute("aria-current", "date");
  await page.getByRole("dialog").getByRole("combobox", { name: "Month", exact: true }).selectOption("0"); await page.getByRole("dialog").getByRole("spinbutton", { name: "Year", exact: true }).fill("2026");
  await page.getByRole("button", { name: "Jan 12, 2026", exact: true }).click();
  await page.getByLabel("End date", { exact: true }).fill("01/11/2026"); await page.getByRole("button", { name: "Save profile" }).click(); await expect(page.locator(".form-error")).toContainText("on or after");
  await page.getByLabel("Ongoing (Present)").check(); await saveProfile(page);
  await page.getByRole("button", { name: "Open calendar for start date" }).click();
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0); await expect(page.getByRole("button", { name: "Open calendar for start date" })).toBeFocused();
  await page.getByRole("link", { name: "Add project" }).click(); await expect(page.getByRole("textbox", { name: "Project date", exact: true })).toHaveValue(inputDate(todayISO()));
  await page.getByLabel("Project title").fill("Calendar Study"); await page.getByLabel("Project description").fill("A consistent approach to date entry.");
  await page.getByRole("textbox", { name: "Project date", exact: true }).fill("02/29/2024"); await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("textbox", { name: "Thumbnail", exact: true }).fill("/images/common-ground.svg"); await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Add Figma", exact: true }).click(); await page.getByLabel("Search tools or add your own").fill("Custom Project Tool"); await page.getByLabel("Search tools or add your own").press("Enter");
  await expect(page.getByRole("button", { name: "Remove Figma", exact: true })).toBeVisible(); await expect(page.getByText("Feb 29, 2024 · 1 supporting images")).toBeVisible();
  await page.getByRole("button", { name: "Add project", exact: true }).click(); await expect(page).toHaveURL(/dashboard/);
  const created = read("projects").find((p: { slug: string }) => p.slug === "calendar-study"); expect(created.date).toBe("2024-02-29"); expect(created.technologies).toEqual(["Figma", "Custom Project Tool"]);
  expect((await page.request.put("/api/content", { data: { project: { ...created, date: "02/29/2025" } } })).status()).toBe(400);
  await page.goto("/admin/preview"); await expect(page.getByText("Feb 29, 2024", { exact: true })).toBeVisible();
  await page.goto("/admin/preview?view=%2Fprojects%2Fcalendar-study"); await expect(page.getByText("Case study / Feb 29, 2024")).toBeVisible();
  await page.goto("/admin/preview?view=%2Fabout"); await expect(page.getByText("Jan 12, 2026 — Present", { exact: true })).toHaveCount(2);
});
test("HOME-003 featured selection replaces, removes, survives edits and deletion; responsive editing and public evidence", async ({ page }) => {
  test.setTimeout(180000); await login(page);
  const article = (title: string) => page.getByRole("article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
  await article(projects[1].title).getByRole("button", { name: "Set as featured project" }).click();
  await expect(article(projects[1].title).getByRole("button", { name: "Remove featured project" })).toBeVisible();
  expect(read("projects").filter((p: { featured: boolean }) => p.featured).map((p: { id: string }) => p.id)).toEqual([projects[1].id]);
  await page.goto("/admin/preview"); await expect(page.getByRole("region", { name: "Featured project", exact: true })).toContainText(projects[1].description);
  await expect(page.getByRole("region", { name: "Projects", exact: true }).getByText(projects[1].title)).toHaveCount(0);
  await page.goto("/admin/dashboard"); await article(projects[0].title).getByRole("button", { name: "Set as featured project" }).click();
  await expect(article(projects[0].title).getByRole("button", { name: "Remove featured project" })).toBeVisible();
  await page.getByRole("button", { name: "Homepage", exact: true }).click(); await page.getByLabel("Homepage tagline", { exact: true }).fill("Good ideas. Thoughtfully made."); await page.getByLabel("Homepage banner", { exact: true }).fill("/images/common-ground-detail.svg"); await saveProfile(page);
  fs.mkdirSync(".qa/screenshots", { recursive: true });
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, route] of [["featured-home", "/admin/preview"], ["homepage-editor", "/admin/dashboard"], ["project-tools", "/admin/projects/" + projects[0].id], ["date-calendar", "/admin/projects/new"]]) {
      await page.goto(route);
      if (name === "homepage-editor") await page.getByRole("button", { name: "Homepage", exact: true }).click();
      if (name === "project-tools") await page.getByRole("button", { name: "03 Review" }).click();
      if (name === "date-calendar") await page.getByRole("button", { name: "Open calendar for project date" }).click();
      await page.evaluate(() => document.fonts.ready); await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator("img").evaluateAll(imgs => imgs.forEach(img => img.setAttribute("loading", "eager")));
      await expect.poll(() => page.locator("img").evaluateAll(imgs => imgs.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await page.screenshot({ path: `.qa/screenshots/${name}-${width}.png`, fullPage: true, animations: "disabled" });
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations.map(v => v.id)).toEqual([]);
    }
  }
  await page.goto("/admin/dashboard"); await article(projects[0].title).getByRole("link", { name: /Edit/ }).click(); await page.getByLabel("Project description").fill("Updated featured description."); await page.getByRole("button", { name: "03 Review" }).click(); await page.getByRole("button", { name: "Save project" }).click(); await expect(page).toHaveURL(/dashboard/);
  await page.goto("/admin/preview"); await expect(page.getByRole("region", { name: "Featured project", exact: true })).toContainText("Updated featured description.");
  await page.goto("/admin/dashboard"); await article(projects[0].title).getByRole("button", { name: "Remove featured project" }).click(); await expect(article(projects[0].title).getByRole("button", { name: "Set as featured project" })).toBeVisible();
  await page.goto("/admin/preview"); await expect(page.getByRole("region", { name: "Featured project", exact: true })).toHaveCount(0);
  await page.goto("/admin/dashboard"); await article(projects[0].title).getByRole("button", { name: "Set as featured project" }).click(); await expect(article(projects[0].title).getByRole("button", { name: "Remove featured project" })).toBeVisible();
  await article(projects[0].title).getByRole("button", { name: "Delete", exact: true }).click(); await article(projects[0].title).getByRole("button", { name: "Confirm delete" }).click(); await expect(article(projects[0].title)).toHaveCount(0);
  await page.goto("/admin/preview"); await expect(page.getByRole("region", { name: "Featured project", exact: true })).toHaveCount(0);
});
