const crypto = require('node:crypto');

const COOKIE_NAME = 'odw_admin';
const SESSION_SECONDS = 8 * 60 * 60;

function secureEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be configured with at least 32 characters');
  return secret;
}

function sign(payload) {
  return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function cookieOptions(maxAge) {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

function createAdminCookie(username) {
  const payload = Buffer.from(JSON.stringify({ sub: username, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${COOKIE_NAME}=${payload}.${sign(payload)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

function readAdminSession(req) {
  const cookies = String(req.headers.cookie || '').split(';').map((part) => part.trim());
  const value = cookies.find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!value) return null;
  const splitAt = value.lastIndexOf('.');
  if (splitAt < 0) return null;
  const payload = value.slice(0, splitAt);
  let expected;
  try { expected = sign(payload); } catch { return null; }
  if (!secureEqual(value.slice(splitAt + 1), expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.sub !== 'string' || data.sub !== process.env.ADMIN_USERNAME || !Number.isFinite(data.exp) || data.exp <= Date.now() / 1000) return null;
    return { username: data.sub, expiresAt: data.exp };
  } catch { return null; }
}

function requireAdmin(req, res) {
  if (readAdminSession(req)) return true;
  res.status(401).json({ ok: false, error: 'Sessão expirada. Entre novamente.' });
  return false;
}

function clearAdminCookie() { return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`; }

function checkSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  try { return new URL(origin).origin === `${proto}://${host}`; } catch { return false; }
}

module.exports = { COOKIE_NAME, SESSION_SECONDS, secureEqual, createAdminCookie, readAdminSession, requireAdmin, clearAdminCookie, checkSameOrigin };
