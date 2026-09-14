"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { centerCrop, makeAspectCrop, type PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
export function CropDialog({ src, onSave, onCancel }: { src: string; onSave: (file: File) => Promise<void>; onCancel: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), img = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<PercentCrop>({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
  const [size, setSize] = useState({ width: 0, height: 0 }), [aspect, setAspect] = useState<number | undefined>(), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { dialog.current?.showModal(); }, []);
  function ratio(value: string) {
    setError("");
    const next = value ? Number(value) : undefined; setAspect(next);
    setCrop(next ? centerCrop(makeAspectCrop({ unit: "%", width: 90 }, next, size.width, size.height), size.width, size.height) : { unit: "%", x: 0, y: 0, width: 100, height: 100 });
  }
  function pixel(key: "x" | "y" | "width" | "height", value: number) {
    if (!Number.isFinite(value)) return;
    setError("");
    setAspect(undefined);
    const dimension = key === "x" || key === "width" ? size.width : size.height;
    const next = { ...crop, [key]: Math.max(key === "width" || key === "height" ? 1 : 0, value) / dimension * 100 };
    next.x = Math.max(0, Math.min(99, next.x)); next.y = Math.max(0, Math.min(99, next.y));
    next.width = Math.min(100 - next.x, Math.max(100 / size.width, next.width)); next.height = Math.min(100 - next.y, Math.max(100 / size.height, next.height));
    setCrop(next);
  }
  async function save() {
    if (!img.current || !size.width) return;
    setBusy(true); setError("");
    try {
      const x = Math.round(crop.x * size.width / 100), y = Math.round(crop.y * size.height / 100);
      const width = Math.max(1, Math.min(size.width - x, Math.round(crop.width * size.width / 100))), height = Math.max(1, Math.min(size.height - y, Math.round(crop.height * size.height / 100)));
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d"); if (!context) throw new Error("This browser could not prepare the crop.");
      context.drawImage(img.current, x, y, width, height, 0, 0, width, height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error("The image could not be cropped.")), "image/webp", .95));
      await onSave(new File([blob], "cropped-image.webp", { type: "image/webp" }));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not crop. Please retry."); setBusy(false); }
  }
  return createPortal(<dialog ref={dialog} className="crop-dialog" aria-labelledby="crop-title" onCancel={e => { e.preventDefault(); if (!busy) onCancel(); }}><div className="p-5 sm:p-7"><h2 id="crop-title" className="display text-3xl">Make the frame yours.</h2><p className="mt-2 text-sm leading-6 text-moss">Drag the edges to crop, move the selection, or enter exact pixel values. A new image is saved; the original is kept.</p>
    <div className="my-5 flex justify-center rounded-xl bg-ink/5 p-2"><ReactCrop crop={crop} onChange={(_, percent) => { setCrop(percent); setError(""); }} aspect={aspect} disabled={busy} keepSelection minWidth={1} minHeight={1}>
      {/* Cropping needs the original image's natural dimensions and a canvas-compatible DOM image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} src={src} alt="Adjust the crop selection" className="max-h-[45vh] max-w-full" onLoad={e => setSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} onError={() => setError("This image could not be loaded. Choose another image.")} />
    </ReactCrop></div>
    <fieldset disabled={busy || !size.width}><label className="studio-field">Aspect ratio<select className="admin-input" value={aspect ?? ""} onChange={e => ratio(e.target.value)}><option value="">Free crop</option><option value="1">Square · 1:1</option><option value={4/3}>Landscape · 4:3</option><option value={3/4}>Portrait · 3:4</option><option value={16/9}>Wide · 16:9</option></select></label><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{(["x", "y", "width", "height"] as const).map(key => <label key={key} className="studio-field">{({ x: "Left (px)", y: "Top (px)", width: "Width (px)", height: "Height (px)" })[key]}<input className="admin-input" type="number" min={key === "x" || key === "y" ? 0 : 1} max={key === "x" || key === "width" ? size.width : size.height} value={Math.round(crop[key] * (key === "x" || key === "width" ? size.width : size.height) / 100)} onChange={e => pixel(key, Number(e.target.value))} /></label>)}</div></fieldset>
    {error && <p className="form-error mt-4" role="alert">{error}</p>}<div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" className="btn-secondary" disabled={busy} onClick={onCancel}>Cancel crop</button><button type="button" className="btn-primary" disabled={busy || !size.width} onClick={() => void save()}>{busy ? "Saving image…" : "Use this crop"}</button></div></div></dialog>, document.body);
}
