import Link from "next/link";
import { getProfile } from "@/lib/content";

export function SiteHeader() {
  const profile = getProfile();
  return <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 md:px-10">
    <Link href="/" className="display min-w-0 break-words text-xl font-semibold tracking-tight">{profile.name}<span className="text-coral">.</span></Link>
    <nav className="flex items-center gap-5 text-sm font-medium">
      <Link className="transition-colors hover:text-coral" href="/about">About</Link>
      <Link className="rounded-full border border-ink bg-ink px-4 py-2 text-paper transition hover:bg-coral hover:text-ink" href="/admin">Owner login</Link>
    </nav>
  </header>;
}
