/**
 * Cloudflare Pages Function: прокси к link-scraper на Railway.
 * Весь анализ ссылок выполняется в link-scraper (Puppeteer).
 */
const FETCH_TIMEOUT = 30000;

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl || typeof targetUrl !== "string") {
    return jsonResponse({ error: "Missing url parameter" }, 400);
  }
  if (!targetUrl.startsWith("https://")) {
    return jsonResponse({ error: "Only https URLs allowed" }, 400);
  }

  const scraperUrl = context.env?.LINK_SCRAPER_URL;
  if (!scraperUrl) {
    return jsonResponse({
      name: "N/A",
      price: null,
      currency: null,
      size: null,
      link: targetUrl,
      image: null,
      imageBase64: null,
      _fallback: true,
      _error: "LINK_SCRAPER_URL not configured",
    });
  }

  try {
    const base = scraperUrl.replace(/\/$/, "");
    const r = await fetch(`${base}/?url=${encodeURIComponent(targetUrl)}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    const data = await r.json();
    if (!r.ok) {
      return jsonResponse({
        name: data.name ?? "N/A",
        price: data.price ?? null,
        currency: data.currency ?? null,
        size: data.size ?? null,
        link: targetUrl,
        image: data.image ?? null,
        imageBase64: data.imageBase64 ?? null,
        _fallback: true,
      });
    }
    return jsonResponse({
      name: data.name ?? "N/A",
      price: data.price ?? null,
      currency: data.currency ?? null,
      size: data.size ?? null,
      link: targetUrl,
      image: data.image ?? null,
      imageBase64: data.imageBase64 ?? null,
    });
  } catch (e) {
    console.error("link-analyze error:", e);
    return jsonResponse({
      name: "N/A",
      price: null,
      currency: null,
      size: null,
      link: targetUrl,
      image: null,
      imageBase64: null,
      _fallback: true,
      _error: String(e?.message || e),
    });
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
