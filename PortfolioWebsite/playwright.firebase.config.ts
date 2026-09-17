import { defineConfig } from "@playwright/test";
export default defineConfig({
  outputDir: ".qa/firebase-test-results", testDir: "./tests", testMatch: "firebase/**/*.spec.ts", fullyParallel: false, workers: 1, timeout: 120000,
  expect: { timeout: 15000 }, reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:3102", browserName: "chromium", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: [
    { command: "node scripts/firebase-emulators.mjs", url: "http://127.0.0.1:9099", timeout: 600000, reuseExistingServer: process.env.PORTFOLIO_REUSE_EMULATORS === "1" },
    { command: "node scripts/firebase-qa-server.mjs", url: "http://127.0.0.1:3102/studio", timeout: 600000, reuseExistingServer: false }
  ]
});
