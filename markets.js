// Vercel serverless function: /api/markets
// Fetches index and commodity quotes from Stooq (free CSV) and returns JSON.
const LIST = [
  ['^spx', 'S&P 500'], ['^ukx', 'FTSE 100'],
  ['gc.f', 'Gold'], ['si.f', 'Silver'], ['cl.f', 'WTI Oil'], ['cb.f', 'Brent'],
  ['ng.f', 'Nat Gas'], ['hg.f', 'Copper'], ['pl.f', 'Platinum'],
  ['zw.f', 'Wheat'], ['kc.f', 'Coffee'], ['sb.f', 'Sugar']
];
module.exports = async (req, res) => {
  try {
    const syms = LIST.map(x => encodeURIComponent(x[0])).join(',');
    const r = await fetch('https://stooq.com/q/l/?s=' + syms + '&f=sd2t2oc&h&e=csv');
    const text = await r.text();
    const rows = {};
    text.trim().split('\n').slice(1).forEach(line => {
      const c = line.split(',');
      rows[(c[0] || '').toLowerCase()] = { open: parseFloat(c[3]), close: parseFloat(c[4]) };
    });
    const out = LIST.map(([s, name]) => {
      const q = rows[s.toLowerCase()] || {};
      const ok = isFinite(q.close) && isFinite(q.open) && q.open !== 0;
      return { name, price: isFinite(q.close) ? q.close : null, pct: ok ? (q.close - q.open) / q.open * 100 : null };
    });
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(out);
  } catch (e) {
    res.status(502).json({ error: 'upstream' });
  }
};
