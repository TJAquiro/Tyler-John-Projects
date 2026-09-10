import { firebaseConfigured } from "@/lib/firebase-server";
export const dynamic = "force-dynamic";
export function GET() {
  const enabled = firebaseConfigured();
  return Response.json({ enabled, ...(enabled ? { config: {
    apiKey: process.env.FIREBASE_WEB_API_KEY, appId: process.env.FIREBASE_WEB_APP_ID,
    projectId: process.env.FIREBASE_PROJECT_ID, authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`, storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  }, ...(process.env.PORTFOLIO_FIREBASE_EMULATORS === "1" && process.env.FIREBASE_PROJECT_ID?.startsWith("demo-") ? { authEmulator: "http://127.0.0.1:9099" } : {}) } : {}) }, { headers: { "Cache-Control": "no-store" } });
}
