import { NextRequest } from "next/server";
import { proxyToGateway, getGatewayConfig } from "@/lib/server-gateway";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyParam = searchParams.get("key");
  const { virtualKey } = getGatewayConfig();
  const targetKey = keyParam || virtualKey;

  const params = new URLSearchParams();
  params.set("key", targetKey);

  return proxyToGateway("/usage", {
    searchParams: params,
    noAuth: true,
  });
}
