import { todayISO } from "@/lib/dates";
import { AdminNav } from "@/components/AdminNav";
import { randomUUID } from "node:crypto";
import { Onboarding } from "@/components/Onboarding";
import { requireAuth } from "@/lib/auth";
import { getProfile, getProjects, getStudio } from "@/lib/content";
export default async function OnboardingPage() {
  const account = await requireAuth();
  return <><AdminNav /><main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-16"><Onboarding initial={getProfile(account.id)} studio={getStudio(account.id)} projects={getProjects(account.id)} projectId={randomUUID()} initialDate={todayISO()} /></main></>;
}
