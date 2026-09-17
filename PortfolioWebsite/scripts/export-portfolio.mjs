// Read-only migration of the existing portfolio into a portable browser backup.
import fs from "node:fs";
import path from "node:path";
// Keep these aligned with lib/portfolio-snapshot.ts. The exported JSON must
// pass BrowserStudio's File-size guard before parseBackup can inspect it.
const MAX_IMAGE_BYTES = 500 * 1024 * 1024;
const MAX_BACKUP_BYTES = 768 * 1024 * 1024;
const account = process.argv[2];
if (account && !/^[a-z0-9-]{36}$/.test(account)) throw new Error("Use a local account ID, or omit it to export the root portfolio.");
const folder = account ? path.join("content/portfolios", account) : "content";
const profile = JSON.parse(fs.readFileSync(path.join(folder, "profile.json"), "utf8"));
const projects = JSON.parse(fs.readFileSync(path.join(folder, "projects.json"), "utf8"));
const refs = [...new Set([profile.headshotImage, profile.bannerImage, ...projects.flatMap(p => [p.thumbnail, ...p.images])].filter(Boolean))];
const sources = refs.map(src => {
  if (!/^\/images\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/i.test(src)) throw new Error(`Export needs PNG/JPG/WebP images. Replace or convert this image in a copy first: ${src}`);
  const file = path.join("public", src), size = fs.statSync(file).size;
  if (size > MAX_IMAGE_BYTES) throw new Error(`Image exceeds 500 MB: ${src}`);
  return { src, file, size };
});
// Refuse libraries whose base64 data alone cannot fit through the browser
// importer's 768 MiB File/JSON guard. The exact serialized size is checked below.
const encodedImageBytes = sources.reduce((total, { src, size }) => {
  const mime = src.toLowerCase().endsWith("png") ? "image/png" : src.toLowerCase().endsWith("webp") ? "image/webp" : "image/jpeg";
  return total + Buffer.byteLength(`data:${mime};base64,`) + 4 * Math.ceil(size / 3);
}, 0);
if (encodedImageBytes > MAX_BACKUP_BYTES) throw new Error("The backup exceeds 768 MB. Reduce image sizes first.");
const images = {};
for (const { src, file } of sources) {
  const bytes = fs.readFileSync(file);
  const mime = src.toLowerCase().endsWith("png") ? "image/png" : src.toLowerCase().endsWith("webp") ? "image/webp" : "image/jpeg";
  images[src] = `data:${mime};base64,${bytes.toString("base64")}`;
}
const backup = { format: "portfolio-draft", version: 1, profile, projects, images, section: 0, projectDraft: null, ownerUid: null, publication: null, updatedAt: new Date().toISOString() };
const text = JSON.stringify(backup, null, 2);
if (Buffer.byteLength(text) > MAX_BACKUP_BYTES) throw new Error("The backup exceeds 768 MB. Reduce image sizes first.");
fs.mkdirSync(".local-backups", { recursive: true });
const output = path.join(".local-backups", `browser-portfolio-${account || "root"}-${Date.now()}.json`);
fs.writeFileSync(output, text, { flag: "wx" });
console.log(`Exported content and images to ${output}. Import this file at /studio. Original content and credentials were not changed.`);
