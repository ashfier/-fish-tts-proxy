exports.handler = async (event, context) => {
  // 只允许 GET 请求
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 获取 URL 中的 text 参数
  const text = event.queryStringParameters.text;
  if (!text) {
    return { statusCode: 400, body: 'Missing text parameter' };
  }

  // ⚠️ 你的密钥和音色 ID
  const FISH_API_KEY = 'sk-fish-lVyNRIiKYWDiDKqkNxF1PPh5hj9Cp_mjHrV9C5H9I0I';
  const VOICE_ID = 'da6a6205c31d451fabb28c3d139adfa8';
  const MODEL = 's2.1-pro-free';

  try {
    // 向 Fish Audio 发起请求（这里用官方 api 域名，因为 Netlify 服务器在海外，不会被墙）
    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_API_KEY}`,
        'Content-Type': 'application/json',
        'model': MODEL
      },
      body: JSON.stringify({
        text: text,
        reference_id: VOICE_ID,
        format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fish API Error:', errorText);
      return { statusCode: response.status, body: `Fish API Error: ${response.status}` };
    }

    // Netlify Functions 需要把音频转成 Base64 格式返回
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

