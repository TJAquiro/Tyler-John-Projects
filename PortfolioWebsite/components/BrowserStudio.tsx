"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MAX_PROJECTS, validHandle } from "@/lib/portfolio-snapshot";
import { validateProject } from "@/lib/validation";
import { publicationIssues, projectsWithEditor, validatePublication, type PublicationIssue } from "@/lib/publication-validation";
import { todayISO } from "@/lib/dates";
import { DraftFeedbackContext, FeedbackScope } from "./DraftFeedback";
import { ProfileFields } from "./StudioFields";
import { LocalMediaContext } from "./LocalMedia";
import { PublishPanel } from "./PublishPanel";
import { ProjectsPanel, StudioHeader, StudioSidebar } from "./BrowserStudioPanels";
import { useBrowserStudioSession } from "./useBrowserStudioSession";

const prompts = ["Let's start with you.", "Put a face to your work.", "Tell your story.", "Where did you learn?", "What do you create with?", "Share your experience.", "Make an entrance.", "Give your work a home.", "Your work, ready to share."];

export function BrowserStudio() {
  const router = useRouter(), session = useBrowserStudioSession();
  const { draft, saved, error, setError, status, setStatus, storageFailed, busy, setBusy, uploading, setUploading, cloudStatus, openingError, cloudError, conflict, recoveries, welcome, update, flush, act, syncAccount, resolveConflict, switchDraft, deleteAccount, saveImage, download, importFile, restore, retryOpen, getDraft, activeDraftKey, hasSaveError, hasConflict } = session;
  const heading = useRef<HTMLHeadingElement>(null), pendingFocus = useRef<string | null>(null);
  const section = draft?.section || 0, projectStep = draft?.projectStep || 0;
  const setProjectStep = (value: number) => update({ projectStep: value });

  useEffect(() => { heading.current?.focus(); }, [section]);
  useEffect(() => {
    if (!pendingFocus.current) return;
    const key = pendingFocus.current; pendingFocus.current = null;
    const wrapper = Array.from(document.querySelectorAll<HTMLElement>("[data-feedback-key]")).find(el => el.dataset.feedbackKey === key);
    (wrapper?.querySelector<HTMLElement>("input,textarea,button") || heading.current)?.focus();
  });

  function newProject() {
    if (getDraft().projects.length >= MAX_PROJECTS) { setError(`You can add up to ${MAX_PROJECTS} projects.`); return; }
    update({ projectDraft: { id: crypto.randomUUID(), title: "", thumbnail: "", images: [], date: todayISO(), description: "", technologies: [], link: "", slug: "" }, projectStep: 0 });
  }
  function commitProject() {
    try {
      const old = getDraft(), project = validateProject(old.projectDraft);
      if (old.projects.some(p => p.id !== project.id && p.slug === project.slug)) throw new Error("Another project uses that URL slug. Choose a different slug.");
      const projects = old.projects.some(p => p.id === project.id) ? old.projects.map(p => p.id === project.id ? project : p) : [...old.projects, project];
      update({ projects, projectDraft: null }); setError(""); setStatus("Project saved to your draft.");
    } catch (e) { setError(e instanceof Error ? e.message : "Check your project details."); }
  }
  function issuesFor(value = getDraft()) {
    const issues = publicationIssues({ profile: value.profile, projects: projectsWithEditor(value.projects, value.projectDraft) });
    if (!value.publication) try { validHandle(value.requestedHandle || ""); } catch (e) { issues.push({ key: "publish:Portfolio address", label: "Portfolio address", section: 8, message: e instanceof Error ? e.message : "Choose a portfolio address." }); }
    return issues;
  }
  function touch(field: string) {
    const value = getDraft();
    if (!value || !issuesFor(value).some(issue => issue.key === field)) return;
    if (!value.feedback?.touched.includes(field)) update({ feedback: { attempted: value.feedback?.attempted || false, touched: [...(value.feedback?.touched || []), field].slice(-3000) } });
  }
  async function preparePublish() {
    update({ feedback: { touched: getDraft().feedback?.touched || [], attempted: true } });
    const value = getDraft();
    if (issuesFor(value).length) { await flush(); return null; }
    const snapshot = validatePublication({ profile: value.profile, projects: projectsWithEditor(value.projects, value.projectDraft) });
    update({ profile: snapshot.profile, projects: snapshot.projects, projectDraft: null }); await flush(); await syncAccount();
    if (hasConflict()) throw new Error("Choose which draft to continue first.");
    return getDraft();
  }
  function openIssue(issue: PublicationIssue) {
    if (issue.key === "projects:Add project") { newProject(); update({ section: 7 }); pendingFocus.current = `project.${getDraft().projectDraft!.id}:Project title`; return; }
    if (issue.projectId && getDraft().projectDraft?.id !== issue.projectId) {
      const project = getDraft().projects.find(p => p.id === issue.projectId);
      if (getDraft().projectDraft) { setError("Finish or discard your current project edit before opening another project."); return; }
      if (project) update({ projectDraft: project });
    }
    update({ section: issue.section }); if (issue.step !== undefined) setProjectStep(issue.step); pendingFocus.current = issue.key;
  }
  async function openPreview() {
    if (!draft!.profile.name.trim()) throw new Error("Add your name before opening the preview.");
    await flush(); sessionStorage.setItem("portfolio-preview-key", activeDraftKey()); router.push("/studio/preview");
  }
  async function removeUnusedImages() {
    const value = getDraft(), refs = new Set([value.profile.headshotImage, value.profile.bannerImage, ...value.projects.flatMap(p => [p.thumbnail, ...p.images]), ...(value.projectDraft ? [value.projectDraft.thumbnail, ...value.projectDraft.images] : [])]);
    update({ images: Object.fromEntries(Object.entries(value.images).filter(([path]) => refs.has(path))) }); await flush(); setStatus("Unused images removed from this device draft.");
  }

  if (!draft) return <main id="main-content" className="mx-auto max-w-5xl p-8">{openingError ? <><p role="alert" className="form-error">{openingError}</p><button className="btn-primary mt-4" onClick={() => void retryOpen()}>Retry opening portfolio</button></> : <p role="status">Opening your saved portfolio…</p>}</main>;
  const locked = busy || uploading || Boolean(conflict), allIssues = issuesFor(draft), visibleIssues = allIssues.filter(issue => draft.feedback?.attempted || draft.feedback?.touched.includes(issue.key));

  return <DraftFeedbackContext.Provider value={{ issues: visibleIssues, touch }}><LocalMediaContext.Provider value={{ images: draft.images, save: saveImage }}>
    <StudioHeader storageFailed={storageFailed} signedIn={activeDraftKey() !== "guest"} cloudStatus={cloudStatus} saved={saved} locked={locked} preview={() => void act(openPreview)} />
    <main id="main-content" className="browser-studio mx-auto max-w-6xl px-6 pb-20 md:px-10">{welcome && <p className="notice mb-5" role="status">{welcome}</p>}<div className="mb-5 border-y border-line py-3"><p className="text-sm leading-6 text-moss">Signed-in text drafts save privately to your account. Verify your email to sync images and publish. Guest drafts stay on this device.</p></div>
      {cloudError && <p role="alert" className="notice mb-5">{cloudError} Your device copy is kept; saving will retry.</p>}
      {openingError && <div className="notice mb-5"><p role="alert">{openingError}</p><button className="btn-secondary mt-3" disabled={busy} onClick={() => void retryOpen()}>Retry opening account</button></div>}
      {conflict && <section className="studio-panel mb-5" aria-labelledby="conflict-heading"><h2 id="conflict-heading" className="display text-2xl">Choose which draft to continue</h2><p className="mt-3 leading-7">This device and your account have different edits. Both versions will be preserved; your published website stays unchanged.</p><div className="mt-4 flex flex-wrap gap-3"><button className="btn-primary" disabled={busy} onClick={() => void act(() => resolveConflict(false))}>Continue account version</button><button className="btn-secondary" disabled={busy} onClick={() => void act(() => resolveConflict(true))}>Continue device version</button><button className="btn-text" onClick={() => download(conflict.local)}>Download device version</button><button className="btn-text" onClick={() => download(conflict.remote)}>Download account version</button></div></section>}
      <div className="grid gap-5 lg:grid-cols-[210px_1fr] lg:gap-8">
        <StudioSidebar section={section} issues={visibleIssues} locked={locked} recoveries={recoveries} navigate={next => update({ section: next })} download={download} importBackup={file => void act(() => importFile(file))} removeUnused={() => void act(removeUnusedImages)} />
        <section className="order-2 min-w-0 lg:order-none"><p className="eyebrow">Create · Preview · Publish</p><h1 ref={heading} tabIndex={-1} className="display mb-5 mt-2 text-4xl leading-tight outline-none sm:text-5xl">{prompts[section]}</h1>
          {error && <p className="form-error mb-5" role="alert">{error}</p>}{status && <p className="notice mb-5" role="status">{status}</p>}
          {draft.feedback?.attempted && allIssues.length > 0 && <section className="mb-5 rounded-xl border border-[#8e302b] bg-white p-5" aria-labelledby="publish-issues-heading"><h2 id="publish-issues-heading" className="text-lg font-bold" role="alert">A few things need attention before publishing</h2><ul className="mt-3 space-y-3">{allIssues.map(issue => <li key={issue.key}><button type="button" className="text-left text-sm text-[#8e302b] underline underline-offset-4" disabled={locked} onClick={() => openIssue(issue)}>{issue.label}: {issue.message}</button></li>)}</ul></section>}
          <div className="studio-panel">
            {section < 7 && <fieldset disabled={locked}><ProfileFields key={section} profile={draft.profile} section={section} onChange={profile => {
              let touched = getDraft().feedback?.touched || [];
              for (const [field, prefix] of [["education", "education."], ["jobs", "job."]] as const) { const old = getDraft().profile[field]; if (profile[field].length < old.length) { const removed = old.findIndex(entry => !profile[field].includes(entry as never)); touched = touched.flatMap(key => { if (!key.startsWith(prefix)) return [key]; const index = Number(key.slice(prefix.length).split(":")[0]); return index === removed ? [] : [index > removed ? key.replace(prefix + index + ":", prefix + (index - 1) + ":") : key]; }); } }
              update({ profile, feedback: { attempted: getDraft().feedback?.attempted || false, touched } });
            }} onBusy={setUploading} /></fieldset>}
            {section === 7 && <ProjectsPanel draft={draft} projectStep={projectStep} locked={locked} setProjectStep={setProjectStep} update={update} setUploading={setUploading} clearError={() => { if (!hasSaveError()) setError(""); }} newProject={newProject} commitProject={commitProject} />}
            {section === 8 && <FeedbackScope.Provider value="publish"><PublishPanel preparePublish={preparePublish} onHandle={requestedHandle => update({ requestedHandle })} deleteAccount={deleteAccount} onBusy={setBusy} draft={draft} busy={locked} flush={async () => { await flush(); await syncAccount(); if (hasConflict()) throw new Error("Choose which draft to continue first."); }} connect={uid => switchDraft(uid, { ...getDraft(), ownerUid: uid, publication: null, section: 8 })} openAccount={uid => switchDraft(uid)} signedOut={async () => true} onPublished={async publication => { update({ publication, requestedHandle: publication?.handle || "" }); await flush(); await syncAccount(); }} restore={restore} /></FeedbackScope.Provider>}
          </div>
          {section < 8 && !(section === 7 && draft.projectDraft) && <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button className="btn-secondary" disabled={section === 0 || locked} onClick={() => update({ section: section - 1 })}>Back</button><button className="btn-primary" disabled={locked} onClick={() => update({ section: section + 1 })}>{section === 7 ? "Continue to publishing" : "Continue"}</button></div>}
        </section>
      </div>
    </main>
  </LocalMediaContext.Provider></DraftFeedbackContext.Provider>;
}
