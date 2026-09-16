import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { publishFailure, publishingDB, publishingBucket, publishUser, PublishError, readLimitedJSON } from "@/lib/firebase-server";
import { MAX_IMAGE_BYTES, IMAGE_CHUNK_BYTES } from "@/lib/portfolio-snapshot";
import { finishImage, imageMime, limitedBytes, releaseImageReservation, reserveImage, uploadId, withUploadAdmission, UPLOAD_TTL_MS } from "@/lib/publishing-images";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const user = await publishUser(request), body = await readLimitedJSON(request, 1000) as { size: number };
    if (!Number.isInteger(body?.size) || body.size < 1 || body.size > MAX_IMAGE_BYTES) throw new PublishError("Choose an image between 1 byte and 500 MB.", 413);
    const id = uploadId(); await reserveImage(user.uid, id, body.size, true);
    return Response.json({ id });
  } catch (error) { return publishFailure(error); }
}
async function session(request: Request, options: { part?: number; allowExpired?: boolean } = {}) {
  const user = await publishUser(request), params = new URL(request.url).searchParams, id = params.get("id") || "";
  if (!/^[a-f0-9]{64}$/.test(id)) throw new PublishError("Invalid upload.");
  const db = publishingDB(), owner = db.collection("publishers").doc(user.uid), ref = owner.collection("assets").doc(id);
  const size = await db.runTransaction(async tx => {
    const [account, asset] = await Promise.all([tx.get(owner), tx.get(ref)]);
    if (!account.exists || account.data()?.deleting) throw new PublishError("Account deletion is in progress.", 409);
    const data = asset.data();
    if (!asset.exists || !data?.chunked || data.ready || data.expiring) throw new PublishError("This upload is no longer available.", 409);
    if (!options.allowExpired && data.expiresAt <= Date.now()) throw new PublishError("This upload expired. Start the image upload again.", 409);
    if (data.writingUntil > Date.now()) throw new PublishError("An upload request is still running. Retry shortly.", 409);
    const size = data.size as number;
    if (options.part !== undefined && (options.part < 0 || options.part >= Math.ceil(size / IMAGE_CHUNK_BYTES))) throw new PublishError("Invalid image chunk.");
    if (options.part !== undefined && data.parts?.[String(options.part)]) throw new PublishError("This image chunk was already uploaded.", 409);
    tx.update(ref, { writingUntil: Date.now() + 360000, expiresAt: Date.now() + UPLOAD_TTL_MS });
    return size;
  });
  return { uid: user.uid, id, size, ref, prefix: `portfolios/${user.uid}/chunks/${id}/`, params };
}
export async function PUT(request: Request) {
  let upload: Awaited<ReturnType<typeof session>> | undefined;
  try {
    const indexText = new URL(request.url).searchParams.get("part") || "", index = Number(indexText);
    if (!/^\d+$/.test(indexText) || !Number.isInteger(index)) throw new PublishError("Invalid image chunk.");
    upload = await session(request, { part: index });
    const expected = Math.min(IMAGE_CHUNK_BYTES, upload.size - index * IMAGE_CHUNK_BYTES);
    return await withUploadAdmission(upload.uid, expected, async () => {
      const data = await limitedBytes(request, expected);
      if (data.length !== expected) throw new PublishError("The image chunk is incomplete. Retry publishing.");
      if (index === 0 && !imageMime(data)) throw new PublishError("Choose a PNG, JPG, or WebP image.");
      await publishingBucket().file(upload!.prefix + index).save(data, { resumable: false });
      await upload!.ref.update({ [`parts.${index}`]: true, writingUntil: 0, expiresAt: Date.now() + UPLOAD_TTL_MS });
      upload = undefined;
      return Response.json({ uploaded: index });
    });
  } catch (error) { return publishFailure(error); }
  finally { if (upload) await upload.ref.update({ writingUntil: 0 }); }
}
export async function PATCH(request: Request) {
  let upload: Awaited<ReturnType<typeof session>> | undefined;
  try {
    upload = await session(request);
    const bucket = publishingBucket(), { uid, id, size, prefix } = upload;
    const count = Math.ceil(size / IMAGE_CHUNK_BYTES);
    const record = await upload.ref.get(), uploadedParts = record.data()?.parts || {};
    if (Array.from({ length: count }, (_, index) => uploadedParts[String(index)] === true).some(complete => !complete)) throw new PublishError("An image chunk is missing. Retry publishing.");
    for (let i = 0; i < count; i++) {
      const [metadata] = await bucket.file(prefix + i).getMetadata();
      if (Number(metadata.size) !== Math.min(IMAGE_CHUNK_BYTES, size - i * IMAGE_CHUNK_BYTES)) throw new PublishError("An image chunk is missing. Retry publishing.");
    }
    const [header] = await bucket.file(prefix + 0).download({ start: 0, end: 11 }), mime = imageMime(header);
    if (!mime) throw new PublishError("Choose a PNG, JPG, or WebP image.");
    const output = bucket.file(`portfolios/${uid}/${id}`);
    // Stream sequential chunks: memory remains bounded even for a 500 MB image.
    async function* parts() { for (let i = 0; i < count; i++) yield* bucket.file(prefix + i).createReadStream(); }
    await pipeline(Readable.from(parts()), output.createWriteStream({ resumable: false, metadata: { contentType: mime, cacheControl: "private, no-store" } }));
    await bucket.deleteFiles({ prefix });
    await finishImage(uid, id, size, mime);
    return Response.json({ id });
  } catch (error) { return publishFailure(error); }
  finally { if (upload) await upload.ref.update({ writingUntil: 0 }); }
}
export async function DELETE(request: Request) {
  let upload: Awaited<ReturnType<typeof session>> | undefined;
  try {
    upload = await session(request, { allowExpired: true });
    await publishingBucket().deleteFiles({ prefix: upload.prefix });
    await publishingBucket().file(`portfolios/${upload.uid}/${upload.id}`).delete({ ignoreNotFound: true });
    await releaseImageReservation(upload.uid, upload.id);
    upload = undefined;
    return Response.json({ cancelled: true });
  } catch (error) { return publishFailure(error); }
  finally { if (upload) await upload.ref.update({ writingUntil: 0 }); }
}
