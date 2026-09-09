"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, saveJSON } from "./StudioFields";
export function AccountForm({ canImport }: { canImport: boolean }) {
  const router = useRouter(), [name, setName] = useState(""), [email, setEmail] = useState(""), [handle, setHandle] = useState(""), [password, setPassword] = useState(""), [confirm, setConfirm] = useState(""), [importExisting, setImportExisting] = useState(false), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (password !== confirm) { setError("Your passwords do not match."); return; }
    setBusy(true);
    try { await saveJSON("/api/auth/register", { name, email, handle, password, importExisting }, "POST"); router.push("/admin/onboarding"); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not create account."); setBusy(false); }
  }
  return <form className="mt-8 space-y-5" onSubmit={submit}><fieldset disabled={busy} className="space-y-5"><Field label="Your name" value={name} onChange={setName} required maxLength={100} /><Field label="Email address" value={email} onChange={setEmail} required type="email" maxLength={254} /><Field label="Portfolio address" value={handle} onChange={setHandle} required hint="Your site will be /u/your-name. Use lowercase letters, numbers, and hyphens." maxLength={50} /><label className="studio-field">Password<input className="admin-input" type="password" autoComplete="new-password" minLength={10} maxLength={200} required value={password} onChange={e => setPassword(e.target.value)} /></label><p className="text-xs text-moss">Use at least 10 characters.</p><label className="studio-field">Confirm password<input className="admin-input" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
    {canImport && <label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1" type="checkbox" checked={importExisting} onChange={e => setImportExisting(e.target.checked)} /><span>Copy the existing portfolio on this computer into my account. Leave unchecked to start empty.</span></label>}
    </fieldset>{error && <p className="form-error" role="alert">{error}</p>}<button className="btn-primary w-full" disabled={busy} type="submit">{busy ? "Creating your account…" : "Create account & start setup →"}</button><p className="text-xs leading-6 text-moss">This account is stored on this computer. Your email is used for sign-in; no email is sent.</p></form>;
}
