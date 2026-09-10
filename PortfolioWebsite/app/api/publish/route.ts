import { publishFailure, publishingDB, publishUser, PublishError, readLimitedJSON, readPublication } from "@/lib/firebase-server";
import { imageReferences, validateSnapshot, validHandle } from "@/lib/portfolio-snapshot";
import { readManifest } from "@/lib/content";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await publishUser(request, false);
    const record = await publishingDB().collection("publishers").doc(user.uid).get();
    const publication = record.data()?.handle ? await readPublication(record.data()!.handle) : null;
    return Response.json({ publication }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return publishFailure(error); }
}
export async function POST(request: Request) {
  try {
    const user = await publishUser(request);
    const body = await readLimitedJSON(request) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new PublishError("Choose a valid portfolio to publish.");
    let handle: string, snapshot;
    try { handle = validHandle(body.handle); snapshot = validateSnapshot(body.snapshot); } catch (e) { throw new PublishError(e instanceof Error ? e.message : "Check your portfolio."); }
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
    if (bytes > 40 * 1024 * 1024) throw new PublishError("Published images must total less than 40 MB. Use smaller crops or fewer images.");
    const publishedAt = new Date().toISOString();
    const revision = await db.runTransaction(async tx => {
      const [owner, existing] = await Promise.all([tx.get(publisher), tx.get(target)]);
      if (owner.data()?.handle && owner.data()!.handle !== handle) throw new PublishError("Your portfolio address stays the same when you publish updates.", 409);
      if (existing.exists && existing.data()!.uid !== user.uid) throw new PublishError("That address is already taken. Choose another.", 409);
      if ((existing.data()?.revision || 0) !== body.revision) throw new PublishError("A newer version was published from another tab or device. Download your draft backup, then restore the published version before updating.", 409);
      if (Date.now() - (owner.data()?.lastPublish || 0) < 10000) throw new PublishError("Please wait a few seconds before publishing again.", 429);
      const next = Number(body.revision) + 1;
      tx.set(target, { ...snapshot, uid: user.uid, handle, assets, revision: next, publishedAt });
      tx.set(publisher, { handle, lastPublish: Date.now() }, { merge: true });
      return next;
    });
    return Response.json({ handle, revision, publishedAt, path: `/p/${handle}` });
  } catch (error) { return publishFailure(error); }
}
