(() => {
  const track = document.querySelector('[data-project-track]');
  const status = document.querySelector('[data-catalog-status]');
  const controls = document.querySelector('.catalog-controls');
  const safeUrl = (value) => {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.origin);
      return url.protocol === 'https:' || url.origin === window.location.origin ? url.href : '';
    } catch (_) { return ''; }
  };
  const addText = (parent, tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value || '';
    parent.append(node);
    return node;
  };
  const makeCard = (project, index) => {
    const card = document.createElement('article');
    card.className = 'project-card project-card--reel';
    card.dataset.projectCard = '';
    const mediaButton = document.createElement('button');
    mediaButton.type = 'button';
    mediaButton.className = 'project-card__media project-card__media-button project-card__media--video';
    mediaButton.dataset.previewToggle = '';
    mediaButton.dataset.previewTitle = project.title;
    mediaButton.setAttribute('aria-pressed', 'false');
    mediaButton.setAttribute('aria-label', `Reproduzir prévia de ${project.title}`);
    mediaButton.disabled = !project.videoUrl;
    if (project.videoUrl) {
      const video = document.createElement('video');
      video.className = 'project-card__preview-video';
      video.dataset.cardPreview = '';
      video.dataset.previewSrc = project.videoUrl;
      video.poster = project.posterUrl;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.setAttribute('aria-hidden', 'true');
      video.tabIndex = -1;
      mediaButton.append(video);
    } else {
      const poster = document.createElement('img');
      poster.className = 'project-card__preview-video';
      poster.src = project.posterUrl;
      poster.alt = '';
      poster.loading = 'lazy';
      mediaButton.append(poster);
    }
    const play = document.createElement('span');
    play.className = 'project-card__play';
    play.setAttribute('aria-hidden', 'true');
    addText(play, 'span', '', project.videoUrl ? '▶ PRÉVIA' : 'IMAGEM');
    mediaButton.append(play);
    card.append(mediaButton);

    const body = document.createElement('div');
    body.className = 'project-card__body';
    const meta = document.createElement('div');
    meta.className = 'project-card__meta';
    addText(meta, 'span', '', `PROJECT / ${String(index + 1).padStart(2, '0')}`);
    addText(meta, 'span', '', project.category);
    body.append(meta);
    addText(body, 'h3', '', project.title);
    addText(body, 'p', '', project.description);
    const actions = document.createElement('div');
    actions.className = 'project-card__actions';
    const instagram = safeUrl(project.instagramUrl);
    if (instagram) {
      const link = document.createElement('a');
      link.className = 'arrow-link';
      link.href = instagram;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Assistir no Instagram ↗';
      actions.append(link);
    }
    const preview = document.createElement('button');
    preview.type = 'button';
    preview.className = 'project-card__bts';
    preview.dataset.openGallery = project.id;
    preview.textContent = 'Ver prévia →';
    actions.append(preview);
    body.append(actions);
    card.append(body);
    return card;
  };

  window.ONE_DAY_CATALOG_PROMISE = (async () => {
    if (!track) return false;
    try {
      const response = await fetch('/api/catalog', { cache: 'no-store', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`Catálogo indisponível (${response.status})`);
      const payload = await response.json();
      if (!payload || payload.ok !== true || !Array.isArray(payload.projects)) throw new Error('Resposta de catálogo inválida');
      const projects = payload.projects.filter((item) => item && typeof item.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(item.id) && typeof item.title === 'string');
      track.replaceChildren();
      const library = window.ONE_DAY_MEDIA || (window.ONE_DAY_MEDIA = {});
      projects.forEach((project, index) => {
        const videoUrl = safeUrl(project.videoUrl);
        const posterUrl = safeUrl(project.posterUrl);
        const instagramUrl = safeUrl(project.instagramUrl);
        const previous = Object.hasOwn(library, project.id) ? library[project.id] : { items: [] };
        const items = Array.isArray(previous.items) ? [...previous.items] : [];
        const sameMedia = (src) => {
          try { return new URL(src, window.location.origin).href === videoUrl; } catch (_) { return false; }
        };
        if (videoUrl && !items.some((item) => sameMedia(item.src))) {
          items.unshift({ type: 'video', src: videoUrl, poster: posterUrl, caption: project.title });
        }
        if (!videoUrl && posterUrl && items.length === 0) items.push({ type: 'image', src: posterUrl, alt: project.title, caption: project.title });
        library[project.id] = {
          ...previous,
          title: project.title,
          label: project.category || 'PROJETO',
          description: project.description || '',
          instagram: instagramUrl,
          items
        };
        track.append(makeCard({ ...project, videoUrl, posterUrl, instagramUrl }, index));
      });
      if (status) status.textContent = projects.length ? `01 / ${String(projects.length).padStart(2, '0')}` : '00 / 00';
      if (!projects.length) {
        const empty = document.createElement('p');
        empty.className = 'catalog-empty';
        empty.textContent = 'Novos projetos em breve.';
        track.append(empty);
        if (controls) controls.hidden = true;
      }
      return true;
    } catch (error) {
      // Static cards stay in place when the API is not configured or available.
      console.info('Usando catálogo local:', error.message);
      return false;
    }
  })();
})();
