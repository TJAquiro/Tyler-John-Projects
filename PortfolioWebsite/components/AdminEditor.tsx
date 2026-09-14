"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Profile, Project } from "@/lib/types";
import { validateProfile, validateProject } from "@/lib/validation";
import { ProfileFields, profileSections, ProjectFields, saveJSON, DraftNotice } from "./StudioFields";
import { useLocalDraft } from "./useLocalDraft";

export function ProfileEditor({ initial }: { initial: Profile }) {
  const router = useRouter(), draft = useLocalDraft("portfolio-profile-draft", initial);
  const [section, setSection] = useState(0), [status, setStatus] = useState(""), [error, setError] = useState(""), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault(); setError(""); setStatus(""); setBusy(true);
    try { const profile = validateProfile(draft.value, initial); await saveJSON("/api/content", { profile }); draft.markSaved(profile); router.refresh(); setStatus("Saved to your portfolio. Preview your changes."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save. Please retry."); }
    finally { setBusy(false); }
  }
  if (!draft.ready) return <p role="status">Loading your profile…</p>;
  return <form onSubmit={save} className="studio-panel"><DraftNotice conflict={draft.conflict !== null} restore={draft.restore} /><div className="mb-7 flex flex-wrap gap-2" role="group" aria-label="Profile sections">{profileSections.map((name, i) => <button type="button" disabled={busy || uploading} className={section === i ? "section-tab active" : "section-tab"} aria-pressed={section === i} key={name} onClick={() => { setSection(i); setStatus(""); setError(""); }}>{name}</button>)}</div><fieldset disabled={busy || uploading}><ProfileFields key={section} profile={draft.value} onChange={value => { draft.update(value); setStatus("Unsaved changes · recovery draft kept in this browser"); setError(""); }} section={section} onBusy={setUploading} /></fieldset><div className="form-actions"><button className="btn-primary" type="submit" disabled={busy || uploading}>{busy ? "Saving…" : "Save profile"}</button><span role="status" className="text-sm text-moss">{status}</span></div>{error && <p role="alert" className="form-error">{error}</p>}</form>;
}
export function ProjectEditor({ initial, isNew = false, onSaved }: { initial: Project; isNew?: boolean; onSaved?: () => void }) {
  const router = useRouter(), draft = useLocalDraft(isNew ? "portfolio-project-new" : `portfolio-project-${initial.id}`, initial, isNew);
  const [step, setStep] = useState(0), [error, setError] = useState(""), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const steps = ["Details", "Images", "Review"];
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (step < 2) {
      if (step === 1 && (draft.value.images.length < 1 || !draft.value.thumbnail)) { setError("Choose a thumbnail and add 1–6 supporting images."); return; }
      setStep(step + 1); return;
    }
    setBusy(true);
    try { const project = validateProject(draft.value, initial); await saveJSON("/api/content", { project }); draft.clear(); onSaved?.(); router.push("/admin/dashboard?saved=project"); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save. Please retry."); }
    finally { setBusy(false); }
  }
  if (!draft.ready) return <p role="status">Loading your project…</p>;
  return <form className="studio-panel" onSubmit={submit}><DraftNotice conflict={draft.conflict !== null} restore={draft.restore} /><ol className="mb-8 flex gap-2">{steps.map((name, i) => <li className="flex-1" key={name}><button type="button" disabled={busy || uploading} className={step === i ? "wizard-tab active" : "wizard-tab"} aria-current={step === i ? "step" : undefined} onClick={() => { setStep(i); setError(""); }}><span className="mono text-xs">0{i + 1}</span><span>{name}</span></button></li>)}</ol><fieldset disabled={busy || uploading}><ProjectFields key={step} project={draft.value} onChange={value => { draft.update(value); setError(""); }} section={step} onBusy={setUploading} /></fieldset>{error && <p role="alert" className="form-error mt-5">{error}</p>}<div className="form-actions justify-between"><div>{step > 0 ? <button type="button" className="btn-secondary" onClick={() => { setStep(step - 1); setError(""); }}>← Back</button> : <Link href="/admin/dashboard" className="btn-secondary">Back to dashboard</Link>}</div><button className="btn-primary" type="submit" disabled={busy || uploading}>{busy ? "Saving…" : step < 2 ? "Continue →" : isNew ? "Add project" : "Save project"}</button></div><p className="mt-3 text-xs text-moss">A recovery draft stays in this browser until you save. Your hosted site updates after deployment.</p></form>;
}
export function FeatureProject({ id, featured }: { id: string; featured: boolean }) {
  const router = useRouter(), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function toggle() {
    setBusy(true); setError("");
    try { await saveJSON("/api/content", { featuredProjectId: featured ? null : id }); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update featured project."); }
    finally { setBusy(false); }
  }
  return <div><button type="button" className="btn-secondary" disabled={busy} aria-pressed={featured} onClick={() => void toggle()}>{busy ? "Saving…" : featured ? "Remove featured project" : "Set as featured project"}</button>{error && <p role="alert" className="form-error mt-2">{error}</p>}</div>;
}
export function DeleteProject({ id, title }: { id: string; title: string }) {
  const router = useRouter(), [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function remove() {
    setBusy(true); setError("");
    try { await saveJSON("/api/content", { id }, "DELETE"); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not delete."); setBusy(false); }
  }
  return <div>{confirm ? <div className="mt-3 rounded-xl border border-line bg-paper p-4"><p className="mb-3 text-sm">Delete “{title}”? This removes the project from your next deployment. Image files are kept.</p><div className="flex flex-wrap gap-4"><button type="button" className="btn-danger" disabled={busy} onClick={() => void remove()}>{busy ? "Deleting…" : "Confirm delete"}</button><button type="button" className="btn-secondary" disabled={busy} onClick={() => { setConfirm(false); setError(""); }}>Keep project</button></div></div> : <button type="button" className="btn-text" onClick={() => setConfirm(true)}>Delete</button>}{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
