import { getAuth } from "firebase-admin/auth";
import { firebaseAdmin, publishingDB, PublishError } from "./firebase-server";
import type { Publication } from "./portfolio-snapshot";

// Recover the index only from proven UID ownership, never from an email or a URL.
export async function accountPublication(uid: string): Promise<Publication | null> {
  const db = publishingDB(), owner = db.collection("publishers").doc(uid);
  return db.runTransaction(async tx => {
    const account = await tx.get(owner);
    const sites = await tx.get(db.collection("publishedPortfolios").where("uid", "==", uid).limit(2));
    await getAuth(firebaseAdmin()).getUser(uid);
    if (account.data()?.deleting) throw new PublishError("Account deletion is in progress.", 409);
    if (sites.size > 1) throw new PublishError("Multiple portfolios are linked to this account. Your work is safe; contact support to repair the link.", 409);
    if (sites.empty) {
      if (account.data()?.handle) throw new PublishError("Your portfolio link needs repair. Your saved draft has not been replaced. Please contact support.", 409);
      return null;
    }
    const doc = sites.docs[0], data = doc.data();
    if (!data.profile || !Array.isArray(data.projects) || !data.assets || !Number.isInteger(data.revision)) throw new PublishError("Your published portfolio could not be read. Your draft has not been replaced.", 409);
    if (account.data()?.handle !== doc.id) tx.set(owner, { handle: doc.id }, { merge: true });
    return { profile: data.profile, projects: data.projects, assets: data.assets, handle: doc.id, revision: data.revision, publishedAt: data.publishedAt };
  });
}
