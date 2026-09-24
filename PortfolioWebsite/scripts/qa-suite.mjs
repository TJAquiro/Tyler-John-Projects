import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { startNode, stopTree, portOpen, runNode } from "./qa/processes.mjs";

const suite = process.argv[2];
if (!["local", "firebase"].includes(suite)) throw new Error("Choose local or firebase.");
const reportDir = path.resolve(process.env.QA_REPORT_DIR || `.qa/results/${suite}`);
fs.mkdirSync(reportDir, { recursive: true });
if (!process.env.QA_PROCESS_REGISTRY) {
  process.env.QA_PROCESS_REGISTRY = path.join(reportDir, "processes.jsonl");
  fs.writeFileSync(process.env.QA_PROCESS_REGISTRY, "");
}
const servers = suite === "local"
  ? [{ script: "qa-server", port: 3100 }, { script: "qa-dev-server", port: 3101 }]
  : [{ script: "firebase-emulators", port: 9099 }, { script: "firebase-qa-server", port: 3102 }];
const ports = suite === "local" ? [3100, 3101] : [3102, 3103, 9099, 8080, 9199, 4400, 4500, 9150];
const children = [];
let code = 1;
const cleanup = () => { for (const child of children.toReversed()) stopTree(child); };
const interrupted = () => { cleanup(); process.exit(130); };
process.once("SIGINT", interrupted); process.once("SIGTERM", interrupted);
try {
  for (const port of ports) if (await portOpen(port)) throw new Error(`QA port ${port} is occupied. Stop that server before testing; it will not be reused or killed.`);
  for (const server of servers) {
    const log = fs.openSync(path.join(reportDir, `${server.script}.log`), "w");
    const child = startNode([`scripts/${server.script}.mjs`], { stdio: ["ignore", log, log], env: { ...process.env, PORTFOLIO_REUSE_EMULATORS: "0" } });
    fs.closeSync(log); children.push(child);
    let spawnError;
    child.once("error", error => { spawnError = error; });
    const deadline = Date.now() + 600000;
    while (true) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null || child.signalCode !== null) throw new Error(`${server.script} exited before readiness. See ${reportDir}.`);
      const ready = server.script === "firebase-emulators"
        ? (await Promise.all([9099, 8080, 9199].map(portOpen))).every(Boolean)
        : await fetch(`http://127.0.0.1:${server.port}${suite === "firebase" ? "/studio" : "/"}`, { signal: AbortSignal.timeout(2000) }).then(r => r.ok).catch(() => false);
      if (ready) break;
      if (Date.now() > deadline) throw new Error(`${server.script} did not become ready within 10 minutes.`);
      await delay(500);
    }
    console.log(`Ready: ${server.script} (${server.port})`);
  }
  const args = ["node_modules/@playwright/test/cli.js", "test", ...(suite === "firebase" ? ["--config", "playwright.firebase.config.ts"] : []), ...process.argv.slice(3)];
  const result = await runNode(args, { env: { ...process.env, QA_MANAGED_SERVERS: "1", QA_REPORT_DIR: reportDir } });
  code = result.code;
  if (result.timedOut) console.error("Playwright timed out; incomplete execution is a failure.");
} catch (error) { console.error(error.message); }
finally {
  cleanup();
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline && (await Promise.all(ports.map(portOpen))).some(Boolean)) await delay(250);
  const remaining = [];
  for (const port of ports) if (await portOpen(port)) remaining.push(port);
  if (remaining.length) { console.error(`QA ports still open after cleanup: ${remaining.join(", ")}`); code = 1; }
  fs.writeFileSync(path.join(reportDir, "lifecycle.json"), JSON.stringify({ suite, code, portsClosed: remaining.length === 0, finishedAt: new Date().toISOString() }, null, 2));
}
process.exitCode = code;
