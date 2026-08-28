import './style.css';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import productTextureUrl from '../assets/nexa-review-product.svg?url';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050b14, 0.035);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.25, 10.8);
scene.add(camera);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

const hemi = new THREE.HemisphereLight(0x9bc8ff, 0x07101d, 1.1);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 3.6);
key.position.set(4, 6, 7);
key.castShadow = true;
scene.add(key);
const rim = new THREE.PointLight(0x4389ff, 38, 18, 2);
rim.position.set(-4, 1.5, 4);
scene.add(rim);
const fill = new THREE.PointLight(0x8fd4ff, 20, 16, 2);
fill.position.set(4, -2, 3);
scene.add(fill);

const world = new THREE.Group();
scene.add(world);

const productGroup = new THREE.Group();
world.add(productGroup);

const bodyGeometry = new RoundedBoxGeometry(5.18, 4.83, 0.24, 10, 0.2);
const bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf7f9fc,
  roughness: 0.18,
  metalness: 0.04,
  clearcoat: 0.72,
  clearcoatRoughness: 0.12
});
const cardBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
cardBody.castShadow = true;
cardBody.receiveShadow = true;
productGroup.add(cardBody);

const texture = new THREE.TextureLoader().load(productTextureUrl);
texture.colorSpace = THREE.SRGBColorSpace;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
const faceMaterial = new THREE.MeshPhysicalMaterial({
  map: texture,
  transparent: true,
  roughness: 0.16,
  metalness: 0,
  clearcoat: 0.45,
  clearcoatRoughness: 0.1
});
const face = new THREE.Mesh(new THREE.PlaneGeometry(5.02, 4.68), faceMaterial);
face.position.z = 0.126;
productGroup.add(face);

const backCanvas = document.createElement('canvas');
backCanvas.width = 1024;
backCanvas.height = 960;
const ctx = backCanvas.getContext('2d');
const grad = ctx.createLinearGradient(0, 0, 1024, 960);
grad.addColorStop(0, '#0b3a9d');
grad.addColorStop(1, '#071d58');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, 1024, 960);
ctx.fillStyle = '#ffffff';
ctx.font = '700 112px Arial';
ctx.textAlign = 'center';
ctx.fillText('NEXA', 512, 450);
ctx.font = '600 34px Arial';
ctx.fillText('SMART REVIEW SOLUTION', 512, 520);
const backTexture = new THREE.CanvasTexture(backCanvas);
backTexture.colorSpace = THREE.SRGBColorSpace;
const back = new THREE.Mesh(
  new THREE.PlaneGeometry(5.02, 4.68),
  new THREE.MeshPhysicalMaterial({ map: backTexture, roughness: 0.22, clearcoat: 0.3 })
);
back.position.z = -0.126;
back.rotation.y = Math.PI;
productGroup.add(back);

const pedestal = new THREE.Group();
world.add(pedestal);
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(3.2, 3.55, 0.42, 96),
  new THREE.MeshPhysicalMaterial({ color: 0x10213a, metalness: 0.55, roughness: 0.18, clearcoat: 0.9, clearcoatRoughness: 0.08 })
);
base.position.y = -3.25;
base.receiveShadow = true;
pedestal.add(base);
const glass = new THREE.Mesh(
  new THREE.CylinderGeometry(2.85, 3.0, 0.18, 96),
  new THREE.MeshPhysicalMaterial({ color: 0x6eb1ff, transmission: 0.5, transparent: true, opacity: 0.72, roughness: 0.08, thickness: 0.8, ior: 1.42 })
);
glass.position.y = -2.93;
pedestal.add(glass);
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.98, 0.035, 16, 128),
  new THREE.MeshBasicMaterial({ color: 0x5aa0ff, transparent: true, opacity: 0.72 })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = -2.82;
pedestal.add(ring);

const halo = new THREE.Mesh(
  new THREE.TorusGeometry(4.1, 0.018, 12, 160),
  new THREE.MeshBasicMaterial({ color: 0x4a8fff, transparent: true, opacity: 0.22 })
);
halo.rotation.x = Math.PI / 2.25;
halo.rotation.z = 0.3;
world.add(halo);

const starsGeo = new THREE.BufferGeometry();
const starCount = 280;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const r = 12 + Math.random() * 16;
  const a = Math.random() * Math.PI * 2;
  positions[i * 3] = Math.cos(a) * r;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
  positions[i * 3 + 2] = Math.sin(a) * r - 4;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const stars = new THREE.Points(
  starsGeo,
  new THREE.PointsMaterial({ color: 0x6fa9ff, size: 0.018, transparent: true, opacity: 0.55 })
);
scene.add(stars);

productGroup.rotation.set(-0.08, -0.38, -0.05);
productGroup.position.set(2.85, 0.4, 0);
pedestal.position.x = 2.85;
halo.position.x = 2.85;

const mouse = new THREE.Vector2();
const pointerTarget = new THREE.Vector2();
window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
  pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

const clock = new THREE.Clock();
let sceneProgress = 0;

function setSceneFromScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  sceneProgress = max > 0 ? window.scrollY / max : 0;
  const progress = document.querySelector('#scrollProgress');
  if (progress) progress.style.width = `${sceneProgress * 100}%`;

  if (sceneProgress < 0.18) {
    const t = sceneProgress / 0.18;
    productGroup.position.x = THREE.MathUtils.lerp(2.85, -2.6, t);
    pedestal.position.x = THREE.MathUtils.lerp(2.85, -2.6, t);
    halo.position.x = THREE.MathUtils.lerp(2.85, -2.6, t);
    productGroup.rotation.y = THREE.MathUtils.lerp(-0.38, 0.5, t);
    productGroup.position.y = THREE.MathUtils.lerp(0.4, 0.1, t);
  } else if (sceneProgress < 0.45) {
    const t = (sceneProgress - 0.18) / 0.27;
    productGroup.position.x = THREE.MathUtils.lerp(-2.6, 1.4, t);
    pedestal.position.x = THREE.MathUtils.lerp(-2.6, 1.4, t);
    halo.position.x = THREE.MathUtils.lerp(-2.6, 1.4, t);
    productGroup.rotation.y = THREE.MathUtils.lerp(0.5, Math.PI * 0.72, t);
    productGroup.rotation.x = THREE.MathUtils.lerp(-0.08, 0.12, t);
    productGroup.position.y = THREE.MathUtils.lerp(0.1, 1.0, Math.sin(t * Math.PI));
  } else if (sceneProgress < 0.72) {
    const t = (sceneProgress - 0.45) / 0.27;
    productGroup.position.x = THREE.MathUtils.lerp(1.4, 0, t);
    pedestal.position.x = THREE.MathUtils.lerp(1.4, 0, t);
    halo.position.x = THREE.MathUtils.lerp(1.4, 0, t);
    productGroup.rotation.y = THREE.MathUtils.lerp(Math.PI * 0.72, Math.PI * 1.05, t);
    productGroup.position.y = THREE.MathUtils.lerp(1.0, 0.25, t);
  } else {
    const t = (sceneProgress - 0.72) / 0.28;
    productGroup.position.x = THREE.MathUtils.lerp(0, 2.3, t);
    pedestal.position.x = THREE.MathUtils.lerp(0, 2.3, t);
    halo.position.x = THREE.MathUtils.lerp(0, 2.3, t);
    productGroup.rotation.y = THREE.MathUtils.lerp(Math.PI * 1.05, Math.PI * 1.3, t);
    productGroup.position.y = THREE.MathUtils.lerp(0.25, -0.25, t);
  }
}
window.addEventListener('scroll', setSceneFromScroll, { passive: true });
setSceneFromScroll();

function animate() {
  const dt = clock.getElapsedTime();
  mouse.lerp(pointerTarget, 0.045);
  const pointerInfluence = window.innerWidth > 900 ? 1 : 0;
  productGroup.rotation.x += ((-0.08 - mouse.y * 0.07 * pointerInfluence) - productGroup.rotation.x) * 0.025;
  productGroup.rotation.z += ((-0.04 - mouse.x * 0.035 * pointerInfluence) - productGroup.rotation.z) * 0.025;
  productGroup.position.y += Math.sin(dt * 0.8) * 0.0008;
  ring.rotation.z = dt * 0.12;
  halo.rotation.z = 0.3 + dt * 0.025;
  stars.rotation.y = dt * 0.004;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.position.z = window.innerWidth < 700 ? 13.2 : window.innerWidth < 1050 ? 12 : 10.8;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const nav = document.querySelector('#nav');
window.addEventListener('scroll', () => nav?.classList.toggle('is-scrolled', window.scrollY > 20), { passive: true });

gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.from(el, {
    y: 28,
    opacity: 0,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  });
});

const intro = document.querySelector('#intro');
const introHold = document.querySelector('#introHold');
const introRing = document.querySelector('#introRing');
const introSkip = document.querySelector('#introSkip');
let holdTimer = null;
let holdValue = 0;

function enterSite() {
  clearInterval(holdTimer);
  holdTimer = null;
  holdValue = 100;
  introRing?.style.setProperty('--p', '100%');
  intro?.classList.add('is-hidden');
  document.body.classList.remove('intro-lock');
  try { sessionStorage.setItem('nexa3dIntro', '1'); } catch {}
}

function resetHold() {
  clearInterval(holdTimer);
  holdTimer = null;
  holdValue = 0;
  introRing?.style.setProperty('--p', '0%');
}

function startHold(e) {
  e?.preventDefault();
  if (holdTimer) return;
  holdValue = 0;
  holdTimer = setInterval(() => {
    holdValue += 2.4;
    introRing?.style.setProperty('--p', `${Math.min(100, holdValue)}%`);
    if (holdValue >= 100) enterSite();
  }, 24);
}

introHold?.addEventListener('pointerdown', startHold);
introHold?.addEventListener('pointerup', resetHold);
introHold?.addEventListener('pointerleave', resetHold);
introHold?.addEventListener('pointercancel', resetHold);
introSkip?.addEventListener('click', enterSite);

try {
  if (sessionStorage.getItem('nexa3dIntro') === '1') {
    intro?.classList.add('is-hidden');
    document.body.classList.remove('intro-lock');
  }
} catch {}
