const { requireAdmin, checkSameOrigin } = require('../server/admin-auth');
const { listProjects, normalizeProject, saveProject, removeProject, httpError } = require('../server/catalog-store');

module.exports = async function handler(req, res) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) return res.status(405).setHeader('Allow', 'GET, POST, PUT, DELETE').json({ ok: false, error: 'Método não permitido.' });
  if (req.method !== 'GET' && !checkSameOrigin(req)) return res.status(403).json({ ok: false, error: 'Origem inválida.' });
  if (!requireAdmin(req, res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') return res.status(200).json({ ok: true, projects: await listProjects() });
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    if (req.method === 'DELETE') {
      const removed = await removeProject(body.id || req.query?.id);
      return res.status(200).json({ ok: true, project: removed });
    }
    let prior = {};
    if (req.method === 'PUT') {
      if (typeof body.id !== 'string') throw httpError(400, 'Identificador inválido.');
      prior = (await listProjects()).find((project) => project.id === body.id);
      if (!prior) throw httpError(404, 'Projeto não encontrado.');
    }
    const project = normalizeProject(body, prior);
    await saveProject(project);
    return res.status(req.method === 'POST' ? 201 : 200).json({ ok: true, project });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ ok: false, error: error.statusCode ? error.message : 'Não foi possível atualizar o projeto.' });
  }
};
