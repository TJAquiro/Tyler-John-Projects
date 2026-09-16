import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { draftFailure, publishingDB, publishingBucket, publishUser, PublishError, readLimitedJSON } from "@/lib/firebase-server";
import { MAX_IMAGE_BYTES, IMAGE_CHUNK_BYTES } from "@/lib/portfolio-snapshot";
import { finishImage, imageMime, limitedBytes, releaseImageReservation, reserveImage, uploadId, withUploadAdmission } from "@/lib/publishing-images";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const user = await publishUser(request), body = await readLimitedJSON(request, 1000) as { size: number };
    if (!Number.isInteger(body?.size) || body.size < 1 || body.size > MAX_IMAGE_BYTES) throw new PublishError("Choose an image between 1 byte and 500 MB.", 413);
    const id = uploadId(); await reserveImage(user.uid, id, body.size, true, true);
    return Response.json({ id });
  } catch (error) { return draftFailure(error); }
}
async function session(request: Request) {
  const user = await publishUser(request), params = new URL(request.url).searchParams, id = params.get("id") || "";
  if (!/^[a-f0-9]{64}$/.test(id)) throw new PublishError("Invalid upload.");
  const db = publishingDB(), owner = db.collection("publishers").doc(user.uid), ref = owner.collection("draftAssets").doc(id);
  const size = await db.runTransaction(async tx => {
    const [account, asset] = await Promise.all([tx.get(owner), tx.get(ref)]);
    if (!account.exists || account.data()?.deleting) throw new PublishError("Account deletion is in progress.", 409);
    if (!asset.exists || !asset.data()?.chunked || asset.data()?.ready) throw new PublishError("This upload is no longer available.", 409);
    if (asset.data()!.writingUntil > Date.now()) throw new PublishError("An upload request is still running. Retry shortly.", 409);
    tx.update(ref, { writingUntil: Date.now() + 360000 });
    return asset.data()!.size as number;
  });
  return { uid: user.uid, id, size, ref, prefix: `portfolios/${user.uid}/draft/chunks/${id}/`, params };
}
export async function PUT(request: Request) {
  let upload: Awaited<ReturnType<typeof session>> | undefined;
  try {
    upload = await session(request);
    const indexText = upload.params.get("part") || "", index = Number(indexText);
    if (!/^\d+$/.test(indexText) || !Number.isInteger(index) || index < 0 || index >= Math.ceil(upload.size / IMAGE_CHUNK_BYTES)) throw new PublishError("Invalid image chunk.");
    const expected = Math.min(IMAGE_CHUNK_BYTES, upload.size - index * IMAGE_CHUNK_BYTES);
    return await withUploadAdmission(upload.uid, expected, async () => {
      const data = await limitedBytes(request, expected);
      if (data.length !== expected) throw new PublishError("The image chunk is incomplete. Retry publishing.");
      if (index === 0 && !imageMime(data)) throw new PublishError("Choose a PNG, JPG, or WebP image.");
      await publishingBucket().file(upload!.prefix + index).save(data, { resumable: false });
      return Response.json({ uploaded: index });
    });
  } catch (error) { return draftFailure(error); }
  finally { if (upload) await upload.ref.update({ writingUntil: 0 }); }
}
export async function PATCH(request: Request) {
  let upload: Awaited<ReturnType<typeof session>> | undefined;
  try {
    upload = await session(request);
    const bucket = publishingBucket(), { uid, id, size, prefix } = upload;
    const count = Math.ceil(size / IMAGE_CHUNK_BYTES);
    for (let i = 0; i < count; i++) {
      const [metadata] = await bucket.file(prefix + i).getMetadata();
      if (Number(metadata.size) !== Math.min(IMAGE_CHUNK_BYTES, size - i * IMAGE_CHUNK_BYTES)) throw new PublishError("An image chunk is missing. Retry publishing.");
    }
    const [header] = await bucket.file(prefix + 0).download({ start: 0, end: 11 }), mime = imageMime(header);
    if (!mime) throw new PublishError("Choose a PNG, JPG, or WebP image.");
    const output = bucket.file(`portfolios/${uid}/draft/${id}`);
    // Stream sequential chunks: memory remains bounded even for a 500 MB image.
    async function* parts() { for (let i = 0; i < count; i++) yield* bucket.file(prefix + i).createReadStream(); }
    await pipeline(Readable.from(parts()), output.createWriteStream({ resumable: false, metadata: { contentType: mime, cacheControl: "private, no-store" } }));
    await bucket.deleteFiles({ prefix });
    await finishImage(uid, id, size, mime, true);
    return Response.json({ id });
  } catch (error) { return draftFailure(error); }
  finally { if (upload) await upload.ref.update({ writingUntil: 0 }); }
}
export async function DELETE(request: Request) {
  let upload: Awaited<ReturnType<typeof session>> | undefined;
  try {
    upload = await session(request);
    await publishingBucket().deleteFiles({ prefix: upload.prefix });
    await publishingBucket().file(`portfolios/${upload.uid}/draft/${upload.id}`).delete({ ignoreNotFound: true });
    await releaseImageReservation(upload.uid, upload.id, true);
    upload = undefined;
    return Response.json({ cancelled: true });
  } catch (error) { return draftFailure(error); }
  finally { if (upload) await upload.ref.update({ writingUntil: 0 }); }
}
