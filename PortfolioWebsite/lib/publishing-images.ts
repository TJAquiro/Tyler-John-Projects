import { getAuth } from "firebase-admin/auth";
import { randomBytes, randomUUID } from "node:crypto";
import { firebaseAdmin, publishingDB, publishingBucket, PublishError } from "./firebase-server";
import { IMAGE_CHUNK_BYTES, MAX_IN_FLIGHT_UPLOAD_BYTES, MAX_IN_FLIGHT_UPLOAD_REQUESTS, MAX_LIBRARY_BYTES, MAX_SERVICE_DAILY_UPLOADS, MAX_SERVICE_STORAGE_BYTES } from "./portfolio-snapshot";

const LEASE_MS = 6 * 60 * 1000;
export const UPLOAD_TTL_MS = 24 * 60 * 60 * 1000;
type UploadLease = { uid: string; bytes: number; expiresAt: number };

export async function withUploadAdmission<T>(uid: string, requestedBytes: number, task: () => Promise<T>) {
  const db = publishingDB(), ref = db.collection("serviceState").doc("uploadAdmission"), leaseId = randomUUID(), now = Date.now();
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(ref), stored = snapshot.data()?.leases || {};
    const leases = Object.fromEntries(Object.entries(stored).filter(([, value]) => Number((value as UploadLease).expiresAt) > now)) as Record<string, UploadLease>;
    const bytes = Object.values(leases).reduce((total, lease) => total + Number(lease.bytes || 0), 0);
    if (Object.keys(leases).length >= MAX_IN_FLIGHT_UPLOAD_REQUESTS || bytes + requestedBytes > MAX_IN_FLIGHT_UPLOAD_BYTES) throw new PublishError("The upload service is busy. Retry in a moment.", 429);
    leases[leaseId] = { uid, bytes: requestedBytes, expiresAt: now + LEASE_MS };
    tx.set(ref, { leases, updatedAt: new Date().toISOString() });
  });
  try { return await task(); }
  finally {
    await db.runTransaction(async tx => {
      const snapshot = await tx.get(ref), leases = { ...(snapshot.data()?.leases || {}) };
      delete leases[leaseId];
      tx.set(ref, { leases, updatedAt: new Date().toISOString() });
    }).catch(error => console.error("Upload admission lease cleanup failed", error instanceof Error ? error.name : "Unknown error"));
  }
}

export function imageMime(data: Buffer) {
  return data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "image/png" : data[0] === 255 && data[1] === 216 && data[2] === 255 ? "image/jpeg" : data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP" ? "image/webp" : null;
}
export const uploadId = () => randomBytes(32).toString("hex");

async function reapExpiredUploads(uid: string, privateDraft: boolean) {
  const db = publishingDB(), owner = db.collection("publishers").doc(uid);
  const collection = owner.collection(privateDraft ? "draftAssets" : "assets");
  const expired = await collection.where("expiresAt", "<=", Date.now()).limit(20).get();
  for (const candidate of expired.docs) {
    const claimed = await db.runTransaction(async tx => {
      const current = await tx.get(candidate.ref), data = current.data();
      if (!current.exists || data?.ready || (data?.expiresAt ?? Infinity) > Date.now() || (data?.writingUntil || 0) > Date.now()) return false;
      tx.update(candidate.ref, { expiring: true });
      return true;
    });
    if (!claimed) continue;
    const root = `portfolios/${uid}/${privateDraft ? "draft/" : ""}`;
    await publishingBucket().deleteFiles({ prefix: `${root}chunks/${candidate.id}/` });
    await publishingBucket().file(`${root}${candidate.id}`).delete({ ignoreNotFound: true });
    await releaseImageReservation(uid, candidate.id, privateDraft);
  }
}

export async function reserveImage(uid: string, id: string, size: number, chunked = false, privateDraft = false) {
  await reapExpiredUploads(uid, privateDraft);
  const db = publishingDB(), owner = db.collection("publishers").doc(uid), asset = owner.collection(privateDraft ? "draftAssets" : "assets").doc(id), service = db.collection("serviceState").doc("imageQuota");
  return db.runTransaction(async tx => {
    const [current, account, global] = await Promise.all([tx.get(asset), tx.get(owner), tx.get(service)]);
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
    const globalQuota = global.data() || {}, globalUploads = globalQuota.uploadDay === day ? globalQuota.uploads || 0 : 0;
    if (globalUploads >= MAX_SERVICE_DAILY_UPLOADS) throw new PublishError("The service upload limit has been reached. Try again tomorrow.", 429);
    const globalStorageBytes = (globalQuota.storageBytes || 0) + (current.exists ? 0 : size);
    if (globalStorageBytes > MAX_SERVICE_STORAGE_BYTES) throw new PublishError("The service image capacity has been reached. Contact the site owner.", 413);
    tx.set(owner, { storageBytes, uploadDay: day, uploads: uploads + 1 }, { merge: true });
    tx.set(service, { storageBytes: globalStorageBytes, uploadDay: day, uploads: globalUploads + 1 }, { merge: true });
    tx.set(asset, { downloadToken: current.data()?.downloadToken || randomUUID(), size, ready: false, chunked, writingUntil: chunked ? 0 : Date.now() + 360000, expiresAt: Date.now() + UPLOAD_TTL_MS, ...(chunked ? { parts: {} } : {}), createdAt: new Date().toISOString() }, { merge: true });
    return false;
  });
}
export async function releaseImageReservation(uid: string, id: string, privateDraft = false) {
  const db = publishingDB(), owner = db.collection("publishers").doc(uid), asset = owner.collection(privateDraft ? "draftAssets" : "assets").doc(id), service = db.collection("serviceState").doc("imageQuota");
  await db.runTransaction(async tx => {
    const [account, current, global] = await Promise.all([tx.get(owner), tx.get(asset), tx.get(service)]);
    if (!current.exists) return;
    const size = Number(current.data()?.size || 0);
    tx.set(owner, { storageBytes: Math.max(0, Number(account.data()?.storageBytes || 0) - size) }, { merge: true });
    tx.set(service, { storageBytes: Math.max(0, Number(global.data()?.storageBytes || 0) - size) }, { merge: true });
    tx.delete(asset);
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
  const tooLarge = limit <= IMAGE_CHUNK_BYTES ? "This image is too large for a direct upload. Use the chunked upload for images above 8 MiB." : "The image upload exceeds its size limit.";
  if (Number(request.headers.get("content-length")) > limit) throw new PublishError(tooLarge, 413);
  if (!request.body) throw new PublishError("Choose an image.");
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > limit) { await reader.cancel(); throw new PublishError(tooLarge, 413); } chunks.push(part.value); }
  return Buffer.concat(chunks);
}
