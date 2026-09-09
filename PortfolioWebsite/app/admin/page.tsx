import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getStudio } from "@/lib/content";
export default async function AdminPage() { const account = await requireAuth(); redirect(getStudio(account.id).completed ? "/admin/dashboard" : "/admin/onboarding"); }
