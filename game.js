import * as THREE from 'three';
import { terrainHeight, columnBlocks } from './terrain.js';

const canvas = document.getElementById('game');
const menu = document.getElementById('menu');
const playBtn = document.getElementById('playBtn');
const multiplayerBtn = document.getElementById('multiplayerBtn');
const gameShell = document.getElementById('gameShell');
const hud = document.getElementById('hud');
const slots = [...document.querySelectorAll('.slot')];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
function resizeRendererToGameShell() {
  const width = Math.max(1, gameShell.clientWidth);
  const height = Math.max(1, gameShell.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 20, 55);

const camera = new THREE.PerspectiveCamera(
  75,
  16 / 9,
  0.1,
  100
);

const hemi = new THREE.HemisphereLight(0xffffff, 0x6f7f62, 2.4);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 2.0);
sun.position.set(20, 30, 10);
scene.add(sun);

const blockTypes = [
  { name: 'grass', color: 0x59a83d },
  { name: 'dirt',  color: 0x805735 },
  { name: 'stone', color: 0x7d7d7d },
  { name: 'sand',  color: 0xd9c27f },
];

const geometry = new THREE.BoxGeometry(1, 1, 1);
const materials = blockTypes.map(
  b => new THREE.MeshLambertMaterial({ color: b.color })
);

const blocks = new Map();
const blockGroup = new THREE.Group();
scene.add(blockGroup);

const keyOf = (x, y, z) => `${x},${y},${z}`;

function addBlock(x, y, z, type = 0) {
  x = Math.round(x); y = Math.round(y); z = Math.round(z);
  const k = keyOf(x, y, z);
  if (blocks.has(k)) return false;

  const mesh = new THREE.Mesh(geometry, materials[type]);
  mesh.position.set(x, y, z);
  mesh.userData = { x, y, z, type };
  blockGroup.add(mesh);
  blocks.set(k, mesh);
  return true;
}

function removeBlock(mesh) {
  const { x, y, z } = mesh.userData;
  if (y <= -2) return false;
  blockGroup.remove(mesh);
  blocks.delete(keyOf(x, y, z));
  return true;
}

function generateWorld() {
  for (let x = -14; x <= 14; x++) {
    for (let z = -14; z <= 14; z++) {
      const height = terrainHeight(x, z);
      for (const block of columnBlocks(height)) {
        addBlock(x, block.y, z, block.type);
      }
    }
  }
}

generateWorld();

const player = {
  position: new THREE.Vector3(0, terrainHeight(0, 5) + 2.7, 5),
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  height: 1.7,
  radius: 0.32,
  onGround: false,
};

camera.position.copy(player.position);
resizeRendererToGameShell();

const keys = Object.create(null);
let selectedType = 0;
let selectedSlot = 0;
let locked = false;

function selectSlot(index) {
  selectedSlot = Math.max(0, Math.min(slots.length - 1, index));
  if (selectedSlot < blockTypes.length) selectedType = selectedSlot;
  slots.forEach((slot, i) => slot.classList.toggle('selected', i === selectedSlot));
}

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Digit1') selectSlot(0);
  if (e.code === 'Digit2') selectSlot(1);
  if (e.code === 'Digit3') selectSlot(2);
  if (e.code === 'Digit4') selectSlot(3);
  if (e.code === 'Digit5') selectSlot(4);
  if (e.code === 'Digit6') selectSlot(5);
  if (e.code === 'Digit7') selectSlot(6);
  if (e.code === 'Digit8') selectSlot(7);
  if (e.code === 'Digit9') selectSlot(8);

  if (e.code === 'Space' && player.onGround) {
    player.velocity.y = 6.2;
    player.onGround = false;
  }
});

window.addEventListener('keyup', e => {
  keys[e.code] = false;
});


multiplayerBtn.addEventListener('click', () => {
  multiplayerBtn.textContent = 'COMING SOON';
  setTimeout(() => { multiplayerBtn.textContent = 'MULTIPLAYER'; }, 1200);
});
playBtn.addEventListener('click', () => {
  canvas.requestPointerLock();
});

canvas.addEventListener('click', () => {
  if (!locked) canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  menu.style.display = locked ? 'none' : 'grid';
  hud.style.display = locked ? 'block' : 'none';
});

document.addEventListener('mousemove', e => {
  if (!locked) return;

  player.yaw -= e.movementX * 0.0023;
  player.pitch -= e.movementY * 0.0023;
  player.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, player.pitch));
});

document.addEventListener('contextmenu', e => e.preventDefault());

const raycaster = new THREE.Raycaster();
raycaster.far = 6;

function raycastBlock() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(blockGroup.children, false);
  return hits[0] || null;
}

document.addEventListener('mousedown', e => {
  if (!locked) return;

  const hit = raycastBlock();
  if (!hit) return;

  if (e.button === 0) {
    removeBlock(hit.object);
  }

  if (e.button === 2) {
    const normal = hit.face.normal.clone();
    const p = hit.object.position.clone().add(normal);

    if (
      Math.abs(p.x - player.position.x) < 0.8 &&
      Math.abs(p.z - player.position.z) < 0.8 &&
      p.y > player.position.y - 1.7 &&
      p.y < player.position.y + 0.4
    ) return;

    if (selectedSlot < blockTypes.length) addBlock(p.x, p.y, p.z, selectedType);
  }
});

function blockAt(x, y, z) {
  return blocks.has(keyOf(Math.round(x), Math.round(y), Math.round(z)));
}

function playerCollides(pos) {
  const r = player.radius;
  const minX = Math.floor(pos.x - r + 0.5);
  const maxX = Math.floor(pos.x + r + 0.5);
  const minZ = Math.floor(pos.z - r + 0.5);
  const maxZ = Math.floor(pos.z + r + 0.5);
  const minY = Math.floor(pos.y - player.height + 0.5);
  const maxY = Math.floor(pos.y + 0.2);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (blockAt(x, y, z)) return true;
      }
    }
  }
  return false;
}

function moveAxis(axis, amount) {
  if (!amount) return;
  const candidate = player.position.clone();
  candidate[axis] += amount;

  if (!playerCollides(candidate)) {
    player.position.copy(candidate);
    return;
  }

  if (axis === 'y' && amount < 0) {
    player.onGround = true;
  }
  player.velocity[axis] = 0;
}

const clock = new THREE.Clock();

function update(dt) {
  const move = new THREE.Vector3();
  const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

  if (keys['KeyW']) move.add(forward);
  if (keys['KeyS']) move.sub(forward);
  if (keys['KeyD']) move.add(right);
  if (keys['KeyA']) move.sub(right);

  if (move.lengthSq() > 0) move.normalize().multiplyScalar(5.2);

  player.velocity.x = move.x;
  player.velocity.z = move.z;
  player.velocity.y -= 16.5 * dt;
  player.onGround = false;

  moveAxis('x', player.velocity.x * dt);
  moveAxis('z', player.velocity.z * dt);
  moveAxis('y', player.velocity.y * dt);

  if (player.position.y < -10) {
    player.position.set(0, 2.5, 5);
    player.velocity.set(0, 0, 0);
  }

  camera.position.copy(player.position);
resizeRendererToGameShell();
  camera.rotation.order = 'YXZ';
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  function resizeRendererToGameShell() {
  const width = Math.max(1, gameShell.clientWidth);
  const height = Math.max(1, gameShell.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

});
