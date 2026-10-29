const $ = (selector) => document.querySelector(selector);
const loginPanel = $('[data-login-panel]');
const workspace = $('[data-workspace]');
const loginForm = $('[data-login-form]');
const form = $('[data-project-form]');
const list = $('[data-project-list]');
const loginMessage = $('[data-login-message]');
const pageMessage = $('[data-page-message]');
const formMessage = $('[data-form-message]');
const loading = $('[data-project-loading]');
const empty = $('[data-project-empty]');
const logoutButton = $('[data-logout]');
const deleteButton = $('[data-delete]');
const saveButton = $('[data-save]');
let projects = [];
let blobUpload;

const setMessage = (node, message = '', isError = false) => {
  node.textContent = message;
  node.dataset.error = String(isError);
};
const api = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) throw new Error(payload.error || payload.message || `Erro ${response.status}`);
  return payload;
};

async function checkSession() {
  try {
    const session = await api('/api/admin-session');
    if (session.authenticated) showWorkspace();
  } catch (_) { /* Not authenticated yet. */ }
}
function showWorkspace() {
  loginPanel.hidden = true;
  workspace.hidden = false;
  logoutButton.hidden = false;
  loadProjects();
}
function resetForm() {
  form.reset();
  form.elements.id.value = '';
  form.elements.order.value = String(projects.length);
  $('#editor-title').textContent = 'Novo projeto';
  saveButton.textContent = 'Salvar projeto';
  deleteButton.hidden = true;
  setMessage(formMessage);
}
function renderList() {
  list.replaceChildren();
  empty.hidden = projects.length > 0;
  projects.forEach((project, index) => {
    const row = document.createElement('li');
    row.className = 'project-row';
    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'project-row__main';
    main.dataset.editProject = project.id;
    const title = document.createElement('strong');
    title.textContent = project.title;
    const meta = document.createElement('span');
    meta.textContent = `${project.category || 'Projeto'} · ${project.status === 'published' ? 'Publicado' : 'Rascunho'}`;
    main.append(title, meta);
    const move = document.createElement('div');
    move.className = 'project-row__move';
    move.setAttribute('aria-label', `Alterar posição de ${project.title}`);
    [['↑', 'up'], ['↓', 'down']].forEach(([symbol, direction]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = symbol;
      button.setAttribute('aria-label', direction === 'up' ? 'Mover para cima' : 'Mover para baixo');
      button.disabled = direction === 'up' ? index === 0 : index === projects.length - 1;
      button.addEventListener('click', () => reorder(index, direction === 'up' ? index - 1 : index + 1));
      move.append(button);
    });
    row.append(main, move);
    list.append(row);
  });
}
async function loadProjects() {
  loading.hidden = false;
  empty.hidden = true;
  try {
    const result = await api('/api/admin-projects');
    projects = Array.isArray(result.projects) ? result.projects : [];
    projects.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    renderList();
    loading.hidden = true;
  } catch (error) {
    loading.textContent = `Não foi possível carregar os projetos: ${error.message}`;
    setMessage(pageMessage, 'Confira sua conexão e tente novamente.', true);
  }
}
function editProject(id) {
  const project = projects.find((item) => item.id === id);
  if (!project) return;
  form.elements.id.value = project.id;
  form.elements.title.value = project.title || '';
  form.elements.category.value = project.category || '';
  form.elements.description.value = project.description || '';
  form.elements.instagramUrl.value = project.instagramUrl || '';
  form.elements.order.value = String(project.order || 0);
  form.elements.published.checked = project.status === 'published';
  $('#editor-title').textContent = 'Editar projeto';
  saveButton.textContent = 'Salvar alterações';
  deleteButton.hidden = false;
  setMessage(formMessage, 'Deixe os arquivos vazios para manter as mídias atuais.');
  if (window.matchMedia('(max-width: 700px)').matches) $('.editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
async function reorder(from, to) {
  if (to < 0 || to >= projects.length) return;
  const next = [...projects];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  const previous = projects;
  projects = next.map((item, index) => ({ ...item, order: index }));
  renderList();
  try {
    for (const project of projects) await api('/api/admin-projects', {
      method: 'PUT', body: JSON.stringify({ ...project, order: project.order })
    });
    setMessage(pageMessage, 'Ordem atualizada.');
  } catch (error) {
    projects = previous;
    renderList();
    await loadProjects();
    setMessage(pageMessage, `Não foi possível salvar a ordem: ${error.message}`, true);
  }
}
async function getUpload() {
  if (blobUpload) return blobUpload;
  const module = await import('https://esm.sh/@vercel/blob@2.8.2/client');
  blobUpload = module.upload;
  if (typeof blobUpload !== 'function') throw new Error('O envio de arquivos não está disponível neste navegador.');
  return blobUpload;
}
async function makePoster(file) {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    video.src = url;
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = () => reject(new Error('Não foi possível ler o primeiro quadro do vídeo.'));
    });
    if (video.duration > 0.4) {
      const seeked = new Promise((resolve) => { video.onseeked = resolve; });
      video.currentTime = Math.min(0.5, video.duration / 3);
      await seeked;
    }
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 900 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
    if (!blob) throw new Error('Não foi possível gerar a capa deste vídeo.');
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-poster.webp`, { type: 'image/webp' });
  } finally { URL.revokeObjectURL(url); }
}
async function uploadFile(file, type) {
  const upload = await getUpload();
  const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || `projeto.${type === 'video' ? 'mp4' : 'webp'}`;
  const result = await upload(`catalog/${Date.now()}-${safeName}`, file, {
    access: 'public',
    handleUploadUrl: '/api/upload-token',
    clientPayload: JSON.stringify({ kind: type })
  });
  if (!result || !result.url) throw new Error('O envio terminou sem retornar o link do arquivo.');
  return result.url;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submit = loginForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  setMessage(loginMessage, 'Entrando…');
  try {
    await api('/api/admin-login', { method: 'POST', body: JSON.stringify({ username: loginForm.elements.username.value, password: loginForm.elements.password.value }) });
    loginForm.reset();
    showWorkspace();
  } catch (error) { setMessage(loginMessage, error.message || 'Não foi possível entrar.', true); }
  finally { submit.disabled = false; }
});
logoutButton.addEventListener('click', async () => {
  try { await api('/api/admin-logout', { method: 'POST', body: JSON.stringify({}) }); }
  catch (_) { /* Return to login even if the session already expired. */ }
  workspace.hidden = true;
  logoutButton.hidden = true;
  loginPanel.hidden = false;
  setMessage(loginMessage, 'Sessão encerrada.');
});
list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-edit-project]');
  if (button) editProject(button.dataset.editProject);
});
$('[data-new-project]').addEventListener('click', () => { resetForm(); if (window.matchMedia('(max-width: 700px)').matches) $('.editor').scrollIntoView({ behavior: 'smooth' }); });
$('[data-cancel]').addEventListener('click', resetForm);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  saveButton.disabled = true;
  setMessage(formMessage, 'Preparando arquivos…');
  const current = projects.find((item) => item.id === form.elements.id.value);
  try {
    let videoUrl = current?.videoUrl || '';
    let posterUrl = current?.posterUrl || '';
    const videoFile = form.elements.videoFile.files[0];
    const customPoster = form.elements.posterFile.files[0];
    if (videoFile) {
      setMessage(formMessage, 'Enviando vídeo…');
      videoUrl = await uploadFile(videoFile, 'video');
      if (!customPoster) {
        try {
          setMessage(formMessage, 'Criando capa do primeiro quadro…');
          posterUrl = await uploadFile(await makePoster(videoFile), 'image');
        } catch (posterError) {
          console.warn('Capa automática indisponível:', posterError);
          if (!posterUrl) setMessage(formMessage, 'Vídeo enviado. Não foi possível gerar a capa; escolha uma imagem de capa para salvar.', true);
        }
      }
    }
    if (customPoster) {
      setMessage(formMessage, 'Enviando capa…');
      posterUrl = await uploadFile(customPoster, 'image');
    }
    if (!videoUrl && !posterUrl) throw new Error('Envie um vídeo ou uma capa para criar a miniatura do projeto.');
    if (videoFile && !posterUrl) throw new Error('Adicione uma capa personalizada para este vídeo.');
    const project = {
      ...(current || {}),
      id: current?.id,
      title: form.elements.title.value.trim(),
      category: form.elements.category.value.trim(),
      description: form.elements.description.value.trim(),
      instagramUrl: form.elements.instagramUrl.value.trim(),
      videoUrl,
      posterUrl,
      order: Number(form.elements.order.value || 0),
      status: form.elements.published.checked ? 'published' : 'draft'
    };
    const editing = Boolean(current);
    setMessage(formMessage, 'Salvando projeto…');
    await api('/api/admin-projects', {
      method: editing ? 'PUT' : 'POST', body: JSON.stringify(project)
    });
    await loadProjects();
    resetForm();
    setMessage(pageMessage, 'Projeto salvo.');
  } catch (error) { setMessage(formMessage, error.message || 'Não foi possível salvar.', true); }
  finally { saveButton.disabled = false; }
});
deleteButton.addEventListener('click', async () => {
  const id = form.elements.id.value;
  const project = projects.find((item) => item.id === id);
  if (!project || !window.confirm(`Excluir “${project.title}” do catálogo?`)) return;
  deleteButton.disabled = true;
  try {
    await api('/api/admin-projects', { method: 'DELETE', body: JSON.stringify({ id }) });
    await loadProjects();
    resetForm();
    setMessage(pageMessage, 'Projeto excluído.');
  } catch (error) { setMessage(formMessage, error.message, true); }
  finally { deleteButton.disabled = false; }
});

checkSession();
