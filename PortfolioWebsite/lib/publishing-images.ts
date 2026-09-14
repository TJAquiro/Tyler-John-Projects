import { getAuth } from "firebase-admin/auth";
﻿import { randomBytes, randomUUID } from "node:crypto";
import { firebaseAdmin, publishingDB, publishingBucket, PublishError } from "./firebase-server";
import { MAX_LIBRARY_BYTES } from "./portfolio-snapshot";

export function imageMime(data: Buffer) {
  return data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "image/png" : data[0] === 255 && data[1] === 216 && data[2] === 255 ? "image/jpeg" : data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP" ? "image/webp" : null;
}
export const uploadId = () => randomBytes(32).toString("hex");
export async function reserveImage(uid: string, id: string, size: number, chunked = false, privateDraft = false) {
  const db = publishingDB(), owner = db.collection("publishers").doc(uid), asset = owner.collection(privateDraft ? "draftAssets" : "assets").doc(id);
  return db.runTransaction(async tx => {
    const [current, account] = await Promise.all([tx.get(asset), tx.get(owner)]);
    // Read Auth after the transaction reads: a concurrent deletion changes the
    // publisher document, so the transaction retries and cannot resurrect it.
    await getAuth(firebaseAdmin()).getUser(uid).catch(() => { throw new PublishError("Your account is no longer available. Sign in again.", 401); });
    if (account.data()?.deleting) throw new PublishError("Account deletion is in progress. Retry deleting your account.", 409);
    if (current.data()?.ready) return true;
    const day = new Date().toISOString().slice(0, 10), quota = account.data() || {};
    const uploads = quota.uploadDay === day ? quota.uploads || 0 : 0;
    if (uploads >= 200) throw new PublishError("Today's upload limit has been reached. Try again tomorrow.", 429);
    const storageBytes = (quota.storageBytes || 0) + (current.exists ? 0 : size);
    if (storageBytes > MAX_LIBRARY_BYTES) throw new PublishError("Your image library has reached its 1 GB limit.", 413);
    tx.set(owner, { storageBytes, uploadDay: day, uploads: uploads + 1 }, { merge: true });
    tx.set(asset, { downloadToken: current.data()?.downloadToken || randomUUID(), size, ready: false, chunked, writingUntil: chunked ? 0 : Date.now() + 360000, createdAt: new Date().toISOString() }, { merge: true });
    return false;
  });
}
export async function finishImage(uid: string, id: string, size: number, mime: string, privateDraft = false) {
  const db = publishingDB(), owner = db.collection("publishers").doc(uid);
  const record = await owner.collection(privateDraft ? "draftAssets" : "assets").doc(id).get();
  const bucket = publishingBucket(), object = bucket.file(`portfolios/${uid}/${privateDraft ? "draft/" : ""}${id}`), token = record.data()?.downloadToken || randomUUID();
  await object.setMetadata({ contentType: mime, cacheControl: "private, no-store", metadata: privateDraft ? {} : { firebaseStorageDownloadTokens: token } });
  const base = process.env.FIREBASE_STORAGE_EMULATOR_HOST ? `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0` : "https://firebasestorage.googleapis.com/v0";
  const url = `${base}/b/${bucket.name}/o/${encodeURIComponent(object.name)}?alt=media&token=${token}`;
  await db.runTransaction(async tx => {
    const account = await tx.get(owner);
    if (!account.exists || account.data()?.deleting) throw new PublishError("Account deletion is in progress.", 409);
    tx.set(owner.collection(privateDraft ? "draftAssets" : "assets").doc(id), { size, ready: true, ...(privateDraft ? {} : { url }), writingUntil: 0, createdAt: new Date().toISOString() });
  });
}
export async function limitedBytes(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new PublishError("Each image must be no larger than 500 MB; upload large images in chunks.", 413);
  if (!request.body) throw new PublishError("Choose an image.");
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > limit) { await reader.cancel(); throw new PublishError("The image upload exceeds its size limit.", 413); } chunks.push(part.value); }
  return Buffer.concat(chunks);
}
