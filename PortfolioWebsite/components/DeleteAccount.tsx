"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EmailAuthProvider, reauthenticateWithCredential, type User } from "firebase/auth";

export function DeleteAccount({ user, disabled, remove, onBusy }: { user: User; disabled: boolean; remove: (uid: string) => Promise<void>; onBusy: (busy: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="border-t border-line pt-5"><h3 className="font-bold">Delete account</h3><p className="mt-2 text-sm leading-6 text-moss">Permanently remove your account, published website, uploaded images, and account draft on this device.</p><button className="btn-danger mt-4" disabled={disabled} onClick={() => setOpen(true)}>Delete account</button>{open && <Confirmation user={user} remove={remove} onBusy={onBusy} close={() => setOpen(false)} />}</div>;
}
function Confirmation({ user, remove, onBusy, close }: { user: User; remove: (uid: string) => Promise<void>; onBusy: (busy: boolean) => void; close: () => void }) {
  const confirmed = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null), [password, setPassword] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { dialog.current?.showModal(); }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); onBusy(true); setError("");
    try {
      if (!user.email) throw new Error("Sign in with your email again before deleting your account.");
      if (!confirmed.current) {
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
        await user.getIdToken(true); confirmed.current = true;
      }
      await remove(user.uid);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(code === "auth/invalid-credential" || code === "auth/wrong-password" ? "The password is incorrect. Try again." : code ? "Could not confirm your password. Check your connection and try again." : e instanceof Error ? e.message : "Could not delete your account. Retry.");
    } finally { setBusy(false); onBusy(false); }
  }
  return createPortal(<dialog ref={dialog} className="account-dialog" aria-labelledby="delete-account-title" onCancel={event => { event.preventDefault(); if (!busy) close(); }}><form onSubmit={submit} className="space-y-5"><h2 id="delete-account-title" className="display text-3xl">Delete your account and website?</h2><p className="text-sm leading-6">This permanently deletes the account for <strong>{user.email}</strong>, its published pages and uploaded images. This cannot be undone.</p><p className="text-sm leading-6 text-moss">Your account draft on this device will be removed. Downloaded backups and offline drafts on other devices cannot be erased remotely.</p><label className="studio-field">Confirm your password<input autoFocus className="admin-input" type="password" autoComplete="current-password" required value={password} disabled={busy} onChange={event => { setPassword(event.target.value); confirmed.current = false; setError(""); }} /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="flex flex-wrap gap-3"><button type="button" className="btn-secondary" disabled={busy} onClick={close}>Keep my account</button><button type="submit" className="btn-danger" disabled={busy}>{busy ? "Deleting account…" : "Permanently delete account"}</button></div></form></dialog>, document.body);
}
