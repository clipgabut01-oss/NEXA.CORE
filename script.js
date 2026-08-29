(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

  async function loadNexaProductArtwork() {
    try {
      const response = await fetch('assets/nexa-product-ref.webp.base64', { cache: 'force-cache' });
      if (!response.ok) throw new Error('Product asset failed to load');

      const base64 = (await response.text()).trim();
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

      const url = URL.createObjectURL(new Blob([bytes], { type: 'image/webp' }));
      document.querySelectorAll('[data-nexa-product]').forEach(image => {
        image.src = url;
      });
    } catch (error) {
      console.error('NEXA artwork:', error);
    }
  }

  loadNexaProductArtwork();

  const revealItems = [...document.querySelectorAll('.reveal')];

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -28px 0px' });

    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      let frame = 0;

      card.addEventListener('pointermove', event => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;

          const rotateY = px * 12;
          const rotateX = -py * 8;

          card.style.setProperty('--rx', `${rotateX - 4}deg`);
          card.style.setProperty('--ry', `${rotateY - 4}deg`);
        });
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '-5deg');
        card.style.setProperty('--ry', '-9deg');
      });
    });
  }

  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${visible.target.id || 'top'}`
        );
      });
    }, { threshold: [0.25, 0.45, 0.65] });

    sections.forEach(section => navObserver.observe(section));
  }
})();
