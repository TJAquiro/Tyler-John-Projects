import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
const javaRoot = path.resolve(".qa/java");
const portable = fs.existsSync(javaRoot) ? fs.readdirSync(javaRoot).find(name => fs.existsSync(path.join(javaRoot, name, "bin", "java.exe"))) : null;
const env = { ...process.env, FIREBASE_EMULATORS_PATH: path.resolve(".qa/firebase-emulators"), ...(portable ? { PATH: path.join(javaRoot, portable, "bin") + path.delimiter + process.env.PATH } : {}) };
const child = spawn(process.execPath, [path.resolve("node_modules/firebase-tools/lib/bin/firebase.js"), "emulators:start", "--only", "auth,firestore,storage", "--project", "demo-portfolio", "--config", "firebase.json"], { env, stdio: "inherit", windowsHide: true });
process.on("SIGINT", () => child.kill()); process.on("SIGTERM", () => child.kill()); child.on("exit", code => process.exit(code || 0));
