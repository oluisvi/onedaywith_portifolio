const { listProjects } = require('../server/catalog-store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).setHeader('Allow', 'GET').json({ ok: false, error: 'Método não permitido.' });
  try {
    const projects = (await listProjects()).filter((project) => project.status === 'published');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ ok: true, projects });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ ok: false, error: error.statusCode ? error.message : 'Não foi possível carregar o catálogo.' });
  }
};
