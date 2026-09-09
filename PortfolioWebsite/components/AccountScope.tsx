"use client";
import { createContext } from "react";
export const AccountScope = createContext("signed-out");
export function AccountScopeProvider({ id, children }: { id: string; children: React.ReactNode }) { return <AccountScope.Provider value={id}>{children}</AccountScope.Provider>; }
