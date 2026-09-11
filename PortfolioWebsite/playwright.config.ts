import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testIgnore: "firebase-publishing.spec.ts", workers: 1, fullyParallel: false, timeout: 120000,
  expect: { timeout: 15000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: [
    { command: "node scripts/qa-server.mjs", url: "http://127.0.0.1:3100", timeout: 600000, reuseExistingServer: false },
    { command: "node scripts/qa-dev-server.mjs", url: "http://127.0.0.1:3101", timeout: 90000, reuseExistingServer: false }
  ]
});
