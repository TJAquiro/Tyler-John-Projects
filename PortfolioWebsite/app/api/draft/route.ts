import { getAuth } from "firebase-admin/auth";
import { accountPublication } from "@/lib/account-publication";
import { draftReferences, validateDraftContent, type CloudDraft } from "@/lib/cloud-draft";
import { firebaseAdmin, publishingDB, publishUser, draftFailure, PublishError, readLimitedJSON } from "@/lib/firebase-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  try {
    const user = await publishUser(request, false);
    const publication = await accountPublication(user.uid);
    const doc = await publishingDB().collection("publishers").doc(user.uid).collection("drafts").doc("current").get();
    if (doc.exists && doc.data()?.version !== 1) throw new PublishError("This draft uses a newer format. Reload the latest app before editing.", 409);
    return Response.json({ draft: doc.exists ? doc.data() : null, publication }, { headers });
  } catch (error) { return draftFailure(error); }
}
export async function PUT(request: Request) {
  try {
    const user = await publishUser(request, false);
    const body = await readLimitedJSON(request, 450000) as { version: number; revision: number; publication?: CloudDraft["publication"]; content: unknown; assets: Record<string, string> };
    if (body?.version !== 1 || !Number.isInteger(body.revision) || body.revision < 0) throw new PublishError("Reload your saved draft before saving.");
    const publication = body.publication || null;
    if (publication && (typeof publication.handle !== "string" || !Number.isInteger(publication.revision) || publication.revision < 0 || typeof publication.publishedAt !== "string")) throw new PublishError("The draft publication metadata is invalid.");
    let content;
    try { content = validateDraftContent(body.content); } catch { throw new PublishError("The draft contains unsupported fields or image references."); }
    const refs = draftReferences(content);
    if (!body.assets || typeof body.assets !== "object" || refs.some(path => !/^[a-f0-9]{64}$/.test(body.assets[path] || ""))) throw new PublishError("Wait for every draft image to upload before saving.");
    const assets = Object.fromEntries(refs.map(path => [path, body.assets[path]]));
    const db = publishingDB(), owner = db.collection("publishers").doc(user.uid), target = owner.collection("drafts").doc("current");
    const result = await db.runTransaction(async tx => {
      const [account, previous, ...images] = await Promise.all([tx.get(owner), tx.get(target), ...Object.values(assets).map(id => tx.get(owner.collection("draftAssets").doc(id)))]);
      await getAuth(firebaseAdmin()).getUser(user.uid).catch(() => { throw new PublishError("Your account is no longer available. Sign in again.", 401); });
      if (account.data()?.deleting) throw new PublishError("Account deletion is in progress.", 409);
      if (previous.exists && previous.data()?.version !== 1) throw new PublishError("Reload the latest app before saving this draft.", 409);
      if ((previous.data()?.revision || 0) !== body.revision) throw new PublishError("Another device saved changes. Choose which draft to continue before saving.", 409);
      if (images.some(image => !image.data()?.ready)) throw new PublishError("A draft image is not ready. Retry saving.");
      if (publication && account.data()?.handle !== publication.handle) throw new PublishError("Reload your account before saving its publication link.", 409);
      const next: CloudDraft = { version: 1, publication, content, assets, revision: body.revision + 1, savedAt: new Date().toISOString() };
      // Touch the owner so concurrent deletion conflicts and retries safely.
      tx.set(owner, { lastDraftSave: next.savedAt }, { merge: true }); tx.set(target, next);
      return next;
    });
    return Response.json({ revision: result.revision, savedAt: result.savedAt }, { headers });
  } catch (error) { return draftFailure(error); }
}
