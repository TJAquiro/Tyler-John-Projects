import { HomeView } from "@/components/PublicPages";
import { getProfile, getProjects } from "@/lib/content";
export const dynamic = "force-static";
export default function HomePage() { return <HomeView profile={getProfile()} projects={getProjects()} />; }
