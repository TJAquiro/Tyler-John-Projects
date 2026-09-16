import { NextResponse } from "next/server";
import { registerAccount } from "@/lib/accounts";
import { createSessionToken, SESSION_COOKIE, SESSION_AGE, localMutationOrigin, authConfigured, editingEnabled, validLocalAdminToken } from "@/lib/auth";
export async function POST(request: Request) {
  if (!localMutationOrigin(request) || !authConfigured() || !editingEnabled()) return NextResponse.json({ error: "Account creation is available in a configured local studio." }, { status: 403 });
  try {
    const body = await request.json();
    if (!body || ["name", "email", "password", "handle"].some(key => typeof body[key] !== "string")) throw new Error("Complete all account fields.");
    if (!validLocalAdminToken(body.adminToken)) return NextResponse.json({ error: "The local admin token is incorrect." }, { status: 403 });
    const account = await registerAccount({ name: body.name, email: body.email, password: body.password, handle: body.handle }, { importExisting: body.importExisting === true });
    const response = NextResponse.json({ ok: true, next: "/admin/onboarding" });
    response.cookies.set(SESSION_COOKIE, createSessionToken(account.id), { httpOnly: true, sameSite: "strict", secure: new URL(request.url).protocol === "https:", maxAge: SESSION_AGE, path: "/" });
    return response;
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Account could not be created." }, { status: 400 }); }
}
