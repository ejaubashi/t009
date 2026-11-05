import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = document.querySelector('#loader');
document.body.classList.add('loading');
const started = performance.now();
const symbols = ['✳', '◒', '✦', '◉', '✺', '♡'];
function loadFrame(now) {
  const progress = Math.min((now - started) / (reduced ? 100 : 2200), 1);
  document.querySelector('#load-count').textContent = String(Math.round(100 * (1 - progress))).padStart(3, '0');
  document.querySelector('#loader-object').textContent = symbols[Math.min(5, Math.floor(progress * 6))];
  if (progress < 1) requestAnimationFrame(loadFrame);
  else { loader.classList.add('done'); document.body.classList.remove('loading'); setTimeout(() => loader.remove(), 1100); }
}
requestAnimationFrame(loadFrame);

const menuButton = document.querySelector('#menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { document.body.classList.remove('menu-open'); menuButton.setAttribute('aria-expanded', 'false'); navigation.setAttribute('aria-hidden', 'true'); navigation.inert = true; }
navigation.inert = true;
menuButton.addEventListener('click', () => {
  const open = !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.setAttribute('aria-hidden', String(!open)); navigation.inert = !open;
});
navigation.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

function updateTime() {
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' }).format(new Date());
  document.querySelectorAll('.clock').forEach(el => { el.textContent = `${time} CET`; });
}
updateTime(); setInterval(updateTime, 30000);

const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }, { threshold: .08 });
document.querySelectorAll('.intro, .project, .works-note, .approach').forEach(el => { el.classList.add('reveal'); observer.observe(el); });

const descriptions = [
  ['MOVA', 'Where taste meets meaning.', 'A concept identity for a slower kind of coffee culture. Organic textures, editorial typography, and a warm, grounded palette bring the everyday ritual into focus.', 'Brand strategy / Visual identity / Packaging'],
  ['Terrain', 'A living instrument for reading territory.', 'A digital design concept exploring the relationship between place, data, and human perspective. Topographic forms meet a precise, systematic visual language.', 'Digital design / Art direction / Visual system'],
  ['Hooptily', 'Swiss clarity for French engineering.', 'A concept brand built around connection. A simple loop becomes a flexible identity, balancing technical precision with an expressive, unmistakable personality.', 'Positioning / Visual identity / Website'],
  ['Objects of feeling', 'Ordinary things. Extraordinary feelings.', 'An ongoing visual playground of sculptural forms, reflective surfaces, and unexpected material combinations. An exploration in making the familiar feel new.', '3D exploration / Art direction / Motion']
];
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('.project').forEach(project => project.addEventListener('click', () => {
  const [name, title, description, services] = descriptions[Number(project.dataset.project)];
  const detail = document.querySelector('#project-detail'); detail.replaceChildren();
  const eyebrow = document.createElement('span'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'SELECTED CONCEPT / 2024—2026';
  const heading = document.createElement('h2'); heading.textContent = name;
  const subheading = document.createElement('p'); subheading.textContent = title;
  const image = project.querySelector('.project-image').cloneNode(true); image.querySelector('.project-open')?.remove(); image.setAttribute('aria-hidden','true');
  const body = document.createElement('p'); body.textContent = description;
  const meta = document.createElement('p'); meta.className = 'project-meta'; meta.textContent = services;
  const contact = document.createElement('a'); contact.className = 'pill dark'; contact.href = 'mailto:hello@endy.j'; contact.textContent = 'LET’S MAKE SOMETHING ↗';
  detail.append(eyebrow, heading, subheading, image, body, meta, contact);
  dialog.showModal();
}));
document.querySelector('#close-project').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if(e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });

const copyButton = document.querySelector('#copy-email');
copyButton.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('hello@endy.j'); copyButton.textContent = 'EMAIL COPIED ✓'; }
  catch { copyButton.textContent = 'hello@endy.j'; }
  setTimeout(() => { copyButton.innerHTML = 'COPY OUR EMAIL <span>↗</span>'; }, 2500);
});

