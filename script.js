(() => {
  const ORIGINAL_PRODUCT = 'assets/nexa-review-product-original.png';
  const FALLBACK_PRODUCT = 'assets/nexa-review-product.svg';
  const WHATSAPP_NUMBER = '62895702699697';
  const WHATSAPP_MESSAGE = 'Halo NEXA, saya tertarik dengan NEXA Review. Bisa minta informasi lebih lanjut?';
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

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

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  };

  const activateWhatsApp = () => {
    const navCta = document.querySelector('.nav-cta');
    if (navCta) {
      navCta.classList.remove('nav-cta--disabled');
      navCta.textContent = 'Pesan Sekarang';
      navCta.setAttribute('role', 'link');
      navCta.setAttribute('tabindex', '0');
      navCta.setAttribute('aria-label', 'Pesan NEXA Review melalui WhatsApp');
      navCta.style.cursor = 'pointer';
      navCta.addEventListener('click', openWhatsApp);
      navCta.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openWhatsApp();
        }
      });
    }

    const actionButtons = [...document.querySelectorAll('.btn-disabled-action')];
    actionButtons.forEach(button => {
      button.disabled = false;
      button.classList.remove('btn-disabled-action');
      button.textContent = /kontak/i.test(button.textContent) ? 'Hubungi Kami' : 'Pesan Sekarang';
      button.setAttribute('aria-label', `${button.textContent} melalui WhatsApp`);
      button.addEventListener('click', openWhatsApp);
    });

    const comingNote = document.querySelector('.coming-note');
    if (comingNote) comingNote.textContent = 'WhatsApp NEXA: 0895 7026 99697';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyOriginalProduct();
      activateWhatsApp();
    }, { once: true });
  } else {
    applyOriginalProduct();
    activateWhatsApp();
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