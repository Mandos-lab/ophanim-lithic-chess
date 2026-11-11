/* Philosophy From A Stone: natural voice for read-aloud.
   GET /api/tts?l=el&t=<text>[&r=0.9][&v=Aoede]  ->  audio/mpeg
   The Google key lives only here, in the Vercel setting GOOGLE_TTS_KEY. It never reaches the browser.
   Every answer is cached by the web for a year, so each sentence is paid for once. */

const LANG = { el: 'el-GR', he: 'he-IL', ar: 'ar-XA', en: 'en-GB' };
const VOICES = ['Achird','Algenib','Algieba','Alnilam','Charon','Enceladus','Fenrir','Iapetus','Orus','Puck','Rasalgethi','Sadachbia','Sadaltager','Schedar','Umbriel','Zubenelgenubi','Achernar','Aoede','Autonoe','Callirrhoe','Despina','Erinome','Gacrux','Kore','Laomedeia','Leda','Pulcherrima','Sulafat','Vindemiatrix','Zephyr'];   // first 16 male, then 14 female
const MAX = 400;

function fail(res, code, msg) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(code).json({ error: msg });
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'GET only');
  const key = process.env.GOOGLE_TTS_KEY;
  if (!key) return fail(res, 503, 'voice not set up');

  // only our own pages (or someone typing the address into the browser) may use it
  const h = req.headers || {};
  const site = h['sec-fetch-site'];
  let ok = site === 'same-origin' || site === 'none';
  if (!ok && h.referer && h.host) { try { ok = new URL(h.referer).host === h.host; } catch (e) {} }
  if (!ok) return fail(res, 403, 'not allowed');

  const q = req.query || {};
  const lang = String(q.l || '').toLowerCase();
  const code = LANG[lang];
  if (!code) return fail(res, 400, 'language not supported');
  const text = String(q.t || '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return fail(res, 400, 'no text');
  if (text.length > MAX) return fail(res, 400, 'text too long');
  let rate = parseFloat(q.r); if (!(rate >= 0.5 && rate <= 1.5)) rate = 1;
  const want = String(q.v || process.env.GOOGLE_TTS_VOICE || 'Charon');
  const voice = VOICES.indexOf(want) >= 0 ? want : 'Charon';

  try {
    const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: code, name: code + '-Chirp3-HD-' + voice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: rate }
      })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.audioContent) return fail(res, 502, (j.error && j.error.message) || 'voice service refused');
    const buf = Buffer.from(j.audioContent, 'base64');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.status(200).send(buf);
  } catch (e) {
    return fail(res, 502, 'voice service unreachable');
  }
}