let audioContext, soundGain;
const soundButton = document.querySelector('#sound-toggle');
soundButton.addEventListener('click', async () => {
  const active = soundButton.getAttribute('aria-pressed') !== 'true';
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      soundGain = audioContext.createGain(); soundGain.gain.value = 0; soundGain.connect(audioContext.destination);
      [110, 164.81, 220, 277.18].forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.detune.value = index * 1.2;
        const gain = audioContext.createGain(); gain.gain.value = .025; oscillator.connect(gain); gain.connect(soundGain); oscillator.start();
      });
    }
    await audioContext.resume(); soundGain.gain.setTargetAtTime(active ? .35 : 0, audioContext.currentTime, .5);
    soundButton.setAttribute('aria-pressed', String(active)); soundButton.setAttribute('aria-label', active ? 'Disable ambient sound' : 'Enable ambient sound');
    soundButton.querySelector('.sound-label').textContent = active ? 'SOUND ON' : 'SOUND OFF';
  } catch { soundButton.querySelector('.sound-label').textContent = 'SOUND UNAVAILABLE'; }
});

const cursor = document.querySelector('.cursor');
if (matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', e => { cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`; });
  document.querySelectorAll('.project').forEach(el => { el.addEventListener('pointerenter', () => cursor.classList.add('active')); el.addEventListener('pointerleave', () => cursor.classList.remove('active')); });
  document.querySelectorAll('.project').forEach(el => el.addEventListener('click', () => cursor.classList.remove('active')));
}

const hero = document.querySelector('.hero');
const art = document.querySelector('#hero-art');
try {
  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.setClearColor(0x000000, 0); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.6;
  art.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100); camera.position.set(0,0,9);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment(); const environment = pmrem.fromScene(room, .04); scene.environment = environment.texture; room.dispose(); pmrem.dispose();
  const group = new THREE.Group(); scene.add(group);
  const material = new THREE.MeshPhysicalMaterial({color:0xce64a6,metalness:.94,roughness:.2,clearcoat:1,clearcoatRoughness:.08,iridescence:.8,iridescenceIOR:1.5,iridescenceThicknessRange:[100,400]});
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.02,.34,200,32,2,3), material); knot.rotation.set(.4, .2, -.4); group.add(knot);
  const chrome = new THREE.MeshPhysicalMaterial({color:0xe5dcec,metalness:1,roughness:.13,clearcoat:1});
  const satellite = new THREE.Mesh(new THREE.TorusGeometry(.35,.13,24,80), chrome); satellite.position.set(-1.6,.8,-.5); satellite.rotation.set(.8,.5,.2);group.add(satellite);
  const star = new THREE.Mesh(new THREE.IcosahedronGeometry(.28,0),new THREE.MeshPhysicalMaterial({color:0x7063ff,metalness:.8,roughness:.15}));star.position.set(1.5,-.7,.2);group.add(star);
  scene.add(new THREE.HemisphereLight(0xffffff,0x241523,2));
  const light = new THREE.DirectionalLight(0xffffff,4);light.position.set(4,5,6);scene.add(light);
  let pointerX=0,pointerY=0,scroll=0,visible=true;
  window.addEventListener('pointermove', e => {pointerX=(e.clientX/innerWidth-.5); pointerY=(e.clientY/innerHeight-.5);},{passive:true});
  window.addEventListener('scroll',()=>{scroll=window.scrollY;},{passive:true});
  const heroObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});heroObserver.observe(hero);
  function resize(){const {width,height}=hero.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();group.scale.setScalar(width<700?.43:.75);}
  new ResizeObserver(resize).observe(hero); resize();
  const time = new THREE.Clock();
  function animate(){requestAnimationFrame(animate);if(!visible || document.hidden)return;const t=time.getElapsedTime();if(!reduced){knot.rotation.y=t*.19+pointerX*.3;knot.rotation.z=Math.sin(t*.22)*.25-.3;knot.rotation.x=.35+Math.sin(t*.3)*.2;group.position.y=Math.sin(t*.7)*.12+scroll*.0015;group.position.x+=(pointerX*.3-group.position.x)*.025;satellite.rotation.x=t*.3;star.rotation.y=t*.5;const hue=.88+Math.sin(t*.16)*.09;material.color.setHSL(hue,.55,.57);}renderer.render(scene,camera);}
  animate();
  if(!reduced)setTimeout(()=>document.querySelector('.ink').classList.add('active'),6500);
} catch(error) {
  console.warn('WebGL unavailable; using static art.');
  art.innerHTML='<div class="fallback-sculpture" aria-hidden="true">✳</div>';
}
