"use client";
import { useEffect, useState } from "react";
export function CreatorCount() {
  const [count, setCount] = useState<number | null | undefined>(undefined);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    // The route keeps the database result briefly cached, but navigation must not
    // reuse a browser response from before this visitor published a portfolio.
    void fetch("/api/public-stats", { signal: controller.signal, cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("Unavailable");
      const data = await response.json();
      setCount(Number.isSafeInteger(data.publishedCreators) && data.publishedCreators >= 0 ? data.publishedCreators : null);
    }).catch(() => setCount(null)).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);
  return <div aria-live="polite" className="creator-count"><p className="eyebrow">A growing community of independent voices</p>
    {count === undefined ? <p className="mt-3 text-moss">Loading creator count…</p> : count === null ? <p className="mt-3 text-moss">Creator count temporarily unavailable</p> : <p className="mt-3"><strong className="display mr-3 text-5xl sm:text-6xl">{count.toLocaleString("en-US")}</strong><span className="text-moss">{count === 0 ? "portfolios published—be the first" : count === 1 ? "creator has published a portfolio" : "creators have published their portfolios"}</span></p>}
  </div>;
}
