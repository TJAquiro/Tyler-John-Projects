import type { Metadata } from "next";
import { HostedAccountForm } from "@/components/HostedAccountForm";
export const metadata: Metadata = { title: "Sign in | Portfolio studio", robots: { index: false, follow: false } };
export default function LoginPage() { return <HostedAccountForm mode="login" />; }
