(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const intro = $('#intro');
    const hold = $('#introHold');
    const ring = $('#introRing');
    const skip = $('#introSkip');
    const nav = $('#nav');
    const progressBar = $('#siteProgress');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer:fine)').matches;

    let timer = null;
    let value = 0;
    const circumference = 333;

    const setRing = (p) => {
      if (!ring) return;
      ring.style.strokeDashoffset = String(circumference - (circumference * p / 100));
    };

    const enter = () => {
      clearInterval(timer);
      setRing(100);
      intro?.classList.add('is-hidden');
      body.classList.remove('intro-lock');
      try { sessionStorage.setItem('nexaIntroSeen', '1'); } catch (_) {}
      setTimeout(() => intro?.setAttribute('aria-hidden', 'true'), 600);
    };

    const resetHold = () => {
      clearInterval(timer);
      timer = null;
      value = 0;
      setRing(0);
    };

    const startHold = (e) => {
      e?.preventDefault();
      if (timer) return;
      value = 0;
      timer = setInterval(() => {
        value += 3;
        setRing(Math.min(value, 100));
        if (value >= 100) enter();
      }, 24);
    };

    if (reduceMotion) {
      enter();
    } else {
      let seen = false;
      try { seen = sessionStorage.getItem('nexaIntroSeen') === '1'; } catch (_) {}
      if (seen) enter();
    }

    hold?.addEventListener('mousedown', startHold);
    hold?.addEventListener('mouseup', resetHold);
    hold?.addEventListener('mouseleave', resetHold);
    hold?.addEventListener('touchstart', startHold, { passive:false });
    hold?.addEventListener('touchend', resetHold);
    hold?.addEventListener('touchcancel', resetHold);
    skip?.addEventListener('click', enter);

    const reveals = $$('[data-reveal]');
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('is-visible'));
    }

    const updateScrollUI = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const pct = max > 0 ? (scrollY / max) * 100 : 0;
      if (progressBar) progressBar.style.width = `${pct}%`;
      nav?.classList.toggle('is-scrolled', scrollY > 18);
    };
    addEventListener('scroll', updateScrollUI, { passive:true });
    updateScrollUI();

    const attachTilt = (area, target, maxX = 7, maxY = 9) => {
      if (!area || !target || !finePointer || reduceMotion) return;
      area.addEventListener('mousemove', (e) => {
        const r = area.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const rx = -py * maxX;
        const ry = px * maxY;
        if (window.gsap) {
          gsap.to(target, { rotateX:rx, rotateY:ry, x:px*8, y:py*7, duration:.45, ease:'power2.out', transformPerspective:1200 });
        } else {
          target.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${px*8}px,${py*7}px,0)`;
        }
      });
      area.addEventListener('mouseleave', () => {
        if (window.gsap) gsap.to(target, { rotateX:0, rotateY:0, x:0, y:0, duration:.65, ease:'power2.out' });
        else target.style.transform = 'none';
      });
    };

    attachTilt($('#heroVisual'), $('#heroProduct3d'), 7, 9);
    attachTilt($('#showcaseVisual'), $('#showcaseProduct3d'), 5, 7);

    $$('.faq-item').forEach((item) => {
      const btn = $('.faq-item__button', item);
      btn?.addEventListener('click', () => {
        const nextState = !item.classList.contains('is-open');
        $$('.faq-item.is-open').forEach((other) => {
          if (other !== item) {
            other.classList.remove('is-open');
            $('.faq-item__button', other)?.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('is-open', nextState);
        btn.setAttribute('aria-expanded', String(nextState));
      });
    });

    if (window.gsap && window.ScrollTrigger && !reduceMotion) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.to('#heroProduct3d', {
        y: 42,
        rotateZ: 2,
        scrollTrigger: { trigger:'.hero', start:'top top', end:'bottom top', scrub:1 }
      });

      gsap.to('.stage__ring--a', {
        rotate: 12,
        scrollTrigger: { trigger:'.hero', start:'top top', end:'bottom top', scrub:1.2 }
      });
      gsap.to('.stage__ring--b', {
        rotate: -4,
        scrollTrigger: { trigger:'.hero', start:'top top', end:'bottom top', scrub:1.2 }
      });

      gsap.to('#showcaseProduct3d', {
        y: -28,
        rotateZ: 1.2,
        scrollTrigger: { trigger:'.product-section', start:'top bottom', end:'bottom top', scrub:1 }
      });

      gsap.to('.mini-device img', {
        y: -22,
        rotate: -4,
        scrollTrigger: { trigger:'.how', start:'top bottom', end:'bottom top', scrub:1 }
      });

      $$('.gallery-card').forEach((card, idx) => {
        gsap.from(card, {
          y: 35 + idx * 6,
          opacity:0,
          duration:.8,
          ease:'power2.out',
          scrollTrigger:{ trigger:card, start:'top 88%', once:true }
        });
      });
    }
  });
})();