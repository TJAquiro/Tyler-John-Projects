import { defineConfig } from "@playwright/test";
import path from "node:path";
const reportDir = process.env.QA_REPORT_DIR || ".qa/results/firebase";
export default defineConfig({
  outputDir: path.join(reportDir, "artifacts"), testDir: "./tests", testMatch: "firebase/**/*.spec.ts", fullyParallel: false, workers: 1, timeout: 120000,
  forbidOnly: true, retries: 0,
  expect: { timeout: 15000 }, reporter: [["list"], ["json", { outputFile: path.join(reportDir, "results.json") }], ["html", { open: "never", outputFolder: path.join(reportDir, "html") }]],
  use: { baseURL: "http://127.0.0.1:3102", browserName: "chromium", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: process.env.QA_MANAGED_SERVERS === "1" ? [] : [
    { command: "node scripts/firebase-emulators.mjs", url: "http://127.0.0.1:9099", timeout: 600000, reuseExistingServer: process.env.PORTFOLIO_REUSE_EMULATORS === "1" },
    { command: "node scripts/firebase-qa-server.mjs", url: "http://127.0.0.1:3102/studio", timeout: 600000, reuseExistingServer: false }
  ]
});
