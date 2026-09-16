"use client";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { publishingAuth, publishingFetch, PublishingRequestError } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { draftRecoveries, deleteDraft, backupBlob, emptyDraft, fileData, parseBackup, readDraft, writeDraft, type BrowserDraft } from "@/lib/browser-draft";
import { MAX_DRAFT_BYTES, MAX_PROJECTS, type Publication } from "@/lib/portfolio-snapshot";
import { validateProject } from "@/lib/validation";
import { publicationIssues, projectsWithEditor, validatePublication, type PublicationIssue } from "@/lib/publication-validation";
import { AttentionIcon, DraftFeedbackContext, FeedbackScope } from "./DraftFeedback";
import { validHandle } from "@/lib/portfolio-snapshot";
import { todayISO } from "@/lib/dates";
import { ProfileFields, ProjectFields } from "./StudioFields";
import { LocalMediaContext } from "./LocalMedia";
import { PublishPanel } from "./PublishPanel";

import { hasDraftWork, hydrateCloud, loadAccountDraft, publicationBase, publicationMeta, saveAccountDraft } from "@/lib/account-draft-client";

const sections = ["Your name", "Headshot", "Biography", "Education", "Tools", "Experience", "Homepage", "Projects", "Publish"];
const prompts = ["Let's start with you.", "Put a face to your work.", "Tell your story.", "Where did you learn?", "What do you create with?", "Share your experience.", "Make an entrance.", "Give your work a home.", "Your work, ready to share."];
export function BrowserStudio() {
  const router = useRouter();
  const [draft, setDraft] = useState<BrowserDraft | null>(null), [saved, setSaved] = useState(false), [error, setError] = useState(""), [status, setStatus] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const current = useRef<BrowserDraft | null>(null), key = useRef("guest"), persisted = useRef<string | null>(null), queue = useRef(Promise.resolve()), saveError = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const storageReady = useRef(false);
  const cloudAbort = useRef<AbortController | null>(null);
  function invalidateCloud() { cloudAbort.current?.abort(); cloudAbort.current = new AbortController(); generation.current++; }
  const accountUid = useRef<string | null>(null), generation = useRef(0), cloudReady = useRef(false), remoteRevision = useRef(0);
  const deletingAccount = useRef(false);
  const cloudQueue = useRef(Promise.resolve()), cloudTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [cloudStatus, setCloudStatus] = useState(""), [openingError, setOpeningError] = useState(""), [cloudError, setCloudError] = useState("");
  const [conflict, setConflict] = useState<{ local: BrowserDraft; remote: BrowserDraft } | null>(null);
  const conflictRef = useRef(false);
  const [recoveries, setRecoveries] = useState<BrowserDraft[]>([]);
  const [welcome, setWelcome] = useState("");
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("welcome");
    if (value === "verify-email") setWelcome("Account created. Check your inbox (check your spam folder too) to verify your email before publishing. You can start creating now.");
    if (value === "verification-pending") setWelcome("Your account was created, but the verification email could not be sent. You can start creating now and resend the email from Publish.");
  }, []);
  useEffect(() => {
    let active = true, stop: (() => void) | undefined;
    void (async () => {
      const auth = await publishingAuth();
      await auth?.authStateReady();
      if (!active) return;
      accountUid.current = auth?.currentUser?.uid || null;
      if (auth && active) stop = onAuthStateChanged(auth, user => {
        const uid = user?.uid || null;
        if (accountUid.current !== uid) {
          invalidateCloud(); cloudReady.current = false; clearTimeout(cloudTimer.current);
          accountUid.current = uid;
          setCloudStatus("");
          if (uid && (key.current !== "guest" || !current.current || !hasDraftWork(current.current))) void openAccountDraft(uid);
          if (!uid && !deletingAccount.current && key.current !== "guest") void switchDraft("guest").catch(e => setError(e instanceof Error ? e.message : "Could not open your guest draft."));
        }
      });
      if (accountUid.current) await openAccountDraft(accountUid.current);
      else {
        localStorage.getItem("portfolio-active-draft"); // Detect disabled site storage before claiming a save.
        const value = await readDraft("guest");
        if (!active) return;
        await installDraft("guest", value || emptyDraft(), value?.updatedAt || null, false);
      }

    })().catch(e => { if (active) {
      if (e instanceof DOMException || (e instanceof Error && e.message.includes("storage"))) {
        const value = emptyDraft(); current.current = value; setDraft(value); storageReady.current = false; saveError.current = true; setStorageFailed(true);
        setError("Browser storage is unavailable. Enable site storage, then reload to open your saved draft. Download a backup before leaving if you make changes here.");
      } else setOpeningError(e instanceof Error ? e.message : "Could not open your saved portfolio. Retry when connected.");
    } });
    return () => { active = false; invalidateCloud(); cloudReady.current = false; clearTimeout(cloudTimer.current); stop?.(); };
    // Startup is account-driven; edits never restart authentication or hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function installDraft(uid: string, value: BrowserDraft, expected: string | null, write = true) {
    if (write) await writeDraft(uid, value, expected);
    key.current = uid; persisted.current = write ? value.updatedAt : expected;
    storageReady.current = true; current.current = value; setDraft(value); setSaved(write || Boolean(expected));
    localStorage.setItem("portfolio-active-draft", uid);
    saveError.current = false; setStorageFailed(false);
  }
  async function openAccountDraft(uid: string) {
    clearTimeout(saveTimer.current); clearTimeout(cloudTimer.current);
    invalidateCloud(); const token = generation.current; cloudReady.current = false; setOpeningError(""); setBusy(true);
    try {
      if (current.current) await flush();
      if (key.current !== uid) setDraft(null);
      await cloudQueue.current.catch(() => {});
      const local = await readDraft(uid);
      const result = await loadAccountDraft(uid, cloudAbort.current?.signal);
      if (token !== generation.current || accountUid.current !== uid) return false;
      remoteRevision.current = result.draft?.revision || 0;
      const localDirty = local && (local.cloud ? local.updatedAt !== local.cloud.syncedUpdatedAt : hasDraftWork(local));
      const needsConflict = localDirty && (result.draft ? local.cloud?.revision !== result.draft.revision : Boolean(result.publication && local.publication?.revision !== result.publication.revision));
      if (needsConflict) {
        const remote = await hydrateCloud(result, uid, cloudAbort.current?.signal);
        if (token !== generation.current) return false;
        conflictRef.current = true; setConflict({ local, remote });
        await installDraft(uid, local, local.updatedAt, false);
      } else {
        const value = local && (localDirty || (result.draft && local.cloud?.revision === result.draft.revision))
          ? { ...local, publication: publicationBase(local.publication, result.publication) }
          : await hydrateCloud(result, uid, cloudAbort.current?.signal);
        if (token !== generation.current) return false;
        await installDraft(uid, value, local?.updatedAt || null);
        cloudReady.current = true; conflictRef.current = false; setConflict(null);
        setCloudStatus(value.cloud?.syncedUpdatedAt === value.updatedAt ? "Saved to your account" : "Saving to your account…");
      }
      setRecoveries(await draftRecoveries(uid));
      return true;
    } catch (e) {
      if (token !== generation.current) return false;
      setOpeningError(e instanceof Error ? e.message : "Could not load your account. Retry when connected.");
      const local = await readDraft(uid).catch(() => null);
      if (local) await installDraft(uid, local, local.updatedAt, false);
      setCloudStatus("Saved on this device—sync pending");
      return false;
    } finally { if (token === generation.current) setBusy(false); }
  }
  async function syncAccount() {
    const token = generation.current, uid = key.current, signal = cloudAbort.current?.signal;
    const task = cloudQueue.current.catch(() => {}).then(async () => {
      if (!cloudReady.current || conflictRef.current || uid === "guest" || uid !== accountUid.current || token !== generation.current) return;
      const value = current.current;
      if (!value || value.updatedAt === value.cloud?.syncedUpdatedAt) return;
      setCloudStatus("Saving to your account…");
      try {
        const cloud = await saveAccountDraft(value, uid, remoteRevision.current, () => token === generation.current && accountUid.current === uid && cloudReady.current, signal);
        if (token !== generation.current) return;
        remoteRevision.current = cloud.revision; setCloudError("");
        if (!current.current) return;
        const next = { ...current.current, cloud };
        current.current = next; setDraft(next);
        await persist(next, uid);
        setCloudStatus(next.updatedAt === cloud.syncedUpdatedAt ? "Saved to your account" : "Saving to your account…");
      } catch (e) {
        if (token !== generation.current) return;
        setCloudStatus("Saved on this device—sync pending");
        if (e instanceof PublishingRequestError && e.status === 409) {
          cloudReady.current = false;
          try {
            const result = await loadAccountDraft(uid), remote = await hydrateCloud(result, uid, cloudAbort.current?.signal);
            if (token !== generation.current || !current.current) return;
            remoteRevision.current = result.draft?.revision || 0;
            conflictRef.current = true; setConflict({ local: current.current, remote });
          } catch (loadError) { setOpeningError(loadError instanceof Error ? loadError.message : "Could not load the other draft. Retry when connected."); }
        } else setCloudError(e instanceof Error ? e.message : "Could not save to your account. Your device copy is kept; saving will retry.");
      }
    });
    cloudQueue.current = task; return task;
  }
  const retrySync = useRef(() => {});
  retrySync.current = () => { if (!busy && !conflictRef.current) { if (openingError && accountUid.current) void openAccountDraft(accountUid.current); else void syncAccount(); } };
  useEffect(() => {
    const retry = () => retrySync.current();
    window.addEventListener("online", retry);
    const interval = setInterval(retry, 15000);
    return () => { window.removeEventListener("online", retry); clearInterval(interval); };
  }, []);
  async function resolveConflict(useLocal: boolean) {
    if (!conflict || !accountUid.current) return;
    const uid = accountUid.current;
    const other = useLocal ? conflict.remote : conflict.local;
    await writeDraft(`${uid}:recovery:${crypto.randomUUID()}`, other);
    const chosen = useLocal ? { ...conflict.local, publication: conflict.remote.publication, cloud: { revision: remoteRevision.current, syncedUpdatedAt: "", assets: conflict.local.cloud?.assets || {} } } : conflict.remote;
    const old = await readDraft(uid);
    await installDraft(uid, chosen, old?.updatedAt || null);
    setCloudStatus(chosen.cloud?.syncedUpdatedAt === chosen.updatedAt ? "Saved to your account" : "Saving to your account…");
    conflictRef.current = false; setConflict(null); cloudReady.current = true;
    setRecoveries(await draftRecoveries(uid));
    await syncAccount();
  }
  async function persist(value: BrowserDraft, draftKey = key.current) {
    const next = queue.current.catch(() => {}).then(async () => {
      // A delayed autosave must never write into a subsequently selected account.
      if (draftKey !== key.current) return;
      try {
        if (!storageReady.current) throw new Error("Browser storage is unavailable. Enable site storage, then reload. Download a backup to keep your changes before leaving.");
        await writeDraft(draftKey, value, persisted.current); persisted.current = value.updatedAt; if (saveError.current) setError(""); saveError.current = false; setStorageFailed(false); if (current.current === value) setSaved(true);
      }
      catch (e) { saveError.current = true; setStorageFailed(true); setSaved(false); setError(e instanceof Error ? e.message : "Could not save this draft."); throw e; }
    }); queue.current = next;
    await next;
    if (draftKey !== "guest" && value.updatedAt !== value.cloud?.syncedUpdatedAt && cloudReady.current) {
      clearTimeout(cloudTimer.current);
      cloudTimer.current = setTimeout(() => { void syncAccount(); }, 800);
    }
    return next;
  }
  useEffect(() => {
    if (!draft) return;
    const draftKey = key.current;
    saveTimer.current = setTimeout(() => { void persist(draft, draftKey).catch(() => {}); }, 300);
    return () => clearTimeout(saveTimer.current);
    // persist reads mutable revision/key refs; only a new draft schedules a save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (current.current && (saveError.current || current.current.updatedAt !== persisted.current || (key.current !== "guest" && current.current.updatedAt !== current.current.cloud?.syncedUpdatedAt))) { event.preventDefault(); } };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    const channel = new BroadcastChannel("portfolio-account-deletion");
    channel.onmessage = event => {
      if (event.data !== key.current) return;
      deletingAccount.current = true;
      invalidateCloud(); cloudReady.current = false; clearTimeout(cloudTimer.current);
      clearTimeout(saveTimer.current); current.current = null; saveError.current = false;
      router.replace("/login?deleted=1");
    };
    return () => channel.close();
  }, [router]);
  const section = draft?.section || 0, projectStep = draft?.projectStep || 0;
  const setProjectStep = (value: number) => update({ projectStep: value });
  useEffect(() => { heading.current?.focus(); }, [section]);
  useEffect(() => {
    if (!pendingFocus.current) return;
    const key = pendingFocus.current; pendingFocus.current = null;
    const wrapper = Array.from(document.querySelectorAll<HTMLElement>("[data-feedback-key]")).find(el => el.dataset.feedbackKey === key);
    (wrapper?.querySelector<HTMLElement>("input,textarea,button") || heading.current)?.focus();
  });
  function update(change: Partial<BrowserDraft>) {
    const old = current.current!;
    const next = { ...old, ...change, updatedAt: new Date(Math.max(Date.now(), Date.parse(old.updatedAt) + 1)).toISOString() };
    current.current = next; setDraft(next); setSaved(false); setStatus("");
    if (key.current !== "guest") setCloudStatus("Saving to your account…");
    // Dismiss obsolete action/validation feedback on edits and every navigation path.
    // Persistence failures retain their warning until a save actually succeeds.
    if (!saveError.current) setError("");
  }
  async function flush() { if (current.current) await persist(current.current); }
  async function act(task: () => Promise<void>) {
    setError(""); setBusy(true);
    try { await task(); } catch (e) { setError(e instanceof Error ? e.message : "Could not finish. Please retry."); }
    finally { setBusy(false); }
  }
  async function switchDraft(nextKey: string, replacement?: BrowserDraft, confirmed = false) {
    clearTimeout(saveTimer.current); await flush();
    if (!replacement && nextKey !== "guest") return openAccountDraft(nextKey);
    if (nextKey === "guest") {
      invalidateCloud(); cloudReady.current = false; clearTimeout(cloudTimer.current);
      const existing = await readDraft("guest");
      await installDraft("guest", existing || emptyDraft(), existing?.updatedAt || null);
      setCloudStatus(""); setCloudError(""); setOpeningError(""); conflictRef.current = false; setConflict(null); setRecoveries([]);
      return true;
    }
    // Freeze old autosaves while checking and downloading replacement data.
    const wasReady = cloudReady.current, beforeReplacement = generation.current;
    try {
    cloudReady.current = false; clearTimeout(cloudTimer.current);
    await cloudQueue.current.catch(() => {});
    const result = await loadAccountDraft(nextKey), existing = await readDraft(nextKey);
    if (!confirmed && (existing && hasDraftWork(existing) || result.draft || result.publication) && !window.confirm("Replace this account's draft? Its previous version will be kept as a recovery backup on this device.")) { cloudReady.current = wasReady; return false; }
    const remote = await hydrateCloud(result, nextKey);
    if (existing && hasDraftWork(existing)) await writeDraft(`${nextKey}:recovery:${crypto.randomUUID()}`, existing);
    if (result.draft || result.publication) await writeDraft(`${nextKey}:recovery:${crypto.randomUUID()}`, remote);
    invalidateCloud(); cloudReady.current = false;
    remoteRevision.current = result.draft?.revision || 0;
    const value = { ...replacement!, ownerUid: nextKey, publication: publicationMeta(result.publication), cloud: { revision: remoteRevision.current, syncedUpdatedAt: "", assets: existing?.cloud?.assets || remote.cloud?.assets || {} }, updatedAt: new Date().toISOString() };
    await installDraft(nextKey, value, existing?.updatedAt || null);
    cloudReady.current = true; setOpeningError(""); conflictRef.current = false; setConflict(null);
    setRecoveries(await draftRecoveries(nextKey));
    await syncAccount();
    return true;
    } finally { if (generation.current === beforeReplacement) cloudReady.current = wasReady; }
  }
  async function deleteAccount(uid: string) {
    if (key.current !== uid) await flush();
    clearTimeout(saveTimer.current);
    invalidateCloud(); cloudReady.current = false; clearTimeout(cloudTimer.current);
    await cloudQueue.current.catch(() => {});
    await queue.current.catch(() => {});
    await publishingFetch("/api/account", { method: "DELETE", headers: { "X-Confirm-Delete": "delete-account" } });
    deletingAccount.current = true;
    // Never flush after deletion: a pending save must not recreate the removed draft.
    if (key.current === uid) { current.current = null; saveError.current = false; }
    try { await deleteDraft(uid); } catch { throw new Error("Your online account and website were deleted. Clear this site?s browser data to remove the remaining device draft."); }
    const auth = await publishingAuth(); if (auth) await signOut(auth);
    router.replace("/login?deleted=1");
  }
  async function saveImage(file: File): Promise<string> {
    const path = `/images/${crypto.randomUUID()}.webp`;
    const data = await fileData(file), old = current.current!;
    const images = { ...old.images, [path]: data };
    if (Object.values(images).reduce((size, image) => size + image.length, 0) > MAX_DRAFT_BYTES) throw new Error("Your device image library has reached 768 MB. Download a backup and remove unused images.");
    update({ images }); return path;
  }
  function download(value = current.current!) {
    const url = URL.createObjectURL(backupBlob(value));
    const a = document.createElement("a"); a.href = url; a.download = "portfolio-draft.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Backup downloaded with your content and images.");
  }
  async function importFile(file?: File) {
    if (!file) return;
    if (file.size > MAX_DRAFT_BYTES) throw new Error("Choose a backup no larger than 768 MB.");
    const imported = parseBackup(await file.text());
    if (!window.confirm("Replace this device draft with the backup? Your published portfolio will stay unchanged.")) return;
    const old = current.current!;
    update({ ...imported, ownerUid: old.ownerUid, publication: old.publication }); await flush(); setStatus("Backup restored on this device. Publish when you are ready.");
  }
  async function restore(publication: Publication, images: Record<string, string>, uid: string) {
    const value = { ...emptyDraft(), profile: publication.profile, projects: publication.projects, images, ownerUid: uid, section: 8, publication: { handle: publication.handle, revision: publication.revision, publishedAt: publication.publishedAt } };
    return switchDraft(uid, value, true);
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
      update({ projects, projectDraft: null }); setError(""); setStatus("Project saved to your draft.");
    } catch (e) { setError(e instanceof Error ? e.message : "Check your project details."); }
  }
  function issuesFor(value: BrowserDraft) {
    const issues = publicationIssues({ profile: value.profile, projects: projectsWithEditor(value.projects, value.projectDraft) });
    if (!value.publication) {
      try { validHandle(value.requestedHandle || ""); }
      catch (e) { issues.push({ key: "publish:Portfolio address", label: "Portfolio address", section: 8, message: e instanceof Error ? e.message : "Choose a portfolio address." }); }
    }
    return issues;
  }
  function touch(field: string) {
    const value = current.current!;
    // Valid/optional fields need no warning metadata; blurring them must not dirty a saved draft.
    if (!value || !issuesFor(value).some(issue => issue.key === field)) return;
    if (!value.feedback?.touched.includes(field)) update({ feedback: { attempted: value.feedback?.attempted || false, touched: [...(value.feedback?.touched || []), field].slice(-3000) } });
  }
  async function preparePublish(): Promise<BrowserDraft | null> {
    update({ feedback: { touched: current.current!.feedback?.touched || [], attempted: true } });
    const value = current.current!;
    if (issuesFor(value).length) { await flush(); return null; }
    const snapshot = validatePublication({ profile: value.profile, projects: projectsWithEditor(value.projects, value.projectDraft) });
    update({ profile: snapshot.profile, projects: snapshot.projects, projectDraft: null });
    await flush(); await syncAccount();
    if (conflictRef.current) throw new Error("Choose which draft to continue first.");
    return current.current!;
  }
  function openIssue(issue: PublicationIssue) {
    if (issue.key === "projects:Add project") { newProject(); update({ section: 7 }); pendingFocus.current = `project.${current.current!.projectDraft!.id}:Project title`; return; }
    if (issue.projectId && current.current!.projectDraft?.id !== issue.projectId) {
      const project = current.current!.projects.find(p => p.id === issue.projectId);
      if (current.current!.projectDraft) { setError("Finish or discard your current project edit before opening another project."); return; }
      if (project) update({ projectDraft: project });
    }
    update({ section: issue.section });
    if (issue.step !== undefined) setProjectStep(issue.step);
    pendingFocus.current = issue.key;
  }
  if (!draft) return <main id="main-content" className="mx-auto max-w-5xl p-8">{openingError ? <><p role="alert" className="form-error">{openingError}</p><button className="btn-primary mt-4" onClick={() => accountUid.current ? void openAccountDraft(accountUid.current) : window.location.reload()}>Retry opening portfolio</button></> : <p role="status">Opening your saved portfolio…</p>}</main>;
  const locked = busy || uploading || Boolean(conflict);
  const allIssues = issuesFor(draft), visibleIssues = allIssues.filter(issue => draft.feedback?.attempted || draft.feedback?.touched.includes(issue.key));
  return <DraftFeedbackContext.Provider value={{ issues: visibleIssues, touch }}><LocalMediaContext.Provider value={{ images: draft.images, save: saveImage }}><header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-10"><Link className="display text-xl font-semibold" href="/">Portfolio studio<span className="text-coral">.</span></Link><div className="flex flex-wrap items-center gap-4"><span className="text-sm text-moss" role="status">{storageFailed ? "Not saved · download a backup" : key.current !== "guest" ? cloudStatus || "Saved on this device—sync pending" : saved ? "Saved on this device" : "Saving on this device…"}</span><button className="btn-secondary" disabled={locked} onClick={() => void act(async () => { if (!draft.profile.name.trim()) throw new Error("Add your name before opening the preview."); await flush(); sessionStorage.setItem("portfolio-preview-key", key.current); router.push("/studio/preview"); })}>Preview portfolio</button></div></header>
  <main id="main-content" className="browser-studio mx-auto max-w-6xl px-6 pb-20 md:px-10">{welcome && <p className="notice mb-5" role="status">{welcome}</p>}<div className="mb-5 border-y border-line py-3"><p className="text-sm leading-6 text-moss">Signed-in text drafts save privately to your account. Verify your email to sync images and publish. Guest drafts stay on this device.</p></div>
    {cloudError && <p role="alert" className="notice mb-5">{cloudError} Your device copy is kept; saving will retry.</p>}
    {openingError && <div className="notice mb-5"><p role="alert">{openingError}</p><button className="btn-secondary mt-3" disabled={busy} onClick={() => accountUid.current && void openAccountDraft(accountUid.current)}>Retry opening account</button></div>}
    {conflict && <section className="studio-panel mb-5" aria-labelledby="conflict-heading"><h2 id="conflict-heading" className="display text-2xl">Choose which draft to continue</h2><p className="mt-3 leading-7">This device and your account have different edits. Both versions will be preserved; your published website stays unchanged.</p><div className="mt-4 flex flex-wrap gap-3"><button className="btn-primary" disabled={busy} onClick={() => void act(() => resolveConflict(false))}>Continue account version</button><button className="btn-secondary" disabled={busy} onClick={() => void act(() => resolveConflict(true))}>Continue device version</button><button className="btn-text" onClick={() => download(conflict.local)}>Download device version</button><button className="btn-text" onClick={() => download(conflict.remote)}>Download account version</button></div></section>}
    <div className="grid gap-5 lg:grid-cols-[210px_1fr] lg:gap-8"><aside className="contents lg:block"><nav aria-label="Portfolio setup" className="grid grid-cols-2 gap-1 min-[375px]:grid-cols-3 sm:grid-cols-5 lg:grid-cols-1">{sections.map((label, i) => <button type="button" key={label} className={section === i ? "setup-step active" : "setup-step"} aria-current={section === i ? "step" : undefined} disabled={locked} onClick={() => { update({ section: i }); }}><span className="mono text-xs">{String(i + 1).padStart(2, "0")}</span><span>{label}</span>{visibleIssues.some(issue => issue.section === i) && <><AttentionIcon /><span className="sr-only">Needs attention</span></>}</button>)}</nav><details className="order-3 mt-3 space-y-3 border-t border-line pt-4 lg:order-none"><summary className="cursor-pointer text-sm font-bold">Draft backups & storage</summary><p className="text-sm leading-6 text-moss">Account drafts open automatically when you sign in, including on a new device. Offline edits and guest drafts stay on this device until synced. Download a backup before clearing browser data while sync is pending.</p><button className="btn-text" onClick={() => download()}>Download draft backup</button>{recoveries.map((value, i) => <button key={i} className="btn-text block" onClick={() => download(value)}>Download recovery {i + 1} · {new Date(value.updatedAt).toLocaleString()}</button>)}<label className="block text-sm font-bold">Import draft backup<input className="mt-2 block w-full text-sm" type="file" accept=".json,application/json" disabled={locked} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; void act(() => importFile(file)); }} /></label><button className="btn-text" disabled={locked} onClick={() => void act(async () => { const d = current.current!, refs = new Set([d.profile.headshotImage, d.profile.bannerImage, ...d.projects.flatMap(p => [p.thumbnail, ...p.images]), ...(d.projectDraft ? [d.projectDraft.thumbnail, ...d.projectDraft.images] : [])]); update({ images: Object.fromEntries(Object.entries(d.images).filter(([path]) => refs.has(path))) }); await flush(); setStatus("Unused images removed from this device draft."); })}>Remove unused draft images</button></details></aside>
    <section className="order-2 min-w-0 lg:order-none"><p className="eyebrow">Create · Preview · Publish</p><h1 ref={heading} tabIndex={-1} className="display mb-5 mt-2 text-4xl leading-tight outline-none sm:text-5xl">{prompts[section]}</h1>
    {error && <p className="form-error mb-5" role="alert">{error}</p>}{status && <p className="notice mb-5" role="status">{status}</p>}
    {draft.feedback?.attempted && allIssues.length > 0 && <section className="mb-5 rounded-xl border border-[#8e302b] bg-white p-5" aria-labelledby="publish-issues-heading"><h2 id="publish-issues-heading" className="text-lg font-bold" role="alert">A few things need attention before publishing</h2><ul className="mt-3 space-y-3">{allIssues.map(issue => <li key={issue.key}><button type="button" className="text-left text-sm text-[#8e302b] underline underline-offset-4" disabled={locked} onClick={() => openIssue(issue)}>{issue.label}: {issue.message}</button></li>)}</ul></section>}
    <div className="studio-panel">
      {section < 7 && <fieldset disabled={locked}><ProfileFields key={section} profile={draft.profile} section={section} onChange={profile => {
        let touched = current.current!.feedback?.touched || [];
        for (const [field, prefix] of [["education", "education."], ["jobs", "job."]] as const) {
          const old = current.current!.profile[field];
          if (profile[field].length < old.length) {
            const removed = old.findIndex(entry => !profile[field].includes(entry as never));
            touched = touched.flatMap(key => {
              if (!key.startsWith(prefix)) return [key];
              const index = Number(key.slice(prefix.length).split(":")[0]);
              return index === removed ? [] : [index > removed ? key.replace(prefix + index + ":", prefix + (index - 1) + ":") : key];
            });
          }
        }
        update({ profile, feedback: { attempted: current.current!.feedback?.attempted || false, touched } });
      }} onBusy={setUploading} /></fieldset>}
      {section === 7 && <div className="space-y-6">{draft.projectDraft ? <><div className="flex flex-wrap gap-2">{["Details", "Images", "Review"].map((name, i) => <button className={projectStep === i ? "section-tab active" : "section-tab"} aria-pressed={projectStep === i} disabled={locked} key={name} onClick={() => { setProjectStep(i); if (!saveError.current) setError(""); }}>{name}</button>)}</div><fieldset disabled={locked}><FeedbackScope.Provider value={"project." + draft.projectDraft.id}><ProjectFields key={draft.projectDraft.id + projectStep} project={draft.projectDraft} section={projectStep} onChange={projectDraft => update({ projectDraft })} onBusy={setUploading} /></FeedbackScope.Provider></fieldset><div className="flex flex-wrap gap-3"><button className="btn-primary" disabled={locked} onClick={() => projectStep < 2 ? (setProjectStep(projectStep + 1), !saveError.current && setError("")) : commitProject()}>{projectStep < 2 ? "Continue" : "Save project to draft"}</button><button className="btn-text" disabled={locked} onClick={() => { if (window.confirm("Discard this unfinished project edit? Saved projects will stay in your draft.")) update({ projectDraft: null }); }}>Discard project draft</button></div></> : <><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="display text-2xl">Your projects <span className="text-moss">({draft.projects.length}/{MAX_PROJECTS})</span></h2><button className="btn-primary" onClick={newProject}>Add project</button></div>{!draft.projects.length && <p className="empty-note">Start with a project you are proud of. Add a description, images, and the tools you used.</p>}{draft.projects.map(project => <article className="rounded-xl border border-line p-5" key={project.id}><h3 className="text-lg font-bold">{project.title}</h3><p className="mt-1 text-sm text-moss">{project.images.length} images{project.featured ? " · Featured project" : ""}</p><div className="mt-4 flex flex-wrap gap-4"><button className="btn-secondary" onClick={() => { update({ projectDraft: project }); setProjectStep(0); }}>Edit {project.title}</button><button className="btn-text" onClick={() => update({ projects: draft.projects.map(p => ({ ...p, featured: p.id === project.id ? !project.featured : false })) })}>{project.featured ? "Remove feature" : "Feature project"}</button><button className="btn-text" onClick={() => { if (window.confirm(`Delete “${project.title}” from your draft? It stays online until you publish updates.`)) update({ projects: draft.projects.filter(p => p.id !== project.id) }); }}>Delete {project.title}</button></div></article>)}</>}
      </div>}
      {section === 8 && <FeedbackScope.Provider value="publish"><PublishPanel preparePublish={preparePublish} onHandle={requestedHandle => update({ requestedHandle })} deleteAccount={deleteAccount} onBusy={setBusy} draft={draft} busy={locked} flush={async () => { await flush(); await syncAccount(); if (conflictRef.current) throw new Error("Choose which draft to continue first."); }} connect={uid => switchDraft(uid, { ...current.current!, ownerUid: uid, publication: null, section: 8 })} openAccount={uid => switchDraft(uid)} signedOut={async () => true} onPublished={async publication => { update({ publication, requestedHandle: publication?.handle || "" }); await flush(); await syncAccount(); }} restore={restore} /></FeedbackScope.Provider>}
    </div>
    {section < 8 && <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button className="btn-secondary" disabled={section === 0 || locked} onClick={() => update({ section: section - 1 })}>Back</button><button className="btn-primary" disabled={locked} onClick={() => update({ section: section + 1 })}>{section === 7 ? "Continue to publishing" : "Continue"}</button></div>}
    </section></div>
  </main></LocalMediaContext.Provider></DraftFeedbackContext.Provider>;
}
