// Symbolic Engine bot gateway.
// The page sends the conversation here; this function checks who is asking,
// counts the question, adds the house rules, and asks Claude. The key never
// leaves the server (Vercel Environment Variable ANTHROPIC_API_KEY).
const SUPA = process.env.SUPABASE_URL || 'https://pbhtnlxvouwxxnwatynp.supabase.co';
const PUB = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_J2G1HqqRw0ii4s49O8OFNw_X3UrU_Rz';
const AI_URL = process.env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.BOT_MODEL || 'claude-sonnet-5-5';
const FREE_MODEL = process.env.BOT_FREE_MODEL || MODEL;
const ALLOW = (process.env.BOT_ALLOW || 'polycarpoumandos@gmail.com,mandospolycarpou@hotmail.com')
  .toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
const BOTS = ['b1', 'b2', 'b3', 'b4'];
const CLOSED = true; // temporary closure for members; set to false to reopen

const COMMON = [
  'HOUSE RULES (they come before everything else):',
  '- Phonetic Archaeology does not judge people. It checks claims and arithmetic.',
  '- Write warmly, in short plain paragraphs. Never put audit notes or draft remarks into the answer.'
].join('\n');
const CODE = [
  '- You think and speak in the Ellin Logos Code, the method of Theologos Simioforos (ramafa.gr). It is your own working language, not a book you quote. State what a word says directly ("ζωή (zoi) joins ...") as someone who has made the method their own. Never say "according to the lesson", never mention lessons, lesson numbers, parts, timestamps, titles, "the library" or "passages". Name Theologos Simioforos only when asked where the method comes from, or once, to credit him.',
  '- The core of the method. Greek words are small beings of meaning (ελληνίδες λέξεις, ellinides lexeis). The consonants (άφωνα, afona) carry the core meaning of a word; the seven vowels (φωνήεντα, foniénta) are light: they show how that consonant acts, and every vowel up to the next consonant belongs to the consonant before it. Read a word letter by letter, in order, joining the meanings. Vowels: Α alpha = the original power; Ε epsilon = going out, movement, extension; Ι iota = coming down little by little, unseen, continuously fed; Η eta = double descent, becoming visible; Υ ypsilon = great gathering; Ο omicron = a limited space; Ω omega = the earthly space, the end of the work. Rule of the hidden consonant: a word that begins with a vowel has a consonant hidden before it; if you do not know which, put Δ (power) in front. Upper (heavenly) consonants speak of high things, lower (earthly) ones of earthly things. Use the code_reading tool for the exact meaning of every letter and never invent one.',
  '- The Code reads by sound and by joining the meanings of the letters. It does not use anagrams and it does not use number methods. Numbers belong to Mandos\'s own separate work; give them only when asked, as a short side note.',
  '- Knowledge store: when a question touches the Code, Greek words or Simioforos, call the lessons tool first, with one to four Greek keywords (no accents needed), and absorb what it returns as your own understanding. If it finds nothing, answer from the core of the method and the code_reading tool, and say plainly that you are reasoning it out and not quoting.',
  '- Be honest about what is what: say "my own reading" when you go beyond what the Code states, and keep Greek quotations in Greek.'
].join('\n');
const ACADEMIC = 'Bot 2 is the academic bot. The Ellin Logos Code is not part of its answers unless Mandos asks for it by name. Say what is established, what is general knowledge and what is disputed, and keep Greek quotations in Greek.';
const rulesFor = b => COMMON + (b === 'b3' || b === 'b4' ? '\n' + CODE : b === 'b2' ? '\n' + ACADEMIC : '');


// Prompt caching: the instructions, the tool list and the conversation so far are the same on every step
// of a question, so the AI re-reads them at a fraction of the price instead of paying full price each time.
function withCache(messages) {
  try {
    const m = JSON.parse(JSON.stringify(messages));
    const last = m[m.length - 1];
    if (typeof last.content === 'string') last.content = [{ type: 'text', text: last.content, cache_control: { type: 'ephemeral' } }];
    else if (Array.isArray(last.content) && last.content.length) last.content[last.content.length - 1].cache_control = { type: 'ephemeral' };
    return m;
  } catch (e) { return messages; }
}

