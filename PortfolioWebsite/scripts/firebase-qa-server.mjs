import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { resetFixtures } from "./qa/isolation.mjs";
resetFixtures(["firebase-content", "firebase-accounts"]);
const content = path.resolve(".qa/firebase-content"); fs.mkdirSync(content, { recursive: true });
for (const file of ["profile.json", "projects.json"]) fs.copyFileSync(path.join("tests/fixtures", file), path.join(content, file));
const env = { ...process.env, PORTFOLIO_CONTENT_DIR: content, PORTFOLIO_ACCOUNT_DIR: path.resolve(".qa/firebase-accounts"), PORTFOLIO_BUILD_DIR: ".next-qa-firebase", PORTFOLIO_DISABLE_LOCAL_EDITOR: "1", PORTFOLIO_FIREBASE_EMULATORS: "1", FIREBASE_PROJECT_ID: "demo-portfolio", FIREBASE_STORAGE_BUCKET: "demo-portfolio.firebasestorage.app", FIREBASE_WEB_API_KEY: "demo-test-key", FIREBASE_WEB_APP_ID: "demo-test-app", FIREBASE_AUTH_DOMAIN: "localhost", FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099", FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080", FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:9199", NEXT_TELEMETRY_DISABLED: "1" };
const next = path.resolve("node_modules/next/dist/bin/next");
let child = spawn(process.execPath, [next, "build"], { env, stdio: "inherit", windowsHide: true });
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  child.kill("SIGTERM");
  setTimeout(() => process.exit(0), 5000);
}
process.on("SIGINT", stop); process.on("SIGTERM", stop);
child.on("exit", code => {
  if (stopping) { process.exit(0); return; }
  if (code !== 0) { process.exit(code || 1); return; }
  child = spawn(process.execPath, [next, "start", "--hostname", "127.0.0.1", "--port", "3102"], { env, stdio: "inherit", windowsHide: true });
  child.on("exit", status => process.exit(stopping ? 0 : status || 0));
});
