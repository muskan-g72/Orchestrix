import { NextResponse } from "next/server";

export function getGatewayConfig() {
  const baseUrl = (
    process.env.GATEWAY_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://orchestrix-yc6s.onrender.com"
  ).replace(/\/+$/, "");

  const virtualKey =
    process.env.GATEWAY_VIRTUAL_KEY ||
    process.env.NEXT_PUBLIC_DEFAULT_VIRTUAL_KEY ||
    "vk_open";

  return { baseUrl, virtualKey };
}

export async function proxyToGateway(
  endpointPath: string,
  options: {
    method?: string;
    body?: string;
    searchParams?: URLSearchParams;
    customKey?: string | null;
    noAuth?: boolean;
  } = {}
) {
  const { baseUrl, virtualKey } = getGatewayConfig();
  const keyToUse = options.customKey || virtualKey;

  let url = `${baseUrl}${endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`}`;
  if (options.searchParams && options.searchParams.toString()) {
    const delimiter = url.includes("?") ? "&" : "?";
    url = `${url}${delimiter}${options.searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!options.noAuth && keyToUse) {
    headers["Authorization"] = `Bearer ${keyToUse}`;
  }

  try {
    const controller = new AbortController();
    // Render free-tier can take up to 60s to wake up, so set 70s timeout
    const timeoutId = setTimeout(() => controller.abort(), 70000);

    const gatewayResponse = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const contentType = gatewayResponse.headers.get("content-type") || "";
    if (gatewayResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (contentType.includes("application/json")) {
      const data = await gatewayResponse.json();
      return NextResponse.json(data, {
        status: gatewayResponse.status,
      });
    }

    const text = await gatewayResponse.text();
    return new NextResponse(text, {
      status: gatewayResponse.status,
      headers: { "Content-Type": contentType || "text/plain" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gateway communication failed";
    return NextResponse.json(
      {
        error: "GatewayProxyError",
        detail: `Failed connecting to Orchestrix backend: ${message}`,
      },
      { status: 502 }
    );
  }
}