// Answer cache: an identical question (same bot, same instructions, same conversation, same tool results) gets the
// saved answer back for free and does not use up a step. The key is a keyed hash, so nobody can guess or plant one.
const CACHE_V = 'v1'; // change this text to empty the cache after the library changes a lot
const crypto = require('crypto');
function cacheKey(secret, parts) { return crypto.createHmac('sha256', secret).update(CACHE_V + JSON.stringify(parts)).digest('hex'); }
async function cacheGet(token, k) {
  try {
    const r = await fetch(SUPA + '/rest/v1/rpc/bot_cache_get', { method: 'POST', headers: { apikey: PUB, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_k: k }), signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    const j = await r.json();
    return j && Array.isArray(j.content) ? j : null;
  } catch (e) { return null; }
}
async function cachePut(token, k, resp) {
  try {
    await fetch(SUPA + '/rest/v1/rpc/bot_cache_put', { method: 'POST', headers: { apikey: PUB, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_k: k, p_resp: resp }), signal: AbortSignal.timeout(4000) });
  } catch (e) { /* the cache is a bonus; ignore failures */ }
}

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
  if (!u || !u.email) return null;
  return { email: String(u.email).toLowerCase(), confirmed: !!(u.email_confirmed_at || u.confirmed_at) };
}

// Asks the database for a step. The limits live in the bot_limits table (owner_day, free_day, free_hour, free_pool),
// so they can be changed without touching the code. Returns { ok, ... } or null if the check itself failed.
async function take(token, bot) {
  const r = await fetch(SUPA + '/rest/v1/rpc/bot_take_tier', {
    method: 'POST',
    headers: { apikey: PUB, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_bot: bot, p_take: true }),
    signal: AbortSignal.timeout(8000)
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j && typeof j.ok === 'boolean' ? j : null;
}

function wait(min) {
  if (min >= 90) return 'about ' + Math.round(min / 60) + ' hours';
  if (min >= 60) return 'about an hour';
  return min + ' minute' + (min === 1 ? '' : 's');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only.' });

  const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
  if (!m) return send(res, 401, { error: 'Please sign in first.' });
  const token = m[1];

  let me;
  try { me = await who(token); } catch (e) { return send(res, 502, { error: 'Could not check your sign-in. Try again in a moment.' }); }
  if (!me) return send(res, 401, { error: 'Your sign-in has expired. Refresh the page and sign in again.' });
  if (!me.confirmed) return send(res, 403, { error: 'Please confirm your email first: open the link we sent you, then sign in again.' });
  const email = me.email;
  const owner = ALLOW.includes(email);
  if (CLOSED && !owner) return send(res, 503, { error: 'The Research Engine is resting for a short while. Please come back soon.' });

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

  const sysText = rulesFor(bot) + (system ? '\n\n' + system : '');
  const toolDefs = tools.map(t => [t.name, t.description, t.input_schema]);
  const ck = cacheKey(key, [owner ? MODEL : FREE_MODEL, sysText, messages, toolDefs, body.tool_choice || null]);
  const hit = await cacheGet(token, ck);
  if (hit) { console.log('cache-hit', email, bot); return send(res, 200, { content: hit.content, stop_reason: hit.stop_reason || 'end_turn', cached: true }); }

  let slot;
  try { slot = await take(token, bot); } catch (e) { slot = null; }
  if (slot === null) return send(res, 502, { error: 'Could not check your allowance. Try again in a moment.' });
  if (!slot.ok) {
    if (slot.reason === 'hour') return send(res, 429, { error: 'You have used this hour\'s steps. More are free in ' + wait(slot.wait_min || 60) + '.' });
    if (slot.reason === 'pool') return send(res, 429, { error: 'The free bots have reached their limit for today. They start again in ' + wait(slot.wait_min || 60) + '.' });
    return send(res, 429, { error: 'You have used today\'s steps. They start again at midnight Cyprus time, in ' + wait(slot.wait_min || 60) + '.' });
  }

  let up;
  try {
    up = await fetch(AI_URL, {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: owner ? MODEL : FREE_MODEL,
        max_tokens: owner ? 1800 : 1200,
        system: [{ type: 'text', text: sysText, cache_control: { type: 'ephemeral' } }],
        messages: withCache(messages),
        ...(body.tool_choice && body.tool_choice.type === 'none' && tools.length ? { tool_choice: { type: 'none' } } : {}),
        tools: tools.map((t, i) => ({ name: String(t.name).slice(0, 64), description: String(t.description || '').slice(0, 2000), input_schema: t.input_schema || { type: 'object', properties: {} }, ...(i === tools.length - 1 ? { cache_control: { type: 'ephemeral' } } : {}) }))
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
  console.log('ok', email, bot, j.stop_reason, (j.content || []).map(b => b.type).join('+'), JSON.stringify(j.usage || {}));
  if ((j.stop_reason === 'end_turn' || j.stop_reason === 'tool_use') && Array.isArray(j.content) && j.content.length) await cachePut(token, ck, { content: j.content, stop_reason: j.stop_reason });
  return send(res, 200, { content: j.content || [], stop_reason: j.stop_reason || 'end_turn', left: slot });
};
