"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { dateISO, formatDate, inputDate, months, todayISO } from "@/lib/dates";

export function DateField({ label, value, onChange, required = false, allowPresent = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; allowPresent?: boolean }) {
  const id = useId(), [open, setOpen] = useState(false), [touched, setTouched] = useState(false);
  const current = allowPresent && value === "Present";
  const invalid = touched && !!value && !current && !dateISO(value);
  return <div className="studio-field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label><small id={id + "-hint"}>MM/DD/YYYY · Type a date or open the calendar.</small>
    <div className="flex items-center gap-2"><input id={id} className="admin-input" placeholder="MM/DD/YYYY" inputMode="numeric" maxLength={30} required={required} disabled={current} value={current ? "" : inputDate(value)} aria-describedby={id + "-hint"} aria-invalid={invalid || undefined} onChange={e => { setTouched(true); onChange(e.target.value); }} onBlur={() => { if (dateISO(value)) onChange(dateISO(value)!); }} /><button type="button" className="btn-secondary mt-2 !rounded-xl !px-3" disabled={current} aria-label={`Open calendar for ${label.toLowerCase()}`} onClick={() => setOpen(true)}>Calendar</button></div>
    {invalid && <small className="!text-[#8e302b]" role="alert">Enter a real date as MM/DD/YYYY.</small>}
    {!touched && value && !current && !dateISO(value) && <small>Existing date: {value}. Choose an exact date to use the new format.</small>}
    {allowPresent && <label className="mt-3 flex items-center gap-2 font-normal"><input type="checkbox" checked={current} onChange={e => { setTouched(true); onChange(e.target.checked ? "Present" : todayISO()); }} />Ongoing (Present)</label>}
    {open && <Calendar label={label} value={value} onSelect={next => { setTouched(true); onChange(next); setOpen(false); }} onClose={() => setOpen(false)} />}
  </div>;
}
function Calendar({ label, value, onSelect, onClose }: { label: string; value: string; onSelect: (date: string) => void; onClose: () => void }) {
  const id = useId(), ref = useRef<HTMLDialogElement>(null);
  const selected = dateISO(value) || todayISO();
  const [month, setMonth] = useState(+selected.slice(5, 7) - 1), [year, setYear] = useState(+selected.slice(0, 4)), [yearText, setYearText] = useState(selected.slice(0, 4));
  useEffect(() => { ref.current?.showModal(); ref.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus(); }, []);
  const days = new Date(year, month + 1, 0).getDate(), offset = new Date(year, month, 1).getDay();
  function move(amount: number) { const next = new Date(year, month + amount, 1); if (next.getFullYear() >= 1000 && next.getFullYear() <= 9999) { setYear(next.getFullYear()); setYearText(String(next.getFullYear())); setMonth(next.getMonth()); } }
  function close() { ref.current?.close(); onClose(); }
  function select(date: string) { ref.current?.close(); onSelect(date); }
  return createPortal(<dialog ref={ref} aria-labelledby={id} className="date-dialog" onCancel={e => { e.preventDefault(); close(); }}><div className="flex items-start justify-between gap-4"><h2 id={id} className="display text-2xl">{label}</h2><button type="button" className="btn-text" onClick={close}>Cancel</button></div><p className="mt-2 text-sm text-moss">Choose a day. Today is {formatDate(todayISO())}.</p>
    <div className="mt-5 flex items-end gap-2"><button type="button" className="calendar-day w-8 shrink-0" aria-label="Previous month" onClick={() => move(-1)}>←</button><label className="min-w-0 flex-1 text-xs">Month<select className="admin-input !px-2" value={month} onChange={e => setMonth(+e.target.value)}>{months.map((name, i) => <option key={name} value={i}>{name}</option>)}</select></label><label className="w-24 text-xs">Year<input type="number" className="admin-input !px-2" value={yearText} min={1000} max={9999} onBlur={() => setYearText(String(year))} onChange={e => { setYearText(e.target.value); const next = +e.target.value; if (next >= 1000 && next <= 9999) setYear(next); }} /></label><button type="button" className="calendar-day w-8 shrink-0" aria-label="Next month" onClick={() => move(1)}>→</button></div>
    <div className="mt-5 grid grid-cols-7 text-center"><div className="col-span-7 grid grid-cols-7 text-xs text-moss">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <span className="py-2" key={day}>{day}</span>)}</div>{Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}{Array.from({ length: days }, (_, i) => { const day = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`; return <button type="button" key={day} className="calendar-day" aria-label={formatDate(day)} aria-pressed={day === selected} aria-current={day === todayISO() ? "date" : undefined} onClick={() => select(day)}>{i + 1}</button>; })}</div><button type="button" className="btn-secondary mt-5 w-full" onClick={() => select(todayISO())}>Use today</button>
  </dialog>, document.body);
}
