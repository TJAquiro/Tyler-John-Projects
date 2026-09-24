import { account, db, draftBody, expect, test } from "./fixtures";

test("API-001 hosted private endpoints reject anonymous requests without creating records", async ({ request }) => {
  const calls: [string, string][] = [["GET", "/api/draft"], ["PUT", "/api/draft"], ["GET", "/api/publish"], ["POST", "/api/publish"], ["PATCH", "/api/publish"], ["DELETE", "/api/account"], ["GET", "/api/draft/image?id=invalid"]];
  for (const scope of ["publish", "draft"]) {
    calls.push(["POST", `/api/${scope}/image`]);
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) calls.push([method, `/api/${scope}/image/chunks?id=${"a".repeat(64)}&part=0`]);
  }
  for (const [method, url] of calls) {
    const response = await request.fetch(url, { method });
    expect(response.status(), `${method} ${url}`).toBe(401);
  }
  expect((await db.collection("publishers").get()).empty).toBe(true);
  expect((await db.collection("publishedPortfolios").get()).empty).toBe(true);
});

test("API-002 invalid cloud updates preserve the previous draft and its revision", async ({ request }) => {
  const owner = await account(request, "baseline-api@example.com");
  expect((await request.put("/api/draft", { headers: owner.headers, data: draftBody("Saved name") })).status()).toBe(200);
  const read = async () => (await (await request.get("/api/draft", { headers: owner.headers })).json()).draft;
  const before = await read();
  for (const invalid of [{ ...draftBody("Bad"), version: 2 }, { ...draftBody("Bad"), revision: -1 }, { ...draftBody("Bad", 1), content: { profile: { name: 42 } } }]) {
    expect((await request.put("/api/draft", { headers: owner.headers, data: invalid })).status()).toBe(400);
    expect(await read()).toEqual(before);
  }
  expect((await request.put("/api/draft", { headers: { ...owner.headers, "Content-Type": "application/json" }, data: "{" })).status()).toBe(400);
  expect(await read()).toEqual(before);
  expect((await request.put("/api/draft", { headers: owner.headers, data: draftBody("Stale overwrite", 0) })).status()).toBe(409);
  expect(await read()).toEqual(before);
});

test("API-003 hosted configuration is public-only and legacy file editing stays disabled", async ({ request, page }) => {
  const response = await request.get("/api/firebase-config");
  expect(response.headers()["cache-control"]).toBe("no-store");
  const config = await response.json();
  expect(config.enabled).toBe(true);
  expect(Object.keys(config.config).sort()).toEqual(["apiKey", "appId", "authDomain", "projectId", "storageBucket"]);
  expect(config.config.projectId).toBe("demo-portfolio");
  expect((await request.post("/api/auth/register", { data: { adminToken: "qa-local-admin-token" } })).status()).toBe(403);
  expect((await request.put("/api/content", { data: { profile: { name: "No hosted writes" } } })).status()).toBe(401);
  expect((await request.get("/p/not-published")).status()).toBe(404);
  await page.goto("/p/not-published");
  await expect(page.getByRole("heading", { name: "That page has moved." })).toBeVisible();
  await page.getByRole("link", { name: /Back to Portfolio studio/ }).click();
  await expect(page).toHaveURL("/");
});
