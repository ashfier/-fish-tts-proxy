export const config = { path: '/api/tts' };

const FISH_API_KEY = 'sk-fish-lVyNRIiKYWDiDKqkNxF1PPh5hj9Cp_mjHrV9C5H9I0I';
const FISH_VOICE_ID = 'da6a6205c31d451fabb28c3d139adfa8';
const FISH_MODEL = 's2.1-pro-free';

export default async function handler(req: Request) {
  const url = new URL(req.url);
  if (url.pathname !== '/api/tts') return new Response('Not Found', { status: 404 });

  const text = url.searchParams.get('text');
  if (!text) return new Response('Missing text', { status: 400 });
  if (text.length > 500) return new Response('Too long', { status: 400 });

  try {
    const resp = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text, reference_id: FISH_VOICE_ID,
        model: FISH_MODEL, format: 'mp3',
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return new Response('Fish failed: ' + resp.status, { status: 502 });
    return new Response(resp.body, { headers: { 'Content-Type': 'audio/mpeg' } });
  } catch (e) {
    return new Response('TTS error: ' + e.message, { status: 502 });
  }
}
