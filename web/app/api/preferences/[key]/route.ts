import { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/server-gateway";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const authHeader = request.headers.get("authorization");
  let customKey: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    customKey = authHeader.replace("Bearer ", "").trim();
  }

  return proxyToGateway(`/v1/preferences/${params.key}`, {
    method: "DELETE",
    customKey,
  });
}
