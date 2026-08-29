(() => {
  const ORIGINAL_PRODUCT = 'assets/nexa-review-product-original.png';
  const FALLBACK_PRODUCT = 'assets/nexa-review-product.svg';

  const applyOriginalProduct = () => {
    const productImages = document.querySelectorAll('.product-3d img, .mini-product img');
    productImages.forEach(img => {
      const originalAlt = img.alt || 'NEXA Review';
      img.src = ORIGINAL_PRODUCT;
      img.alt = originalAlt;
      img.decoding = 'async';
      img.onerror = () => {
        img.onerror = null;
        img.src = FALLBACK_PRODUCT;
      };
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOriginalProduct, { once: true });
  } else {
    applyOriginalProduct();
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

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
      const selector = link.getAttribute('href');
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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
          card.style.setProperty('--rx', `${-py * 5.5 - 2.5}deg`);
          card.style.setProperty('--ry', `${px * 8 - 3}deg`);
        });
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '-3deg');
        card.style.setProperty('--ry', '-6deg');
      });
    });
  }

  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id || 'top'}`);
      });
    }, { threshold: [0.25, 0.45, 0.65] });
    sections.forEach(section => navObserver.observe(section));
  }
})();