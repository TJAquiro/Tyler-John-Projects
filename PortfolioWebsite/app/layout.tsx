import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import "./admin/admin.css";
export const metadata: Metadata = { title: "Portfolio studio | Create your free portfolio", description: "Create a free portfolio website for your projects, experience, education, and story. Guided setup, thoughtful design, and your own published portfolio link." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a>{children}</body></html>;
}
