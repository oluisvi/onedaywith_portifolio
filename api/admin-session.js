const { readAdminSession } = require('../server/admin-auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).setHeader('Allow', 'GET').json({ ok: false, error: 'Método não permitido.' });
  res.setHeader('Cache-Control', 'no-store');
  const session = readAdminSession(req);
  return res.status(200).json({ ok: true, authenticated: Boolean(session), ...(session ? { username: session.username } : {}) });
};
