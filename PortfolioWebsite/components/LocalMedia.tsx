"use client";
import { createContext, useContext } from "react";
export const LocalMediaContext = createContext<{ images: Record<string, string>; save: (file: File) => Promise<string> } | null>(null);
export const useLocalMedia = () => useContext(LocalMediaContext);
