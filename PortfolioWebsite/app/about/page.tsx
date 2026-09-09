import { AboutView } from "@/components/PublicPages";
import { getProfile } from "@/lib/content";
export const dynamic = "force-static";
export default function AboutPage() { return <AboutView profile={getProfile()} />; }
