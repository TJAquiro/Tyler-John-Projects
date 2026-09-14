import { IMAGE_CHUNK_BYTES, MAX_IMAGE_BYTES } from "./portfolio-snapshot";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
let pending: Promise<Auth | null> | undefined;
export function publishingAuth(): Promise<Auth | null> {
  if (!pending) pending = (async () => {
    const response = await fetch("/api/firebase-config", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not connect to publishing. Try again later.");
    const data = await response.json();
    if (!data.enabled) return null;
    const existing = getApps().find(app => app.name === "portfolio-browser");
    const auth = getAuth(existing || initializeApp(data.config, "portfolio-browser"));
    if (!existing && data.authEmulator && ["127.0.0.1", "localhost"].includes(location.hostname)) connectAuthEmulator(auth, data.authEmulator, { disableWarnings: true });
    return auth;
  })().then(auth => { if (!auth) pending = undefined; return auth; }).catch(error => { pending = undefined; throw error; });
  return pending;
}
export async function publishingFetch(path: string, init: RequestInit = {}) {
  const auth = await publishingAuth();
  if (!auth?.currentUser) throw new Error("Sign in to publish your portfolio.");
  const headers = new Headers(init.headers); headers.set("Authorization", `Bearer ${await auth.currentUser.getIdToken()}`);
  const response = await fetch(path, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not finish. Please try again.");
  return data;
}
export async function uploadPublishingImage(file: Blob, progress: (percent: number) => void) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Choose an image no larger than 500 MB.");
  if (file.size <= IMAGE_CHUNK_BYTES) return publishingFetch("/api/publish/image", { method: "POST", headers: { "Content-Type": file.type }, body: file });
  const { id } = await publishingFetch("/api/publish/image/chunks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size: file.size }) });
  const path = `/api/publish/image/chunks?id=${id}`;
  try {
    for (let offset = 0, part = 0; offset < file.size; offset += IMAGE_CHUNK_BYTES, part++) {
      await publishingFetch(`${path}&part=${part}`, { method: "PUT", body: file.slice(offset, offset + IMAGE_CHUNK_BYTES) });
      progress(Math.round(Math.min(file.size, offset + IMAGE_CHUNK_BYTES) / file.size * 100));
    }
    return await publishingFetch(path, { method: "PATCH" });
  } catch (error) { await publishingFetch(path, { method: "DELETE" }).catch(() => {}); throw error; }
}
