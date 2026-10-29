 (async () => {
  await window.ONE_DAY_CATALOG_PROMISE;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updatePreviewButton = (button, playing) => {
    const state = button.querySelector('[data-preview-state]');
    const title = button.dataset.previewTitle || 'vídeo';
    const defaultState = button.dataset.previewDefault || '▶ PRÉVIA';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', `${playing ? 'Pausar' : 'Reproduzir'} prévia de ${title}`);
    button.classList.toggle('is-playing', playing);
    if (state) state.textContent = playing ? 'Ⅱ PAUSAR / PRÉVIA' : defaultState;
  };

  const pauseCardPreviewVideos = (exceptVideo = null) => {
    document.querySelectorAll('video[data-card-preview]').forEach((video) => {
      if (video === exceptVideo) return;
      video.pause();
      const button = video.closest('[data-preview-toggle]');
      if (button) updatePreviewButton(button, false);
    });
  };

  document.addEventListener('play', (event) => {
    const video = event.target;
    if (video.matches?.('video[data-card-preview]')) updatePreviewButton(video.closest('[data-preview-toggle]'), true);
  }, true);
  document.addEventListener('pause', (event) => {
    const video = event.target;
    if (video.matches?.('video[data-card-preview]')) updatePreviewButton(video.closest('[data-preview-toggle]'), false);
  }, true);
  document.addEventListener('error', (event) => {
    const video = event.target;
    if (video.matches?.('video[data-card-preview]')) updatePreviewButton(video.closest('[data-preview-toggle]'), false);
  }, true);
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-preview-toggle]');
    if (!button) return;
    const video = button.querySelector('video[data-card-preview]');
    if (!video) return;
    if (!video.paused) { video.pause(); return; }
    pauseCardPreviewVideos(video);
    if (!video.hasAttribute('src')) { video.src = video.dataset.previewSrc; video.load(); }
    try { await video.play(); } catch (_) { updatePreviewButton(button, false); }
  });

  const cardPreviewIsPlaying = () => Array.from(document.querySelectorAll('video[data-card-preview]')).some((video) => !video.paused);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseCardPreviewVideos();
  });

  const reveals = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach((el) => observer.observe(el));
  }

  const parallax = Array.from(document.querySelectorAll('[data-parallax]'));
  const header = document.querySelector('[data-header]');
  let lastY = window.scrollY;
  let raf = null;

  const updateScroll = () => {
    raf = null;
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    root.style.setProperty('--scroll-progress', Math.min(1, Math.max(0, y / max)));

    if (!reduceMotion) {
      parallax.forEach((el) => {
        const speed = Number(el.dataset.parallax || 0);
        const rect = el.getBoundingClientRect();
        if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
          const centerDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
          el.style.transform = `translate3d(0, ${centerDelta * -speed}px, 0)`;
        }
      });
    }

    if (header) {
      const goingDown = y > lastY;
      header.classList.toggle('is-hidden', goingDown && y > 180);
    }
    lastY = y;
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(updateScroll);
  };

  updateScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  const serviceCatalog = document.querySelector('[data-service-catalog]');
  const serviceDetails = {
    day: {
      label: 'UMA EXPERIÊNCIA DE CONTEÚDO',
      title: 'Um dia inteiro de ideias em movimento.',
      copy: 'Planejamento, direção, captação e edição para transformar um período de gravação em conteúdos alinhados ao seu negócio.',
      message: 'Olá, Isa! Quero saber mais sobre o One Day With.'
    },
    video: {
      label: 'PRODUÇÃO PONTUAL',
      title: 'Um vídeo para um momento que importa.',
      copy: 'Campanhas, lançamentos, rotina, serviços ou produtos. A produção parte do que você precisa comunicar agora.',
      message: 'Olá, Isa! Quero conversar sobre um vídeo avulso.'
    },
    script: {
      label: 'IDEIA COM DIREÇÃO',
      title: 'Do que você quer dizer ao que vai para a câmera.',
      copy: 'Ideias e roteiros ajudam a organizar a mensagem antes da gravação, com uma linguagem natural para você e para sua marca.',
      message: 'Olá, Isa! Quero conversar sobre roteiros para conteúdo.'
    },
    direction: {
      label: 'CONTEÚDO COM INTENÇÃO',
      title: 'Mais clareza para aparecer do seu jeito.',
      copy: 'Direção criativa e estratégica para encontrar boas histórias na rotina, nos serviços e no conhecimento que você já tem.',
      message: 'Olá, Isa! Quero conversar sobre direção de conteúdo.'
    }
  };
  const whatsappNumber = (document.body.dataset.whatsappNumber || '').replace(/\D/g, '');
  const whatsappShortLink = document.body.dataset.whatsappShortLink || '';
  const makeWhatsAppUrl = (message) => whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : whatsappShortLink || `https://wa.me/?text=${encodeURIComponent(message)}`;
  const setWhatsAppLinks = (message) => {
    document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
      link.href = makeWhatsAppUrl(message);
    });
  };

  if (serviceCatalog) {
    const tabs = Array.from(serviceCatalog.querySelectorAll('[data-service-tab]'));
    const label = serviceCatalog.querySelector('[data-service-label]');
    const title = serviceCatalog.querySelector('[data-service-title]');
    const copy = serviceCatalog.querySelector('[data-service-copy]');
    const contact = serviceCatalog.querySelector('[data-service-contact]');

    const selectService = (key) => {
      const service = serviceDetails[key];
      if (!service) return;
      tabs.forEach((tab) => {
        const selected = tab.dataset.serviceTab === key;
        tab.setAttribute('aria-pressed', String(selected));
      });
      label.textContent = service.label;
      title.textContent = service.title;
      copy.textContent = service.copy;
      contact.href = makeWhatsAppUrl(service.message);
      contact.dataset.serviceMessage = service.message;
      setWhatsAppLinks(service.message);
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectService(tab.dataset.serviceTab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0
          : event.key === 'End' ? tabs.length - 1
            : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      });
    });
  }

  setWhatsAppLinks('Olá, Isa! Quero conversar sobre um orçamento para produção de conteúdo.');

  const projectTrack = document.querySelector('[data-project-track]');
  if (projectTrack) {
    const sourceCards = Array.from(projectTrack.querySelectorAll('[data-project-card]'));
    if (sourceCards.length) {
    const previous = document.querySelector('[data-catalog-prev]');
    const next = document.querySelector('[data-catalog-next]');
    const toggle = document.querySelector('[data-catalog-toggle]');
    const status = document.querySelector('[data-catalog-status]');
    const catalog = document.querySelector('[data-project-catalog]');
    const firstClone = sourceCards[0].cloneNode(true);
    const lastClone = sourceCards[sourceCards.length - 1].cloneNode(true);
    [firstClone, lastClone].forEach((clone) => {
      clone.removeAttribute('data-reveal');
      clone.classList.add('is-visible', 'project-card--clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.inert = true;
    });
    projectTrack.prepend(lastClone);
    projectTrack.append(firstClone);

    let activeIndex = 0;
    let scrollTimer = null;
    let explicitPause = false;
    let pointerInside = false;
    let focusInside = false;

    const modulo = (value, length) => ((value % length) + length) % length;
    const scrollToCard = (card, behavior = 'smooth') => {
      const left = projectTrack.scrollLeft + card.getBoundingClientRect().left - projectTrack.getBoundingClientRect().left;
      projectTrack.scrollTo({ left, behavior: reduceMotion ? 'auto' : behavior });
    };
    const setActive = (index, behavior = 'smooth') => {
      activeIndex = modulo(index, sourceCards.length);
      status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(sourceCards.length).padStart(2, '0')}`;
      pauseCardPreviewVideos();
      scrollToCard(sourceCards[activeIndex], behavior);
    };

    requestAnimationFrame(() => scrollToCard(sourceCards[0], 'auto'));
    previous.addEventListener('click', () => setActive(activeIndex - 1));
    next.addEventListener('click', () => setActive(activeIndex + 1));

    const updateFromScroll = () => {
      const previousIndex = activeIndex;
      const children = Array.from(projectTrack.children);
      const center = projectTrack.getBoundingClientRect().left + projectTrack.clientWidth / 2;
      const closestIndex = children.reduce((best, card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2 - center);
        return distance < best.distance ? { index, distance } : best;
      }, { index: 0, distance: Infinity }).index;

      if (closestIndex === 0) {
        activeIndex = sourceCards.length - 1;
        scrollToCard(sourceCards[activeIndex], 'auto');
      } else if (closestIndex === children.length - 1) {
        activeIndex = 0;
        scrollToCard(sourceCards[activeIndex], 'auto');
      } else {
        activeIndex = closestIndex - 1;
      }
      status.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(sourceCards.length).padStart(2, '0')}`;
      if (activeIndex !== previousIndex) pauseCardPreviewVideos();
    };

    projectTrack.addEventListener('scroll', () => {
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(updateFromScroll, 120);
    }, { passive: true });

    const updatePauseControl = () => {
      const paused = explicitPause;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Retomar apresentação automática' : 'Pausar apresentação automática');
      toggle.innerHTML = paused ? 'Retomar <span aria-hidden="true">▶</span>' : 'Pausar <span aria-hidden="true">Ⅱ</span>';
    };
    toggle.addEventListener('click', () => {
      explicitPause = !explicitPause;
      updatePauseControl();
    });
    catalog.addEventListener('pointerenter', () => { pointerInside = true; });
    catalog.addEventListener('pointerleave', () => { pointerInside = false; });
    catalog.addEventListener('focusin', () => { focusInside = true; });
    catalog.addEventListener('focusout', (event) => {
      focusInside = catalog.contains(event.relatedTarget);
    });
    window.setInterval(() => {
      const lightboxOpen = document.querySelector('[data-media-lightbox]:not([hidden])');
      if (reduceMotion || explicitPause || pointerInside || focusInside || document.hidden || lightboxOpen || cardPreviewIsPlaying()) return;
      setActive(activeIndex + 1);
    }, 6200);
    }
  }

  const lightbox = document.querySelector('[data-media-lightbox]');
  const mediaLibrary = window.ONE_DAY_MEDIA || {};

  if (!lightbox || !Object.keys(mediaLibrary).length) return;

  const track = lightbox.querySelector('[data-carousel-track]');
  const thumbs = lightbox.querySelector('[data-carousel-thumbs]');
  const counter = lightbox.querySelector('[data-carousel-counter]');
  const previous = lightbox.querySelector('[data-carousel-prev]');
  const next = lightbox.querySelector('[data-carousel-next]');
  const closeButton = lightbox.querySelector('[data-lightbox-close]');
  const title = lightbox.querySelector('[data-lightbox-title]');
  const label = lightbox.querySelector('[data-lightbox-label]');
  const description = lightbox.querySelector('[data-lightbox-description]');
  const instagram = lightbox.querySelector('[data-lightbox-instagram]');

  let activeIndex = 0;
  let activeProject = null;
  let opener = null;
  let scrollRaf = null;
  let closeTimer = null;
  let previousBodyOverflow = '';

  const pauseVideos = () => {
    track.querySelectorAll('video').forEach((video) => video.pause());
  };

  const syncActiveVideoSource = () => {
    const activeSlide = track.children[activeIndex];
    track.querySelectorAll('video').forEach((video) => {
      if (activeSlide && activeSlide.contains(video)) {
        if (!video.getAttribute('src')) {
          video.src = video.dataset.videoSrc;
          video.load();
        }
      } else if (video.getAttribute('src')) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    });
  };

  const updateUi = () => {
    const total = track.children.length;
    track.setAttribute('data-carousel-index', String(activeIndex));
    counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    previous.disabled = activeIndex <= 0;
    next.disabled = activeIndex >= total - 1;
    thumbs.querySelectorAll('button').forEach((button, index) => {
      button.classList.toggle('is-active', index === activeIndex);
      button.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
    });
    pauseVideos();
    syncActiveVideoSource();
  };

  const goTo = (index, shouldScroll = true) => {
    const total = track.children.length;
    activeIndex = Math.max(0, Math.min(index, total - 1));
    updateUi();
    if (shouldScroll) {
      track.scrollTo({
        left: activeIndex * track.clientWidth,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    }
  };

  const buildSlide = (item, index) => {
    const slide = document.createElement('article');
    slide.className = 'media-carousel__slide';
    slide.setAttribute('aria-label', `Mídia ${index + 1}`);

    const frame = document.createElement('div');
    frame.className = 'media-carousel__frame';

    if (item.type === 'video') {
      frame.classList.add('media-carousel__frame--video');

      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.dataset.videoSrc = item.src;
      if (item.poster) video.poster = item.poster;
      video.setAttribute('controlsList', 'nodownload');
      video.setAttribute('aria-label', item.caption || 'Vídeo de bastidor');

      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'media-carousel__play';
      play.textContent = 'Play vídeo';
      play.setAttribute('aria-label', 'Reproduzir vídeo');
      play.addEventListener('click', async () => {
        try {
          await video.play();
          play.hidden = true;
        } catch (_) {
          video.controls = true;
        }
      });
      video.addEventListener('play', () => { play.hidden = true; });
      video.addEventListener('ended', () => { play.hidden = false; });

      frame.append(video, play);
    } else {
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = item.alt || '';
      image.loading = index === 0 ? 'eager' : 'lazy';
      frame.appendChild(image);
    }

    if (item.caption) {
      const caption = document.createElement('span');
      caption.className = 'media-carousel__caption';
      caption.textContent = item.caption;
      frame.appendChild(caption);
    }

    slide.appendChild(frame);
    return slide;
  };

  const buildThumb = (item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'media-lightbox__thumb';
    button.setAttribute('aria-label', item.type === 'video' ? `Abrir vídeo ${index + 1}` : `Abrir mídia ${index + 1}`);
    const image = document.createElement('img');
    image.src = item.type === 'video' ? item.poster : item.src;
    image.alt = '';
    image.loading = 'lazy';
    button.appendChild(image);
    button.addEventListener('click', () => goTo(index));
    return button;
  };

  const renderGallery = (projectId) => {
    const project = mediaLibrary[projectId];
    if (!project) return false;

    activeProject = projectId;
    activeIndex = 0;
    title.textContent = project.title;
    label.textContent = project.label;
    description.textContent = project.description;
    instagram.href = project.instagram;
    track.replaceChildren();
    thumbs.replaceChildren();

    project.items.forEach((item, index) => {
      track.appendChild(buildSlide(item, index));
      thumbs.appendChild(buildThumb(item, index));
    });

    track.scrollLeft = 0;
    updateUi();
    return true;
  };

  const openLightbox = () => {
    if (closeTimer) window.clearTimeout(closeTimer);
    pauseCardPreviewVideos();
    previousBodyOverflow = document.body.style.overflow;
    lightbox.hidden = false;
    document.body.classList.add('has-lightbox-open');
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    closeButton.focus();
  };

  const cleanupLightbox = () => {
    pauseVideos();
    document.body.classList.remove('has-lightbox-open');
    document.body.style.overflow = previousBodyOverflow;
    activeProject = null;
    track.replaceChildren();
    thumbs.replaceChildren();
    if (opener) opener.focus();
    opener = null;
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    pauseVideos();
    closeTimer = window.setTimeout(() => {
      lightbox.hidden = true;
      cleanupLightbox();
    }, reduceMotion ? 0 : 180);
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-gallery]');
    if (!button || !renderGallery(button.dataset.openGallery)) return;
    opener = button;
    openLightbox();
  });

  previous.addEventListener('click', () => goTo(activeIndex - 1));
  next.addEventListener('click', () => goTo(activeIndex + 1));

  track.addEventListener('scroll', () => {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      const width = track.clientWidth || 1;
      const index = Math.round(track.scrollLeft / width);
      if (index !== activeIndex) {
        activeIndex = Math.max(0, Math.min(index, track.children.length - 1));
        updateUi();
      }
    });
  }, { passive: true });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Tab') {
      const focusable = Array.from(lightbox.querySelectorAll('button:not([disabled]), a[href], video[controls], [tabindex]:not([tabindex="-1"])'))
        .filter((element) => !element.hidden && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    }
    if (event.key === 'ArrowLeft' && !event.target.closest('video, button, a, input, textarea')) {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === 'ArrowRight' && !event.target.closest('video, button, a, input, textarea')) {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  });
})();
