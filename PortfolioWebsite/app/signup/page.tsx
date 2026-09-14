import type { Metadata } from "next";
import { HostedAccountForm } from "@/components/HostedAccountForm";
export const metadata: Metadata = { title: "Create your free account | Portfolio studio" };
export default function SignupPage() { return <HostedAccountForm mode="signup" />; }
