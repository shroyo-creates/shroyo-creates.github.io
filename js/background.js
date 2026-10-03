// background.js: the 3D scene behind the whole site
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// ---------- 1. Renderer, scene and camera ----------
const canvas = document.querySelector("#bg");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0d1117, 0.07); // far-away things fade into the background

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;
// ---------- 2. The particle network ----------
const COUNT = 200;      // number of dots
const RADIUS = 6;       // size of the cloud
const LINK_DIST = 1.6;  // dots closer than this get a line between them

const points = [];
for (let i = 0; i < COUNT; i++) {
  const p = new THREE.Vector3().randomDirection().multiplyScalar(RADIUS * Math.cbrt(Math.random()));
  points.push(p);
}

// Draw a soft glowing circle on a tiny 2D canvas and use it as each dot's image
// (without this, WebGL draws every dot as a square)
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const dotGeometry = new THREE.BufferGeometry().setFromPoints(points);
const dotMaterial = new THREE.PointsMaterial({
  color: 0x58a6ff,
  size: 0.18,
  map: makeGlowTexture(),
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending, // overlapping dots glow brighter
  depthWrite: false,
});
const dots = new THREE.Points(dotGeometry, dotMaterial);

const linePoints = [];
for (let i = 0; i < COUNT; i++) {
  for (let j = i + 1; j < COUNT; j++) {
    if (points[i].distanceTo(points[j]) < LINK_DIST) {
      linePoints.push(points[i], points[j]);
    }
  }
}
const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xa371f7, transparent: true, opacity: 0.25 });
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

const network = new THREE.Group();
network.add(dots, lines);
scene.add(network);
// ---------- 3. The glowing "shield core" in the middle ----------
const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.3, 1),
  new THREE.MeshBasicMaterial({ color: 0x3fb950, wireframe: true, transparent: true, opacity: 0.35 })
);
scene.add(core);
// ---------- 4. Inputs: scroll and mouse ----------
let scrollProgress = 0; // 0 at the top of the page, 1 at the very bottom
function updateScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
}
window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();

const mouse = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.x = e.clientX / window.innerWidth - 0.5;  // -0.5 (left) to 0.5 (right)
  mouse.y = e.clientY / window.innerHeight - 0.5;
});

// ---------- 5. Animation loop ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clock = new THREE.Clock();

function animate() {
  const t = reduceMotion ? 0 : clock.getElapsedTime();

  // Slow constant spin, plus extra spin driven by scroll
  network.rotation.y = t * 0.05 + scrollProgress * Math.PI;
  network.rotation.x = scrollProgress * 0.6;
  core.rotation.x = t * 0.2;
  core.rotation.y = t * 0.3 + scrollProgress * Math.PI * 2;

  // Camera flies INTO the network as you scroll (z goes from 8 to 3.5)
  camera.position.z = 8 - scrollProgress * 4.5;

  // Camera drifts gently toward the mouse ("lerp" = move 5% of the way each frame)
  camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.05;
  camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ---------- 6. Keep it sharp when the window resizes ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateScroll();
});