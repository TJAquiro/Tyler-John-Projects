// Read-only migration of the existing portfolio into a portable browser backup.
import fs from "node:fs";
import path from "node:path";
const account = process.argv[2];
if (account && !/^[a-z0-9-]{36}$/.test(account)) throw new Error("Use a local account ID, or omit it to export the root portfolio.");
const folder = account ? path.join("content/portfolios", account) : "content";
const profile = JSON.parse(fs.readFileSync(path.join(folder, "profile.json"), "utf8"));
const projects = JSON.parse(fs.readFileSync(path.join(folder, "projects.json"), "utf8"));
const refs = [...new Set([profile.headshotImage, profile.bannerImage, ...projects.flatMap(p => [p.thumbnail, ...p.images])].filter(Boolean))];
const images = {};
for (const src of refs) {
  if (!/^\/images\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/i.test(src)) throw new Error(`Export needs PNG/JPG/WebP images. Replace or convert this image in a copy first: ${src}`);
  const bytes = fs.readFileSync(path.join("public", src));
  if (bytes.length > 5 * 1024 * 1024) throw new Error(`Image exceeds 5 MB: ${src}`);
  const mime = src.toLowerCase().endsWith("png") ? "image/png" : src.toLowerCase().endsWith("webp") ? "image/webp" : "image/jpeg";
  images[src] = `data:${mime};base64,${bytes.toString("base64")}`;
}
const backup = { format: "portfolio-draft", version: 1, profile, projects, images, section: 0, projectDraft: null, ownerUid: null, publication: null, updatedAt: new Date().toISOString() };
const text = JSON.stringify(backup, null, 2);
if (text.length > 100 * 1024 * 1024) throw new Error("The backup exceeds 100 MB. Reduce image sizes first.");
fs.mkdirSync(".local-backups", { recursive: true });
const output = path.join(".local-backups", `browser-portfolio-${account || "root"}-${Date.now()}.json`);
fs.writeFileSync(output, text, { flag: "wx" });
console.log(`Exported content and images to ${output}. Import this file at /studio. Original content and credentials were not changed.`);
