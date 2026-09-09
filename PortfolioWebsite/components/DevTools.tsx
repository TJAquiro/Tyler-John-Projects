"use client";
import { useState } from "react";
import { saveJSON } from "./StudioFields";
export function DevTools({ count }: { count: number }) {
  const [confirmation, setConfirmation] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function act(action: "showcase" | "reset") {
    setBusy(true); setError("");
    try {
      await saveJSON("/api/dev", { action, confirmation }, "POST");
      if (action === "reset") for (const key of Object.keys(localStorage)) if (key.includes("portfolio-")) localStorage.removeItem(key);
      window.location.assign(action === "reset" ? "/admin/register" : "/admin/dashboard");
    } catch (e) { setError(e instanceof Error ? e.message : "Action failed."); setBusy(false); }
  }
  return <div className="space-y-6"><section className="studio-panel"><p className="eyebrow">Optional showcase</p><h2 className="display mt-3 text-3xl">See a complete portfolio.</h2><p className="my-4 leading-7 text-moss">Open a separate fictional account with a complete profile, education, tools, experience, and three illustrated projects with captions. Your own account is preserved.</p><button className="btn-primary" disabled={busy} onClick={() => void act("showcase")}>Open showcase profile →</button></section><section className="studio-panel"><p className="eyebrow">Local development only · {count} accounts</p><h2 className="display mt-3 text-3xl">Reset this installation.</h2><p className="my-4 leading-7 text-moss">Clear all created accounts, profiles, projects, and onboarding progress, including the original portfolio. Everyone is signed out. Uploaded image files are retained. A local data backup is created first.</p><label className="studio-field">Type RESET ALL to confirm<input className="admin-input" value={confirmation} autoComplete="off" onChange={e => setConfirmation(e.target.value)} /></label><button className="btn-danger mt-5" disabled={busy || confirmation !== "RESET ALL"} onClick={() => void act("reset")}>{busy ? "Working…" : "Reset all accounts and projects"}</button></section>{error && <p role="alert" className="form-error">{error}</p>}</div>;
}
