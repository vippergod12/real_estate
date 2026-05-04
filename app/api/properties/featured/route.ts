import { getFeaturedProperties } from "@/lib/data";
import { ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const properties = await getFeaturedProperties(8);
    return ok({ properties });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
