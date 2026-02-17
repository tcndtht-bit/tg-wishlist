/**
 * Cloudflare Pages Function: прокси к link-scraper /wish-text
 */
const TIMEOUT = 15000;

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");
  const analyze = url.searchParams.get("analyze");
  if (!id) {
    return jsonResponse({ error: "Missing id" }, 400);
  }
  const scraperUrl = context.env?.LINK_SCRAPER_URL;
  if (!scraperUrl) {
    return jsonResponse({ error: "LINK_SCRAPER_URL not configured" }, 503);
  }
  const base = scraperUrl.replace(/\/$/, "");
  const target = `${base}/wish-text?id=${encodeURIComponent(id)}${analyze ? "&analyze=1" : ""}`;
  try {
    const r = await fetch(target, { signal: AbortSignal.timeout(TIMEOUT) });
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return jsonResponse({ error: String(e?.message || e) }, 502);
  }
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
