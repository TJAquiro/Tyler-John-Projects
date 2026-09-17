import { Readable } from "node:stream";
import { draftFailure, publishingDB, publishingBucket, publishUser, PublishError } from "@/lib/firebase-server";
import { createDirectImageUploadHandler, createImageUploadPolicy } from "@/lib/image-upload-routes";

export const runtime = "nodejs";
export const maxDuration = 300;

const uploadImage = createDirectImageUploadHandler(createImageUploadPolicy("draft"));
export async function POST(request: Request) { return uploadImage(request); }

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
