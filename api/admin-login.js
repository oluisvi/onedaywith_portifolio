const { createAdminCookie, secureEqual, checkSameOrigin } = require('../server/admin-auth');

const failures = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

function clientKey(req) { return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim(); }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).setHeader('Allow', 'POST').json({ ok: false, error: 'Método não permitido.' });
  if (!checkSameOrigin(req)) return res.status(403).json({ ok: false, error: 'Origem inválida.' });
  const key = clientKey(req);
  const now = Date.now();
  const attempts = (failures.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (attempts.length >= MAX_FAILURES) return res.status(429).json({ ok: false, error: 'Muitas tentativas. Aguarde alguns minutos.' });
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || !process.env.ADMIN_SESSION_SECRET) return res.status(503).json({ ok: false, error: 'Acesso administrativo não configurado.' });
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const valid = secureEqual(body.username || '', username) && secureEqual(body.password || '', password);
  if (!valid) {
    attempts.push(now);
    failures.set(key, attempts);
    return res.status(401).json({ ok: false, error: 'Usuário ou senha incorretos.' });
  }
  failures.delete(key);
  res.setHeader('Set-Cookie', createAdminCookie(username));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, username });
};
