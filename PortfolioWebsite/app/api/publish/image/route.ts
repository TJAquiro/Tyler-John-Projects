import { createHash } from "node:crypto";
import { publishFailure, publishingBucket, publishUser, PublishError } from "@/lib/firebase-server";
import { MAX_IMAGE_BYTES } from "@/lib/portfolio-snapshot";
import { finishImage, imageMime, limitedBytes, reserveImage } from "@/lib/publishing-images";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const user = await publishUser(request);
    const data = await limitedBytes(request, MAX_IMAGE_BYTES), mime = imageMime(data);
    if (!mime) throw new PublishError("Choose a PNG, JPG, or WebP image.");
    const id = createHash("sha256").update(data).digest("hex");
    if (!await reserveImage(user.uid, id, data.length)) {
      const object = publishingBucket().file(`portfolios/${user.uid}/${id}`);
      try { await object.save(data, { resumable: false, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType: mime, cacheControl: "private, no-store" } }); }
      catch (e) { if ((e as { code?: number }).code !== 412) throw e; }
      await finishImage(user.uid, id, data.length, mime);
    }
    return Response.json({ id });
  } catch (error) { return publishFailure(error); }
}
