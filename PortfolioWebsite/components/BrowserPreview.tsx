"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { readDraft, type BrowserDraft } from "@/lib/browser-draft";
import { mapImages } from "@/lib/portfolio-snapshot";
import { HomeView, AboutView, ProjectView } from "./PublicPages";
export function BrowserPreview() {
  const params = useSearchParams();
  const [draft, setDraft] = useState<BrowserDraft | null>(null), [view, setView] = useState("/"), [error, setError] = useState("");
  useEffect(() => {
    const search = new URLSearchParams(location.search);
    setView(search.get("view") || "/");
    let active = true;
    void Promise.resolve().then(() => readDraft(sessionStorage.getItem("portfolio-preview-key") || "guest"))
      .then(value => { if (active) { setDraft(value); setError(value ? "" : "No saved draft was found on this device. Open the studio to create one."); } })
      .catch(() => { if (active) setError("Browser storage is unavailable. Enable site storage, then return to the studio to open your preview."); });
    return () => { active = false; };
  }, [params]);
  useEffect(() => {
    const channel = new BroadcastChannel("portfolio-account-deletion");
    channel.onmessage = event => {
      if (event.data !== draft?.ownerUid) return;
      setDraft(null); setError("This account and its portfolio have been deleted.");
      sessionStorage.removeItem("portfolio-preview-key");
    };
    return () => channel.close();
  }, [draft?.ownerUid]);
  const mapped = draft ? mapImages(draft, draft.images) : null;
  const project = mapped?.projects.find(p => view === `/projects/${p.slug}`);
  return <><div className="notice m-4 flex flex-wrap items-center justify-between gap-3"><span>Private preview · Only saved on this device</span><Link className="btn-secondary" href="/studio">Back to studio</Link></div>{error ? <main id="main-content" className="p-6"><p role="alert">{error}</p></main> : !mapped ? <main id="main-content" className="p-6" role="status">Loading your preview…</main> : view === "/about" ? <AboutView {...mapped} basePath="/studio/preview" /> : project ? <ProjectView profile={mapped.profile} project={project} basePath="/studio/preview" /> : <HomeView {...mapped} basePath="/studio/preview" />}</>;
}
