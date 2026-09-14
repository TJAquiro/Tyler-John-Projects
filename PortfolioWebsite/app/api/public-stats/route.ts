import { unstable_cache } from "next/cache";
import { firebaseConfigured, publishingDB } from "@/lib/firebase-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const publishedCreators = unstable_cache(async () => {
  const snapshot = await publishingDB().collection("publishedPortfolios").count().get();
  return snapshot.data().count;
}, ["published-creator-count"], { revalidate: 300, tags: ["published-creator-count"] });
export async function GET() {
  try {
    if (!firebaseConfigured()) throw new Error("Publishing unavailable");
    return Response.json({ publishedCreators: await publishedCreators() }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json({ publishedCreators: null }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
