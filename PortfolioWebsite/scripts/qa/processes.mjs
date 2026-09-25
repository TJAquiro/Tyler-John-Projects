import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";

// Only terminate a process tree created by this harness, never a port owner.
export function stopTree(child) {
  if (!child?.pid) return;
  const records = new Map();
  if (child.qaRegistry && fs.existsSync(child.qaRegistry)) {
    for (const line of fs.readFileSync(child.qaRegistry, "utf8").split("\n").filter(Boolean)) {
      try { const row = JSON.parse(line); records.set(row.pid, row); } catch { /* Ignore an in-progress final append; port verification fails closed. */ }
    }
  }
  const seen = new Set([child.pid]);
  const descendants = parent => [...records.values()].filter(row => row.parent === parent && !seen.has(row.pid)).flatMap(row => { seen.add(row.pid); return [...descendants(row.pid), row]; });
  for (const row of descendants(child.pid)) if (row.active) {
    // Nested harness runners start their own POSIX process groups. Killing only
    // the outer group leaves those servers alive after a timeout/interruption.
    if (process.platform !== "win32") {
      try { process.kill(-row.pid, "SIGKILL"); continue; } catch (error) { if (error.code !== "ESRCH") throw error; }
    }
    try { process.kill(row.pid, "SIGKILL"); } catch (error) { if (error.code !== "ESRCH") throw error; }
  }
  if (process.platform === "win32") {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
  } else {
    try { process.kill(-child.pid, "SIGKILL"); } catch (error) { if (error.code !== "ESRCH") throw error; }
  }
}

export function startNode(args, options = {}) {
  const env = { ...(options.env || process.env) };
  if (env.QA_PROCESS_REGISTRY) {
    const preload = `--require="${path.resolve("scripts/qa/track-processes.cjs").replaceAll("\\", "/")}"`;
    if (!(env.NODE_OPTIONS || "").includes(preload)) env.NODE_OPTIONS = `${env.NODE_OPTIONS || ""} ${preload}`.trim();
  }
  const child = spawn(process.execPath, args, { windowsHide: true, detached: process.platform !== "win32", ...options, env });
  child.qaRegistry = env.QA_PROCESS_REGISTRY;
  return child;
}

export function portOpen(port) {
  return new Promise(resolve => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const finish = value => { socket.destroy(); resolve(value); };
    socket.setTimeout(500);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

export async function runNode(args, options = {}, timeout = 20 * 60 * 1000) {
  const child = startNode(args, { stdio: "inherit", ...options });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; stopTree(child); }, timeout);
  const interrupt = () => stopTree(child);
  process.once("SIGINT", interrupt); process.once("SIGTERM", interrupt);
  try {
    return await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => resolve({ code: code ?? 1, signal, timedOut }));
    });
  } finally {
    clearTimeout(timer);
    process.off("SIGINT", interrupt); process.off("SIGTERM", interrupt);
  }
}
