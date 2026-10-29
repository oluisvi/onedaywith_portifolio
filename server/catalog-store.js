const { delete: deleteBlob } = require('@vercel/blob');

const COLUMNS = ['id', 'title', 'category', 'description', 'videoUrl', 'posterUrl', 'instagramUrl', 'status', 'order', 'createdAt', 'updatedAt'];
const MAX_TITLE = 120;
const MAX_DESCRIPTION = 1200;
const MAX_PROJECTS = 300;

function httpError(status, message) { const error = new Error(message); error.statusCode = status; return error; }
function requiredEnv(name) { const value = process.env[name]; if (!value) throw new Error(`${name} is not configured`); return value; }

function safeMediaUrl(value, field, optional = true) {
  if (value === '' && optional) return '';
  if (typeof value !== 'string' || value.length > 2048) throw httpError(400, `${field}: URL inválida.`);
  if (value.startsWith('/assets/')) {
    if (value.includes('..') || value.includes('\\') || /[?#]/.test(value)) throw httpError(400, `${field}: caminho de mídia inválido.`);
    return value;
  }
  let parsed;
  try { parsed = new URL(value); } catch { throw httpError(400, `${field}: informe uma URL https ou um arquivo de /assets/.`); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw httpError(400, `${field}: informe uma URL https válida.`);
  if (field === 'instagramUrl' && !/(^|\.)instagram\.com$/i.test(parsed.hostname)) throw httpError(400, 'Instagram: use um link do Instagram.');
  return parsed.toString();
}

function normalizeProject(input, prior = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw httpError(400, 'Dados do projeto inválidos.');
  const text = (key, max, fallback = '') => {
    const value = input[key] === undefined ? fallback : input[key];
    if (typeof value !== 'string' || value.trim().length > max) throw httpError(400, `${key}: texto inválido.`);
    return value.trim();
  };
  const title = text('title', MAX_TITLE);
  const category = text('category', 60);
  const description = text('description', MAX_DESCRIPTION);
  if (!title || !category) throw httpError(400, 'Preencha o título e a categoria.');
  const status = input.status === undefined ? (prior.status || 'draft') : input.status;
  if (!['published', 'draft'].includes(status)) throw httpError(400, 'Status inválido.');
  const order = input.order === undefined ? (prior.order ?? 0) : Number(input.order);
  if (!Number.isInteger(order) || order < 0 || order > 100000) throw httpError(400, 'Ordem inválida.');
  return {
    id: prior.id || (typeof input.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(input.id) ? input.id : cryptoId()),
    title,
    category,
    description,
    videoUrl: safeMediaUrl(input.videoUrl === undefined ? (prior.videoUrl || '') : input.videoUrl, 'Vídeo'),
    posterUrl: safeMediaUrl(input.posterUrl === undefined ? (prior.posterUrl || '') : input.posterUrl, 'Capa'),
    instagramUrl: safeMediaUrl(input.instagramUrl === undefined ? (prior.instagramUrl || '') : input.instagramUrl, 'instagramUrl'),
    status,
    order,
    createdAt: prior.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function cryptoId() { return `p-${require('node:crypto').randomUUID()}`; }

function normalizeRow(row) {
  const project = {};
  for (const key of COLUMNS) project[key] = row?.[key] ?? '';
  project.order = Number(project.order) || 0;
  return project;
}

async function callSheet(action, project) {
  const endpoint = requiredEnv('SHEETS_API_URL');
  const secret = requiredEnv('SHEETS_API_SECRET');
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, secret, ...(project ? { project } : {}) }),
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
  } catch { throw httpError(502, 'Não foi possível conectar ao catálogo.'); }
  if (!response.ok) throw httpError(502, 'O catálogo não respondeu corretamente.');
  let data;
  try { data = await response.json(); } catch { throw httpError(502, 'Resposta inválida do catálogo.'); }
  if (!data?.ok) throw httpError(502, 'Não foi possível atualizar o catálogo.');
  return data;
}

async function listProjects() {
  const data = await callSheet('list');
  if (!Array.isArray(data.projects) || data.projects.length > MAX_PROJECTS) throw httpError(502, 'Lista de projetos inválida.');
  return data.projects.map(normalizeRow).sort((a, b) => a.order - b.order || String(a.createdAt).localeCompare(String(b.createdAt)));
}

async function saveProject(project) {
  const existing = await listProjects();
  if (!existing.some((item) => item.id === project.id) && existing.length >= MAX_PROJECTS) throw httpError(400, 'O catálogo atingiu o limite de projetos.');
  await callSheet('upsert', project);
}

function isManagedBlobUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com') && !url.username && !url.password;
  } catch { return false; }
}

async function removeProject(id) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw httpError(400, 'Identificador inválido.');
  const current = await listProjects();
  const removed = current.find((project) => project.id === id);
  if (!removed) throw httpError(404, 'Projeto não encontrado.');
  await callSheet('delete', { id });
  const remaining = await listProjects();
  const retained = new Set(remaining.flatMap((project) => [project.videoUrl, project.posterUrl]));
  const candidates = new Set([removed.videoUrl, removed.posterUrl].filter(isManagedBlobUrl));
  for (const url of candidates) {
    if (retained.has(url)) continue;
    try { await deleteBlob(url); } catch (error) {
      // A stale/unavailable Blob must not undo a successful catalog deletion.
      if (process.env.NODE_ENV !== 'production') console.warn('Blob cleanup failed:', error?.message);
    }
  }
  return removed;
}

module.exports = { COLUMNS, httpError, normalizeProject, listProjects, saveProject, removeProject, isManagedBlobUrl };
