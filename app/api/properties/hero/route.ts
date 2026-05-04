import { getHeroProperties } from "@/lib/data";
import { ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const properties = await getHeroProperties(4);
    return ok({ properties });
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
