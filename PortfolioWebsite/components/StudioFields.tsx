"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import type { Profile, Project } from "@/lib/types";
import { imagePath as validateImagePath } from "@/lib/validation";
import { SoftwarePicker } from "./SoftwarePicker";
import { CropDialog } from "./CropDialog";
import { DateField } from "./DateField";
import { formatDate, todayISO } from "@/lib/dates";
import { useLocalMedia } from "./LocalMedia";
import { MAX_IMAGE_BYTES } from "@/lib/portfolio-snapshot";

export async function saveJSON(url: string, body: unknown, method = "PUT") {
  let response: Response;
  try { response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
  catch { throw new Error("Connection lost. Your changes are still here. Check your connection and retry."); }
  const result = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(result.error || "Could not save. Please retry.");
}
export function Field({ label, value, onChange, required, multiline, hint, type = "text", maxLength = 20000 }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; multiline?: boolean; hint?: string; type?: string; maxLength?: number }) {
  const id = useId(), description = hint ? `${id}-hint` : undefined;
  return <div className="studio-field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>{hint && <small id={description}>{hint}</small>}
    {multiline ? <textarea id={id} aria-describedby={description} className="admin-input min-h-36" value={value} required={required} maxLength={maxLength} onChange={e => onChange(e.target.value)} /> : <input id={id} aria-describedby={description} className="admin-input" type={type} value={value} required={required} maxLength={maxLength} onChange={e => onChange(e.target.value)} />}
  </div>;
}
export function DraftNotice({ conflict, restore }: { conflict: boolean; restore: () => void }) {
  return conflict ? <div className="notice mb-5"><p>A newer saved version was loaded. Your older browser draft was kept separately.</p><button className="btn-text mt-2" type="button" onClick={restore}>Restore older draft</button></div> : null;
}
export function ImagePicker({ label, value, onChange, onBusy, required = false }: { label: string; value: string; onChange: (value: string) => void; onBusy?: (busy: boolean) => void; required?: boolean }) {
  const local = useLocalMedia();
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [source, setSource] = useState<string | null>(null);
  const objectURL = useRef<string | null>(null);
  useEffect(() => () => { if (objectURL.current) URL.revokeObjectURL(objectURL.current); }, []);
  function close() { setError(""); if (objectURL.current) URL.revokeObjectURL(objectURL.current); objectURL.current = null; setSource(null); onBusy?.(false); }
  function choose(file?: File) {
    if (!file) return;
    setError("");
    if (file.size > MAX_IMAGE_BYTES) { setError("Choose an image no larger than 500 MB."); return; }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setError("Choose a PNG, JPG, or WebP image."); return; }
    objectURL.current = URL.createObjectURL(file); setSource(objectURL.current); onBusy?.(true);
  }
  async function upload(file: File) {
    setError(""); setBusy(true);
    try {
      if (file.size > MAX_IMAGE_BYTES) throw new Error("The cropped image is larger than 500 MB. Use a smaller crop.");
      if (local) { onChange(await local.save(file)); close(); return; }
      const data = new FormData(); data.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: data });
      const result = await response.json() as { path?: string; error?: string };
      if (!response.ok || !result.path) throw new Error(result.error || "Upload failed. Please retry.");
      onChange(result.path); close();
    } finally { setBusy(false); }
  }
  return <div className="image-picker">
    {value && /^\/images\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|svg)$/i.test(value) && <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg bg-line"><Image src={local?.images[value] || value} alt={`${label} preview`} fill sizes="112px" className="object-contain" /></div>}
    <div className="min-w-0 flex-1">{local ? <p className="text-sm font-bold">{label}{required ? " *" : ""}</p> : <Field label={label} value={value} required={required} hint="Upload and crop a photo, or use an existing /images/ path." onChange={value => { setError(""); onChange(value); }} />}
      <label className="mt-3 block text-sm"><span className="sr-only">Upload {label.toLowerCase()}</span><input className="w-full text-xs file:mr-3 file:rounded-full file:border file:border-line file:bg-paper file:px-3 file:py-2 file:font-semibold" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => { choose(e.target.files?.[0]); e.target.value = ""; }} /></label>
      {/^\/images\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|svg)$/i.test(value) && <button type="button" className="btn-text mt-3" disabled={busy} onClick={() => { setError(""); setSource(local?.images[value] || value); onBusy?.(true); }}>Crop {label.toLowerCase()}</button>}
      <p className="mt-2 text-xs text-moss" role="status">{busy ? "Uploading…" : "PNG, JPG or WebP · Up to 500 MB"}</p>
      {error && <p className="form-error mt-2" role="alert">{error}</p>}
    </div>{source && <CropDialog src={source} onSave={upload} onCancel={close} />}
  </div>;
}

