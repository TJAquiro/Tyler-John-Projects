import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { currentAccount, localDevelopment, localMutationOrigin, createSessionToken, SESSION_COOKIE, SESSION_AGE, validLocalAdminToken } from "@/lib/auth";
import { getAccounts, isLocalOperator, registerAccount, resetAccountsAndContent, type Account } from "@/lib/accounts";
import { contentRoot, writeContent } from "@/lib/content";
import { showcaseProfile, showcaseProjects } from "@/lib/showcase";
export async function POST(request: Request) {
  if (!localDevelopment(request)) return NextResponse.json({ error: "Dev tools are only available on a local development server." }, { status: 403 });
  const account = await currentAccount();
  if (!localMutationOrigin(request) || !account || !isLocalOperator(account)) return NextResponse.json({ error: "Only the local owner can use dev tools." }, { status: 403 });
  try {
    const body = await request.json();
    if (!validLocalAdminToken(body.adminToken)) return NextResponse.json({ error: "The local admin token is incorrect." }, { status: 403 });
    if (body.action === "reset") {
      if (body.confirmation !== "RESET ALL") throw new Error("Type RESET ALL to confirm.");
      const backup = process.env.PORTFOLIO_ACCOUNT_DIR ? path.join(process.env.PORTFOLIO_ACCOUNT_DIR, "reset-backups", Date.now().toString()) : path.join(process.cwd(), ".local-backups", "reset-" + Date.now());
      fs.mkdirSync(backup, { recursive: true }); fs.cpSync(contentRoot, path.join(backup, "content"), { recursive: true }); fs.writeFileSync(path.join(backup, "accounts.json"), JSON.stringify(getAccounts(), null, 2));
      resetAccountsAndContent();
      const response = NextResponse.json({ ok: true }); response.cookies.delete(SESSION_COOKIE); return response;
    }
    if (body.action === "showcase") {
      let account = getAccounts().find(item => (item as Account & { showcase?: boolean }).showcase);
      if (!account) {
        const suffix = randomBytes(4).toString("hex");
        account = await registerAccount({ name: showcaseProfile.name, email: `showcase-${suffix}@example.invalid`, handle: `showcase-${suffix}`, password: randomBytes(24).toString("base64") }, { showcase: true });
        writeContent("profile.json", showcaseProfile, account.id); writeContent("projects.json", showcaseProjects, account.id); writeContent("studio.json", { step: 7, completed: true, projectDraft: null }, account.id);
      }
      const response = NextResponse.json({ ok: true });
      response.cookies.set(SESSION_COOKIE, createSessionToken(account.id), { httpOnly: true, sameSite: "strict", maxAge: SESSION_AGE, path: "/" });
      return response;
    }
    throw new Error("Choose a valid dev action.");
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Dev action failed." }, { status: 400 }); }
}
