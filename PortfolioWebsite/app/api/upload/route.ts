import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { isAuthenticated, editingEnabled, sameOrigin } from "@/lib/auth";
import { MAX_IMAGE_BYTES } from "@/lib/portfolio-snapshot";
export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Please sign in again before uploading." }, { status: 401 });
  if (!sameOrigin(request) || !editingEnabled()) return NextResponse.json({ error: "Upload images in your local studio." }, { status: 403 });
  try {
    const form = await request.formData(), file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Choose an image between 1 byte and 500 MB." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    // Inspect signatures, not filenames. SVG uploads can contain scripts.
    const extension = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png"
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "jpg"
      : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : null;
    if (!extension) return NextResponse.json({ error: "Choose a PNG, JPG, or WebP image. SVG uploads are not supported." }, { status: 400 });
    const directory = process.env.PORTFOLIO_UPLOAD_DIR || path.join(process.cwd(), "public", "images");
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
    return NextResponse.json({ path: `/images/${filename}` });
  } catch { return NextResponse.json({ error: "The image could not be uploaded. Please retry." }, { status: 500 }); }
}
