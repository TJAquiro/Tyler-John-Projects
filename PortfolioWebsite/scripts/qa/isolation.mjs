import fs from "node:fs";
import path from "node:path";

export function resetFixtures(names) {
  const root = path.resolve(".qa");
  if (fs.existsSync(root) && fs.lstatSync(root).isSymbolicLink()) throw new Error("Refusing a linked QA root.");
  for (const name of names) {
    if (!["content", "accounts", "uploads", "dev-content", "dev-accounts", "firebase-content", "firebase-accounts"].includes(name)) throw new Error("Unknown fixture directory.");
    const target = path.resolve(root, name);
    if (path.dirname(target) !== root || (fs.existsSync(target) && fs.lstatSync(target).isSymbolicLink())) throw new Error(`Unsafe fixture path: ${target}`);
    // An allowlisted direct child of the verified workspace QA root only.
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(target, { recursive: true });
  }
}
