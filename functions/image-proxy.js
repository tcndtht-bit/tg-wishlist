/**
 * Cloudflare Pages Function: прокси для загрузки изображений с api.telegram.org
 * Решает проблему CORS — браузер не может fetch напрямую с api.telegram.org
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl || typeof imageUrl !== "string") {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!imageUrl.startsWith("https://api.telegram.org/")) {
    return new Response(JSON.stringify({ error: "Forbidden: only api.telegram.org URLs allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Telegram API returned ${response.status}`);

    const buffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(
      JSON.stringify({ base64: `data:${contentType};base64,${base64}` }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch image" }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
