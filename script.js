import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const positions = new Float32Array(starCount * 3);
const velocities = new Float32Array(starCount * 3);
const masses = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  const r = Math.random() * 100;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);

  velocities[i * 3] = Math.random() * 0.1 - 0.05;
  velocities[i * 3 + 1] = Math.random() * 0.1 - 0.05;
  velocities[i * 3 + 2] = Math.random() * 0.1 - 0.05;

  masses[i] = Math.random() * 0.5 + 0.5;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMaterial = new THREE.PointsMaterial({
  size: 0.1,
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const blackHoleGeometry = new THREE.SphereGeometry(1, 32, 32);
const blackHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
scene.add(blackHole);

camera.position.z = 150;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.enableKeys = false;

const physicsControls = {
  gravity: 0.01,
  timeStep: 0.1,
  paused: false
};

const stats = document.createElement('div');
stats.style.position = 'absolute';
stats.style.top = '10px';
stats.style.left = '10px';
stats.style.color = 'white';
document.body.appendChild(stats);

function updatePhysics() {
  if (physicsControls.paused) return;
  
  const pos = starGeometry.attributes.position.array;
  for (let i = 0; i < starCount; i++) {
    const dx = -pos[i * 3];
    const dy = -pos[i * 3 + 1];
    const dz = -pos[i * 3 + 2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

    const force = physicsControls.gravity * masses[i] / (dist * dist);
    velocities[i * 3] += (dx / dist) * force * physicsControls.timeStep;
    velocities[i * 3 + 1] += (dy / dist) * force * physicsControls.timeStep;
    velocities[i * 3 + 2] += (dz / dist) * force * physicsControls.timeStep;

    pos[i * 3] += velocities[i * 3];
    pos[i * 3 + 1] += velocities[i * 3 + 1];
    pos[i * 3 + 2] += velocities[i * 3 + 2];
  }
  starGeometry.attributes.position.needsUpdate = true;
}

function animate() {
  requestAnimationFrame(animate);
  updatePhysics();
  stars.rotation.y += 0.001;
  controls.update();
  renderer.render(scene, camera);
  stats.textContent = `Gravity: ${physicsControls.gravity.toFixed(3)} | Paused: ${physicsControls.paused}`;
}

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

document.addEventListener('keydown', (e) => {
  console.log(e.key);
  if (e.key === ' ') {
    physicsControls.paused = !physicsControls.paused;
  }
  if (e.key === 'ArrowUp') {
    physicsControls.gravity += 0.5;
    console.log("Gravity increased: " + physicsControls.gravity);
    e.preventDefault();
  }
  if (e.key === 'ArrowDown') {
    physicsControls.gravity = Math.max(0, physicsControls.gravity - 0.5);
    console.log("Gravity decreased: " + physicsControls.gravity);
    e.preventDefault();
  }
});
