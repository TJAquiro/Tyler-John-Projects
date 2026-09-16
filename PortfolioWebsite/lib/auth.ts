import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { accountById } from "./accounts";
export const SESSION_COOKIE = "portfolio_session";
export const SESSION_AGE = 60 * 60 * 24 * 7;
export const authConfigured = () => Boolean(process.env.SESSION_SECRET);
export const localAdminConfigured = () => Boolean(process.env.PORTFOLIO_ADMIN_TOKEN);
export const editingEnabled = () => process.env.VERCEL !== "1" && process.env.PORTFOLIO_DISABLE_LOCAL_EDITOR !== "1" && !process.env.K_SERVICE;
function equal(a: string, b: string) { const first = Buffer.from(a), second = Buffer.from(b); return first.length === second.length && timingSafeEqual(first, second); }
export function validLocalAdminToken(value: unknown) {
  return typeof value === "string" && localAdminConfigured() && equal(value, process.env.PORTFOLIO_ADMIN_TOKEN!);
}
function signature(value: string) { return createHmac("sha256", process.env.SESSION_SECRET!).update(value).digest("hex"); }
export function createSessionToken(accountId: string) {
  if (!authConfigured()) throw new Error("Studio login is not configured.");
  const value = `${accountId}.${Math.floor(Date.now() / 1000) + SESSION_AGE}.${randomBytes(16).toString("hex")}`;
  return `${value}.${signature(value)}`;
}
export async function currentAccount() {
  if (!editingEnabled()) return null;
  if (!authConfigured()) return null;
  const actual = (await cookies()).get(SESSION_COOKIE)?.value || "", [id, expires, nonce, signed, extra] = actual.split(".");
  if (extra || !/^[a-z0-9-]{36}$/.test(id || "") || !/^\d+$/.test(expires || "") || !/^[a-f0-9]{32}$/.test(nonce || "") || !/^[a-f0-9]{64}$/.test(signed || "")) return null;
  if (Number(expires) <= Date.now() / 1000 || !equal(signed, signature(`${id}.${expires}.${nonce}`))) return null;
  return accountById(id);
}
export async function isAuthenticated() { return Boolean(await currentAccount()); }
export async function requireAuth() { const account = await currentAccount(); if (!account) redirect("/admin/login"); return account; }
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin"); if (!origin) return true;
  try { const source = new URL(origin), target = new URL(request.url); return source.host === (request.headers.get("host") || target.host) && source.protocol === target.protocol; } catch { return false; }
}
export function localMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin), target = new URL(request.url);
    const requestHost = request.headers.get("host") || target.host;
    const requestProtocol = request.headers.get("x-forwarded-proto") || target.protocol.replace(":", "");
    return source.host === requestHost
      && source.protocol === `${requestProtocol}:`
      && ["localhost", "127.0.0.1", "[::1]"].includes(source.hostname);
  } catch { return false; }
}
export function localDevelopment(request?: Request) {
  if (process.env.NODE_ENV !== "development" || !editingEnabled()) return false;
  if (!request) return true;
  const host = (request.headers.get("host") || new URL(request.url).host).split(":")[0];
  return ["localhost", "127.0.0.1", "[::1]"].includes(host);
}
