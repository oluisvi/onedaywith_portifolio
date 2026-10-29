const CATALOG_TAB = 'Catalogo';
const CATALOG_SPREADSHEET_ID = '1cmfWDTNEDsLs7gpRRvezM1yoYZFZqe0w-6BNK6eBvvA';
const CATALOG_COLUMNS = ['id', 'title', 'category', 'description', 'videoUrl', 'posterUrl', 'instagramUrl', 'status', 'order', 'createdAt', 'updatedAt'];

/** Run once from either a spreadsheet-bound or standalone Apps Script project. */
function setupPortfolioCatalog() {
  const spreadsheet = SpreadsheetApp.openById(CATALOG_SPREADSHEET_ID);
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  properties.setProperty('SHEET_NAME', CATALOG_TAB);
  let sheet = spreadsheet.getSheetByName(CATALOG_TAB);
  if (!sheet) sheet = spreadsheet.insertSheet(CATALOG_TAB);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, CATALOG_COLUMNS.length).setValues([CATALOG_COLUMNS]);
  if (sheet.getLastRow() > 0) {
    const actual = sheet.getRange(1, 1, 1, CATALOG_COLUMNS.length).getValues()[0].map(String);
    if (actual.join('|') !== CATALOG_COLUMNS.join('|')) throw new Error('A primeira linha da aba Catalogo precisa conter os cabeçalhos esperados, na ordem documentada.');
  }
  const hasSecret = Boolean(getApiSecret());
  return { ok: true, spreadsheetId: spreadsheet.getId(), sheet: CATALOG_TAB, apiSecretConfigured: hasSecret };
}

/** Store SHEETS_API_SECRET in Apps Script Project Settings > Script Properties. */
function getApiSecret() {
  return PropertiesService.getScriptProperties().getProperty('SHEETS_API_SECRET') || '';
}

function doGet() {
  return jsonOutput({ ok: true, service: 'one-day-with-catalog' });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(event && event.postData && event.postData.contents || '{}');
    const secret = getApiSecret();
    if (!secret || !constantTimeEqual(String(body.secret || ''), secret)) return jsonOutput({ ok: false, error: 'Unauthorized' });
    const action = String(body.action || '');
    if (action === 'list') return jsonOutput({ ok: true, projects: listProjects_() });
    if (action === 'upsert') {
      const project = validateProject_(body.project);
      lock.waitLock(10000);
      const sheet = catalogSheet_();
      const rows = readRows_(sheet);
      const index = rows.findIndex(function (row) { return row.id === project.id; });
      const now = new Date().toISOString();
      project.createdAt = index >= 0 ? rows[index].createdAt : (project.createdAt || now);
      project.updatedAt = now;
      if (index >= 0) sheet.getRange(index + 2, 1, 1, CATALOG_COLUMNS.length).setValues([rowValues_(project)]);
      else sheet.appendRow(rowValues_(project));
      return jsonOutput({ ok: true, project: project });
    }
    if (action === 'delete') {
      const id = String(body.project && body.project.id || '');
      if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return jsonOutput({ ok: false, error: 'Invalid id' });
      lock.waitLock(10000);
      const sheet = catalogSheet_();
      const rows = readRows_(sheet);
      const index = rows.findIndex(function (row) { return row.id === id; });
      if (index < 0) return jsonOutput({ ok: false, error: 'Not found' });
      sheet.deleteRow(index + 2);
      return jsonOutput({ ok: true });
    }
    return jsonOutput({ ok: false, error: 'Invalid action' });
  } catch (error) {
    return jsonOutput({ ok: false, error: 'Request failed' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function catalogSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  const tabName = properties.getProperty('SHEET_NAME') || CATALOG_TAB;
  if (!spreadsheetId) throw new Error('Run setupPortfolioCatalog first.');
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(tabName);
  if (!sheet) throw new Error('Catalog sheet not found.');
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, CATALOG_COLUMNS.length).setValues([CATALOG_COLUMNS]);
  return sheet;
}

function listProjects_() {
  const rows = readRows_(catalogSheet_());
  return rows.sort(function (a, b) { return Number(a.order) - Number(b.order) || String(a.createdAt).localeCompare(String(b.createdAt)); });
}

function readRows_(sheet) {
  if (sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, CATALOG_COLUMNS.length).getValues();
  return values.filter(function (row) { return row[0] !== ''; }).map(function (row) {
    const project = {};
    CATALOG_COLUMNS.forEach(function (column, index) { project[column] = row[index]; });
    project.order = Number(project.order) || 0;
    return project;
  });
}

function validateProject_(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('Invalid project');
  const project = {};
  CATALOG_COLUMNS.forEach(function (key) { project[key] = source[key] == null ? '' : source[key]; });
  ['id', 'title', 'category', 'description', 'videoUrl', 'posterUrl', 'instagramUrl', 'status', 'createdAt', 'updatedAt'].forEach(function (key) {
    if (typeof project[key] !== 'string') throw new Error('Invalid field');
    project[key] = project[key].trim();
  });
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(project.id) || !project.title || project.title.length > 120 || !project.category || project.category.length > 60 || project.description.length > 1200) throw new Error('Invalid project fields');
  if (!['published', 'draft'].includes(project.status)) throw new Error('Invalid status');
  project.order = Number(project.order);
  if (!Number.isInteger(project.order) || project.order < 0 || project.order > 100000) throw new Error('Invalid order');
  project.videoUrl = validateMediaUrl_(project.videoUrl, 'video');
  project.posterUrl = validateMediaUrl_(project.posterUrl, 'poster');
  project.instagramUrl = validateMediaUrl_(project.instagramUrl, 'instagram');
  return project;
}

function validateMediaUrl_(value, field) {
  if (!value) return '';
  if (value.length > 2048) throw new Error('URL too long');
  if (value.indexOf('/assets/') === 0 && !/[?#\\]/.test(value) && value.indexOf('..') < 0) return value;
  if (!/^https:\/\//i.test(value)) throw new Error('Invalid URL');
  const host = value.match(/^https:\/\/([^/:?#]+)/i);
  if (!host || /@/.test(host[1])) throw new Error('Invalid URL');
  if (field === 'instagram' && !/(^|\.)instagram\.com$/i.test(host[1])) throw new Error('Invalid Instagram URL');
  return value;
}

function rowValues_(project) { return CATALOG_COLUMNS.map(function (key) { return project[key]; }); }
function jsonOutput(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function constantTimeEqual(a, b) {
  let mismatch = a.length ^ b.length;
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return mismatch === 0;
}
