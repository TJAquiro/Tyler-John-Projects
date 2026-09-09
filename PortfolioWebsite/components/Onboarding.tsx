"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Profile, Project } from "@/lib/types";
import type { StudioState } from "@/lib/content";
import { validateProfile, validateProject, ValidationError } from "@/lib/validation";
import { ProfileFields, ProjectFields, saveJSON, DraftNotice } from "./StudioFields";
import { useLocalDraft } from "./useLocalDraft";
import { formatDate } from "@/lib/dates";

const steps = ["Your name", "Headshot", "Biography", "Education", "Tools", "Experience", "First project", "Preview"];
const prompts = ["Let's start with you.", "Put a face to your work.", "What's your story?", "Where did you learn?", "What do you create with?", "Tell us about your experience.", "Give your work a home.", "Your portfolio, taking shape."];
const hints = ["Your existing content is here. Make it yours, one step at a time.", "Choose a portrait or an image that represents your practice.", "A few thoughtful lines help people understand the person behind the work.", "Degrees, independent study, and specialist courses all count.", "Share the tools and skills you bring to a project.", "Add a current role, a past team, or an independent collaboration.", "Start with one project. You can add more from the dashboard.", "Review your profile and projects. You can revisit any step before finishing."];
const blankProject: Project = { id: "onboarding-project", title: "", thumbnail: "", images: [], date: "", description: "", technologies: [], link: "", slug: "" };

