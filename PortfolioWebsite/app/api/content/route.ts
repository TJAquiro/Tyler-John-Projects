import { NextResponse } from "next/server";
import { currentAccount, editingEnabled, sameOrigin } from "@/lib/auth";
import { getProfile, getProjects, writeContent } from "@/lib/content";
import { validateProfile, validateProject, ValidationError } from "@/lib/validation";
export async function GET() {
  const account = await currentAccount();
  if (!account) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  return NextResponse.json({ profile: getProfile(account.id), projects: getProjects(account.id) }, { headers: { "Cache-Control": "no-store" } });
}
async function mutate(request: Request, remove = false) {
  const account = await currentAccount();
  if (!account) return NextResponse.json({ error: "Your session expired. Sign in again; your changes are still in this form." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  if (!editingEnabled()) return NextResponse.json({ error: "Open your local studio to edit, then redeploy to publish." }, { status: 403 });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ValidationError("Send a content object.");
    // One complete document per request. Validate everything before writing.
    if (remove) {
      if (typeof body.id !== "string") throw new ValidationError("Choose a project to delete.");
      const current = getProjects(account.id);
      if (!current.some(p => p.id === body.id)) return NextResponse.json({ error: "Project not found." }, { status: 404 });
      writeContent("projects.json", current.filter(p => p.id !== body.id), account.id);
    } else if (Object.keys(body).length === 1 && "featuredProjectId" in body) {
      const current = getProjects(account.id), id = body.featuredProjectId;
      if (id !== null && (typeof id !== "string" || !current.some(p => p.id === id))) throw new ValidationError("Choose an existing project to feature.");
      writeContent("projects.json", current.map(p => ({ ...p, featured: p.id === id })), account.id);
    } else if (body.profile && Object.keys(body).length === 1) {
      writeContent("profile.json", validateProfile(body.profile, getProfile(account.id)), account.id);
    } else if (body.project && Object.keys(body).length === 1) {
      const current = getProjects(account.id), project = validateProject(body.project, current.find(p => p.id === body.project.id));
      if (current.some(p => p.slug === project.slug && p.id !== project.id)) throw new ValidationError("That slug is already used. Choose a unique project address.");
      project.featured = current.find(p => p.id === project.id)?.featured ?? false;
      const updated = current.some(p => p.id === project.id) ? current.map(p => p.id === project.id ? project : p) : [...current, project];
      writeContent("projects.json", updated.map(p => project.featured && p.id !== project.id ? { ...p, featured: false } : p), account.id);
    } else throw new ValidationError("Save one profile or one project at a time.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof SyntaxError) return NextResponse.json({ error: error instanceof SyntaxError ? "Invalid JSON. Please retry." : error.message }, { status: 400 });
    return NextResponse.json({ error: "Could not write your changes. Check that the local content folder is writable, then retry." }, { status: 500 });
  }
}
export async function PUT(request: Request) { return mutate(request); }
export async function DELETE(request: Request) { return mutate(request, true); }