export const profileSections = ["Basics", "Headshot", "Biography", "Education", "Tools", "Experience", "Homepage"] as const;
export function ProfileFields({ profile, onChange, section, onBusy }: { profile: Profile; onChange: (value: Profile) => void; section: number; onBusy?: (busy: boolean) => void }) {
  const change = <K extends keyof Profile>(key: K, value: Profile[K]) => onChange({ ...profile, [key]: value });
  if (section === 6) return <div className="space-y-6"><Field label="Homepage tagline" value={profile.tagline ?? "Ideas, made into experiences."} onChange={v => change("tagline", v)} maxLength={200} hint="The main headline on your homepage. Leave blank to hide it." /><ImagePicker label="Homepage banner" value={profile.bannerImage || ""} onChange={v => change("bannerImage", v)} onBusy={onBusy} />{profile.bannerImage && <button type="button" className="btn-secondary" onClick={() => change("bannerImage", "")}>Remove banner</button>}<p className="text-sm leading-6 text-moss">Your Biography appears on both Home and About. Edit it in the Biography tab, save, then open Preview to see your changes.</p></div>;
  if (section === 0) return <Field label="Your name" value={profile.name} required maxLength={100} onChange={v => change("name", v)} hint="This appears in the site navigation and page titles." />;
  if (section === 1) return <ImagePicker label="Headshot" value={profile.headshotImage} onChange={v => change("headshotImage", v)} onBusy={onBusy} />;
  if (section === 2) return <Field label="Biography" value={profile.biography} multiline hint="Shown in full on Home and About. Markdown is supported: **bold**, *italic*, lists, and links." onChange={v => change("biography", v)} />;
  if (section === 4) return <SoftwarePicker value={profile.tools} onChange={v => change("tools", v)} />;
  if (section === 3) return <div className="space-y-5">{!profile.education.length && <p className="empty-note">Where did you learn your craft? Add a degree, course, or program.</p>}{profile.education.map((entry, index) => <fieldset className="entry-card" key={index}><legend className="px-2 text-sm font-bold">Education {index + 1}</legend><div className="grid gap-4 sm:grid-cols-2">{(["institution", "degree", "field", "startYear", "endYear"] as const).map(key => key === "startYear" || key === "endYear" ? <DateField key={key} label={key === "startYear" ? "Start date" : "End date"} value={entry[key]} allowPresent={key === "endYear"} onChange={value => change("education", profile.education.map((item, i) => i === index ? { ...item, [key]: value } : item))} /> : <Field key={key} label={{ institution: "Institution", degree: "Degree", field: "Field of study", startYear: "Start year", endYear: "End year" }[key]} required={key === "institution"} value={entry[key]} onChange={value => change("education", profile.education.map((item, i) => i === index ? { ...item, [key]: value } : item))} />)}</div><div className="mt-4"><Field label="Education description" multiline value={entry.description || ""} onChange={value => change("education", profile.education.map((item, i) => i === index ? { ...item, description: value } : item))} hint="Optional. Describe your focus, achievements, or relevant coursework." /></div><button className="btn-text mt-4" type="button" onClick={() => change("education", profile.education.filter((_, i) => i !== index))}>Remove education {index + 1}</button></fieldset>)}<button className="btn-secondary" type="button" onClick={() => change("education", [...profile.education, { institution: "", degree: "", field: "", startYear: todayISO(), endYear: todayISO() }])}>+ Add education</button></div>;
  return <div className="space-y-5">{!profile.jobs.length && <p className="empty-note">Add the roles, collaborations, and independent work that shaped your practice.</p>}{profile.jobs.map((entry, index) => <fieldset className="entry-card" key={index}><legend className="px-2 text-sm font-bold">Experience {index + 1}</legend><div className="grid gap-4 sm:grid-cols-2">{(["company", "position", "startDate", "endDate"] as const).map(key => key === "startDate" || key === "endDate" ? <DateField key={key} label={key === "startDate" ? "Start date" : "End date"} value={entry[key]} allowPresent={key === "endDate"} onChange={value => change("jobs", profile.jobs.map((item, i) => i === index ? { ...item, [key]: value } : item))} /> : <Field key={key} label={{ company: "Company", position: "Position", startDate: "Start date", endDate: "End date" }[key]} required={key === "company" || key === "position"} value={entry[key]} onChange={value => change("jobs", profile.jobs.map((item, i) => i === index ? { ...item, [key]: value } : item))} />)}</div><div className="mt-4"><Field label="Role description" value={entry.description} multiline onChange={value => change("jobs", profile.jobs.map((item, i) => i === index ? { ...item, description: value } : item))} /></div><button className="btn-text mt-4" type="button" onClick={() => change("jobs", profile.jobs.filter((_, i) => i !== index))}>Remove experience {index + 1}</button></fieldset>)}<button className="btn-secondary" type="button" onClick={() => change("jobs", [...profile.jobs, { company: "", position: "", description: "", startDate: todayISO(), endDate: todayISO() }])}>+ Add experience</button></div>;
}
export function ProjectFields({ project, onChange, section, onBusy }: { project: Project; onChange: (value: Project) => void; section: number; onBusy?: (busy: boolean) => void }) {
  const local = useLocalMedia();
  const [imagePath, setImagePath] = useState(""), [imageError, setImageError] = useState("");
  const change = <K extends keyof Project>(key: K, value: Project[K]) => onChange({ ...project, [key]: value });
  const addImage = (value: string) => {
    try { validateImagePath(value); setImageError(""); }
    catch (e) { setImageError(e instanceof Error ? e.message : "Invalid image path."); return; }
    if (value && !project.images.includes(value) && project.images.length < 6) {
      onChange({ ...project, images: [...project.images, value], thumbnail: project.thumbnail || value });
      setImagePath("");
    }
  };
  if (section === 0) return <div className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Project title" required value={project.title} maxLength={200} onChange={v => {
    const suggested = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    onChange({ ...project, title: v, slug: !project.slug || project.slug === suggested ? v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : project.slug });
  }} /><DateField label="Project date" required value={project.date} onChange={v => change("date", v)} /></div><Field label="Project description" required multiline value={project.description} onChange={v => change("description", v)} /><Field label="URL slug" required hint="Lowercase letters, numbers, and hyphens. Changing this changes the project address." value={project.slug} maxLength={100} onChange={v => change("slug", v)} /></div>;
  if (section === 1) return <div className="space-y-6"><ImagePicker label="Thumbnail" required value={project.thumbnail} onBusy={onBusy} onChange={v => onChange({ ...project, thumbnail: v, images: project.images.length || !/^\/images\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|svg)$/i.test(v) ? project.images : [v] })} />
    <div>{imageError && <p className="form-error" role="alert">{imageError}</p>}<h3 className="text-lg font-bold">Supporting images <span className="font-normal text-moss">({project.images.length}/6)</span></h3><p className="mt-1 text-sm text-moss">Add 1–6 images. The first image leads the case study.</p></div>
    <div className="grid gap-3 sm:grid-cols-2">{project.images.map((src, i) => <div key={src} className="rounded-xl border border-line p-3"><ImagePicker label={`Image ${i + 1}`} value={src} onBusy={onBusy} onChange={next => { try { validateImagePath(next); } catch { setImageError("Use a valid image path or upload a photo."); return; } setImageError(""); onChange({ ...project, images: project.images.map((old, index) => index === i ? next : old), imageDescriptions: { ...project.imageDescriptions, [next]: project.imageDescriptions?.[src] || "" } }); }} /><div className="mt-3"><Field label={`Description for photo ${i + 1}`} value={project.imageDescriptions?.[src] || ""} multiline hint="Optional. Appears beneath this photo on the project page." maxLength={2000} onChange={description => change("imageDescriptions", { ...project.imageDescriptions, [src]: description })} /></div><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-moss">Image {i + 1}</span><div className="flex gap-3">{i > 0 && <button type="button" className="btn-text" aria-label={`Move image ${i + 1} earlier`} onClick={() => { const images = [...project.images]; [images[i-1], images[i]] = [images[i], images[i-1]]; change("images", images); }}>Move up</button>}<button type="button" className="btn-text" aria-label={`Remove image ${i + 1}`} onClick={() => change("images", project.images.filter((_, index) => index !== i))}>Remove</button></div></div></div>)}</div>
    {project.images.length < 6 ? <div><ImagePicker label="New supporting image" value={imagePath} onBusy={onBusy} onChange={v => { setImageError(""); setImagePath(v); if (/^\/images\/.+\.(png|jpe?g|webp)$/i.test(v)) addImage(v); }} />{!local && <button className="btn-secondary mt-3" type="button" disabled={!imagePath || project.images.includes(imagePath)} onClick={() => addImage(imagePath)}>Add image path</button>}</div> : <p className="empty-note">All six image slots are filled. Remove an image to replace it.</p>}
  </div>;
  return <div className="space-y-6"><SoftwarePicker value={project.technologies} onChange={v => change("technologies", v)} /><Field label="External project link" type="url" hint="Optional. Include https:// for a website that opens in a new tab." value={project.link} onChange={v => change("link", v)} /><div className="rounded-xl bg-paper p-5"><p className="eyebrow">Project summary</p><h3 className="display mt-2 text-3xl">{project.title || "Untitled project"}</h3><p className="mt-2 text-sm text-moss">{formatDate(project.date)} · {project.images.length} supporting images</p><p className="mt-3 leading-7">{project.description || "Add a description in the Details step."}</p></div></div>;
}