export function Onboarding({ initial, studio, projects, projectId, initialDate }: { initial: Profile; studio: StudioState; projects: Project[]; projectId: string; initialDate: string }) {
  const router = useRouter(), profile = useLocalDraft("portfolio-onboarding-profile", initial);
  const markProfileSaved = profile.markSaved;
  const project = useLocalDraft("portfolio-onboarding-project", { ...blankProject, id: projectId, date: initialDate, ...studio.projectDraft }, true);
  const [step, setStep] = useState(studio.step), [projectStep, setProjectStep] = useState(0), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const [error, setError] = useState(""), [status, setStatus] = useState(""), [savedProjects, setSavedProjects] = useState(projects), [projectAdded, setProjectAdded] = useState(false);
  const revision = useRef(0), heading = useRef<HTMLHeadingElement>(null);
  // Serialize autosaves and explicit transitions to avoid stale responses winning.
  const queue = useRef<Promise<void>>(Promise.resolve());
  function enqueue(task: () => Promise<void>) { const next = queue.current.catch(() => {}).then(task); queue.current = next; return next; }
  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    if (!profile.ready || !project.ready || step > 6 || (step === 6 && projectAdded)) return;
    const current = ++revision.current;
    const timer = setTimeout(() => {
      void enqueue(async () => {
        try {
          if (step < 6) { const saved = validateProfile(profile.value, initial); await saveJSON("/api/content", { profile: saved }); markProfileSaved(saved); }
          if (step === 6 && !projectAdded) await saveJSON("/api/studio", { projectDraft: project.value });
          if (current === revision.current) { setStatus(step === 6 ? "Project draft saved — add the project when ready" : "Progress saved"); setError(""); }
        } catch (e) { if (current === revision.current) { setStatus("Draft kept in this browser"); setError(e instanceof Error ? e.message : "Could not save. Please retry."); } }
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [profile.value, project.value, profile.ready, project.ready, step, projectAdded, markProfileSaved, initial]);
  async function navigate(nextStep: number, skip = false) {
    setBusy(true); setError(""); revision.current++;
    try {
      await enqueue(async () => {
        if (step < 6) {
          try { const saved = validateProfile(profile.value, initial); await saveJSON("/api/content", { profile: saved }); profile.markSaved(saved); }
          catch (e) { if (!skip || !(e instanceof ValidationError)) throw e; }
        }
        await saveJSON("/api/studio", { step: nextStep, ...(step === 6 && !projectAdded ? { projectDraft: project.value } : {}) });
      });
      setStep(nextStep); setStatus(skip ? "Step skipped · your draft is kept" : "Progress saved");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save. Please retry."); }
    finally { setBusy(false); }
  }
  async function saveProject() {
    setBusy(true); setError("");
    try {
      const valid = validateProject(project.value);
      await enqueue(async () => { await saveJSON("/api/content", { project: valid }); await saveJSON("/api/studio", { projectDraft: null, step: 7 }); });
      setSavedProjects(current => current.some(p => p.id === valid.id) ? current.map(p => p.id === valid.id ? valid : p) : [...current, valid]);
      setProjectAdded(true); project.clear(); setStep(7); setStatus("Project saved");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save project."); }
    finally { setBusy(false); }
  }
  async function finish() {
    setBusy(true); setError("");
    try {
      await enqueue(async () => { await saveJSON("/api/content", { profile: validateProfile(profile.value, initial) }); await saveJSON("/api/studio", { completed: true, step: 7 }); });
      profile.clear(); router.push("/admin/dashboard?finished=1"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not finish setup."); setBusy(false); }
  }
  if (!profile.ready || !project.ready) return <p role="status">Loading your saved progress…</p>;
  return <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
    <aside><p className="eyebrow mb-5">Make it yours</p><ol className="grid grid-cols-4 gap-2 lg:grid-cols-1">{steps.map((name, i) => <li key={name}><button disabled={busy || uploading} type="button" className={step === i ? "setup-step active" : "setup-step"} aria-current={step === i ? "step" : undefined} onClick={() => void navigate(i, true)}><span className="mono text-xs">{String(i + 1).padStart(2, "0")}</span><span>{name}</span></button></li>)}</ol><p className="mt-6 hidden text-sm leading-6 text-moss lg:block">One section at a time.<br />Your progress stays with you.</p></aside>
    <section className="min-w-0"><div className="mb-8"><p className="eyebrow">Guided setup · {step + 1} of {steps.length}</p><h1 ref={heading} tabIndex={-1} className="display mt-3 text-4xl leading-tight outline-none sm:text-5xl">{prompts[step]}</h1><p className="mt-4 max-w-xl leading-7 text-moss">{hints[step]}</p></div>
    <div className="studio-panel"><DraftNotice conflict={profile.conflict !== null} restore={profile.restore} />
      {step < 6 && <fieldset disabled={busy || uploading}><ProfileFields key={step} profile={profile.value} onChange={value => { profile.update(value); setStatus("Saving…"); }} section={step} onBusy={setUploading} /></fieldset>}
      {step === 6 && <><p className="mb-6 text-sm text-moss">{savedProjects.length ? `You already have ${savedProjects.length} projects. Add another here, or skip to the preview.` : "Start with one project. You can add the rest later."}</p><div className="mb-6 flex gap-2">{["Details", "Images", "Review"].map((name, i) => <button key={name} type="button" disabled={busy || uploading} className={projectStep === i ? "section-tab active" : "section-tab"} onClick={() => setProjectStep(i)}>{name}</button>)}</div><fieldset disabled={busy || uploading}><ProjectFields key={projectStep} project={project.value} onChange={value => { project.update(value); setProjectAdded(false); setStatus("Saving draft…"); }} section={projectStep} onBusy={setUploading} /></fieldset><div className="mt-6 flex justify-end">{projectStep < 2 ? <button type="button" className="btn-secondary" disabled={uploading} onClick={() => setProjectStep(projectStep + 1)}>Next: {projectStep === 0 ? "Images" : "Review"} →</button> : <button type="button" className="btn-primary" disabled={busy || uploading} onClick={() => void saveProject()}>Save first project</button>}</div></>}
      {step === 7 && <div className="space-y-7"><div><p className="eyebrow">Your profile</p><h2 className="display mt-3 text-3xl">{profile.value.name}</h2><p className="mt-3 whitespace-pre-line leading-7">{profile.value.biography || "Biography skipped — add it from your dashboard whenever you're ready."}</p></div><dl className="grid grid-cols-3 gap-3 border-y border-line py-5">{[["Education", profile.value.education.length], ["Tools", profile.value.tools.length], ["Experience", profile.value.jobs.length]].map(([label, count]) => <div key={label}><dt className="text-xs text-moss">{label}</dt><dd className="display mt-2 text-3xl">{count}</dd></div>)}</dl><div><p className="eyebrow mb-4">Selected work · {savedProjects.length} projects</p>{savedProjects.map(p => <p key={p.id} className="border-b border-line py-3">{p.title}<span className="float-right text-sm text-moss">{formatDate(p.date)}</span></p>)}</div><div className="flex flex-wrap gap-3"><Link className="btn-secondary" href="/admin/preview" target="_blank">Preview full site ↗</Link><button className="btn-primary" disabled={busy} onClick={() => void finish()}>{busy ? "Finishing…" : "Finish setup →"}</button></div><p className="text-sm leading-6 text-moss">Finishing saves your setup. Publish by deploying the repository; your hosted site stays unchanged until then.</p></div>}
      {error && <p className="form-error mt-5" role="alert">{error}</p>}
      <div className="mt-6 flex min-h-6 items-center gap-2 text-sm text-moss" role="status"><span className="h-1.5 w-1.5 rounded-full bg-moss" />{status || "Your existing content is preserved. Changes save automatically."}</div>
    </div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button className="btn-secondary" disabled={step === 0 || busy || uploading} type="button" onClick={() => void navigate(step - 1, true)}>← Back</button>{step < 7 && <div className="flex gap-3"><button className="btn-text" type="button" disabled={busy || uploading} onClick={() => void navigate(step + 1, true)}>Skip for now</button>{step < 6 && <button className="btn-primary" type="button" disabled={busy || uploading} onClick={() => void navigate(step + 1)}>{busy ? "Saving…" : "Save & continue →"}</button>}</div>}</div>
    </section>
  </div>;
}
