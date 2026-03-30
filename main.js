import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/* =============================================
   LOADER SCREEN
   ============================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1200);
});

/* =============================================
   CUSTOM CURSOR
   ============================================= */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .project-card, .contact-card, .card-inner').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

/* =============================================
   NAVBAR SCROLL
   ============================================= */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* =============================================
   PARTICLES
   ============================================= */
const particleContainer = document.getElementById('particles');
const colors = ['#6c63ff', '#00d4ff', '#ff6b9d', '#a78bfa'];

for (let i = 0; i < 28; i++) {
  const p = document.createElement('div');
  p.classList.add('particle');
  const size = Math.random() * 4 + 1.5;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const delay = Math.random() * 12;
  const duration = Math.random() * 10 + 10;
  const left = Math.random() * 100;
  p.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    left: ${left}%;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    box-shadow: 0 0 ${size * 2}px ${color};
  `;
  particleContainer.appendChild(p);
}

/* =============================================
   THREE.JS — 3D MODEL VIEWER
   ============================================= */
const canvas = document.getElementById('threeCanvas');
const container = document.getElementById('modelContainer');
const hintEl = document.getElementById('modelHint');

// ---- Scene ----
const scene = new THREE.Scene();

// ---- Camera ----
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.02,
  1000
);
camera.position.set(0, 1.4, 1.8);

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ---- Lights ----
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const bluePoint = new THREE.PointLight(0x6c63ff, 8, 20);
bluePoint.position.set(-3, 2, 2);
scene.add(bluePoint);

const cyanPoint = new THREE.PointLight(0x00d4ff, 6, 20);
cyanPoint.position.set(3, -2, 2);
scene.add(cyanPoint);

const rimLight = new THREE.PointLight(0xff6b9d, 3, 15);
rimLight.position.set(0, -3, -2);
scene.add(rimLight);

// ---- Grid helper (subtle floor) ----
const gridHelper = new THREE.GridHelper(10, 20, 0x6c63ff, 0x111827);
gridHelper.position.y = -1.6;
gridHelper.material.opacity = 0.25;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// ---- Load GLB ----
let model = null;
let modelLoaded = false;
let autoRotateSpeed = 0.004;

let baseRotationY = 90;   // driven by scroll
let userRotationX = 0;   // driven by mouse drag
let userRotationY = 2;
let targetRotX = 0;
let targetRotY = 0;
let isGrabbing = false;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/libs/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(
  'model.glb',
  (gltf) => {
    model = gltf.scene;

    // Center + scale to fit
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4.5 / maxDim;

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));

    // Enable shadows
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(model);
    modelLoaded = true;

    // Hide loader hint after 4s of interaction
    setTimeout(() => hintEl.classList.add('hidden'), 5000);
  },
  (progress) => {
    const pct = (progress.loaded / progress.total * 100).toFixed(0);
    document.querySelector('.loader-text').textContent = `Loading 3D model... ${pct}%`;
  },
  (error) => {
    console.warn('GLB load error:', error);
    document.querySelector('.loader-text').textContent = 'Ready';
  }
);

// ---- Scroll → rotate Y ----
let scrollRotation = 0;
window.addEventListener('scroll', () => {
  const heroHeight = document.getElementById('hero').offsetHeight;
  const progress = Math.min(window.scrollY / heroHeight, 1);
  scrollRotation = progress * Math.PI * 1.5; // 270° on full hero scroll
});

// ---- Drag to rotate ----
let pointerDown = false;
let lastPointerX = 0, lastPointerY = 0;

container.addEventListener('pointerdown', (e) => {
  pointerDown = true;
  isGrabbing = true;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
  container.style.cursor = 'grabbing';
  hintEl.classList.add('hidden');
  e.preventDefault();
});

window.addEventListener('pointermove', (e) => {
  if (!pointerDown) return;
  const dx = e.clientX - lastPointerX;
  const dy = e.clientY - lastPointerY;
  targetRotY += dx * 0.012;
  targetRotX += dy * 0.008;
  targetRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotX));
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;
});

window.addEventListener('pointerup', () => {
  pointerDown = false;
  isGrabbing = false;
  container.style.cursor = 'grab';
});

container.style.cursor = 'grab';

// ---- Touch support ----
container.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  pointerDown = true;
  isGrabbing = true;
  lastPointerX = t.clientX;
  lastPointerY = t.clientY;
  hintEl.classList.add('hidden');
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (!pointerDown) return;
  const t = e.touches[0];
  const dx = t.clientX - lastPointerX;
  const dy = t.clientY - lastPointerY;
  targetRotY += dx * 0.012;
  targetRotX += dy * 0.008;
  targetRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotX));
  lastPointerX = t.clientX;
  lastPointerY = t.clientY;
});

window.addEventListener('touchend', () => {
  pointerDown = false;
  isGrabbing = false;
});

// ---- Resize ----
window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ---- Animate floating lights ----
let clock = new THREE.Clock();

// =============================================
//  RENDER LOOP
// =============================================
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Pulsing lights
  bluePoint.intensity = 8 + Math.sin(t * 1.1) * 2;
  cyanPoint.intensity = 6 + Math.sin(t * 0.8 + 1) * 2;
  rimLight.intensity = 3 + Math.sin(t * 1.4 + 2) * 1;

  // Animate light positions gently
  bluePoint.position.x = -3 + Math.sin(t * 0.5) * 0.8;
  bluePoint.position.y = 2 + Math.cos(t * 0.4) * 0.5;
  cyanPoint.position.x = 3 + Math.cos(t * 0.6) * 0.8;

  if (model && modelLoaded) {
    // Smooth drag interpolation
    userRotationX += (targetRotX - userRotationX) * 0.08;
    userRotationY += (targetRotY - userRotationY) * 0.08;

    // Auto-rotate when not grabbing
    if (!isGrabbing) {
      baseRotationY += autoRotateSpeed;
    }

    // Combine scroll + auto-rotation + user drag
    model.rotation.y = baseRotationY + scrollRotation + userRotationY;
    model.rotation.x = userRotationX;

    // Subtle floating bob
    model.position.y = Math.sin(t * 0.6) * 0.06;
  }

  renderer.render(scene, camera);
}
animate();

/* =============================================
   INTERSECTION OBSERVER — Reveal & Skill Bars
   ============================================= */
const revealEls = document.querySelectorAll(
  '#about .section-header, .about-grid, #skills .section-header, .skill-category, ' +
  '#projects .section-header, .project-card, #contact .section-header, .contact-card, ' +
  '.stat-item, .card-inner'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// Animate skill bars
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.pill-fill').forEach(fill => {
        // Reset then animate
        fill.style.width = '0';
        requestAnimationFrame(() => {
          fill.style.width = fill.parentElement.previousElementSibling === null
            ? fill.style.width
            : fill.getAttribute('style').match(/width:\s*([\d.]+%)/)?.[1] || '0';
          // Re-apply from data
          const target = fill.style.width;
          fill.style.width = '0';
          setTimeout(() => { fill.style.width = target; }, 100);
        });
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(cat => barObserver.observe(cat));

/* =============================================
   ACTIVE NAV LINK ON SCROLL
   ============================================= */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.style.color = '');
      const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.style.color = 'var(--text)';
    }
  });
}, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* =============================================
   SMOOTH HOVER EFFECT ON NAV LINKS
   ============================================= */
document.querySelectorAll('.nav-links a, .nav-cta, .btn-primary, .btn-secondary, .btn-outline').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});
