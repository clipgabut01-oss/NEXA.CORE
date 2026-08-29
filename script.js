(() => {
  const revealItems = [...document.querySelectorAll('.reveal')];
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' })
    : null;

  revealItems.forEach(el => observer ? observer.observe(el) : el.classList.add('is-visible'));

  const finePointer = matchMedia('(pointer:fine)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.product-tilt').forEach(el => {
      let frame = null;
      el.addEventListener('pointermove', ev => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const x = (ev.clientX - r.left) / r.width - .5;
          const y = (ev.clientY - r.top) / r.height - .5;
          el.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-2px)`;
        });
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .45s ease';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 460);
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      const target = id && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();