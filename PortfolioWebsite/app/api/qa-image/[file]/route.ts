import fs from "node:fs/promises";
import path from "node:path";
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params, directory = process.env.PORTFOLIO_UPLOAD_DIR;
  if (!directory || !/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(file)) return new Response(null, { status: 404 });
  const data = await fs.readFile(path.join(directory, file)).catch(() => null);
  return data ? new Response(data, { headers: { "Content-Type": file.endsWith("png") ? "image/png" : file.endsWith("jpg") ? "image/jpeg" : "image/webp" } }) : new Response(null, { status: 404 });
}
