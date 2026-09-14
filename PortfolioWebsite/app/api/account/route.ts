import { getAuth } from "firebase-admin/auth";
import { revalidateTag } from "next/cache";
import { firebaseAdmin, publishUser, publishingDB, publishingBucket, PublishError } from "@/lib/firebase-server";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function DELETE(request: Request) {
  try {
    // Derive the target exclusively from the verified token; unverified users can delete too.
    let user;
    try { user = await publishUser(request, false); }
    catch (original) {
      // A response can be lost after Auth deletion. Allow that same recently signed-in
      // user to retry cleanup, but never accept a revoked token for an existing user.
      const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
      if (!token) throw original;
      const auth = getAuth(firebaseAdmin());
      const decoded = await auth.verifyIdToken(token).catch(() => { throw original; });
      const exists = await auth.getUser(decoded.uid).then(() => true).catch(error => {
        if (error.code === "auth/user-not-found") return false;
        throw original;
      });
      if (exists) throw original;
      user = decoded;
    }
    if (!user.auth_time || Date.now() / 1000 - user.auth_time > 300) throw new PublishError("Confirm your password again before deleting your account.", 401);
    if (request.headers.get("x-confirm-delete") !== "delete-account") throw new PublishError("Confirm account deletion first.");
    const db = publishingDB(), publisher = db.collection("publishers").doc(user.uid);
    // Keep a deletion marker until auth removal succeeds, so partial cleanup can be retried
    // and concurrent publish/upload transactions cannot recreate the website.
    await db.runTransaction(async tx => {
      const [account, assets, privateAssets, sites] = await Promise.all([
        tx.get(publisher), tx.get(publisher.collection("assets")), tx.get(publisher.collection("draftAssets")),
        tx.get(db.collection("publishedPortfolios").where("uid", "==", user.uid))
      ]);
      if ([...assets.docs, ...privateAssets.docs].some(asset => (asset.data().writingUntil || 0) > Date.now())) throw new PublishError("An image upload is still running. Wait for it to finish, then retry deletion.", 409);
      tx.set(publisher, { deleting: true, handle: account.data()?.handle || null }, { merge: true });
      sites.docs.forEach(site => tx.delete(site.ref));
    });
    revalidateTag("published-creator-count");
    await publishingBucket().deleteFiles({ prefix: `portfolios/${user.uid}/` });
    // Subcollections are not automatically deleted with their parent document.
    for (const collection of await publisher.listCollections()) await db.recursiveDelete(collection);
    await getAuth(firebaseAdmin()).deleteUser(user.uid).catch(error => { if (error.code !== "auth/user-not-found") throw error; });
    await publisher.delete();
    return Response.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof PublishError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Account deletion failed", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Account deletion could not finish. Your website may already be offline. Retry deletion to finish removing your account and images." }, { status: 503 });
  }
}
