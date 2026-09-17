import { createChunkedImageUploadHandlers, createImageUploadPolicy } from "@/lib/image-upload-routes";

export const runtime = "nodejs";
export const maxDuration = 300;

const handlers = createChunkedImageUploadHandlers(createImageUploadPolicy("draft"));
export async function POST(request: Request) { return handlers.POST(request); }
export async function PUT(request: Request) { return handlers.PUT(request); }
export async function PATCH(request: Request) { return handlers.PATCH(request); }
export async function DELETE(request: Request) { return handlers.DELETE(request); }
