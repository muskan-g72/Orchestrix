import { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/server-gateway";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let customKey: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    customKey = authHeader.replace("Bearer ", "").trim();
  }

  return proxyToGateway("/v1/preferences", {
    method: "GET",
    customKey,
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.text();
  const authHeader = request.headers.get("authorization");
  let customKey: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    customKey = authHeader.replace("Bearer ", "").trim();
  }

  return proxyToGateway("/v1/preferences", {
    method: "PUT",
    body,
    customKey,
  });
}
