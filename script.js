document.addEventListener("DOMContentLoaded",()=>{
  const body=document.body;
  const intro=document.getElementById("intro");
  const holdButton=document.getElementById("holdButton");
  const holdRing=document.getElementById("holdRing");
  const holdStatus=document.getElementById("holdStatus");
  const skipIntro=document.getElementById("skipIntro");
  const scrollProgress=document.getElementById("scrollProgress");
  const nav=document.getElementById("nav");
  const heroVisual=document.getElementById("heroVisual");
  const productTilt=document.getElementById("productTilt");
  const showcaseArea=document.getElementById("showcaseArea");
  const showcaseTilt=document.getElementById("showcaseTilt");

  let holding=false,progress=0,timer=null;
  const hasGSAP=typeof gsap!=="undefined"&&typeof ScrollTrigger!=="undefined";

  const runIntroAnimation=()=>{
    if(!hasGSAP)return;
    gsap.from(".hero .reveal",{y:24,opacity:0,duration:.75,stagger:.08,ease:"power2.out"});
    gsap.from("#productTilt",{y:20,opacity:0,duration:1,ease:"power2.out"});
  };

  const revealSite=()=>{
    clearInterval(timer);holding=false;
    holdRing.style.setProperty("--progress","360deg");
    holdStatus.textContent="WELCOME";
    setTimeout(()=>{
      intro.classList.add("is-hidden");
      body.classList.remove("is-locked");
      sessionStorage.setItem("nexa-intro-seen","1");
      runIntroAnimation();
    },170);
  };

  const resetHold=()=>{
    if(!holding)return;
    clearInterval(timer);holding=false;progress=0;
    holdRing.style.setProperty("--progress","0deg");
    holdStatus.textContent="HOLD TO ENTER";
  };

  const startHold=e=>{
    if(e)e.preventDefault();
    if(holding)return;
    holding=true;progress=0;holdStatus.textContent="OPENING";
    timer=setInterval(()=>{
      progress+=2.4;
      holdRing.style.setProperty("--progress",`${Math.min(progress/100*360,360)}deg`);
      if(progress>=100)revealSite();
    },24);
  };

  holdButton?.addEventListener("mousedown",startHold);
  holdButton?.addEventListener("mouseup",resetHold);
  holdButton?.addEventListener("mouseleave",resetHold);
  holdButton?.addEventListener("touchstart",startHold,{passive:false});
  holdButton?.addEventListener("touchend",resetHold);
  holdButton?.addEventListener("touchcancel",resetHold);
  skipIntro?.addEventListener("click",revealSite);

  if(sessionStorage.getItem("nexa-intro-seen")==="1"){
    intro?.classList.add("is-hidden");
    body.classList.remove("is-locked");
  }

  if(hasGSAP){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".section .reveal").forEach(el=>{
      gsap.from(el,{y:22,opacity:0,duration:.72,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 90%",once:true}});
    });
    gsap.to("#showcaseTilt",{y:-18,scrollTrigger:{trigger:".product-section",start:"top bottom",end:"bottom top",scrub:1}});
  }

  const enableTilt=(container,target,intensity=8)=>{
    if(!container||!target||!window.matchMedia("(pointer:fine)").matches)return;
    container.addEventListener("mousemove",event=>{
      const rect=container.getBoundingClientRect();
      const px=(event.clientX-rect.left)/rect.width-.5;
      const py=(event.clientY-rect.top)/rect.height-.5;
      const rotateY=px*intensity;
      const rotateX=-py*(intensity-2);
      const x=px*8,y=py*8;
      if(hasGSAP){gsap.to(target,{rotateY,rotateX,x,y,duration:.45,ease:"power2.out"});}
      else{target.style.transform=`rotateY(${rotateY}deg) rotateX(${rotateX}deg) translate(${x}px,${y}px)`;}
    });
    container.addEventListener("mouseleave",()=>{
      if(hasGSAP){gsap.to(target,{rotateY:0,rotateX:0,x:0,y:0,duration:.55,ease:"power2.out"});}
      else{target.style.transform="rotateY(0deg) rotateX(0deg) translate(0,0)";}
    });
  };

  enableTilt(heroVisual,productTilt,8);
  enableTilt(showcaseArea,showcaseTilt,7);

  const updateScrollUI=()=>{
    const scrollable=document.documentElement.scrollHeight-window.innerHeight;
    const percent=scrollable>0?window.scrollY/scrollable*100:0;
    scrollProgress.style.width=`${percent}%`;
    nav.classList.toggle("is-scrolled",window.scrollY>12);
  };
  window.addEventListener("scroll",updateScrollUI,{passive:true});
  updateScrollUI();

  if(sessionStorage.getItem("nexa-intro-seen")==="1")runIntroAnimation();
});