import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { scryptSync } from "node:crypto";
const content = path.resolve(".qa/content"), accounts = path.resolve(".qa/accounts");
const id = "11111111-1111-4111-8111-111111111111";
fs.mkdirSync(path.join(content, "portfolios", id), { recursive: true }); fs.mkdirSync(accounts, { recursive: true });
for (const file of ["profile.json", "projects.json"]) {
  fs.copyFileSync(path.join("tests", "fixtures", file), path.join(content, file));
  fs.copyFileSync(path.join("tests", "fixtures", file), path.join(content, "portfolios", id, file));
}
fs.writeFileSync(path.join(content, "portfolios", id, "studio.json"), JSON.stringify({ step: 0, completed: false, projectDraft: null }));
fs.writeFileSync(path.join(content, "portfolios", "index.json"), JSON.stringify([{ id, handle: "qa-portfolio", name: "Alex Morgan" }]));
const salt = "qa-salt-for-tests";
fs.writeFileSync(path.join(accounts, "accounts.json"), JSON.stringify([{ id, name: "Alex Morgan", handle: "qa-portfolio", email: "qa@example.com", salt, hash: scryptSync("qa-password-only", salt, 64).toString("hex"), createdAt: "2026-01-01T00:00:00.000Z" }]));
const env = { ...process.env, FIREBASE_PROJECT_ID: "", FIREBASE_WEB_API_KEY: "", PORTFOLIO_DISABLE_LOCAL_EDITOR: "0", PORTFOLIO_UPLOAD_DIR: path.resolve(".qa/uploads"), PORTFOLIO_CONTENT_DIR: content, PORTFOLIO_ACCOUNT_DIR: accounts, PORTFOLIO_BUILD_DIR: ".next-qa", SESSION_SECRET: "qa-session-secret-never-used-for-real-content", PORTFOLIO_ADMIN_TOKEN: "qa-local-admin-token", NEXT_TELEMETRY_DISABLED: "1", VERCEL: "0" };
const next = path.resolve("node_modules/next/dist/bin/next");
function run(args) { return spawn(process.execPath, [next, ...args], { env, stdio: "inherit", windowsHide: true }); }
const build = run(["build"]);
build.on("exit", code => {
  if (code) { process.exit(code); return; }
  const server = run(["start", "--hostname", "127.0.0.1", "--port", "3100"]);
  process.on("SIGINT", () => server.kill()); process.on("SIGTERM", () => server.kill());
  server.on("exit", status => process.exit(status || 0));
});
