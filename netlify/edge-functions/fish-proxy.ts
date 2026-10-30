import type { Config, Context } from "@netlify/edge-functions";

export default async (req: Request, context: Context) => {
  // 处理跨域预检
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, model",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 从 Netlify 环境变量读取真 Key
  const apiKey = Netlify.env.get("FISH_API_KEY");
  if (!apiKey) {
    return new Response("FISH_API_KEY not configured", { status: 500 });
  }

  const upstreamUrl = "https://api.fish.audio/v1/tts";
  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.delete("host");

  try {
    const upstreamReq = new Request(upstreamUrl, {
      method: "POST",
      headers,
      body: req.body,
    });

    const upstreamRes = await fetch(upstreamReq);
    
    const resHeaders = new Headers(upstreamRes.headers);
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Expose-Headers", "Content-Type");

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  } catch (error) {
    return new Response(`Proxy Error: ${error.message}`, { status: 502 });
  }
};

// 这条规则非常重要，它直接接管 /v1/tts 请求
export const config: Config = {
  path: "/v1/tts",
};
