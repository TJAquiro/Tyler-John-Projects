"use client";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AccountScope } from "./AccountScope";
export function useLocalDraft<T>(storageKey: string, initial: T, newDraft = false) {
  const accountId = useContext(AccountScope), key = `${accountId}:${storageKey}`;
  const [value, setValue] = useState(initial), [ready, setReady] = useState(false), [conflict, setConflict] = useState<T | null>(null);
  const base = useRef(JSON.stringify(initial)), latest = useRef(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as { base?: string; value?: T };
        if (saved.value !== undefined && (newDraft || saved.base === base.current)) { latest.current = saved.value; setValue(saved.value); }
        else if (saved.value !== undefined && JSON.stringify(saved.value) !== base.current) {
          setConflict(saved.value);
          localStorage.setItem(`${key}:conflict`, JSON.stringify(saved.value));
          localStorage.removeItem(key);
        }
        else localStorage.removeItem(key);
      }
      const archived = localStorage.getItem(`${key}:conflict`);
      if (archived) setConflict(JSON.parse(archived) as T);
    } catch { /* Storage may be unavailable. Server saves still work. */ }
    setReady(true);
  }, [key, newDraft]);
  const update = (next: T) => {
    latest.current = next; setValue(next);
    try { localStorage.setItem(key, JSON.stringify({ base: base.current, value: next })); } catch { /* Keep in memory. */ }
  };
  const clear = useCallback(() => { try { localStorage.removeItem(key); } catch { /* No recovery copy. */ } }, [key]);
  const markSaved = useCallback((saved: T) => {
    base.current = JSON.stringify(saved);
    if (JSON.stringify(latest.current) === base.current) clear();
    else { try { localStorage.setItem(key, JSON.stringify({ base: base.current, value: latest.current })); } catch { /* Keep in memory. */ } }
  }, [key, clear]);
  const restore = () => {
    if (conflict !== null) update(conflict);
    setConflict(null);
    try { localStorage.removeItem(`${key}:conflict`); } catch { /* Keep in memory. */ }
  };
  return { value, update, clear, ready, markSaved, conflict, restore };
}
