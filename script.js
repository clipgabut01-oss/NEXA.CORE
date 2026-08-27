const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');}
  });
},{threshold:0.14});
revealItems.forEach(el=>observer.observe(el));

function enableTilt(stageSelector,targetSelector,maxRotate=9){
  const stage = document.querySelector(stageSelector);
  const target = document.querySelector(targetSelector);
  if(!stage || !target || window.matchMedia('(pointer:coarse)').matches) return;

  stage.addEventListener('mousemove',(e)=>{
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    const rx = -y * maxRotate;
    const ry = x * maxRotate;
    target.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translate(${x*10}px, ${y*10}px)`;
  });

  stage.addEventListener('mouseleave',()=>{
    target.style.transform = '';
  });
}

enableTilt('#heroStage','#heroProductWrap',8);
enableTilt('.floating-panel','#productInfoWrap',7);

document.querySelectorAll('.gallery-card').forEach((card,i)=>{
  card.style.animation = `floatCard ${4.8 + i*.5}s ease-in-out infinite`;
});

const style = document.createElement('style');
style.textContent = `
@keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
`;
document.head.appendChild(style);