/**
 * Cloudflare Pages Function: анализ ссылки на товар
 * Fetch страницы → парсинг og:* / JSON-LD → при необходимости LLM (OpenRouter/Groq)
 */
const USER_AGENT =
  "Mozilla/5.0 (compatible; WishlistBot/1.0; +https://pages.dev)";
const MAX_HTML = 80000;
const LLM_PROMPT = `Проанализируй текст страницы товара и извлеки информацию. Верни ТОЛЬКО валидный JSON без пояснений:
{"name":"строка","price":число или null,"currency":"строка или null","size":"строка или null"}

1. name — название товара (существительное или фраза). Если нет — "N/A".
2. price и currency — связка число + валюта (BYN, RUB, USD, EUR, KZT и т.п.). Если нет — null.
3. size — размер для одежды/обуви (EU, US, XXS-XL). Иначе null.`;

function extractMeta(html, name) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,
    "i"
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
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

  try {
    const res = await fetch(targetUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let html = await res.text();
    if (html.length > MAX_HTML) html = html.slice(0, MAX_HTML);

    const title = extractTitle(html);
    const ogTitle = extractMeta(html, "og:title");
    const ogImage = extractMeta(html, "og:image");
    const ogDesc = extractMeta(html, "og:description");
    const ogPrice = extractMeta(html, "og:price:amount");
    const ogCurrency = extractMeta(html, "og:price:currency");
    const jsonLd = extractJsonLd(html);

    let name = ogTitle || jsonLd?.name || title || "N/A";
    let price = ogPrice ? parseFloat(ogPrice) : jsonLd?.offers?.price ?? jsonLd?.offers?.[0]?.price ?? null;
    let currency = ogCurrency || jsonLd?.offers?.priceCurrency || jsonLd?.offers?.[0]?.priceCurrency || null;
    let size = jsonLd?.size || jsonLd?.additionalProperty?.find((p) => p.name === "Размер" || p.name === "Size")?.value || null;

    const needLLM = !price || !name || name === "N/A";
    if (needLLM) {
      const text = [title, ogTitle, ogDesc, stripHtml(html)].filter(Boolean).join("\n\n");
      const llm = await callLLM(text, context.env);
      if (llm) {
        if (llm.name) name = llm.name;
        if (llm.price != null) price = llm.price;
        if (llm.currency) currency = llm.currency;
        if (llm.size) size = llm.size;
      }
    }

    const result = {
      name: typeof name === "string" ? name : "N/A",
      price: typeof price === "number" && !isNaN(price) ? price : null,
      currency: typeof currency === "string" ? currency : null,
      size: typeof size === "string" ? size : null,
      link: targetUrl,
      image: ogImage || jsonLd?.image || (Array.isArray(jsonLd?.image) ? jsonLd.image[0] : null) || null,
    };

    return jsonResponse(result);
  } catch (e) {
    console.error("link-analyze error:", e);
    return jsonResponse(
      { error: "Failed to fetch or parse page", message: String(e?.message || e) },
      502
    );
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
