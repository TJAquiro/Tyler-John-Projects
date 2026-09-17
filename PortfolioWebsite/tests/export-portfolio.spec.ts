import { test, expect } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseBackup } from "../lib/browser-draft";

const exporter = path.resolve("scripts/export-portfolio.mjs");
const emptyProfile = { name: "Fixture", headshotImage: "", biography: "", education: [], tools: [], jobs: [] };

function fixture(profile = emptyProfile) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-export-"));
  fs.mkdirSync(path.join(root, "content"), { recursive: true });
  fs.mkdirSync(path.join(root, "public", "images"), { recursive: true });
  fs.writeFileSync(path.join(root, "content", "profile.json"), JSON.stringify(profile));
  fs.writeFileSync(path.join(root, "content", "projects.json"), "[]");
  return root;
}

test("export accepts a supported image above the obsolete 5 MB limit and produces an importable backup", () => {
  const src = "/images/large.webp", root = fixture({ ...emptyProfile, headshotImage: src });
  try {
    const original = Buffer.alloc(5 * 1024 * 1024 + 1, 0x61);
    fs.writeFileSync(path.join(root, "public", src), original);
    execFileSync(process.execPath, [exporter], { cwd: root });
    const files = fs.readdirSync(path.join(root, ".local-backups"));
    expect(files).toHaveLength(1);
    const backup = fs.readFileSync(path.join(root, ".local-backups", files[0]), "utf8");
    const parsed = parseBackup(backup);
    expect(parsed.profile.headshotImage).toBe(src);
    expect(Buffer.from(parsed.images[src].split(",")[1], "base64")).toEqual(original);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("export rejects files above 500 MiB and libraries that cannot fit the 768 MiB importer guard before reading them", () => {
  const tooLarge = "/images/too-large.webp", root = fixture({ ...emptyProfile, headshotImage: tooLarge });
  try {
    fs.closeSync(fs.openSync(path.join(root, "public", tooLarge), "w"));
    fs.truncateSync(path.join(root, "public", tooLarge), 500 * 1024 * 1024 + 1);
    let result = spawnSync(process.execPath, [exporter], { cwd: root, encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Image exceeds 500 MB");

    const first = "/images/first.webp", second = "/images/second.webp";
    fs.writeFileSync(path.join(root, "content", "profile.json"), JSON.stringify({ ...emptyProfile, headshotImage: first, bannerImage: second }));
    for (const src of [first, second]) {
      fs.closeSync(fs.openSync(path.join(root, "public", src), "w"));
      fs.truncateSync(path.join(root, "public", src), 300 * 1024 * 1024);
    }
    result = spawnSync(process.execPath, [exporter], { cwd: root, encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("backup exceeds 768 MB");
    expect(fs.existsSync(path.join(root, ".local-backups"))).toBe(false);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
