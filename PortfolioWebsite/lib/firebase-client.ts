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
export class PublishingRequestError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function accountFetch(path: string, init: RequestInit = {}, uid?: string) {
  const auth = await publishingAuth();
  if (!auth?.currentUser) throw new Error("Sign in to publish your portfolio.");
  if (uid && auth.currentUser.uid !== uid) throw new Error("The signed-in account changed. Reopen your draft.");
  const headers = new Headers(init.headers); headers.set("Authorization", `Bearer ${await auth.currentUser.getIdToken()}`);
  const response = await fetch(path, { ...init, headers });
  return response;
}
export async function publishingFetch(path: string, init: RequestInit = {}, uid?: string) {
  const response = await accountFetch(path, init, uid);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new PublishingRequestError(data.error || "Could not finish. Please try again.", response.status);
  return data;
}
export async function uploadPublishingImage(file: Blob, progress: (percent: number) => void, draftUid?: string, signal?: AbortSignal) {
  const root = draftUid ? "/api/draft/image" : "/api/publish/image";
  const send = (path: string, init: RequestInit) => publishingFetch(path, { ...init, signal }, draftUid);
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Choose an image no larger than 500 MB.");
  if (file.size <= IMAGE_CHUNK_BYTES) return send(root, { method: "POST", headers: { "Content-Type": file.type }, body: file });
  const { id } = await send(`${root}/chunks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size: file.size }) });
  const path = `${root}/chunks?id=${id}`;
  try {
    for (let offset = 0, part = 0; offset < file.size; offset += IMAGE_CHUNK_BYTES, part++) {
      await send(`${path}&part=${part}`, { method: "PUT", body: file.slice(offset, offset + IMAGE_CHUNK_BYTES) });
      progress(Math.round(Math.min(file.size, offset + IMAGE_CHUNK_BYTES) / file.size * 100));
    }
    return await send(path, { method: "PATCH" });
  } catch (error) { await send(path, { method: "DELETE" }).catch(() => {}); throw error; }
}
