import { NextResponse } from "next/server";
import { authenticateAccount } from "@/lib/accounts";
import { createSessionToken, SESSION_COOKIE, SESSION_AGE, sameOrigin, authConfigured, editingEnabled } from "@/lib/auth";
export async function POST(request: Request) {
  if (!sameOrigin(request) || !authConfigured() || !editingEnabled()) return NextResponse.json({ error: "Open a configured local studio to sign in." }, { status: 403 });
  try {
    const form = await request.formData(), email = String(form.get("email") || ""), password = String(form.get("password") || "");
    const account = await authenticateAccount(email, password);
    if (!account) return new NextResponse(null, { status: 303, headers: { Location: "/admin/login?error=invalid" } });
    const response = new NextResponse(null, { status: 303, headers: { Location: "/admin" } });
    response.cookies.set(SESSION_COOKIE, createSessionToken(account.id), { httpOnly: true, sameSite: "strict", secure: new URL(request.url).protocol === "https:", maxAge: SESSION_AGE, path: "/" });
    return response;
  } catch { return new NextResponse(null, { status: 303, headers: { Location: "/admin/login?error=invalid" } }); }
}
