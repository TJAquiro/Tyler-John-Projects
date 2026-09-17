import { createDirectImageUploadHandler, createImageUploadPolicy } from "@/lib/image-upload-routes";

export const runtime = "nodejs";
export const maxDuration = 300;

const uploadImage = createDirectImageUploadHandler(createImageUploadPolicy("publish"));
export async function POST(request: Request) { return uploadImage(request); }
