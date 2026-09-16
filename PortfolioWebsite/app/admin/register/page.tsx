import Link from "next/link";
import { AccountForm } from "@/components/AccountForm";
import { getAccounts } from "@/lib/accounts";
import { authConfigured, editingEnabled, localAdminConfigured } from "@/lib/auth";
import { getProfile } from "@/lib/content";
export const dynamic = "force-dynamic";
export default function RegisterPage() {
  return <main id="main-content" className="mx-auto max-w-lg px-6 py-14"><Link href="/" className="display text-2xl">Portfolio studio.</Link><p className="eyebrow mt-10">Start with a blank canvas</p><h1 className="display mt-3 text-5xl">Create your account.</h1><p className="mt-4 leading-7 text-moss">Your work, your space. We&apos;ll guide you through your profile and first project next.</p>{authConfigured() && localAdminConfigured() && editingEnabled() ? <AccountForm canImport={getAccounts().length === 0 && Boolean(getProfile().name)} /> : <p className="notice mt-6">Open your local project with <code>SESSION_SECRET</code> and <code>PORTFOLIO_ADMIN_TOKEN</code> configured to create an account.</p>}<p className="mt-7 text-sm">Already have an account? <Link className="btn-text" href="/admin/login">Sign in</Link></p></main>;
}
