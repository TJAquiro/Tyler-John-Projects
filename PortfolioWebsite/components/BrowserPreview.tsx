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
    const key = sessionStorage.getItem("portfolio-preview-key") || "guest";
    void readDraft(key).then(value => value ? setDraft(value) : setError("No saved draft was found on this device. Open the studio to create one.")).catch(e => setError(e.message));
  }, [params]);
  const mapped = draft ? mapImages(draft, draft.images) : null;
  const project = mapped?.projects.find(p => view === `/projects/${p.slug}`);
  return <><div className="notice m-4 flex flex-wrap items-center justify-between gap-3"><span>Private preview · Only saved on this device</span><Link className="btn-secondary" href="/studio">Back to studio</Link></div>{error ? <main id="main-content" className="p-6"><p role="alert">{error}</p></main> : !mapped ? <main id="main-content" className="p-6" role="status">Loading your preview…</main> : view === "/about" ? <AboutView {...mapped} basePath="/studio/preview" /> : project ? <ProjectView profile={mapped.profile} project={project} basePath="/studio/preview" /> : <HomeView {...mapped} basePath="/studio/preview" />}</>;
}
