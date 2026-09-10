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
  })().catch(error => { pending = undefined; throw error; });
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
