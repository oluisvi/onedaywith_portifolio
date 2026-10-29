const { clearAdminCookie, checkSameOrigin } = require('../server/admin-auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).setHeader('Allow', 'POST').json({ ok: false, error: 'Método não permitido.' });
  if (!checkSameOrigin(req)) return res.status(403).json({ ok: false, error: 'Origem inválida.' });
  res.setHeader('Set-Cookie', clearAdminCookie());
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true });
};
