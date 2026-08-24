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
})();
