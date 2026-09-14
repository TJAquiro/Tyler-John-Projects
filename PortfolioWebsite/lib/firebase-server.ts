import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import type { Publication } from "./portfolio-snapshot";

export class PublishError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const firebaseConfigured = () => Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_STORAGE_BUCKET && process.env.FIREBASE_WEB_API_KEY && process.env.FIREBASE_WEB_APP_ID);
export function firebaseAdmin() {
  if (!firebaseConfigured()) throw new PublishError("Online publishing is not connected yet. You can keep editing and download a backup.", 503);
  return getApps().find(app => app.name === "portfolio-publishing") || initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID, storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    ...(process.env.FIREBASE_AUTH_EMULATOR_HOST ? {} : { credential: applicationDefault() })
  }, "portfolio-publishing");
}
export const publishingDB = () => getFirestore(firebaseAdmin());
export const publishingBucket = () => getStorage(firebaseAdmin()).bucket();
export async function publishUser(request: Request, verified = true) {
  // Bearer tokens are explicitly supplied by the app; cookie-based local auth is never accepted.
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new PublishError("Sign in to publish your portfolio.", 401);
  const auth = getAuth(firebaseAdmin());
  const user = await auth.verifyIdToken(token, true).catch(() => { throw new PublishError("Your sign-in expired. Sign in again.", 401); });
  if (verified && !user.email_verified) throw new PublishError("Verify your email, then check verification before publishing.", 403);
  return user;
}
export async function readPublication(handle: string): Promise<Publication | null> {
  if (!firebaseConfigured() || !/^[a-z0-9-]{3,40}$/.test(handle)) return null;
  const doc = await publishingDB().collection("publishedPortfolios").doc(handle).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return { profile: data.profile, projects: data.projects, assets: data.assets, handle, revision: data.revision, publishedAt: data.publishedAt };
}
export function publishFailure(error: unknown) {
  if (error instanceof PublishError) return Response.json({ error: error.message }, { status: error.status });
  console.error("Publishing request failed", error instanceof Error ? error.name : "Unknown error");
  return Response.json({ error: "Publishing could not finish. Your previous published site is unchanged. Please retry." }, { status: 503 });
}
export async function readLimitedJSON(request: Request, limit = 500000): Promise<unknown> {
  if (!request.body) throw new PublishError("No portfolio was supplied.");
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > limit) { await reader.cancel(); throw new PublishError("This request is too large.", 413); } chunks.push(part.value); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new PublishError("The portfolio request could not be read."); }
}

export function draftFailure(error: unknown) {
  if (error instanceof PublishError) return Response.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "private, no-store" } });
  console.error("Account draft request failed", error instanceof Error ? error.name : "Unknown error");
  return Response.json({ error: "Account storage is temporarily unavailable. Your device draft is unchanged. Please retry." }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
}
