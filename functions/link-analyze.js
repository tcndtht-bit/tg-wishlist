/**
 * Cloudflare Pages Function: анализ ссылки на товар
 * Fetch страницы → парсинг og:* / JSON-LD → при необходимости LLM (OpenRouter/Groq)
 */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const MAX_HTML = 80000;
const FETCH_TIMEOUT = 20000;
const LLM_PROMPT = `Проанализируй текст страницы товара и извлеки информацию. Верни ТОЛЬКО валидный JSON без пояснений:
{"name":"строка","price":число или null,"currency":"строка или null","size":"строка или null"}

1. name — название товара (существительное или фраза). Если нет — "N/A".
2. price и currency — связка число + валюта (BYN, RUB, USD, EUR, KZT и т.п.). Если нет — null.
3. size — размер для одежды/обуви (EU, US, XXS-XL). Иначе null.`;

function extractMeta(html, name) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i"
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

function extractPriceFromHtml(html) {
  const patterns = [
    /"price"\s*:\s*["']?(\d+(?:[.,]\d+)?)["']?/i,
    /"price"\s*:\s*(\d+(?:[.,]\d+)?)/,
    /"currentPrice"\s*:\s*["']?(\d+(?:[.,]\d+)?)["']?/i,
    /data-price=["'](\d+(?:[.,]\d+)?)["']/i,
    /itemprop="price"\s+content=["'](\d+(?:[.,]\d+)?)["']/i,
    /content=["'](\d+(?:[.,]\d+)?)["'][^>]+itemprop="price"/i,
    /__NEXT_DATA__[\s\S]*?"price"\s*:\s*["']?(\d+(?:[.,]\d+)?)["']?/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return parseFloat(String(m[1]).replace(",", "."));
  }
  return null;
}

function extractCurrencyFromHtml(html) {
  const m = html.match(/"priceCurrency"\s*:\s*["']([A-Z]{3})["']/i);
  if (m) {
    const c = m[1];
    if (/BYN|Br/i.test(c)) return "Br";
    if (/RUB/i.test(c)) return "₽";
    if (/USD/i.test(c)) return "$";
    if (/EUR/i.test(c)) return "€";
    if (/KZT/i.test(c)) return "₸";
    return c;
  }
  const m2 = html.match(/\b(BYN|Br|₽|руб\.?|RUB|USD|\$|EUR|€)\b/i);
  if (m2) {
    const c = m2[1];
    if (/BYN|Br/i.test(c)) return "Br";
    if (/RUB|₽|руб/i.test(c)) return "₽";
    if (/USD|\$/i.test(c)) return "$";
    if (/EUR|€/i.test(c)) return "€";
  }
  return null;
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function findProductInJsonLd(obj) {
  if (!obj) return null;
  if (obj["@type"] === "Product" || String(obj["@type"]).includes("Product")) return obj;
  if (Array.isArray(obj)) return obj.find((x) => findProductInJsonLd(x));
  if (obj["@graph"]) return findProductInJsonLd(obj["@graph"]);
  return null;
}

function extractJsonLd(html) {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of scripts) {
    try {
      const parsed = JSON.parse(m[1]);
      const product = findProductInJsonLd(parsed);
      if (product) return product;
    } catch {}
  }
  return null;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function fetchImageAsBase64(imageUrl, baseUrl) {
  try {
    const url = imageUrl.startsWith("http") ? imageUrl : new URL(imageUrl, baseUrl).href;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "image/jpeg";
    if (!/^image\/(jpeg|png|webp|gif)/i.test(ct)) return null;
    return `data:${ct};base64,${arrayBufferToBase64(buf)}`;
  } catch {
    return null;
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000);
}

async function callLLM(text, env) {
  const apiKey = env?.OPENROUTER_API_KEY || env?.GROQ_API_KEY;
  if (!apiKey) return null;
  const isGroq = !!env?.GROQ_API_KEY;
  const url = isGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";
  const model = isGroq
    ? "meta-llama/llama-4-scout-17b-16e-instruct"
    : "google/gemma-3-27b-it:free";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: LLM_PROMPT + "\n\n" + text }],
      max_tokens: 500,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const t = data.choices?.[0]?.message?.content;
  if (!t) return null;
  const m = t.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : null;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl || typeof targetUrl !== "string") {
    return jsonResponse({ error: "Missing url parameter" }, 400);
  }
  if (!targetUrl.startsWith("https://")) {
    return jsonResponse({ error: "Only https URLs allowed" }, 400);
  }

  let html = null;
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
    if (html.length > MAX_HTML) html = html.slice(0, MAX_HTML);
  } catch (e) {
    console.error("link-analyze fetch error:", e);
    return jsonResponse({
      name: "N/A",
      price: null,
      currency: null,
      size: null,
      link: targetUrl,
      image: null,
      _fallback: true,
    });
  }

  try {
    const title = extractTitle(html);
    const ogTitle = extractMeta(html, "og:title");
    const ogImage = extractMeta(html, "og:image");
    const ogDesc = extractMeta(html, "og:description");
    const ogPrice = extractMeta(html, "og:price:amount");
    const ogCurrency = extractMeta(html, "og:price:currency");
    const jsonLd = extractJsonLd(html);

    let name = ogTitle || jsonLd?.name || title || "N/A";
    let price = ogPrice ? parseFloat(ogPrice) : jsonLd?.offers?.price ?? jsonLd?.offers?.[0]?.price ?? extractPriceFromHtml(html);
    let currency = ogCurrency || jsonLd?.offers?.priceCurrency || jsonLd?.offers?.[0]?.priceCurrency ?? extractCurrencyFromHtml(html);
    let size = jsonLd?.size || jsonLd?.additionalProperty?.find((p) => p.name === "Размер" || p.name === "Size")?.value ?? null;

    const needLLM = (!price && !name) || name === "N/A";
    if (needLLM && context.env) {
      const text = [title, ogTitle, ogDesc, stripHtml(html)].filter(Boolean).join("\n\n");
      const llm = await callLLM(text, context.env);
      if (llm) {
        if (llm.name) name = llm.name;
        if (llm.price != null) price = llm.price;
        if (llm.currency) currency = llm.currency;
        if (llm.size) size = llm.size;
      }
    }

    const imageUrl = ogImage || jsonLd?.image || (Array.isArray(jsonLd?.image) ? jsonLd.image[0] : null) || null;
    let imageBase64 = null;
    if (imageUrl) {
      imageBase64 = await fetchImageAsBase64(imageUrl, targetUrl);
    }

    const result = {
      name: typeof name === "string" ? name : "N/A",
      price: typeof price === "number" && !isNaN(price) ? price : null,
      currency: typeof currency === "string" ? currency : null,
      size: typeof size === "string" ? size : null,
      link: targetUrl,
      image: imageUrl,
      imageBase64: imageBase64 || null,
    };

    return jsonResponse(result);
  } catch (e) {
    console.error("link-analyze parse error:", e);
    return jsonResponse({
      name: "N/A",
      price: null,
      currency: null,
      size: null,
      link: targetUrl,
      image: null,
      _fallback: true,
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
