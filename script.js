(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const intro = $('#intro');
    const introHold = $('#introHold');
    const introProgress = $('#introProgress');
    const introSkip = $('#introSkip');
    const nav = $('#nav');
    const scrollbar = $('#scrollbar');
    const heroArea = $('#heroProductArea');
    const heroCard = $('#heroCard');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(pointer:fine)').matches;

    let timer = null;
    let value = 0;
    const circumference = 327;
    const setProgress = p => { if (introProgress) introProgress.style.strokeDashoffset = String(circumference - circumference * p / 100); };
    const enter = () => {
      clearInterval(timer);
      timer = null;
      setProgress(100);
      intro?.classList.add('is-hidden');
      body.classList.remove('intro-lock');
      try { sessionStorage.setItem('nexa-intro', '1'); } catch (_) {}
      setTimeout(() => intro?.setAttribute('aria-hidden','true'), 700);
    };
    const resetHold = () => { clearInterval(timer); timer = null; value = 0; setProgress(0); };
    const startHold = e => {
      e?.preventDefault();
      if (timer) return;
      value = 0;
      timer = setInterval(() => { value += 3; setProgress(value); if (value >= 100) enter(); }, 28);
    };
    introHold?.addEventListener('pointerdown', startHold);
    ['pointerup','pointerleave','pointercancel'].forEach(ev => introHold?.addEventListener(ev, resetHold));
    introSkip?.addEventListener('click', enter);
    try { if (sessionStorage.getItem('nexa-intro') === '1') enter(); } catch (_) {}

    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const pct = max > 0 ? scrollY / max * 100 : 0;
      if (scrollbar) scrollbar.style.width = `${pct}%`;
      nav?.classList.toggle('is-scrolled', scrollY > 15);
    };
    addEventListener('scroll', updateScroll, {passive:true});
    updateScroll();

    if (finePointer && heroArea && heroCard && !reduceMotion) {
      heroArea.addEventListener('mousemove', e => {
        const r = heroArea.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        heroCard.style.animation = 'none';
        heroCard.style.transform = `rotateX(${4 - py * 12}deg) rotateY(${-12 + px * 18}deg) rotateZ(${8 + px * 3}deg) translate3d(${px*10}px,${py*8}px,0)`;
      });
      heroArea.addEventListener('mouseleave', () => {
        heroCard.style.transform = '';
        heroCard.style.animation = '';
      });
    }

    if (window.gsap && window.ScrollTrigger && !reduceMotion) {
      gsap.registerPlugin(ScrollTrigger);
      $$('.reveal').forEach(el => gsap.from(el, {opacity:0,y:28,duration:.85,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 91%',once:true}}));
      gsap.to('.hero__beam--one',{x:-100,y:70,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero__beam--two',{x:80,y:-50,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('#explodeCard',{y:-28,x:15,scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:1}});
      gsap.to('#specProduct',{rotateY:7,rotateZ:4,y:-14,scrollTrigger:{trigger:'.specs',start:'top bottom',end:'bottom top',scrub:1}});
    }

    const canvas = $('#starfield');
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && !reduceMotion) {
      let stars = [];
      const resize = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
        canvas.style.width = innerWidth+'px';
        canvas.style.height = innerHeight+'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
        stars = Array.from({length:Math.min(80,Math.max(35,innerWidth/20|0))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.15+.15,a:Math.random()*.45+.08,s:Math.random()*.12+.02}));
      };
      const draw = () => {
        ctx.clearRect(0,0,innerWidth,innerHeight);
        for (const s of stars) {
          s.y -= s.s;
          if (s.y < -3){s.y=innerHeight+3;s.x=Math.random()*innerWidth}
          ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(90,160,255,${s.a})`;ctx.fill();
        }
        requestAnimationFrame(draw);
      };
      resize();draw();addEventListener('resize',resize);
    }
  });
})();