"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { publishingAuth, publishingFetch, PublishingRequestError } from "@/lib/firebase-client";
import { backupBlob, deleteDraft, draftRecoveries, emptyDraft, fileData, parseBackup, readDraft, writeDraft, type BrowserDraft } from "@/lib/browser-draft";
import { MAX_DRAFT_BYTES, type Publication } from "@/lib/portfolio-snapshot";
import { hasDraftWork, hydrateCloud, loadAccountDraft, publicationBase, publicationMeta, saveAccountDraft } from "@/lib/account-draft-client";

export function useBrowserStudioSession() {
  const router = useRouter();
  const [draft, setDraft] = useState<BrowserDraft | null>(null), [saved, setSaved] = useState(false), [error, setError] = useState(""), [status, setStatus] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const current = useRef<BrowserDraft | null>(null), key = useRef("guest"), persisted = useRef<string | null>(null), queue = useRef(Promise.resolve()), saveError = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const storageReady = useRef(false);
  const cloudAbort = useRef<AbortController | null>(null);
  const accountUid = useRef<string | null>(null), generation = useRef(0), cloudReady = useRef(false), remoteRevision = useRef(0);
  const deletingAccount = useRef(false);
  const cloudQueue = useRef(Promise.resolve()), cloudTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [cloudStatus, setCloudStatus] = useState(""), [openingError, setOpeningError] = useState(""), [cloudError, setCloudError] = useState("");
  const [conflict, setConflict] = useState<{ local: BrowserDraft; remote: BrowserDraft } | null>(null);
  const conflictRef = useRef(false);
  const [recoveries, setRecoveries] = useState<BrowserDraft[]>([]);
  const [welcome, setWelcome] = useState("");

  function invalidateCloud() { cloudAbort.current?.abort(); cloudAbort.current = new AbortController(); generation.current++; }

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
          accountUid.current = uid; setCloudStatus("");
          if (uid && (key.current !== "guest" || !current.current || !hasDraftWork(current.current))) void openAccountDraft(uid);
          if (!uid && !deletingAccount.current && key.current !== "guest") void switchDraft("guest").catch(e => setError(e instanceof Error ? e.message : "Could not open your guest draft."));
        }
      });
      if (accountUid.current) await openAccountDraft(accountUid.current);
      else {
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
    const uid = accountUid.current, other = useLocal ? conflict.remote : conflict.local;
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
      if (draftKey !== key.current) return;
      try {
        if (!storageReady.current) throw new Error("Browser storage is unavailable. Enable site storage, then reload. Download a backup to keep your changes before leaving.");
        await writeDraft(draftKey, value, persisted.current); persisted.current = value.updatedAt; if (saveError.current) setError(""); saveError.current = false; setStorageFailed(false); if (current.current === value) setSaved(true);
      } catch (e) { saveError.current = true; setStorageFailed(true); setSaved(false); setError(e instanceof Error ? e.message : "Could not save this draft."); throw e; }
    });
    queue.current = next; await next;
    if (draftKey !== "guest" && value.updatedAt !== value.cloud?.syncedUpdatedAt && cloudReady.current) {
      clearTimeout(cloudTimer.current); cloudTimer.current = setTimeout(() => { void syncAccount(); }, 800);
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
    const warn = (event: BeforeUnloadEvent) => { if (current.current && (saveError.current || current.current.updatedAt !== persisted.current || (key.current !== "guest" && current.current.updatedAt !== current.current.cloud?.syncedUpdatedAt))) event.preventDefault(); };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel("portfolio-account-deletion");
    channel.onmessage = event => {
      if (event.data !== key.current) return;
      deletingAccount.current = true; invalidateCloud(); cloudReady.current = false; clearTimeout(cloudTimer.current);
      clearTimeout(saveTimer.current); current.current = null; saveError.current = false; router.replace("/login?deleted=1");
    };
    return () => channel.close();
  }, [router]);

  function update(change: Partial<BrowserDraft>) {
    const old = current.current!;
    const next = { ...old, ...change, updatedAt: new Date(Math.max(Date.now(), Date.parse(old.updatedAt) + 1)).toISOString() };
    current.current = next; setDraft(next); setSaved(false); setStatus("");
    if (key.current !== "guest") setCloudStatus("Saving to your account…");
    if (!saveError.current) setError("");
  }
  async function flush() { if (current.current) await persist(current.current); }
  async function act(task: () => Promise<void>) { setError(""); setBusy(true); try { await task(); } catch (e) { setError(e instanceof Error ? e.message : "Could not finish. Please retry."); } finally { setBusy(false); } }

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
    const wasReady = cloudReady.current, beforeReplacement = generation.current;
    try {
      cloudReady.current = false; clearTimeout(cloudTimer.current); await cloudQueue.current.catch(() => {});
      const result = await loadAccountDraft(nextKey), existing = await readDraft(nextKey);
      if (!confirmed && (existing && hasDraftWork(existing) || result.draft || result.publication) && !window.confirm("Replace this account's draft? Its previous version will be kept as a recovery backup on this device.")) { cloudReady.current = wasReady; return false; }
      const remote = await hydrateCloud(result, nextKey);
      if (existing && hasDraftWork(existing)) await writeDraft(`${nextKey}:recovery:${crypto.randomUUID()}`, existing);
      if (result.draft || result.publication) await writeDraft(`${nextKey}:recovery:${crypto.randomUUID()}`, remote);
      invalidateCloud(); cloudReady.current = false; remoteRevision.current = result.draft?.revision || 0;
      const value = { ...replacement!, ownerUid: nextKey, publication: publicationMeta(result.publication), cloud: { revision: remoteRevision.current, syncedUpdatedAt: "", assets: existing?.cloud?.assets || remote.cloud?.assets || {} }, updatedAt: new Date().toISOString() };
      await installDraft(nextKey, value, existing?.updatedAt || null);
      cloudReady.current = true; setOpeningError(""); conflictRef.current = false; setConflict(null); setRecoveries(await draftRecoveries(nextKey));
      await syncAccount(); return true;
    } finally { if (generation.current === beforeReplacement) cloudReady.current = wasReady; }
  }

  async function deleteAccount(uid: string) {
    if (key.current !== uid) await flush();
    clearTimeout(saveTimer.current); invalidateCloud(); cloudReady.current = false; clearTimeout(cloudTimer.current);
    await cloudQueue.current.catch(() => {}); await queue.current.catch(() => {});
    await publishingFetch("/api/account", { method: "DELETE", headers: { "X-Confirm-Delete": "delete-account" } });
    deletingAccount.current = true;
    if (key.current === uid) { current.current = null; saveError.current = false; }
    try { await deleteDraft(uid); } catch { throw new Error("Your online account and website were deleted. Clear this site’s browser data to remove the remaining device draft."); }
    const auth = await publishingAuth(); if (auth) await signOut(auth);
    router.replace("/login?deleted=1");
  }

  async function saveImage(file: File): Promise<string> {
    const path = `/images/${crypto.randomUUID()}.webp`, data = await fileData(file), old = current.current!;
    const images = { ...old.images, [path]: data };
    if (Object.values(images).reduce((size, image) => size + image.length, 0) > MAX_DRAFT_BYTES) throw new Error("Your device image library has reached 768 MB. Download a backup and remove unused images.");
    update({ images }); return path;
  }
  function download(value = current.current!) {
    const url = URL.createObjectURL(backupBlob(value)), a = document.createElement("a");
    a.href = url; a.download = "portfolio-draft.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
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

  return {
    draft, saved, error, setError, status, setStatus, storageFailed, busy, setBusy, uploading, setUploading,
    cloudStatus, openingError, cloudError, conflict, recoveries, welcome,
    update, flush, act, syncAccount, resolveConflict, switchDraft, deleteAccount, saveImage, download, importFile, restore,
    retryOpen: () => accountUid.current ? openAccountDraft(accountUid.current) : Promise.resolve(false),
    getDraft: () => current.current!, activeDraftKey: () => key.current, hasSaveError: () => saveError.current, hasConflict: () => conflictRef.current,
  };
}
