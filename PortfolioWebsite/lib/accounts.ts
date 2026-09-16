import fs from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { contentRoot, initializePortfolio, readManifest, writeManifest } from "./content";
const scrypt = promisify(scryptCallback);
export type Account = { id: string; email: string; name: string; handle: string; salt: string; hash: string; createdAt: string; role?: "owner" | "member"; showcase?: boolean };
const directory = () => process.env.PORTFOLIO_ACCOUNT_DIR || path.join(process.cwd(), ".studio");
export function getAccounts(): Account[] {
  const file = path.join(directory(), "accounts.json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) as Account[] : [];
}
export function writeAccounts(accounts: Account[]) {
  fs.mkdirSync(directory(), { recursive: true });
  const file = path.join(directory(), "accounts.json"), temporary = file + "." + randomUUID() + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify(accounts, null, 2) + "\n");
  fs.renameSync(temporary, file);
}
export async function registerAccount(input: { name: string; email: string; password: string; handle: string }, options: { importExisting?: boolean; showcase?: boolean } = {}) {
  const name = input.name?.trim(), email = input.email?.trim().toLowerCase(), handle = input.handle?.trim().toLowerCase();
  if (!name || name.length > 100) throw new Error("Enter your name (up to 100 characters).");
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (typeof input.password !== "string" || input.password.length < 10 || input.password.length > 200) throw new Error("Use a password between 10 and 200 characters.");
  if (!handle || handle.length > 50 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle)) throw new Error("Your portfolio address needs lowercase letters, numbers, and single hyphens.");
  const salt = randomBytes(16).toString("hex"), hash = (await scrypt(input.password, salt, 64) as Buffer).toString("hex");
  // Read after hashing: two simultaneous registrations cannot reuse an address.
  const accounts = getAccounts(), manifest = readManifest();
  if (accounts.some(account => account.email === email)) throw new Error("That email already has an account. Sign in instead.");
  if (manifest.some(item => item.handle === handle)) throw new Error("That portfolio address is taken. Choose another.");
  const account: Account = { id: randomUUID(), name, email, handle, salt, hash, createdAt: new Date().toISOString(), role: accounts.length === 0 ? "owner" : "member", ...(options.showcase ? { showcase: true } : {}) };
  initializePortfolio(account.id, name, Boolean(options.importExisting && accounts.length === 0));
  writeManifest([...manifest, { id: account.id, handle, name }]);
  writeAccounts([...accounts, account]);
  return account;
}
export async function authenticateAccount(email: string, password: string) {
  const account = getAccounts().find(item => item.email === email.trim().toLowerCase());
  const salt = account?.salt || "00000000000000000000000000000000";
  const actual = await scrypt(password.slice(0, 200), salt, 64) as Buffer;
  return account && timingSafeEqual(actual, Buffer.from(account.hash, "hex")) ? account : null;
}
export function accountById(id: string) { return getAccounts().find(item => item.id === id) || null; }
export function isLocalOperator(account: Account) {
  if (account.role === "owner" || account.showcase) return true;
  // Existing registries predate roles; preserve their first account as owner.
  return getAccounts()[0]?.id === account.id;
}
export function resetAccountsAndContent() {
  for (const item of readManifest()) initializePortfolio(item.id, "");
  writeManifest([]);
  writeAccounts([]);
  fs.writeFileSync(path.join(contentRoot, "profile.json"), JSON.stringify({ name: "", headshotImage: "", biography: "", education: [], tools: [], jobs: [] }, null, 2));
  fs.writeFileSync(path.join(contentRoot, "projects.json"), "[]\n");
  fs.writeFileSync(path.join(contentRoot, "studio.json"), JSON.stringify({ step: 0, completed: false, projectDraft: null }));
}
