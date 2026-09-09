import { NextResponse } from "next/server";
import { currentAccount, editingEnabled, sameOrigin } from "@/lib/auth";
import { getStudio, writeContent } from "@/lib/content";
import { validateProjectDraft, ValidationError } from "@/lib/validation";
export async function PUT(request: Request) {
  const account = await currentAccount();
  if (!account) return NextResponse.json({ error: "Please sign in again. Your progress has not been saved." }, { status: 401 });
  if (!sameOrigin(request) || !editingEnabled()) return NextResponse.json({ error: "Use your local studio to edit." }, { status: 403 });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(key => !["step", "completed", "projectDraft"].includes(key))) throw new ValidationError("Invalid setup update.");
    if (body.step !== undefined && (!Number.isInteger(body.step) || body.step < 0 || body.step > 7)) throw new ValidationError("Invalid setup step.");
    if (body.completed !== undefined && typeof body.completed !== "boolean") throw new ValidationError("Invalid completion state.");
    const next = { ...getStudio(account.id), ...body };
    if (body.projectDraft != null) next.projectDraft = validateProjectDraft(body.projectDraft);
    writeContent("studio.json", next, account.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ValidationError ? error.message : "Setup progress could not be saved. Please retry." }, { status: error instanceof ValidationError || error instanceof SyntaxError ? 400 : 500 });
  }
}
