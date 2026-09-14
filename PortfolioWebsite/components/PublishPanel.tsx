"use client";
import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, reload, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type Auth, type User } from "firebase/auth";
import { publishingAuth, publishingFetch, uploadPublishingImage } from "@/lib/firebase-client";
import { fileData, type BrowserDraft } from "@/lib/browser-draft";
import { imageReferences, validateSnapshot, validHandle, type Publication } from "@/lib/portfolio-snapshot";
import { DeleteAccount } from "./DeleteAccount";
import { Field } from "./StudioFields";

export function PublishPanel({ onHandle, draft, busy: saving, flush, connect, openAccount, onPublished, restore, signedOut, onBusy, deleteAccount }: {
  onHandle: (handle: string) => void;
  draft: BrowserDraft; busy: boolean; flush: () => Promise<void>;
  connect: (uid: string) => Promise<boolean>; openAccount: (uid: string) => Promise<boolean>;
  onPublished: (publication: BrowserDraft["publication"]) => Promise<void>;
  restore: (publication: Publication, images: Record<string, string>, uid: string) => Promise<boolean>;
  signedOut: () => Promise<boolean>;
  deleteAccount: (uid: string) => Promise<void>;
  onBusy: (busy: boolean) => void;
}) {
  const [auth, setAuth] = useState<Auth | null>(null), [user, setUser] = useState<User | null>(null), [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin"), [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const handle = draft.publication?.handle || draft.requestedHandle || "";
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(""), [error, setError] = useState("");
  useEffect(() => {
    let stop: (() => void) | undefined, active = true;
    void publishingAuth().then(value => {
      if (!active) return;
      setAuth(value);
      if (value) stop = onAuthStateChanged(value, next => { setUser(next); setReady(true); });
      else setReady(true);
    }).catch(() => { if (active) { setError("Could not connect to publishing. Reload this page to retry. Your device draft is safe."); setReady(true); } });
    return () => { active = false; stop?.(); };
  }, []);
  async function action(task: () => Promise<unknown>) {
    setBusy(true); onBusy(true); setError(""); setStatus("");
    try { await task(); } catch (e) { const message = e instanceof Error ? e.message : "Could not finish. Please retry."; setError(message.includes("auth/invalid-credential") ? "The email or password is incorrect." : message); }
    finally { setBusy(false); onBusy(false); }
  }
  async function login(event: React.FormEvent) {
    event.preventDefault(); if (!auth) return;
    await action(async () => {
      const result = mode === "signup" ? await createUserWithEmailAndPassword(auth, email, password) : await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
      if (mode === "signup") { await sendEmailVerification(result.user); setStatus("Check your inbox (check your spam folder too) to verify your email before publishing."); }
    });
  }
  async function publish() {
    await flush();
    if (!user || draft.ownerUid !== user.uid) throw new Error("Choose which draft to use with this account first.");
    if (draft.projectDraft) throw new Error("Finish or discard your project draft in Projects before publishing.");
    const address = validHandle(draft.publication?.handle || handle);
    const snapshot = validateSnapshot(draft);
    const refs = imageReferences(snapshot), assets: Record<string, string> = {};
    for (const [index, path] of refs.entries()) {
      if (!draft.images[path]) throw new Error("An image is missing on this device. Restore your published version or choose the image again.");
      setStatus(`Uploading image ${index + 1} of ${refs.length}…`);
      const file = await (await fetch(draft.images[path])).blob();
      const result = await uploadPublishingImage(file, percent => setStatus(`Uploading image ${index + 1} of ${refs.length}: ${percent}%`)); assets[path] = result.id;
    }
    setStatus("Publishing your portfolio…");
    const result = await publishingFetch("/api/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handle: address, snapshot, assets, revision: draft.publication?.revision || 0 }) });
    await onPublished({ handle: result.handle, revision: result.revision, publishedAt: result.publishedAt });
    setStatus("Your portfolio is published. Copy the link to share it.");
  }
  async function restoreOnline() {
    if (!user) return;
    const result = await publishingFetch("/api/publish");
    if (!result.publication) throw new Error("This account has no published portfolio yet.");
    const publication = result.publication as Publication;
    if (!window.confirm("Replace this device draft with your last published version? Download a backup first if you want to keep unpublished edits.")) return;
    const images: Record<string, string> = {};
    for (const path of imageReferences(publication)) {
      setStatus("Restoring your published images…");
      const response = await fetch(publication.assets[path]);
      if (!response.ok) throw new Error("An image could not be restored. Your local draft has not been replaced. Retry when connected.");
      images[path] = await fileData(await response.blob());
    }
    if (await restore(publication, images, user.uid)) { setStatus("Published version restored on this device."); }
  }
  const locked = busy || saving;
  const link = draft.publication && typeof window !== "undefined" ? `${window.location.origin}/p/${draft.publication.handle}` : "";
  return <section onChange={() => { setError(""); setStatus(""); }} className="space-y-6" aria-labelledby="publish-heading"><div><p className="eyebrow">Ready to share</p><h2 id="publish-heading" className="display mt-3 text-3xl">Publish your portfolio.</h2><p className="mt-3 leading-7 text-moss">Your draft saves privately to your account. Publishing updates the website your visitors see.</p></div>
    {!ready ? <p role="status">Connecting to publishing…</p> : !auth ? <div className="notice"><p>Online publishing is not connected yet.</p><p className="mt-2">Keep creating and previewing your portfolio. Download a backup to keep a portable copy until publishing is available.</p></div> : !user ? <form onSubmit={login} className="space-y-5"><p className="text-sm text-moss">Sign in to own your link and update it later. Creating and previewing a draft never requires an account.</p><div className="flex gap-2"><button type="button" className={mode === "signin" ? "section-tab active" : "section-tab"} aria-pressed={mode === "signin"} onClick={() => { setMode("signin"); setError(""); setStatus(""); }}>Sign in</button><button type="button" className={mode === "signup" ? "section-tab active" : "section-tab"} aria-pressed={mode === "signup"} onClick={() => { setMode("signup"); setError(""); setStatus(""); }}>Create account</button></div><Field label="Email address" type="email" value={email} onChange={setEmail} required /><label className="studio-field">Password<input className="admin-input" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={10} maxLength={200} required value={password} onChange={e => setPassword(e.target.value)} /></label><p className="text-sm text-moss">Use at least 10 characters.</p><div className="flex flex-wrap gap-3"><button type="submit" className="btn-primary" disabled={locked}>{busy ? "Please wait…" : mode === "signup" ? "Create publishing account" : "Sign in to publish"}</button><button type="button" className="btn-text" disabled={locked || !email} onClick={() => void action(async () => { await sendPasswordResetEmail(auth, email); setStatus("If an account exists for that email, a password reset link has been sent."); })}>Reset password</button></div></form> : <>
      <div className="notice flex flex-wrap items-center justify-between gap-3"><span className="break-all">Signed in as {user.email}</span><button className="btn-text" disabled={locked} onClick={() => void action(async () => { await flush(); await signOut(auth); await signedOut(); })}>Sign out</button></div>
      {!user.emailVerified && <div className="space-y-3"><p>Verify your email before publishing (check your spam folder too).</p><div className="flex flex-wrap gap-3"><button className="btn-secondary" disabled={locked} onClick={() => void action(async () => { await sendEmailVerification(user); setStatus("Verification email sent. Check your inbox (check your spam folder too)."); })}>Send verification email</button><button className="btn-secondary" disabled={locked} onClick={() => void action(async () => { await reload(user); await user.getIdToken(true); setUser(user); setStatus(user.emailVerified ? "Email verified. You can publish." : "Your email is not verified yet. Open the email link, then check again."); })}>Check verification</button></div></div>}
      {draft.ownerUid !== user.uid ? <div className="space-y-3"><p>Choose the draft to use with this account. Drafts saved for other accounts stay separate on this device.</p><div className="flex flex-wrap gap-3">{!draft.ownerUid && <button className="btn-primary" disabled={locked} onClick={() => void action(async () => { if (await connect(user.uid)) setStatus("This draft is now linked to your account. Check the save status before leaving."); })}>Use this device draft</button>}<button className="btn-secondary" disabled={locked} onClick={() => void action(() => openAccount(user.uid))}>Open my account draft</button></div></div> : <div className="space-y-4">
        {draft.publication ? <div className="rounded-xl border border-line p-5"><p className="eyebrow">Your published link</p><a className="mt-3 block break-all underline" href={link} target="_blank" rel="noopener noreferrer">{link}</a><p className="mt-2 text-sm text-moss">Last published {new Date(draft.publication.publishedAt).toLocaleString()}</p><button className="btn-secondary mt-4" disabled={locked} onClick={() => void action(async () => { await navigator.clipboard.writeText(link); setStatus("Link copied."); })}>Copy link</button></div> : <Field label="Portfolio address" value={handle} onChange={v => onHandle(v.toLowerCase())} maxLength={40} hint="3–40 lowercase letters, numbers, or hyphens. Your link will end in /p/your-address. This address stays fixed after publishing." />}
        <button className="btn-primary" disabled={locked || !user.emailVerified} onClick={() => void action(publish)}>{busy ? "Please wait…" : draft.publication ? "Publish updates" : "Publish portfolio"}</button>
      </div>}
      <div className="border-t border-line pt-5"><button className="btn-text" disabled={locked} onClick={() => void action(restoreOnline)}>Restore last published version</button><p className="mt-2 text-sm leading-6 text-moss">Revert your editable draft to the last version visitors can see. Your current draft is kept as a recovery backup on this device.</p></div>
      <DeleteAccount user={user} disabled={locked} remove={deleteAccount} onBusy={onBusy} />
    </>}
    {status && <p role="status" className="notice">{status}</p>}{error && <p role="alert" className="form-error">{error}</p>}
  </section>;
}
