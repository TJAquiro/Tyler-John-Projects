import { NextResponse } from "next/server";
import { registerAccount } from "@/lib/accounts";
import { createSessionToken, SESSION_COOKIE, SESSION_AGE, sameOrigin, authConfigured, editingEnabled } from "@/lib/auth";
export async function POST(request: Request) {
  if (!sameOrigin(request) || !authConfigured() || !editingEnabled()) return NextResponse.json({ error: "Account creation is available in a configured local studio." }, { status: 403 });
  try {
    const body = await request.json();
    if (!body || ["name", "email", "password", "handle"].some(key => typeof body[key] !== "string")) throw new Error("Complete all account fields.");
    const account = await registerAccount(body);
    const response = NextResponse.json({ ok: true, next: "/admin/onboarding" });
    response.cookies.set(SESSION_COOKIE, createSessionToken(account.id), { httpOnly: true, sameSite: "strict", secure: new URL(request.url).protocol === "https:", maxAge: SESSION_AGE, path: "/" });
    return response;
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Account could not be created." }, { status: 400 }); }
}
