import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { startNode, stopTree, portOpen, runNode } from "./processes.mjs";

test("cleanup terminates an owned server grandchild without process enumeration", async () => {
  const root = path.resolve(".qa");
  fs.mkdirSync(root, { recursive: true });
  const directory = fs.mkdtempSync(path.join(root, "process-check-"));
  const ready = path.join(directory, "port.txt");
  const leaf = `const net=require('node:net'),fs=require('node:fs');const file=${JSON.stringify(ready)};const server=net.createServer();server.listen(0,'127.0.0.1',()=>{fs.writeFileSync(file+'.tmp',String(server.address().port));fs.renameSync(file+'.tmp',file);});`;
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

for (const mode of ["explicit cleanup", "runner timeout"]) {
  test(`${mode} closes a nested detached server and preserves unrelated servers`, async () => {
    const root = path.resolve(".qa");
    fs.mkdirSync(root, { recursive: true });
    const directory = fs.mkdtempSync(path.join(root, "nested-process-check-"));
    const ready = path.join(directory, "owned.json");
    const unrelatedReady = path.join(directory, "unrelated.json");
    const server = file => `const net=require('node:net'),fs=require('node:fs');const file=${JSON.stringify(file)};const s=net.createServer();s.listen(0,'127.0.0.1',()=>{fs.writeFileSync(file+'.tmp',JSON.stringify({pid:process.pid,port:s.address().port}));fs.renameSync(file+'.tmp',file);});`;
    const moduleURL = pathToFileURL(path.resolve("scripts/qa/processes.mjs")).href;
    const parent = `import {startNode} from ${JSON.stringify(moduleURL)};startNode(['-e',${JSON.stringify(server(ready))}],{stdio:'ignore'});setInterval(()=>{},1000);`;
    const env = { ...process.env, QA_PROCESS_REGISTRY: path.join(directory, "processes.jsonl") };
    // Sharing the registry must not make a sibling an owned descendant.
    const unrelated = startNode(["-e", server(unrelatedReady)], { stdio: "ignore", env });
    let child, outcome, owned;
    const readReady = async file => {
      const deadline = Date.now() + 10000;
      while (!fs.existsSync(file) && Date.now() < deadline) await delay(50);
      assert.ok(fs.existsSync(file), "server became ready");
      return JSON.parse(fs.readFileSync(file, "utf8"));
    };
    try {
      const sibling = await readReady(unrelatedReady);
      if (mode === "runner timeout") outcome = runNode(["--input-type=module", "-e", parent], { stdio: "ignore", env }, 5000);
      else child = startNode(["--input-type=module", "-e", parent], { stdio: "ignore", env });
      owned = await readReady(ready);
      assert.equal(await portOpen(owned.port), true);
      if (outcome) {
        const result = await outcome;
        assert.equal(result.timedOut, true);
        assert.notEqual(result.code, 0);
      } else stopTree(child);
      const deadline = Date.now() + 5000;
      while (await portOpen(owned.port) && Date.now() < deadline) await delay(50);
      assert.equal(await portOpen(owned.port), false, "nested detached server closed");
      assert.equal(await portOpen(sibling.port), true, "unrelated server was not killed");
    } finally {
      if (outcome) await outcome;
      stopTree(child);
      stopTree(unrelated);
      // Also clean up after a failed assertion against the old implementation.
      if (!owned && fs.existsSync(ready)) owned = JSON.parse(fs.readFileSync(ready, "utf8"));
      if (owned) {
        try { process.kill(process.platform === "win32" ? owned.pid : -owned.pid, "SIGKILL"); }
        catch (error) { if (error.code !== "ESRCH") throw error; }
      }
      if (path.dirname(directory) !== root) throw new Error("Unexpected scratch directory");
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
}
