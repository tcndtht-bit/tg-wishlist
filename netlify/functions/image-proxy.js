/**
 * Netlify Function: прокси для загрузки изображений с api.telegram.org
 * Решает проблему CORS — браузер не может fetch напрямую с api.telegram.org
 */
exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url || typeof url !== "string") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing url parameter" }),
    };
  }

  // Безопасность: только api.telegram.org
  if (!url.startsWith("https://api.telegram.org/")) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Forbidden: only api.telegram.org URLs allowed" }),
    };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Telegram API returned ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        base64: `data:${contentType};base64,${base64}`,
      }),
    };
  } catch (e) {
    console.error("image-proxy error:", e.message);
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to fetch image" }),
    };
  }
};
