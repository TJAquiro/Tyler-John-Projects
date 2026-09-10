import { createHash, randomUUID } from "node:crypto";
import { publishFailure, publishingDB, publishingBucket, publishUser, PublishError } from "@/lib/firebase-server";
import { MAX_IMAGE_BYTES } from "@/lib/portfolio-snapshot";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await publishUser(request);
    if (!request.body) throw new PublishError("Choose an image.");
    const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > MAX_IMAGE_BYTES) { await reader.cancel(); throw new PublishError("Each image must be smaller than 5 MB.", 413); } chunks.push(part.value); }
    const data = Buffer.concat(chunks);
    const mime = data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "image/png" : data[0] === 255 && data[1] === 216 && data[2] === 255 ? "image/jpeg" : data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP" ? "image/webp" : null;
    if (!mime) throw new PublishError("Choose a PNG, JPG, or WebP image.");
    const id = createHash("sha256").update(data).digest("hex"), db = publishingDB(), owner = db.collection("publishers").doc(user.uid), asset = owner.collection("assets").doc(id);
    const token = randomUUID(), bucket = publishingBucket(), objectName = `portfolios/${user.uid}/${id}`;
    const base = process.env.FIREBASE_STORAGE_EMULATOR_HOST ? `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0` : "https://firebasestorage.googleapis.com/v0";
    const url = `${base}/b/${bucket.name}/o/${encodeURIComponent(objectName)}?alt=media&token=${token}`;
    const ready = await db.runTransaction(async tx => {
      const [current, account] = await Promise.all([tx.get(asset), tx.get(owner)]);
      if (current.data()?.ready) return true;
      const day = new Date().toISOString().slice(0, 10), quota = account.data() || {};
      const uploads = quota.uploadDay === day ? quota.uploads || 0 : 0;
      if (uploads >= 200) throw new PublishError("Today's upload limit has been reached. Try again tomorrow.", 429);
      const storageBytes = (quota.storageBytes || 0) + (current.exists ? 0 : size);
      if (storageBytes > 100 * 1024 * 1024) throw new PublishError("Your image library has reached its 100 MB limit. Contact the site owner to remove unused uploads.", 413);
      tx.set(owner, { storageBytes, uploadDay: day, uploads: uploads + 1 }, { merge: true });
      if (!current.exists) tx.set(asset, { size, ready: false });
      return false;
    });
    if (!ready) {
      // Immutable object creation makes concurrent identical uploads safe.
      const object = bucket.file(objectName);
      try { await object.save(data, { resumable: false, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType: mime, cacheControl: "public, max-age=31536000, immutable", metadata: { firebaseStorageDownloadTokens: token } } }); }
      catch (e) { if ((e as { code?: number }).code !== 412) throw e; }
      const [metadata] = await object.getMetadata();
      const actualToken = metadata.metadata?.firebaseStorageDownloadTokens;
      if (!actualToken) throw new Error("Image token missing");
      await asset.set({ size, ready: true, url: url.replace(token, String(actualToken)), createdAt: new Date().toISOString() });
    }
    return Response.json({ id });
  } catch (error) { return publishFailure(error); }
}
