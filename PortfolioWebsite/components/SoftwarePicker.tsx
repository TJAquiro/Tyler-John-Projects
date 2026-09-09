"use client";
import { useId, useState } from "react";
import { SOFTWARE, SOFTWARE_NAMES } from "@/lib/software";
export function SoftwarePicker({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const id = useId(), [query, setQuery] = useState(""), [category, setCategory] = useState("All software");
  const names: readonly string[] = category === "All software" ? SOFTWARE_NAMES : SOFTWARE[category as keyof typeof SOFTWARE];
  const matches = names.filter(name => name.toLowerCase().includes(query.trim().toLowerCase()) && !value.some(v => v.toLowerCase() === name.toLowerCase()));
  const canonical = SOFTWARE_NAMES.find(name => name.toLowerCase() === query.trim().toLowerCase());
  function add(name: string) {
    const trimmed = name.trim().slice(0, 120);
    if (trimmed && !value.some(item => item.toLowerCase() === trimmed.toLowerCase()) && value.length < 100) onChange([...value, trimmed]);
    setQuery("");
  }
  return <section aria-label="Choose your software" className="space-y-5"><div><h3 className="text-lg font-bold">Tools and software</h3><p className="mt-1 text-sm leading-6 text-moss">Choose from {SOFTWARE_NAMES.length} common tools, or add your own. Select each tool individually.</p></div>
    <div className="flex flex-wrap gap-2" aria-label="Selected tools">{value.map(name => <span key={name} className="flex items-center gap-2 rounded-full border border-line bg-paper py-1 pl-3 pr-1 text-sm">{name}<button className="h-8 w-8 rounded-full hover:bg-line" type="button" aria-label={`Remove ${name}`} onClick={() => onChange(value.filter(item => item !== name))}>×</button></span>)}{!value.length && <p className="text-sm text-moss">No tools selected yet.</p>}</div>
    <div className="grid gap-4 sm:grid-cols-[1fr_200px]"><div><label htmlFor={id} className="studio-field">Search tools or add your own</label><input id={id} className="admin-input" autoComplete="off" maxLength={120} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(canonical || query); } }} placeholder="Search Figma, Blender, Excel…" /></div><div><label htmlFor={id + "-category"} className="studio-field">Category</label><select id={id + "-category"} className="admin-input" value={category} onChange={e => setCategory(e.target.value)}>{["All software", ...Object.keys(SOFTWARE)].map(name => <option key={name}>{name}</option>)}</select></div></div>
    {query.trim() && !value.some(v => v.toLowerCase() === query.trim().toLowerCase()) && <button className="btn-secondary" type="button" onClick={() => add(canonical || query)}>+ Add {canonical || `“${query.trim()}” as a custom tool`}</button>}
    <div className="max-h-64 overflow-y-auto rounded-xl border border-line p-3"><div className="flex flex-wrap gap-2">{matches.map(name => <button className="section-tab" key={name} type="button" onClick={() => add(name)} aria-label={`Add ${name}`}>+ {name}</button>)}</div>{!matches.length && <p className="p-2 text-sm text-moss">No more matches. Enter a name above to add a custom tool.</p>}</div>
  </section>;
}
