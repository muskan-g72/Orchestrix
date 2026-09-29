import { proxyToGateway } from "@/lib/server-gateway";

export const dynamic = "force-dynamic";

export async function GET() {
  return proxyToGateway("/healthz", { noAuth: true });
}
