import { initMotion } from './motion.js';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
initMotion(reduced);
const lenis = reduced ? null : new Lenis({autoRaf:true, anchors:true, lerp:.085, smoothWheel:true, prevent: node => node.closest('dialog, #navigation')});
const menuButton = document.querySelector('#menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { document.body.classList.remove('menu-open'); menuButton.setAttribute('aria-expanded', 'false'); navigation.setAttribute('aria-hidden', 'true'); navigation.inert = true; lenis?.start(); }
navigation.inert = true;
menuButton.addEventListener('click', () => {
  const open = !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.setAttribute('aria-hidden', String(!open)); navigation.inert = !open; if(open) lenis?.stop(); else lenis?.start();
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
  dialog.showModal(); lenis?.stop();
}));
dialog.addEventListener('close', () => lenis?.start());
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
