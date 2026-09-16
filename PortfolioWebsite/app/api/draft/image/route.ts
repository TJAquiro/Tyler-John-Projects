import { Readable } from "node:stream";
﻿import { createHash } from "node:crypto";
import { draftFailure, publishingDB, publishingBucket, publishUser, PublishError } from "@/lib/firebase-server";
import { IMAGE_CHUNK_BYTES } from "@/lib/portfolio-snapshot";
import { finishImage, imageMime, limitedBytes, releaseImageReservation, reserveImage, withUploadAdmission } from "@/lib/publishing-images";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const user = await publishUser(request);
    return await withUploadAdmission(user.uid, IMAGE_CHUNK_BYTES, async () => {
      const data = await limitedBytes(request, IMAGE_CHUNK_BYTES), mime = imageMime(data);
      if (!mime) throw new PublishError("Choose a PNG, JPG, or WebP image.");
      const id = createHash("sha256").update(data).digest("hex");
      if (!await reserveImage(user.uid, id, data.length, false, true)) {
        const object = publishingBucket().file(`portfolios/${user.uid}/draft/${id}`);
        try {
          try { await object.save(data, { resumable: false, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType: mime, cacheControl: "private, no-store" } }); }
          catch (e) { if ((e as { code?: number }).code !== 412) throw e; }
          await finishImage(user.uid, id, data.length, mime, true);
        } catch (error) { await object.delete({ ignoreNotFound: true }); await releaseImageReservation(user.uid, id, true); throw error; }
      }
      return Response.json({ id });
    });
  } catch (error) { return draftFailure(error); }
}

export async function GET(request: Request) {
  try {
    const user = await publishUser(request, false), id = new URL(request.url).searchParams.get("id") || "";
    if (!/^[a-f0-9]{64}$/.test(id)) throw new PublishError("Invalid draft image.");
    const record = await publishingDB().collection("publishers").doc(user.uid).collection("draftAssets").doc(id).get();
    if (!record.data()?.ready) throw new PublishError("This draft image is unavailable.", 404);
    const object = publishingBucket().file(`portfolios/${user.uid}/draft/${id}`);
    const [metadata] = await object.getMetadata();
    return new Response(Readable.toWeb(object.createReadStream()) as ReadableStream, { headers: { "Content-Type": metadata.contentType || "application/octet-stream", "Cache-Control": "private, no-store" } });
  } catch (error) { return draftFailure(error); }
}
