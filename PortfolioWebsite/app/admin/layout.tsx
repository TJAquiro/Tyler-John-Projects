import type { Metadata } from "next";
import { currentAccount } from "@/lib/auth";
import { AccountScopeProvider } from "@/components/AccountScope";
export const metadata: Metadata = { title: "Portfolio studio", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) { const account = await currentAccount(); return <AccountScopeProvider id={account?.id || "signed-out"}>{children}</AccountScopeProvider>; }
