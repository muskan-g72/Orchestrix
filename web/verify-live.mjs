// verify-live.mjs
// Deterministic end-to-end verification of Orchestrix Gateway & Proxy

const GATEWAY_DIRECT_URL = "https://orchestrix-yc6s.onrender.com";
const PROXY_URL = "http://localhost:3000/api";

function logHeader(title) {
  console.log("\n" + "=".repeat(75));
  console.log(`  ${title}`);
  console.log("=".repeat(75));
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// STEP 1: Retry GET /healthz every 15s for up to 90s
async function verifyHealthz() {
  logHeader("STEP 1: Verify GET /healthz (every 15s for up to 90s)");

  const maxAttempts = 7; // 0s, 15s, 30s, 45s, 60s, 75s, 90s
  let healthy = false;
  let healthyTimestamp = null;
  let healthyStatus = null;
  let healthyBody = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const timestamp = new Date().toISOString();
    console.log(`\n[Attempt ${attempt}/${maxAttempts}] ${timestamp} -> Fetching GET ${GATEWAY_DIRECT_URL}/healthz`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const res = await fetch(`${GATEWAY_DIRECT_URL}/healthz`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const status = res.status;
      const text = await res.text();
      console.log(`Status Code: ${status}`);
      console.log(`Response Body: ${text}`);

      if (status === 200) {
        healthy = true;
        healthyTimestamp = timestamp;
        healthyStatus = status;
        healthyBody = text;
        console.log(`>>> GATEWAY IS HEALTHY (200 OK) at ${timestamp}!`);
        break;
      }
    } catch (err) {
      console.log(`Request error or timeout: ${err.message}`);
    }

    if (attempt < maxAttempts) {
      console.log(`Waiting 15s before attempt ${attempt + 1}...`);
      await sleep(15000);
    }
  }

  // Also test through the Next.js proxy
  console.log(`\nTesting through Next.js proxy: GET ${PROXY_URL}/healthz`);
  try {
    const proxyRes = await fetch(`${PROXY_URL}/healthz`);
    console.log(`Proxy Status Code: ${proxyRes.status}`);
    const proxyBody = await proxyRes.text();
    console.log(`Proxy Response Body: ${proxyBody}`);
  } catch (err) {
    console.log(`Proxy error: ${err.message}`);
  }

  return { healthy, healthyTimestamp, healthyStatus, healthyBody };
}

// STEP 2: One real POST /v1/tasks/execute (skill: summarize) through the proxy with vk_open
async function executeTaskVkOpen() {
  logHeader("STEP 2: POST /v1/tasks/execute with vk_open (skill: summarize) via Proxy");

  const url = `${PROXY_URL}/tasks/execute`;
  const requestBody = {
    skill: "summarize",
    input: {
      text: "Orchestrix is a deterministic AI execution gateway providing virtual-key authentication, atomic budget reservation, Groq primary execution with automatic Gemini fallback, and persistent trace recording.",
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer vk_open",
  };

  console.log(`Request URL: ${url}`);
  console.log(`Request Headers:`, JSON.stringify(headers, null, 2));
  console.log(`Request Body:`, JSON.stringify(requestBody, null, 2));

  const startTime = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });
  const duration = Date.now() - startTime;

  console.log(`\nResponse Status: ${res.status} ${res.statusText} (${duration}ms)`);
  const rawText = await res.text();
  console.log(`Raw Response:`);
  try {
    const json = JSON.parse(rawText);
    console.log(JSON.stringify(json, null, 2));
  } catch {
    console.log(rawText);
  }
}

// STEP 3: Run POST /v1/tasks/execute twice with vk_edge back to back to confirm 429
async function executeTaskVkEdgeTwice() {
  logHeader("STEP 3: POST /v1/tasks/execute with vk_edge twice back-to-back (Budget = 1)");

  const url = `${PROXY_URL}/tasks/execute`;
  const requestBody = {
    skill: "summarize",
    input: {
      text: "Orchestrix edge budget verification test.",
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer vk_edge",
  };

  // Call 1
  console.log(`\n--- Call 1 of 2 (vk_edge) ---`);
  console.log(`Request URL: ${url}`);
  console.log(`Headers: Authorization: Bearer vk_edge`);
  console.log(`Body:`, JSON.stringify(requestBody));

  const t1 = Date.now();
  const res1 = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });
  const dur1 = Date.now() - t1;
  const raw1 = await res1.text();
  console.log(`Call 1 Response Status: ${res1.status} ${res1.statusText} (${dur1}ms)`);
  try {
    console.log(`Call 1 Raw Body:`, JSON.stringify(JSON.parse(raw1), null, 2));
  } catch {
    console.log(`Call 1 Raw Body:`, raw1);
  }

  // Call 2
  console.log(`\n--- Call 2 of 2 (vk_edge) [Expected: 429 Budget Exhausted] ---`);
  console.log(`Request URL: ${url}`);
  console.log(`Headers: Authorization: Bearer vk_edge`);
  console.log(`Body:`, JSON.stringify(requestBody));

  const t2 = Date.now();
  const res2 = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });
  const dur2 = Date.now() - t2;
  const raw2 = await res2.text();
  console.log(`Call 2 Response Status: ${res2.status} ${res2.statusText} (${dur2}ms)`);
  try {
    console.log(`Call 2 Raw Body:`, JSON.stringify(JSON.parse(raw2), null, 2));
  } catch {
    console.log(`Call 2 Raw Body:`, raw2);
  }
}

async function main() {
  const healthResult = await verifyHealthz();
  await executeTaskVkOpen();
  await executeTaskVkEdgeTwice();
  console.log("\n" + "=".repeat(75));
  console.log("  ALL VERIFICATION CHECKS COMPLETED");
  console.log("=".repeat(75));
}

main().catch(console.error);
