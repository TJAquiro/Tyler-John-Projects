import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
const javaRoot = path.resolve(".qa/java");
const portable = fs.existsSync(javaRoot) ? fs.readdirSync(javaRoot).find(name => fs.existsSync(path.join(javaRoot, name, "bin", process.platform === "win32" ? "java.exe" : "java"))) : null;
const env = { ...process.env, XDG_CONFIG_HOME: path.resolve(".qa/firebase-config"), FIREBASE_EMULATORS_PATH: path.resolve(".qa/firebase-emulators"), ...(portable ? { PATH: path.join(javaRoot, portable, "bin") + path.delimiter + process.env.PATH } : {}) };
const child = spawn(process.execPath, [path.resolve("node_modules/firebase-tools/lib/bin/firebase.js"), "emulators:start", "--only", "auth,firestore,storage", "--project", "demo-portfolio", "--config", "firebase.json"], { env, stdio: "inherit", windowsHide: true });
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  child.kill("SIGTERM");
  // Some Windows Firebase CLI versions close every emulator port but retain
  // their wrapper process. Do not let that block Playwright's final result.
  setTimeout(() => process.exit(0), 5000);
}
process.on("SIGINT", stop); process.on("SIGTERM", stop);
child.on("exit", code => process.exit(stopping ? 0 : code || 0));
