import type { Metadata } from "next";
import { BrowserStudio } from "@/components/BrowserStudio";
export const metadata: Metadata = { title: "Create your portfolio | Portfolio studio", description: "Build on your device. Publish when you are ready.", robots: { index: false, follow: false } };
export default function StudioPage() { return <BrowserStudio />; }
