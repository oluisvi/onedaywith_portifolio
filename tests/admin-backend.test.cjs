const test = require('node:test');
const assert = require('node:assert/strict');
const { createAdminCookie, readAdminSession } = require('../server/admin-auth');
const { normalizeProject, isManagedBlobUrl } = require('../server/catalog-store');

test('signed admin sessions validate and reject tampered or expired cookies', () => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
  process.env.ADMIN_USERNAME = 'one-day-editor';
  const cookie = createAdminCookie(process.env.ADMIN_USERNAME);
  const request = { headers: { cookie: cookie.split(';')[0] } };
  assert.equal(readAdminSession(request)?.username, process.env.ADMIN_USERNAME);
  request.headers.cookie = `${cookie.split(';')[0]}x`;
  assert.equal(readAdminSession(request), null);
  delete process.env.ADMIN_SESSION_SECRET;
  assert.equal(readAdminSession({ headers: { cookie: cookie.split(';')[0] } }), null);
});

test('project input normalizes valid fields and rejects unsafe media URLs', () => {
  const project = normalizeProject({
    title: '  Reel de teste ', category: 'Filme', description: '', videoUrl: '/assets/reel.mp4',
    posterUrl: 'https://media.public.blob.vercel-storage.com/poster.webp',
    instagramUrl: 'https://www.instagram.com/onedaywitth/reel/abc/', status: 'published', order: '2',
  });
  assert.equal(project.title, 'Reel de teste');
  assert.equal(project.order, 2);
  assert.throws(() => normalizeProject({ title: 'X', category: 'A', videoUrl: 'javascript:alert(1)', status: 'published' }), /URL/);
  assert.equal(isManagedBlobUrl(project.posterUrl), true);
  assert.equal(isManagedBlobUrl('/assets/poster.webp'), false);
});
