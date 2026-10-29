export default async function onRequest(context) {
  const { request, env } = context;

  // 1. 处理跨域预检请求（CORS）
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // 2. 解析前端传来的 text 参数
  const url = new URL(request.url);
  const text = url.searchParams.get("text");

  if (!text) {
    return new Response("Missing text parameter", { 
      status: 400,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }

  // 3. 读取环境变量
  const API_KEY = env.FISH_API_KEY;
  const REFERENCE_ID = env.FISH_REFERENCE_ID;

  if (!API_KEY || !REFERENCE_ID) {
    return new Response("Missing Environment Variables", { 
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }

  try {
    // 4. 请求 Fish Audio 接口 (已替换为 fishaudio.org 域名)
    const response = await fetch("https://api.fishaudio.org/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        reference_id: REFERENCE_ID,
        format: "mp3"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Fish API Error: ${response.status} - ${errorText}`, {
        status: response.status,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    // 5. 返回音频流
    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(`Proxy Error: ${error.message}`, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}

// EdgeOne 专用兼容写法
export const onRequestFetch = onRequest;
