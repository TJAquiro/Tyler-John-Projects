"use client";
import { createContext, useContext, useId } from "react";
import type { PublicationIssue } from "@/lib/publication-validation";

export const DraftFeedbackContext = createContext<{ issues: PublicationIssue[]; touch: (key: string) => void } | null>(null);
export const FeedbackScope = createContext("profile");
export function AttentionIcon() {
  return <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#8e302b] text-xs font-bold text-white" aria-hidden="true">!</span>;
}
export function useDraftFeedback(label: string) {
  const context = useContext(DraftFeedbackContext), scope = useContext(FeedbackScope), id = useId();
  const key = `${scope}:${label}`, issue = context?.issues.find(issue => issue.key === key);
  return { key, issue, errorId: `${id}-error`, touch: () => context?.touch(key) };
}
export function FeedbackMessage({ label }: { label: string }) {
  const { issue, errorId } = useDraftFeedback(label);
  return issue ? <p id={errorId} className="mt-2 text-sm text-[#8e302b]">{issue.message}</p> : null;
}
