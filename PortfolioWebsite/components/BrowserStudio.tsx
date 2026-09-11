"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { backupText, emptyDraft, fileData, parseBackup, readDraft, writeDraft, type BrowserDraft } from "@/lib/browser-draft";
import { MAX_DRAFT_BYTES, MAX_PROJECTS, type Publication } from "@/lib/portfolio-snapshot";
import { validateProject } from "@/lib/validation";
import { todayISO } from "@/lib/dates";
import { ProfileFields, ProjectFields } from "./StudioFields";
import { LocalMediaContext } from "./LocalMedia";
import { PublishPanel } from "./PublishPanel";

const sections = ["Your name", "Headshot", "Biography", "Education", "Tools", "Experience", "Homepage", "Projects", "Publish"];
const prompts = ["Let's start with you.", "Put a face to your work.", "Tell your story.", "Where did you learn?", "What do you create with?", "Share your experience.", "Make an entrance.", "Give your work a home.", "Your work, ready to share."];
export function BrowserStudio() {
  const router = useRouter();
  const [draft, setDraft] = useState<BrowserDraft | null>(null), [saved, setSaved] = useState(false), [error, setError] = useState(""), [status, setStatus] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false), [projectStep, setProjectStep] = useState(0);
  const current = useRef<BrowserDraft | null>(null), key = useRef("guest"), persisted = useRef<string | null>(null), queue = useRef(Promise.resolve()), saveError = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    let active = true;
    key.current = localStorage.getItem("portfolio-active-draft") || "guest";
    void readDraft(key.current).then(value => { if (active) { persisted.current = value?.updatedAt || null; current.current = value || emptyDraft(); setDraft(current.current); setSaved(Boolean(value)); } }).catch(e => { if (active) { current.current = emptyDraft(); setDraft(current.current); setError(e.message); saveError.current = true; setStorageFailed(true); } });
    return () => { active = false; };
  }, []);
  async function persist(value: BrowserDraft) {
    const next = queue.current.catch(() => {}).then(async () => {
      try { await writeDraft(key.current, value, persisted.current); persisted.current = value.updatedAt; saveError.current = false; setStorageFailed(false); if (current.current === value) setSaved(true); }
      catch (e) { saveError.current = true; setStorageFailed(true); setSaved(false); setError(e instanceof Error ? e.message : "Could not save this draft."); throw e; }
    }); queue.current = next; return next;
  }
  useEffect(() => {
    if (!draft) return;
    const timer = setTimeout(() => { void persist(draft).catch(() => {}); }, 300);
    return () => clearTimeout(timer);
    // persist reads mutable revision/key refs; only a new draft schedules a save.
  }, [draft]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (current.current && (saveError.current || current.current.updatedAt !== persisted.current)) { event.preventDefault(); } };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const section = draft?.section || 0;
  useEffect(() => { heading.current?.focus(); }, [section]);
  function update(change: Partial<BrowserDraft>) {
    const old = current.current!;
    const next = { ...old, ...change, updatedAt: new Date(Math.max(Date.now(), Date.parse(old.updatedAt) + 1)).toISOString() };
    current.current = next; setDraft(next); setSaved(false); setStatus("");
  }
  async function flush() { if (current.current) await persist(current.current); }
  async function act(task: () => Promise<void>) {
    setError(""); setBusy(true);
    try { await task(); } catch (e) { setError(e instanceof Error ? e.message : "Could not finish. Please retry."); }
    finally { setBusy(false); }
  }
  async function switchDraft(nextKey: string, replacement?: BrowserDraft) {
    await flush();
    const existing = await readDraft(nextKey);
    if (replacement && existing && !window.confirm("Replace this account's device draft? Download a backup of that draft first if you need it.")) return;
    key.current = nextKey; persisted.current = existing?.updatedAt || null;
    localStorage.setItem("portfolio-active-draft", nextKey);
    const value = replacement || existing || { ...emptyDraft(), ownerUid: nextKey === "guest" ? null : nextKey, section: 8 };
    current.current = value; setDraft(value); setSaved(false); setError("");
    await persist(value);
  }
  async function saveImage(file: File): Promise<string> {
    const path = `/images/${crypto.randomUUID()}.webp`;
    const data = await fileData(file), old = current.current!;
    const images = { ...old.images, [path]: data };
    if (JSON.stringify(images).length > MAX_DRAFT_BYTES) throw new Error("Your device image library has reached 100 MB. Download a backup and remove unused images.");
    update({ images }); return path;
  }
  function download() {
    const url = URL.createObjectURL(new Blob([backupText(current.current!)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "portfolio-draft.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Backup downloaded with your content and images.");
  }
  async function importFile(file?: File) {
    if (!file) return;
    if (file.size > MAX_DRAFT_BYTES) throw new Error("Choose a backup smaller than 100 MB.");
    const imported = parseBackup(await file.text());
    if (!window.confirm("Replace this device draft with the backup? Your published portfolio will stay unchanged.")) return;
    const old = current.current!;
    update({ ...imported, ownerUid: old.ownerUid, publication: old.publication }); await flush(); setStatus("Backup restored on this device. Publish when you are ready.");
  }
  async function restore(publication: Publication, images: Record<string, string>, uid: string) {
    const value = { ...emptyDraft(), profile: publication.profile, projects: publication.projects, images, ownerUid: uid, section: 8, publication: { handle: publication.handle, revision: publication.revision, publishedAt: publication.publishedAt } };
    await switchDraft(uid, value);
  }
  function newProject() {
    if (current.current!.projects.length >= MAX_PROJECTS) { setError(`You can add up to ${MAX_PROJECTS} projects.`); return; }
    update({ projectDraft: { id: crypto.randomUUID(), title: "", thumbnail: "", images: [], date: todayISO(), description: "", technologies: [], link: "", slug: "" } }); setProjectStep(0);
  }
  function commitProject() {
    try {
      const old = current.current!, project = validateProject(old.projectDraft);
      if (old.projects.some(p => p.id !== project.id && p.slug === project.slug)) throw new Error("Another project uses that URL slug. Choose a different slug.");
      const projects = old.projects.some(p => p.id === project.id) ? old.projects.map(p => p.id === project.id ? project : p) : [...old.projects, project];
      update({ projects, projectDraft: null }); setError(""); setStatus("Project added to your device draft.");
    } catch (e) { setError(e instanceof Error ? e.message : "Check your project details."); }
  }
  if (!draft) return <main id="main-content" className="mx-auto max-w-5xl p-8" role="status">Opening your device draft…</main>;
  const locked = busy || uploading;
  return <LocalMediaContext.Provider value={{ images: draft.images, save: saveImage }}><header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 md:px-10"><Link className="display text-xl font-semibold" href="/">Portfolio studio<span className="text-coral">.</span></Link><div className="flex flex-wrap items-center gap-4"><span className="text-sm text-moss" role="status">{storageFailed ? "Not saved · download a backup" : saved ? "Saved on this device" : "Saving on this device…"}</span><button className="btn-secondary" disabled={locked} onClick={() => void act(async () => { if (!draft.profile.name.trim()) throw new Error("Add your name before opening the preview."); await flush(); sessionStorage.setItem("portfolio-preview-key", key.current); router.push("/studio/preview"); })}>Preview portfolio</button></div></header>
  <main id="main-content" className="mx-auto max-w-6xl px-6 pb-20 md:px-10"><div className="mb-8 border-y border-line py-5"><p className="text-sm leading-6 text-moss">Your draft stays in this browser. Publish when you are ready to share. Clearing browser data removes unpublished work; download a backup to keep it.</p></div>
    <div className="grid gap-8 lg:grid-cols-[210px_1fr]"><aside><nav aria-label="Portfolio setup" className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-1">{sections.map((label, i) => <button type="button" key={label} className={section === i ? "setup-step active" : "setup-step"} aria-current={section === i ? "step" : undefined} disabled={locked} onClick={() => { update({ section: i }); setError(""); }}><span className="mono text-xs">{String(i + 1).padStart(2, "0")}</span><span>{label}</span></button>)}</nav><details className="mt-3 space-y-3 border-t border-line pt-4"><summary className="cursor-pointer text-sm font-bold">Draft backups & storage</summary><button className="btn-text" onClick={download}>Download draft backup</button><label className="block text-sm font-bold">Import draft backup<input className="mt-2 block w-full text-sm" type="file" accept=".json,application/json" disabled={locked} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void act(() => importFile(file)); }} /></label><button className="btn-text" disabled={locked} onClick={() => void act(async () => { const d = current.current!, refs = new Set([d.profile.headshotImage, d.profile.bannerImage, ...d.projects.flatMap(p => [p.thumbnail, ...p.images]), ...(d.projectDraft ? [d.projectDraft.thumbnail, ...d.projectDraft.images] : [])]); update({ images: Object.fromEntries(Object.entries(d.images).filter(([path]) => refs.has(path))) }); await flush(); setStatus("Unused images removed from this device draft."); })}>Remove unused draft images</button></details></aside>
    <section className="min-w-0"><p className="eyebrow">Create · Preview · Publish</p><h1 ref={heading} tabIndex={-1} className="display mb-7 mt-3 text-4xl leading-tight outline-none sm:text-5xl">{prompts[section]}</h1>
    {error && <p className="form-error mb-5" role="alert">{error}</p>}{status && <p className="notice mb-5" role="status">{status}</p>}
    <div className="studio-panel">
      {section < 7 && <fieldset disabled={locked}><ProfileFields profile={draft.profile} section={section} onChange={profile => update({ profile })} onBusy={setUploading} /></fieldset>}
      {section === 7 && <div className="space-y-6">{draft.projectDraft ? <><div className="flex flex-wrap gap-2">{["Details", "Images", "Review"].map((name, i) => <button className={projectStep === i ? "section-tab active" : "section-tab"} disabled={locked} key={name} onClick={() => setProjectStep(i)}>{name}</button>)}</div><fieldset disabled={locked}><ProjectFields key={draft.projectDraft.id + projectStep} project={draft.projectDraft} section={projectStep} onChange={projectDraft => update({ projectDraft })} onBusy={setUploading} /></fieldset><div className="flex flex-wrap gap-3"><button className="btn-primary" disabled={locked} onClick={() => projectStep < 2 ? setProjectStep(projectStep + 1) : commitProject()}>{projectStep < 2 ? "Continue" : "Save project to draft"}</button><button className="btn-text" disabled={locked} onClick={() => { if (window.confirm("Discard this unfinished project edit? Saved projects will stay in your draft.")) update({ projectDraft: null }); }}>Discard project draft</button></div></> : <><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="display text-2xl">Your projects <span className="text-moss">({draft.projects.length}/{MAX_PROJECTS})</span></h2><button className="btn-primary" onClick={newProject}>Add project</button></div>{!draft.projects.length && <p className="empty-note">Start with a project you are proud of. Add a description, images, and the tools you used.</p>}{draft.projects.map(project => <article className="rounded-xl border border-line p-5" key={project.id}><h3 className="text-lg font-bold">{project.title}</h3><p className="mt-1 text-sm text-moss">{project.images.length} images{project.featured ? " · Featured project" : ""}</p><div className="mt-4 flex flex-wrap gap-4"><button className="btn-secondary" onClick={() => { update({ projectDraft: project }); setProjectStep(0); }}>Edit {project.title}</button><button className="btn-text" onClick={() => update({ projects: draft.projects.map(p => ({ ...p, featured: p.id === project.id ? !project.featured : false })) })}>{project.featured ? "Remove feature" : "Feature project"}</button><button className="btn-text" onClick={() => { if (window.confirm(`Delete “${project.title}” from your draft? It stays online until you publish updates.`)) update({ projects: draft.projects.filter(p => p.id !== project.id) }); }}>Delete {project.title}</button></div></article>)}</>}
      </div>}
      {section === 8 && <PublishPanel onBusy={setBusy} draft={draft} busy={locked} flush={flush} connect={uid => switchDraft(uid, { ...current.current!, ownerUid: uid, publication: null, section: 8 })} openAccount={uid => switchDraft(uid)} signedOut={() => switchDraft("guest")} onPublished={async publication => { update({ publication }); await flush(); }} restore={restore} />}
    </div>
    {section < 8 && <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button className="btn-secondary" disabled={section === 0 || locked} onClick={() => update({ section: section - 1 })}>Back</button><button className="btn-primary" disabled={locked} onClick={() => update({ section: section + 1 })}>{section === 7 ? "Continue to publishing" : "Continue"}</button></div>}
    </section></div>
  </main></LocalMediaContext.Provider>;
}
