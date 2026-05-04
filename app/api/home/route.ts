import { getHomeData } from "@/lib/data";
import { ok, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHomeData();
    return ok(data);
  } catch (err) {
    console.error(err);
    return serverError();
  }
}
