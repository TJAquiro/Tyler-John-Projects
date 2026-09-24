import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { startNode, stopTree, portOpen } from "./processes.mjs";

test("cleanup terminates an owned server grandchild without process enumeration", async () => {
  const root = path.resolve(".qa");
  fs.mkdirSync(root, { recursive: true });
  const directory = fs.mkdtempSync(path.join(root, "process-check-"));
  const ready = path.join(directory, "port.txt");
  const leaf = `const net=require('node:net'),fs=require('node:fs');const server=net.createServer();server.listen(0,'127.0.0.1',()=>fs.writeFileSync(${JSON.stringify(ready)},String(server.address().port)));`;
  const parent = `require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(leaf)}],{stdio:'ignore'});setInterval(()=>{},1000);`;
  const child = startNode(["-e", parent], { stdio: "ignore", env: { ...process.env, QA_PROCESS_REGISTRY: path.join(directory, "processes.jsonl") } });
  try {
    const deadline = Date.now() + 10000;
    while (!fs.existsSync(ready) && Date.now() < deadline) await delay(50);
    assert.ok(fs.existsSync(ready), "grandchild server started");
    const port = Number(fs.readFileSync(ready, "utf8"));
    assert.equal(await portOpen(port), true);
    stopTree(child);
    const stopped = Date.now() + 5000;
    while (await portOpen(port) && Date.now() < stopped) await delay(50);
    assert.equal(await portOpen(port), false, "grandchild port closed");
  } finally {
    stopTree(child);
    if (path.dirname(directory) !== root) throw new Error("Unexpected scratch directory");
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
