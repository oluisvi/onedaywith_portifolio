(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const pauseVideos = () => {
    track.querySelectorAll('video').forEach((video) => video.pause());
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
      video.src = item.src;
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
    button.setAttribute('aria-label', `Abrir mídia ${index + 1}`);
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
    lightbox.hidden = false;
    document.body.classList.add('has-lightbox-open');
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    closeButton.focus();
  };

  const cleanupLightbox = () => {
    pauseVideos();
    document.body.classList.remove('has-lightbox-open');
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

  document.querySelectorAll('[data-open-gallery]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!renderGallery(button.dataset.openGallery)) return;
      opener = button;
      openLightbox();
    });
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
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  });
})();
