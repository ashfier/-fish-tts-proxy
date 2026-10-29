export default async function handler(req: Request) {
  const url = new URL(req.url);

  if (url.pathname !== '/api/tts') {
    return new Response('Not Found', { status: 404 });
  }

  const text = url.searchParams.get('text');
  if (!text) {
    return new Response('Missing text parameter', { status: 400 });
  }

  const FISH_API_KEY = 'sk-fish-lVyNRIiKYWDiDKqkNxF1PPh5hj9Cp_mjHrV9C5H9I0I';
  const VOICE_ID = 'da6a6205c31d451fabb28c3d139adfa8';
  const MODEL = 's2.1-pro-free';

  try {
    const fishResponse = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_API_KEY}`,
        'Content-Type': 'application/json',
        'model': MODEL,
      },
      body: JSON.stringify({
        text: text,
        reference_id: VOICE_ID,
        format: 'mp3',
      }),
    });

    if (!fishResponse.ok) {
      const errorText = await fishResponse.text();
      console.error('Fish Audio Error:', errorText);
      return new Response(`Fish Audio API error: ${fishResponse.status}`, { status: fishResponse.status });
    }

    return new Response(fishResponse.body, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (e) {
    return new Response('TTS error: ' + e.message, { status: 502 });
  }
}

export const config = { path: '/api/tts' };
