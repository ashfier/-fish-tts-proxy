export default async function handler(event, context) {
  const text = new URL(event.rawUrl).searchParams.get('text');

  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing text' }) };
  }
  if (text.length > 500) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Too long' }) };
  }

  const FISH_API_KEY = 'sk-fish-lVyNRIiKYWDiDKqkNxF1PPh5hj9Cp_mjHrV9C5H9I0I';
  const VOICE_ID = 'da6a6205c31d451fabb28c3d139adfa8';
  const MODEL = 's2.1-pro-free';

  try {
    const resp = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_API_KEY}`,
        'Content-Type': 'application/json',
        'model': MODEL,
      },
      body: JSON.stringify({ text, reference_id: VOICE_ID, format: 'mp3' }),
    });

    if (!resp.ok) {
      return { statusCode: resp.status, body: await resp.text() };
    }

    const buf = Buffer.from(await resp.arrayBuffer());
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
      body: buf.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: e.message }) };
  }
}
