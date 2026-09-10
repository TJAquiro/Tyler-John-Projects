"use client";
export default function PublishedError({ reset }: { reset: () => void }) { return <main id="main-content" className="mx-auto max-w-xl px-6 py-24"><h1 className="display text-4xl">Temporarily unavailable</h1><p className="my-6">This portfolio could not load. Please try again in a moment.</p><button className="btn-primary" onClick={reset}>Try again</button></main>; }
