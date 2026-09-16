import { notFound } from "next/navigation";
import { requireAuth, localDevelopment } from "@/lib/auth";
import { getAccounts, isLocalOperator } from "@/lib/accounts";
import { AdminNav } from "@/components/AdminNav";
import { DevTools } from "@/components/DevTools";
export default async function DevPage() { if (!localDevelopment()) notFound(); const account = await requireAuth(); if (!isLocalOperator(account)) notFound(); return <><AdminNav /><main id="main-content" className="mx-auto max-w-3xl px-5 py-12"><p className="eyebrow">Development workspace</p><h1 className="display mb-8 mt-3 text-5xl">Dev tools.</h1><DevTools count={getAccounts().length} /></main></>; }
