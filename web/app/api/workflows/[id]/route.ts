import { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/server-gateway";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get("authorization");
  let customKey: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    customKey = authHeader.replace("Bearer ", "").trim();
  }

  return proxyToGateway(`/v1/workflows/${params.id}`, {
    method: "GET",
    customKey,
  });
}
