import { accountPublication } from "@/lib/account-publication";
import { getAuth } from "firebase-admin/auth";
import { revalidateTag } from "next/cache";
import { firebaseAdmin, publishFailure, publishingDB, publishUser, PublishError, readLimitedJSON } from "@/lib/firebase-server";
import { MAX_LIBRARY_BYTES, imageReferences, validHandle } from "@/lib/portfolio-snapshot";
import { validatePublication } from "@/lib/publication-validation";
import { readManifest } from "@/lib/content";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await publishUser(request, false);
    const publication = await accountPublication(user.uid);
    return Response.json({ publication }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return publishFailure(error); }
}
export async function POST(request: Request) {
  try {
    const user = await publishUser(request);
    const body = await readLimitedJSON(request) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new PublishError("Choose a valid portfolio to publish.");
    let handle: string, snapshot;
    try { handle = validHandle(body.handle); snapshot = validatePublication(body.snapshot); } catch (e) { throw new PublishError(e instanceof Error ? e.message : "Check your portfolio."); }
    if (readManifest().some(p => p.handle === handle)) throw new PublishError("That address belongs to an existing portfolio. Choose another.", 409);
    if (!Number.isInteger(body.revision) || Number(body.revision) < 0) throw new PublishError("Restore your latest published version before updating.");
    const db = publishingDB(), publisher = db.collection("publishers").doc(user.uid), target = db.collection("publishedPortfolios").doc(handle);
    const refs = imageReferences(snapshot), assetIds = body.assets as Record<string, string>;
    if (!assetIds || typeof assetIds !== "object" || refs.some(src => !/^[a-f0-9]{64}$/.test(assetIds[src] || ""))) throw new PublishError("Upload every portfolio image before publishing.");
    // Look up only this user's assets; client-supplied URLs are never trusted.
    const assets: Record<string, string> = {};
    let bytes = 0;
    for (const src of refs) {
      const record = await publisher.collection("assets").doc(assetIds[src]).get();
      if (!record.exists || !record.data()?.ready) throw new PublishError("An image is missing. Please publish again.");
      assets[src] = record.data()!.url; bytes += record.data()!.size;
    }
    if (bytes > MAX_LIBRARY_BYTES) throw new PublishError("Published images must total no more than 1 GB.");
    const publishedAt = new Date().toISOString();
    const revision = await db.runTransaction(async tx => {
      const [owner, existing, sites] = await Promise.all([tx.get(publisher), tx.get(target), tx.get(db.collection("publishedPortfolios").where("uid", "==", user.uid).limit(2))]);
      await getAuth(firebaseAdmin()).getUser(user.uid).catch(() => { throw new PublishError("Your account is no longer available. Sign in again.", 401); });
      if (owner.data()?.deleting) throw new PublishError("Account deletion is in progress.", 409);
      if (sites.size > 1) throw new PublishError("Multiple portfolios are linked to this account. Your work is safe; contact support to repair the link.", 409);
      if (!sites.empty && sites.docs[0].id !== handle) throw new PublishError("Your website address has changed. Reload your account to see its current URL; use Edit URL to move it.", 409);
      if (sites.empty && owner.data()?.handle) throw new PublishError("Your portfolio link needs repair. Your saved draft is safe; contact support.", 409);
      if (existing.exists && existing.data()!.uid !== user.uid) throw new PublishError("That address is already taken. Choose another.", 409);
      if ((existing.data()?.revision || 0) !== body.revision) throw new PublishError("A newer version was published from another tab or device. Download your draft backup, then restore the published version before updating.", 409);
      if (Date.now() - (owner.data()?.lastPublish || 0) < 10000) throw new PublishError("Please wait a few seconds before publishing again.", 429);
      const next = Number(body.revision) + 1;
      tx.set(target, { ...snapshot, uid: user.uid, handle, assets, revision: next, contentRevision: next, publishedAt });
      tx.set(publisher, { handle, lastPublish: Date.now() }, { merge: true });
      return next;
    });
    if (revision === 1) revalidateTag("published-creator-count");
    return Response.json({ handle, revision, publishedAt, path: `/p/${handle}` });
  } catch (error) { return publishFailure(error); }
}

export async function PATCH(request: Request) {
  try {
    const user = await publishUser(request);
    const body = await readLimitedJSON(request, 2000) as Record<string, unknown>;
    let handle: string, currentHandle: string;
    try { handle = validHandle(body?.handle); currentHandle = validHandle(body?.currentHandle); }
    catch (e) { throw new PublishError(e instanceof Error ? e.message : "Choose a valid address."); }
    if (!Number.isInteger(body.revision) || Number(body.revision) < 1) throw new PublishError("Reload your published link before changing its URL.", 409);
    if (readManifest().some(p => p.handle === handle)) throw new PublishError("That address belongs to an existing portfolio. Choose another.", 409);
    const db = publishingDB(), publisher = db.collection("publishers").doc(user.uid), target = db.collection("publishedPortfolios").doc(handle);
    const result = await db.runTransaction(async tx => {
      const [owner, sites, destination] = await Promise.all([tx.get(publisher), tx.get(db.collection("publishedPortfolios").where("uid", "==", user.uid).limit(2)), tx.get(target)]);
      await getAuth(firebaseAdmin()).getUser(user.uid).catch(() => { throw new PublishError("Your account is no longer available. Sign in again.", 401); });
      if (owner.data()?.deleting) throw new PublishError("Account deletion is in progress.", 409);
      if (sites.size !== 1) throw new PublishError(sites.empty ? "This account has no published website to move." : "Multiple portfolios are linked to this account. Your work is safe; contact support to repair the link.", 409);
      const source = sites.docs[0], data = source.data();
      // An identical retry after a lost response succeeds without moving twice.
      const retry = source.id === handle && data.renamedFrom === currentHandle && data.renamedFromRevision === body.revision && data.revision === Number(body.revision) + 1;
      if (!retry && (source.id !== currentHandle || data.revision !== body.revision)) throw new PublishError("Your published website changed on another tab or device. Reload the current link before changing its URL.", 409);
      if (destination.exists && destination.data()?.uid !== user.uid) throw new PublishError("That address is already taken. Choose another.", 409);
      if (!data.profile || !Array.isArray(data.projects) || !data.assets || !Number.isInteger(data.revision)) throw new PublishError("Your published website needs repair before its URL can change.", 409);
      const revision = retry || source.id === handle ? data.revision : data.revision + 1;
      if (!retry && source.id !== handle) {
        tx.set(target, { ...data, handle, revision, contentRevision: data.contentRevision || data.revision, renamedFrom: source.id, renamedFromRevision: data.revision });
        tx.delete(source.ref);
      }
      tx.set(publisher, { handle }, { merge: true });
      return { handle, revision, publishedAt: data.publishedAt, path: `/p/${handle}` };
    });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return publishFailure(error); }
}
