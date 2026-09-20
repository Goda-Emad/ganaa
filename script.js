/* ═══════════════════════════════════════════════════════════
   GANNA EMAD — Romantic Edition
   script.js
   ═══════════════════════════════════════════════════════════ */

/* EDIT: floating symbols */
const HEART_SYMBOLS  = ['❤️', '🩷', '💕', '💗', '🌸', '🎀', '✨', '💖', '🌷'];
const HEARTS_COUNT   = 12;
const SPARKLE_CHARS  = ['✦', '✧', '⋆', '✫', '·', '★'];
const SPARKLES_COUNT = 16;

/* ── Floating hearts ─────────────────────────────────────── */
function createFloatingHearts() {
  const c = document.getElementById('heartsContainer');
  if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < HEARTS_COUNT; i++) {
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)];
    el.style.cssText = `
      left:${2 + Math.random()*96}%;
      font-size:${0.7 + Math.random()*1}rem;
      animation-delay:${Math.random()*20}s;
      animation-duration:${16 + Math.random()*14}s;
    `;
    c.appendChild(el);
  }
}

/* ── Hero sparkles ───────────────────────────────────────── */
function createHeroSparkles() {
  const f = document.getElementById('sparkleField');
  if (!f || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < SPARKLES_COUNT; i++) {
    const el = document.createElement('span');
    el.className = 'sparkle';
    el.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
    el.style.cssText = `
      left:${2+Math.random()*96}%;
      top:${2+Math.random()*96}%;
      font-size:${0.5+Math.random()*0.9}rem;
      animation-duration:${2.5+Math.random()*3.5}s;
      animation-delay:${Math.random()*5}s;
    `;
    f.appendChild(el);
  }
}

/* ── Scroll reveal ───────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  els.forEach(el => obs.observe(el));
}

/* ── Smooth scroll ───────────────────────────────────────── */
function initSmoothScroll() {
  const btn = document.getElementById('discoverBtn');
  if (!btn) return;
  btn.addEventListener('click', e => {
    const t = document.querySelector(btn.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
}

/* ── Subtle card tilt (desktop only) ─────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top  - r.height/2;
      card.style.transform = `translateY(-8px) rotateX(${(y/r.height)*6}deg) rotateY(${-(x/r.width)*6}deg)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  createHeroSparkles();
  initScrollReveal();
  initSmoothScroll();
  initCardTilt();
});
