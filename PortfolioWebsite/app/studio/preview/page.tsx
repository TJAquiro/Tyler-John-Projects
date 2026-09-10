import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowserPreview } from "@/components/BrowserPreview";
export const metadata: Metadata = { title: "Private portfolio preview", robots: { index: false, follow: false } };
export default function PreviewPage() { return <Suspense fallback={<main id="main-content" className="p-6">Loading preview?</main>}><BrowserPreview /></Suspense>; }
