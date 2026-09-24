import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { runNode } from "./qa/processes.mjs";
import { assess } from "./qa/results.mjs";

const started = Date.now();
const runId = new Date(started).toISOString().replace(/[:.]/g, "-");
const root = path.resolve(".qa/baseline"), runDir = path.join(root, "runs", runId);
fs.mkdirSync(runDir, { recursive: true });
// Prevent concurrent gates from sharing fixture directories or screenshot names.
const lockPath = path.join(root, "running.lock");
let lock;
try { lock = fs.openSync(lockPath, "wx"); } catch { throw new Error("A baseline is already running (or left .qa/baseline/running.lock after an interruption). Check that it has stopped before removing the lock."); }
fs.writeFileSync(lock, String(process.pid));
function files(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    const file = path.join(directory, item.name);
    if (item.isSymbolicLink()) throw new Error(`QA does not follow symlinks: ${file}`);
    return item.isDirectory() ? files(file) : [file];
  });
}
function fingerprints() {
  const protectedFiles = [...files("content"), ...files(".studio"), ...files("public/images"), ...fs.readdirSync(".").filter(name => /^\.env(?:\.|$)/.test(name) || /service-account.*\.json$/.test(name))];
  return Object.fromEntries(protectedFiles.sort().map(file => [file, createHash("sha256").update(fs.readFileSync(file)).digest("hex")]));
}
function implementationHash() {
  const hash = createHash("sha256");
  const source = [...files("app"), ...files("components"), ...files("lib"), ...files("scripts"), ...files("tests"), ...files("public/fonts"), ...fs.readdirSync(".").filter(name => /^(?:package(?:-lock)?\.json|.*\.config\.(?:ts|mjs)|tsconfig\.json|firebase\.json|.*\.rules)$/.test(name))];
  for (const file of source.sort()) hash.update(file).update(fs.readFileSync(file));
  return hash.digest("hex");
}
const summary = { runId, startedAt: new Date(started).toISOString(), status: "running", environment: { node: process.version, platform: process.platform, browser: "Chromium", backends: "isolated local fixtures and demo-portfolio emulators" }, phases: [], suites: {}, reasons: [], screenshots: [], limitations: ["Firefox/WebKit, live email delivery, production IAM/deployment, and manual assistive-technology testing are not covered."] };
const write = () => {
  fs.writeFileSync(path.join(runDir, "summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(root, "latest.json"), JSON.stringify({ runId, directory: runDir, status: summary.status }, null, 2));
};
write();
let before;
try {
  before = fingerprints();
  summary.implementationHash = implementationHash();
  const catalog = JSON.parse(fs.readFileSync("tests/case-catalog.json", "utf8"));
  const phases = [
    ["harness", ["--test", "scripts/qa/results.test.mjs", "scripts/qa/processes.test.mjs"]],
    ["lint", ["node_modules/eslint/bin/eslint.js", "."]],
    ["typecheck", ["node_modules/typescript/bin/tsc", "--noEmit"]],
    ["local", ["scripts/qa-suite.mjs", "local"]],
    ["firebase", ["scripts/qa-suite.mjs", "firebase"]],
  ];
  for (const [name, args] of phases) {
    const directory = path.join(runDir, name); fs.mkdirSync(directory, { recursive: true });
    console.log(`Baseline ${runId}: ${name} (log: ${path.join(directory, "run.log")})`);
    const fd = fs.openSync(path.join(directory, "run.log"), "w");
    let result;
    try { result = await runNode(args, { stdio: ["ignore", fd, fd], env: { ...process.env, QA_REPORT_DIR: directory, QA_PROCESS_REGISTRY: path.join(directory, "processes.jsonl") } }, 40 * 60 * 1000); }
    finally { fs.closeSync(fd); }
    summary.phases.push({ name, ...result });
    if (result.code !== 0 || result.timedOut) summary.reasons.push(`${name} failed or did not finish; see ${name}/run.log`);
    if (["local", "firebase"].includes(name)) {
      const report = path.join(directory, "results.json");
      if (!fs.existsSync(report)) summary.reasons.push(`${name}: no completed Playwright report`);
      else {
        summary.suites[name] = assess(JSON.parse(fs.readFileSync(report, "utf8")), result.code, catalog.filter(c => c.suite === name).map(c => c.id));
        summary.reasons.push(...summary.suites[name].reasons.map(reason => `${name}: ${reason}`));
      }
      const lifecycle = path.join(directory, "lifecycle.json");
      if (!fs.existsSync(lifecycle) || !JSON.parse(fs.readFileSync(lifecycle, "utf8")).portsClosed) summary.reasons.push(`${name}: cleanup was not verified`);
    }
    write();
    // Do not build/run the application when the harness or static checks fail.
    if (!["local", "firebase"].includes(name) && result.code !== 0) break;
  }
} catch (error) { summary.reasons.push(error.message); }
finally {
  try {
    const after = fingerprints();
    summary.implementationUnchanged = summary.implementationHash === implementationHash();
    if (!summary.implementationUnchanged) summary.reasons.push("Implementation changed during this run; rerun the baseline on the final code.");
    summary.ownerFilesUnchanged = Boolean(before) && JSON.stringify(before) === JSON.stringify(after);
    summary.protectedFileCount = Object.keys(after).length;
    if (!summary.ownerFilesUnchanged) summary.reasons.push("Owner content, images, or credentials changed during the run (hashes withheld).");
    const screenshotDir = path.join(runDir, "screenshots"); fs.mkdirSync(screenshotDir, { recursive: true });
    for (const file of files(".qa/screenshots").filter(file => file.endsWith(".png") && fs.statSync(file).mtimeMs >= started)) {
      const target = path.join(screenshotDir, path.basename(file)); fs.copyFileSync(file, target); summary.screenshots.push(target);
    }
    for (const width of [375, 768, 1440]) for (const surface of ["landing", "home", "about", "project", "dashboard", "signup", "login", "baseline-preview", "firebase-published", "firebase-public"]) {
      if (!summary.screenshots.some(file => path.basename(file) === `${surface}-${width}.png`)) summary.reasons.push(`Missing fresh screenshot: ${surface}-${width}.png`);
    }
  } catch (error) { summary.reasons.push(`Evidence preservation failed: ${error.message}`); }
  summary.status = summary.reasons.length ? "failed" : "passed";
  summary.finishedAt = new Date().toISOString();
  write();
  const cases = Object.values(summary.suites).flatMap(suite => suite.cases);
  const handoff = ["# Critic baseline handoff", "", `Run: ${runId}`, `Status: **${summary.status.toUpperCase()}**`, `Cases in report: ${cases.length}; executed: ${cases.filter(c => c.attempts.some(a => a.status !== "skipped")).length}; skipped/unexecuted: ${cases.filter(c => !c.attempts.length || c.attempts.every(a => a.status === "skipped")).length}; clean passes: ${cases.filter(c => c.status === "expected" && c.attempts.length === 1 && c.attempts[0].status === "passed").length}.`, `Owner files unchanged: ${summary.ownerFilesUnchanged ?? "unverified"}.`, "", "## Failures / limitations", ...summary.reasons.map(reason => `- ${reason}`), ...summary.limitations.map(reason => `- ${reason}`), "", "## Evidence", "- Full case results, skips, errors, screenshot paths, and trace attachments: summary.json and each suite's results.json.", "- Server/build logs and lifecycle results: local/ and firebase/.", "- Fresh screenshots: screenshots/ (also individually listed in summary.json).", "", "The critic must read this run's results and inspect relevant screenshots. Passing automation is a functionality/code baseline, not a visual-quality score. Review task fulfillment, usability, flow, aesthetics, clarity, layout, and professional finish independently. A failed baseline must remain visible in the final report.", ""];
  fs.writeFileSync(path.join(runDir, "CRITIC-HANDOFF.md"), handoff.join("\n"));
  fs.closeSync(lock); fs.unlinkSync(lockPath);
}
console.log(`Baseline ${summary.status.toUpperCase()}: ${runDir}`);
process.exitCode = summary.status === "passed" ? 0 : 1;
