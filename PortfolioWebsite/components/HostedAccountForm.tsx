"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, type Auth, type User } from "firebase/auth";
import { publishingAuth } from "@/lib/firebase-client";
import { emptyDraft, readDraft, writeDraft } from "@/lib/browser-draft";

function friendlyError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(code || "")) return "The email or password is incorrect. Try again or reset your password.";
  if (code === "auth/email-already-in-use") return "An account already uses this email. Sign in instead.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait a little and try again.";
  if (code === "auth/network-request-failed") return "Could not connect. Check your connection and try again.";
  if (code === "auth/weak-password") return "Choose a stronger password with at least 10 characters.";
  if (code) return "Could not sign in. Check your details and try again.";
  return error instanceof Error ? error.message : "Could not continue. Please try again.";
}
export function HostedAccountForm({ mode }: { mode: "signup" | "login" }) {
  const signup = mode === "signup", router = useRouter();
  const [auth, setAuth] = useState<Auth | null>(null), [ready, setReady] = useState(false), [attempt, setAttempt] = useState(0);
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [status, setStatus] = useState("");
  const [signedIn, setSignedIn] = useState<User | null>(null);
  const handling = useRef(false);
  useEffect(() => { if (new URLSearchParams(location.search).get("deleted") === "1") setStatus("Your account, website, and uploaded images have been deleted."); }, []);
  const enterStudio = useCallback(async (user: User, welcome = "") => {
    const existing = await readDraft(user.uid);
    if (!existing) await writeDraft(user.uid, { ...emptyDraft(), ownerUid: user.uid }, null);
    localStorage.setItem("portfolio-active-draft", user.uid);
    router.replace(`/studio${welcome ? `?welcome=${welcome}` : ""}`);
  }, [router]);
  useEffect(() => {
    let active = true, unsubscribe: (() => void) | undefined;
    setReady(false); setError("");
    void publishingAuth().then(value => {
      if (!active) return;
      setAuth(value);
      if (!value) { setReady(true); return; }
      unsubscribe = onAuthStateChanged(value, user => {
        if (!active) return;
        setSignedIn(user); setReady(true);
        if (user && !handling.current) {
          handling.current = true; setBusy(true);
          void enterStudio(user).catch(e => { if (active) { setError(friendlyError(e)); setBusy(false); handling.current = false; } });
        }
      });
    }).catch(() => { if (active) { setError("Could not connect to accounts. Check your connection and retry."); setReady(true); } });
    return () => { active = false; unsubscribe?.(); };
  }, [attempt, enterStudio]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!auth || handling.current) return;
    setError("");
    if (signup && password !== confirm) { setError("Your passwords do not match."); return; }
    handling.current = true; setBusy(true);
    try {
      const result = signup ? await createUserWithEmailAndPassword(auth, email.trim(), password) : await signInWithEmailAndPassword(auth, email.trim(), password);
      setSignedIn(result.user); setPassword(""); setConfirm("");
      let welcome = "";
      if (signup) {
        welcome = "verify-email";
        try { await sendEmailVerification(result.user); }
        catch { welcome = "verification-pending"; }
      }
      await enterStudio(result.user, welcome);
    } catch (e) { setError(friendlyError(e)); setBusy(false); handling.current = false; }
  }
  async function resetPassword() {
    if (!auth) return; setBusy(true); setError("");
    try { await sendPasswordResetEmail(auth, email.trim()); setStatus("If an account exists for that email, a password reset link has been sent."); }
    catch (e) { setError(friendlyError(e)); }
    finally { setBusy(false); }
  }
  return <main id="main-content" className="mx-auto max-w-lg px-6 py-10 sm:py-16"><Link className="display text-2xl" href="/">Portfolio studio<span className="text-accent">.</span></Link><p className="eyebrow mt-12">{signup ? "Your next chapter starts here" : "Welcome back"}</p><h1 className="display mt-4 text-5xl leading-tight">{signup ? "Make space for your work." : "Back to your story."}</h1><p className="mt-5 leading-7 text-moss">{signup ? "Create your free account. Then we’ll guide you through your profile and first project." : "Sign in to continue your portfolio and publish your latest work."}</p>
    <div className="studio-panel mt-8">
      {!ready ? <p role="status">Connecting to accounts…</p> : !auth ? <div className="space-y-4"><p className="notice">Account creation and sign-in are temporarily unavailable. Please try again shortly.</p><button className="btn-secondary" onClick={() => setAttempt(value => value + 1)}>Retry connection</button><Link className="btn-text block" href="/studio">Explore the builder on this device</Link></div> : signedIn ? <div className="space-y-4"><p role="status">{busy ? "Opening your portfolio…" : "You’re signed in. Your account is ready."}</p>{!busy && <button className="btn-primary" onClick={() => { setBusy(true); void enterStudio(signedIn).catch(e => { setError(friendlyError(e)); setBusy(false); }); }}>Continue to your portfolio</button>}</div> : <form onChange={() => { setError(""); setStatus(""); }} onSubmit={submit} className="space-y-5"><fieldset disabled={busy} className="space-y-5"><label className="studio-field">Email address<input className="admin-input" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label><label className="studio-field">Password<input className="admin-input" type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 10 : undefined} maxLength={200} value={password} onChange={e => setPassword(e.target.value)} aria-describedby={signup ? "password-hint" : undefined} /></label>{signup && <><p id="password-hint" className="text-xs text-moss">Use at least 10 characters.</p><label className="studio-field">Confirm password<input className="admin-input" type="password" autoComplete="new-password" required maxLength={200} value={confirm} onChange={e => setConfirm(e.target.value)} /></label></>}</fieldset><button className="btn-primary w-full" disabled={busy} type="submit">{busy ? "Please wait…" : signup ? "Create account & start setup" : "Sign in"}</button>{!signup && <button className="btn-text" disabled={busy || !email.trim()} type="button" onClick={() => void resetPassword()}>Reset password</button>}</form>}
      {error && <p className="form-error mt-5" role="alert">{error}</p>}{status && <p className="notice mt-5" role="status">{status}</p>}
    </div><p className="mt-6 text-sm leading-6">{signup ? "Already have an account?" : "New here?"} <Link className="btn-text" href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create your free account"}</Link></p><p className="mt-5 text-xs leading-6 text-moss">{signup ? "100% free. No credit card required. Verify your email before publishing (check your spam folder too); you can start creating right away." : "Drafts save on this device. On a new device, you can restore your last published version from Publish."}</p>
  </main>;
}
