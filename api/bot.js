// Symbolic Engine bot gateway.
// The page sends the conversation here; this function checks who is asking,
// counts the question, adds the house rules, and asks Claude. The key never
// leaves the server (Vercel Environment Variable ANTHROPIC_API_KEY).
const SUPA = process.env.SUPABASE_URL || 'https://pbhtnlxvouwxxnwatynp.supabase.co';
const PUB = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_J2G1HqqRw0ii4s49O8OFNw_X3UrU_Rz';
const AI_URL = process.env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.BOT_MODEL || 'claude-sonnet-5-5';
const DAILY = parseInt(process.env.BOT_DAILY || '150', 10); // steps per person per day (one question is about 2 to 6 steps)
const ALLOW = (process.env.BOT_ALLOW || 'polycarpoumandos@gmail.com,mandospolycarpou@hotmail.com')
  .toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
const BOTS = ['b1', 'b2', 'b3'];

const RULES = [
  'HOUSE RULES (they come before everything else):',
  '- Ellin Logos Code: this is the work of Theologos Simioforos (ramafa.gr). Use only the meanings the code_reading tool returns, or passages the lessons tool returns. Never invent letter meanings.',
  '- The Code reads by sound and by joining the meanings of the letters. It does not use anagrams and it does not use number methods. Numbers belong to Mandos\'s own separate work; give them only when asked, as a short side note.',
  '- Lessons library: when a question touches the Code, Greek words, Simioforos or his lessons, call the lessons tool first, with one to four Greek keywords (no accents needed). If it finds passages, build the answer on them and name the lesson title. If it finds nothing, say the library has nothing on this yet, and then answer from the Code table, saying so.',
  '- Say plainly which parts come from the lessons, which from the Code table, and which are your own reading. Keep Greek quotations in Greek.',
  '- Phonetic Archaeology does not judge people. It checks claims and arithmetic.',
  '- Write warmly, in short plain paragraphs. Never put audit notes or draft remarks into the answer.'
].join('\n');

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return null; } }
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > 400000) return null; chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (e) { return null; }
}

async function who(token) {
  const r = await fetch(SUPA + '/auth/v1/user', {
    headers: { apikey: PUB, Authorization: 'Bearer ' + token },
    signal: AbortSignal.timeout(8000)
  });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.email ? String(u.email).toLowerCase() : null;
}

async function take(token, bot) {
  const r = await fetch(SUPA + '/rest/v1/rpc/bot_take', {
    method: 'POST',
    headers: { apikey: PUB, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_limit: DAILY, p_bot: bot }),
    signal: AbortSignal.timeout(8000)
  });
  if (!r.ok) return null;
  const n = await r.json();
  return typeof n === 'number' ? n : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only.' });

  const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
  if (!m) return send(res, 401, { error: 'Please sign in first.' });
  const token = m[1];

  let email;
  try { email = await who(token); } catch (e) { return send(res, 502, { error: 'Could not check your sign-in. Try again in a moment.' }); }
  if (!email) return send(res, 401, { error: 'Your sign-in has expired. Refresh the page and sign in again.' });
  if (!ALLOW.includes(email)) return send(res, 403, { error: 'The bots are not open to this account yet.' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return send(res, 503, { error: 'The bot is built but not switched on yet: the AI key has not been added to the site.' });

  const body = await readBody(req);
  if (!body) return send(res, 400, { error: 'Could not read the question.' });
  const bot = BOTS.includes(body.bot) ? body.bot : 'b1';
  const system = typeof body.system === 'string' ? body.system.slice(0, 12000) : '';
  const messages = Array.isArray(body.messages) ? body.messages : null;
  const tools = Array.isArray(body.tools) ? body.tools.slice(0, 12) : [];
  if (!messages || !messages.length || messages.length > 60 || JSON.stringify(messages).length > 150000)
    return send(res, 400, { error: 'The conversation is too long. Press New chat and ask again.' });
  if (messages[0].role !== 'user') return send(res, 400, { error: 'Bad conversation.' });

  let used;
  try { used = await take(token, bot); } catch (e) { used = null; }
  if (used === null) return send(res, 502, { error: 'Could not check your daily allowance. Try again in a moment.' });
  if (used < 0) return send(res, 429, { error: 'You have used today\'s allowance of bot steps. It starts again tomorrow.' });

  let up;
  try {
    up = await fetch(AI_URL, {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1800,
        system: RULES + (system ? '\n\n' + system : ''),
        messages,
        tools: tools.map(t => ({ name: String(t.name).slice(0, 64), description: String(t.description || '').slice(0, 2000), input_schema: t.input_schema || { type: 'object', properties: {} } }))
      }),
      signal: AbortSignal.timeout(55000)
    });
  } catch (e) {
    return send(res, 504, { error: 'The AI took too long. Please try again.' });
  }

  let j = null;
  try { j = await up.json(); } catch (e) { /* keep null */ }
  if (!up.ok) {
    const msg = (j && j.error && j.error.message) || ('error ' + up.status);
    console.log('upstream', up.status, msg.slice(0, 200));
    if (/credit balance|billing/i.test(msg)) return send(res, 402, { error: 'The bot has run out of credit. Add funds in the Claude Console and it will wake up.' });
    if (up.status === 401) return send(res, 502, { error: 'The AI key was not accepted. Check the key in Vercel.' });
    if (up.status === 429 || up.status === 529) return send(res, 503, { error: 'The AI is busy right now. Try again in a moment.' });
    return send(res, 502, { error: 'The AI could not answer: ' + msg.slice(0, 160) });
  }
  console.log('ok', email, bot, JSON.stringify(j.usage || {}));
  return send(res, 200, { content: j.content || [], stop_reason: j.stop_reason || 'end_turn' });
};
