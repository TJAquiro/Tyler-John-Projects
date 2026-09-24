import { defineConfig } from "@playwright/test";
import path from "node:path";
const reportDir = process.env.QA_REPORT_DIR || ".qa/results/local";
export default defineConfig({
  testDir: "./tests", testIgnore: "firebase/**", workers: 1, fullyParallel: false, timeout: 120000,
  expect: { timeout: 15000 },
  forbidOnly: true, retries: 0, outputDir: path.join(reportDir, "artifacts"),
  reporter: [["list"], ["json", { outputFile: path.join(reportDir, "results.json") }], ["html", { open: "never", outputFolder: path.join(reportDir, "html") }]],
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: process.env.QA_MANAGED_SERVERS === "1" ? [] : [
    { command: "node scripts/qa-server.mjs", url: "http://127.0.0.1:3100", timeout: 600000, reuseExistingServer: false },
    { command: "node scripts/qa-dev-server.mjs", url: "http://127.0.0.1:3101", timeout: 90000, reuseExistingServer: false }
  ]
});
