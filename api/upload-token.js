const { handleUpload } = require('@vercel/blob/client');
const { readAdminSession, checkSameOrigin } = require('../server/admin-auth');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).setHeader('Allow', 'POST').json({ ok: false, error: 'Método não permitido.' });
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!checkSameOrigin(req) || !readAdminSession(req)) throw new Error('Not authenticated');
        if (typeof pathname !== 'string' || pathname.length > 180 || pathname.includes('..') || pathname.startsWith('/')) throw new Error('Caminho de arquivo inválido.');
        if (clientPayload && clientPayload.length > 500) throw new Error('Dados extras inválidos.');
        return { allowedContentTypes: ALLOWED_TYPES, maximumSizeInBytes: 100 * 1024 * 1024, addRandomSuffix: true, tokenPayload: '{}' };
      },
      onUploadCompleted: async () => {},
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({ ok: false, error: 'Não foi possível iniciar o envio do arquivo.' });
  }
};
