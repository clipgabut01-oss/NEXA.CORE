(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const PRODUCT_PARTS = [
    'assets/product-data/part-01.txt',
    'assets/product-data/part-02.txt',
    'assets/product-data/part-03.txt',
    'assets/product-data/part-04.txt',
    'assets/product-data/part-05.txt',
    'assets/product-data/part-06.txt',
    'assets/product-data/part-07.txt'
  ];

  const productImages = () => $$('img[src*="nexa-review-master-hd.png"], img[data-nexa-product]');

  const setProductLoadingState = () => {
    productImages().forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity .35s ease';
    });
  };

  const loadOriginalProductMaster = async () => {
    const images = productImages();
    if (!images.length) return;

    try {
      const parts = await Promise.all(PRODUCT_PARTS.map(async url => {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Gagal memuat ${url}: ${response.status}`);
        return (await response.text()).trim();
      }));

      const base64 = parts.join('').replace(/\s+/g, '');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const blob = new Blob([bytes], { type: 'image/png' });
      const objectUrl = URL.createObjectURL(blob);

      await Promise.all(images.map(img => new Promise(resolve => {
        const done = () => {
          img.style.opacity = '1';
          img.classList.add('nexa-product-loaded');
          resolve();
        };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', () => {
          console.error('NEXA product master gagal dirender pada elemen gambar.');
          resolve();
        }, { once: true });
        img.src = objectUrl;
        if (img.complete && img.naturalWidth > 0) done();
      })));

      document.documentElement.classList.add('product-master-ready');
    } catch (error) {
      console.error('NEXA product master loader error:', error);
      images.forEach(img => {
        img.style.opacity = '0';
        img.setAttribute('aria-hidden', 'true');
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    setProductLoadingState();
    loadOriginalProductMaster();

    const body = document.body;
    const intro = $('#intro');
    const hold = $('#introHold');
    const valueRing = $('#introValue');
    const skip = $('#introSkip');
    const nav = $('#nav');
    const progress = $('#scrollProgress');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer:fine)').matches;
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    let timer = null;
    let pct = 0;
    const C = 327;

    const setRing = (p) => {
      if (valueRing) valueRing.style.strokeDashoffset = String(C - C * p / 100);
    };

    const enter = () => {
      clearInterval(timer);
      timer = null;
      setRing(100);
      intro?.classList.add('is-hidden');
      body.classList.remove('intro-lock');
      try { sessionStorage.setItem('nexa-intro-seen','1'); } catch(_) {}
      setTimeout(() => intro?.setAttribute('aria-hidden','true'), 650);
    };

    const reset = () => {
      clearInterval(timer);
      timer = null;
      pct = 0;
      setRing(0);
    };

    const start = (e) => {
      e?.preventDefault();
      if (timer) return;
      pct = 0;
      timer = setInterval(() => {
        pct += 3;
        setRing(Math.min(pct,100));
        if (pct >= 100) enter();
      }, 24);
    };

    hold?.addEventListener('mousedown', start);
    hold?.addEventListener('mouseup', reset);
    hold?.addEventListener('mouseleave', reset);
    hold?.addEventListener('touchstart', start, {passive:false});
    hold?.addEventListener('touchend', reset);
    hold?.addEventListener('touchcancel', reset);
    skip?.addEventListener('click', enter);

    try {
      if (sessionStorage.getItem('nexa-intro-seen') === '1') {
        intro?.classList.add('is-hidden');
        body.classList.remove('intro-lock');
      }
    } catch(_) {}

    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max * 100 : 0;
      if (progress) progress.style.width = `${p}%`;
      nav?.classList.toggle('is-scrolled', scrollY > 12);
    };
    addEventListener('scroll', updateScroll, {passive:true});
    updateScroll();

    $$('.faq-item').forEach(item => {
      const btn = $('button', item);
      btn?.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });

    const tilt = (area, card, maxY = 10, maxX = 7) => {
      if (!area || !card || !fine || reduce) return;
      area.addEventListener('mousemove', e => {
        const r = area.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        if (hasGSAP) {
          gsap.to(card,{rotateY:x*maxY,rotateX:-y*maxX,x:x*8,y:y*7,duration:.55,ease:'power2.out'});
        }
      });
      area.addEventListener('mouseleave', () => {
        if (hasGSAP) gsap.to(card,{rotateY:0,rotateX:0,x:0,y:0,duration:.75,ease:'power2.out'});
      });
    };
    tilt($('#heroVisual'), $('#heroProduct'), 11, 7);
    tilt($('#productVisual'), $('#productDetail'), 8, 5);

    if (hasGSAP && !reduce) {
      gsap.registerPlugin(ScrollTrigger);
      $$('.reveal').forEach(el => {
        gsap.from(el,{y:28,opacity:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
      });
      gsap.to('#productDetail',{y:-20,scrollTrigger:{trigger:'#product',start:'top bottom',end:'bottom top',scrub:1}});
      gsap.to('.hero__streak--a',{x:-80,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero__streak--b',{x:65,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    }

    const canvas = $('#stars');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let dpr = Math.min(devicePixelRatio || 1, 2);
      let stars = [];
      const resize = () => {
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
        const count = Math.min(85, Math.max(35, Math.round(innerWidth / 18)));
        stars = Array.from({length:count}, () => ({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.1+.25,a:Math.random()*.35+.06,v:Math.random()*.07+.02}));
      };
      const draw = () => {
        ctx.clearRect(0,0,innerWidth,innerHeight);
        stars.forEach(s => {
          s.y -= s.v;
          if (s.y < -3) { s.y = innerHeight + 3; s.x = Math.random()*innerWidth; }
          ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(112,174,255,${s.a})`;ctx.fill();
        });
        requestAnimationFrame(draw);
      };
      resize();draw();addEventListener('resize',resize);
    }
  });
})();