/* eslint-disable @typescript-eslint/no-require-imports */
// Preloaded only into QA children. Track explicit child handles instead of
// enumerating Windows processes (which restricted developer environments deny).
const fs = require("node:fs");
const cp = require("node:child_process");
const registry = process.env.QA_PROCESS_REGISTRY;
if (registry) {
  const record = (pid, parent, active) => {
    try { fs.appendFileSync(registry, JSON.stringify({ pid, parent, active }) + "\n"); } catch { /* The controlling runner also verifies ports close. */ }
  };
  record(process.pid, process.ppid, true);
  process.once("exit", () => record(process.pid, process.ppid, false));
  for (const name of ["spawn", "fork", "execFile"]) {
    const original = cp[name];
    cp[name] = function (...args) {
      const child = original.apply(this, args);
      if (child.pid) {
        record(child.pid, process.pid, true);
        child.once("exit", () => record(child.pid, process.pid, false));
      }
      return child;
    };
  }
}
