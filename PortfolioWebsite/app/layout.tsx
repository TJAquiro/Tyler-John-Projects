import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import "./globals.css";
import "./admin/admin.css";
export function generateMetadata(): Metadata {
  const profile = getProfile();
  return { title: profile.name ? `${profile.name} | Design portfolio` : "Portfolio studio | Create your design portfolio", description: profile.biography.replace(/[*#_\[\]]/g, "").replace(/\s+/g, " ").slice(0, 160) || "Create a portfolio for your story and your work." };
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a>{children}</body></html>;
}
