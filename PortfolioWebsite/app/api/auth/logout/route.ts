import { NextResponse } from "next/server";
import { SESSION_COOKIE, sameOrigin } from "@/lib/auth";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const response = new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
