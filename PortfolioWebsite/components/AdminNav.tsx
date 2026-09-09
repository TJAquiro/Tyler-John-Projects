import Link from "next/link";
import { localDevelopment } from "@/lib/auth";
export function AdminNav() {
  return <header className="border-b border-line bg-paper"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8"><Link href="/admin/dashboard" className="display text-xl font-semibold">Portfolio <i>studio</i><span className="text-coral">.</span></Link><nav aria-label="Studio navigation" className="flex items-center gap-3 text-sm sm:gap-5"><Link href="/admin/dashboard" className="btn-text">Dashboard</Link><Link href="/admin/preview" target="_blank" className="btn-text">Preview ↗</Link>{localDevelopment() && <Link href="/admin/dev" className="btn-text">Dev tools</Link>}<form action="/api/auth/logout" method="post"><button className="btn-secondary !min-h-10 !px-3 !py-2" type="submit">Log out</button></form></nav></div></header>;
}
