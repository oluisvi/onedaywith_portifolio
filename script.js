(() => {
  const modal = document.querySelector('[data-gallery-modal]');
  const stage = document.querySelector('[data-gallery-stage]');
  const thumbs = document.querySelector('[data-gallery-thumbs]');
  const title = document.getElementById('gallery-title');
  const desc = document.getElementById('gallery-description');
  const eyebrow = document.getElementById('gallery-eyebrow');
  const prevBtn = document.querySelector('[data-gallery-prev]');
  const nextBtn = document.querySelector('[data-gallery-next]');
  const closeButtons = document.querySelectorAll('[data-close-gallery]');
  const openButtons = document.querySelectorAll('[data-open-gallery]');

  let currentProject = null;
  let currentIndex = 0;
  let lastFocused = null;

  const getItems = () => (window.galleryData?.[currentProject]?.items ?? []);

  function pauseAllVideos() {
    stage.querySelectorAll('video').forEach(video => video.pause());
  }

  function buildMedia(item) {
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('controlsList', 'nodownload');
      if (item.poster) video.poster = item.poster;
      const source = document.createElement('source');
      source.src = item.src;
      source.type = 'video/mp4';
      video.appendChild(source);
      slide.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      slide.appendChild(img);
    }
    return slide;
  }

  function buildThumb(item, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-thumb';
    button.dataset.index = index;
    const thumb = document.createElement('img');
    thumb.src = item.thumb || item.poster || item.src;
    thumb.alt = item.alt || item.label || `Mídia ${index + 1}`;
    thumb.loading = 'lazy';
    const label = document.createElement('span');
    label.className = 'gallery-thumb__label';
    label.textContent = item.label || `MÍDIA / ${String(index + 1).padStart(2, '0')}`;
    button.append(thumb, label);
    button.addEventListener('click', () => {
      currentIndex = index;
      renderActiveSlide();
    });
    return button;
  }

  function renderActiveSlide() {
    const items = getItems();
    const slides = [...stage.children];
    const thumbEls = [...thumbs.children];
    pauseAllVideos();
    slides.forEach((slide, index) => slide.classList.toggle('is-active', index === currentIndex));
    thumbEls.forEach((thumb, index) => {
      const active = index === currentIndex;
      thumb.classList.toggle('is-active', active);
      if (active) thumb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
    prevBtn.disabled = items.length <= 1;
    nextBtn.disabled = items.length <= 1;
  }

  function openGallery(projectKey, trigger) {
    const project = window.galleryData?.[projectKey];
    if (!project) return;
    currentProject = projectKey;
    currentIndex = 0;
    lastFocused = trigger || document.activeElement;

    title.textContent = project.title || 'Bastidores';
    desc.textContent = project.description || '';
    eyebrow.textContent = project.eyebrow || 'BASTIDORES';
    stage.innerHTML = '';
    thumbs.innerHTML = '';

    project.items.forEach((item, index) => {
      stage.appendChild(buildMedia(item));
      thumbs.appendChild(buildThumb(item, index));
    });

    renderActiveSlide();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.querySelector('.gallery-modal__close')?.focus();
  }

  function closeGallery() {
    pauseAllVideos();
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  openButtons.forEach(button => {
    button.addEventListener('click', () => openGallery(button.dataset.openGallery, button));
  });

  closeButtons.forEach(button => button.addEventListener('click', closeGallery));

  prevBtn.addEventListener('click', () => {
    const items = getItems();
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    renderActiveSlide();
  });

  nextBtn.addEventListener('click', () => {
    const items = getItems();
    currentIndex = (currentIndex + 1) % items.length;
    renderActiveSlide();
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') closeGallery();
    if (event.key === 'ArrowLeft') prevBtn.click();
    if (event.key === 'ArrowRight') nextBtn.click();
  });
})();
