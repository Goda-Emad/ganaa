/* ============================================================
   Ganna Emad 🎀 — script.js
   بدون أي مكتبات خارجية. كل شيء يعمل بشكل تدريجي:
   إن تعطّل JavaScript، تبقى الصفحة كاملة ومقروءة.
   ============================================================ */
'use strict';

/* ══════════════════════════════════════════════════════════
   EDIT: تاريخ عيد الميلاد — عدّل رقمين فقط 👇
        month = الشهر   (1 = يناير … 12 = ديسمبر)
        day   = اليوم   (1 … 31)
   ضع null مكان الكائن لإخفاء العدّاد التنازلي تماماً.
   ══════════════════════════════════════════════════════════ */
const BIRTHDAY = { month: 12, day: 31 };

/* رسالة تظهر في يوم عيد الميلاد نفسه */
const BIRTHDAY_MESSAGE = '🎉 النهارده اليوم! كل سنة وإنتِ طيبة يا جنّة 🎀';

/* ═══ أدوات صغيرة ══════════════════════════════════════════ */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const pad2 = (n) => String(n).padStart(2, '0');

/* احترام تفضيل المستخدم بتقليل الحركة */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion = () => prefersReduced.matches;

/* هل الجهاز يستخدم مؤشّراً دقيقاً (ماوس)؟ */
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ══════════════════════════════════════════════════════════
   1) خلفية القلوب المتطايرة — Canvas
   (أداء أفضل بكثير من إنشاء مئات عناصر DOM وتحريكها بـ CSS)
   ══════════════════════════════════════════════════════════ */
(function heartsCanvas() {
  const canvas = $('#heartsCanvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const GLYPHS = ['❤️', '🩷', '🎀', '🌸', '💕', '✨'];

  let dpr = 1, w = 0, h = 0;
  let particles = [];
  let rafId = null;
  let running = false;
  let lastT = 0;

  function countForArea() {
    // كثافة متناسبة مع مساحة الشاشة، بحدود معقولة
    const base = Math.round((w * h) / 90000);
    return clamp(base, 10, 22);
  }

  function makeParticle(randomY) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 40,
      size: 11 + Math.random() * 20,
      speed: 12 + Math.random() * 26,          // بكسل/ثانية
      drift: (Math.random() - 0.5) * 16,       // انحراف أفقي
      phase: Math.random() * Math.PI * 2,
      swirl: 10 + Math.random() * 22,          // سعة التمايل
      alpha: 0.18 + Math.random() * 0.42,
      glyph: GLYPHS[(Math.random() * GLYPHS.length) | 0],
      spin: (Math.random() - 0.5) * 0.6,
      rot: (Math.random() - 0.5) * 0.5,
    };
  }

  function resize() {
    dpr = clamp(window.devicePixelRatio || 1, 1, 2); // سقف 2 لتوفير الأداء
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const want = countForArea();
    if (particles.length > want) particles.length = want;
    while (particles.length < want) particles.push(makeParticle(true));
  }

  function frame(t) {
    if (!running) return;
    const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0.016;
    lastT = t;

    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.y -= p.speed * dt;
      p.phase += dt * 0.8;
      p.x += (p.drift + Math.sin(p.phase) * p.swirl) * dt;
      p.rot += p.spin * dt;

      // إعادة التدوير عند الخروج من الأعلى
      if (p.y < -50) {
        particles[i] = makeParticle(false);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = p.size + 'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
      ctx.fillText(p.glyph, 0, 0);
      ctx.restore();
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion()) return;
    running = true;
    lastT = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    ctx.clearRect(0, 0, w, h);
  }

  resize();

  // تشغيل/إيقاف حسب ظهور التبويب (توفير بطارية)
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  // إعادة القياس عند تغيير حجم النافذة (مع تأجيل)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasRunning = running;
      stop();
      resize();
      if (wasRunning) start();
    }, 180);
  }, { passive: true });

  if (reduceMotion()) {
    // وضع ثابت بدون حركة: نرسم لقطة واحدة فقط
    stop();
  } else {
    start();
  }

  prefersReduced.addEventListener?.('change', () => (reduceMotion() ? stop() : start()));
})();

/* ══════════════════════════════════════════════════════════
   2) بريق متلألئ في الـ Hero (عناصر خفيفة بحركة CSS فقط)
   ══════════════════════════════════════════════════════════ */
(function sparkles() {
  const field = $('#sparkleField');
  if (!field || reduceMotion()) return;

  const frag = document.createDocumentFragment();
  const COUNT = window.innerWidth < 640 ? 16 : 26;

  for (let i = 0; i < COUNT; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left = Math.random() * 100 + '%';
    s.style.top  = Math.random() * 100 + '%';
    s.style.setProperty('--delay', (Math.random() * 4).toFixed(2) + 's');
    s.style.setProperty('--dur', (2.6 + Math.random() * 3).toFixed(2) + 's');
    s.style.opacity = '0';
    frag.appendChild(s);
  }
  field.appendChild(frag);
})();

/* ══════════════════════════════════════════════════════════
   3) ظهور الأقسام عند التمرير — IntersectionObserver
   ══════════════════════════════════════════════════════════ */
(function revealOnScroll() {
  const items = $$('.reveal');
  if (!items.length) return;

  // متصفح قديم أو تقليل الحركة → إظهار كل شيء فوراً
  if (!('IntersectionObserver' in window) || reduceMotion()) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target); // مرة واحدة فقط
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  items.forEach((el, i) => {
    // تتابع بسيط بين العناصر المتقاربة (بدون إفراط)
    el.style.transitionDelay = Math.min(i * 40, 200) + 'ms';
    io.observe(el);
  });
})();

/* ══════════════════════════════════════════════════════════
   4) شريط تقدّم التمرير + زر العودة للأعلى + بارالاكس خفيف
   (كلها داخل نفس مستمع التمرير، مع rAF لتفادي الاهتزاز)
   ══════════════════════════════════════════════════════════ */
(function scrollUI() {
  const bar   = $('#scrollBar');
  const toTop = $('#toTop');
  const heroInner = $('.hero__inner');
  const parallaxOn = !reduceMotion() && window.innerWidth > 820;

  let ticking = false;

  function update() {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const y = window.scrollY || doc.scrollTop;

    if (bar) bar.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + '%';

    if (toTop) {
      const show = y > window.innerHeight * 0.9;
      if (show && toTop.hidden) {
        toTop.hidden = false;
        requestAnimationFrame(() => toTop.classList.add('is-on'));
      } else if (!show && !toTop.hidden) {
        toTop.classList.remove('is-on');
        setTimeout(() => { if (!toTop.classList.contains('is-on')) toTop.hidden = true; }, 350);
      }
    }

    if (parallaxOn && heroInner && y < window.innerHeight) {
      heroInner.style.transform = 'translate3d(0,' + (y * 0.14).toFixed(1) + 'px,0)';
      heroInner.style.opacity = String(clamp(1 - (y / window.innerHeight) * 0.85, 0, 1));
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  });
})();

/* ══════════════════════════════════════════════════════════
   5) توهّج البطاقات يتبع المؤشّر (أجهزة الماوس فقط)
   ══════════════════════════════════════════════════════════ */
(function cardGlow() {
  if (!finePointer() || reduceMotion()) return;

  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, { passive: true });
  });
})();

/* ══════════════════════════════════════════════════════════
   6) العدّاد التنازلي لعيد الميلاد
   ══════════════════════════════════════════════════════════ */
(function countdown() {
  const box = $('#countdown');
  if (!box) return;

  if (!BIRTHDAY || typeof BIRTHDAY.month !== 'number' || typeof BIRTHDAY.day !== 'number') {
    box.hidden = true;
    return;
  }

  const note = $('#countdownNote');
  const out = {
    days:    $('[data-unit="days"]', box),
    hours:   $('[data-unit="hours"]', box),
    minutes: $('[data-unit="minutes"]', box),
    seconds: $('[data-unit="seconds"]', box),
  };

  const targetFor = (now) => {
    const year = now.getFullYear();
    let d = new Date(year, BIRTHDAY.month - 1, BIRTHDAY.day, 0, 0, 0, 0);
    // لو فات اليوم هذا العام → العام القادم
    const todayIsIt =
      now.getMonth() === BIRTHDAY.month - 1 && now.getDate() === BIRTHDAY.day;
    if (todayIsIt) return { date: d, today: true };
    if (d.getTime() < now.getTime()) d = new Date(year + 1, BIRTHDAY.month - 1, BIRTHDAY.day, 0, 0, 0, 0);
    return { date: d, today: false };
  };

  let timer = null;

  function render() {
    const now = new Date();
    const { date, today } = targetFor(now);
    box.hidden = false;

    if (today) {
      if (note) note.textContent = BIRTHDAY_MESSAGE;
      // يوم العيد: نصّفّر الأرقام ونُبرز الرسالة
      out.days.textContent = '🎉';
      out.hours.textContent = '🎂';
      out.minutes.textContent = '🎀';
      out.seconds.textContent = '❤️';
      stopTimer();
      return;
    }

    const diff = Math.max(0, date.getTime() - now.getTime());
    const totalSec = Math.floor(diff / 1000);

    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    out.days.textContent    = String(d);
    out.hours.textContent   = pad2(h);
    out.minutes.textContent = pad2(m);
    out.seconds.textContent = pad2(s);

    if (note) {
      note.textContent = d > 0
        ? 'باقي ' + d + ' يوم على اليوم الكبير 🎈'
        : 'باقي ساعات قليلة… 🎈';
    }
  }

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function startTimer() {
    stopTimer();
    render();
    timer = setInterval(render, 1000);
  }

  // إيقاف العدّاد عند إخفاء التبويب، وتحديثه فوراً عند العودة
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopTimer() : startTimer();
  });

  startTimer();
})();

/* ══════════════════════════════════════════════════════════
   7) زر المشاركة + رسالة صغيرة (Toast)
   ══════════════════════════════════════════════════════════ */
(function share() {
  const btn = $('#shareBtn');
  const toast = $('#toast');
  if (!btn) return;

  let toastTimer;

  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2600);
  }

  const title = document.title || 'Ganna Emad 🎀';
  const url = location.href;

  btn.addEventListener('click', async () => {
    // 1) Web Share API (الأفضل على الجوال)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: 'صفحة صُنعت بكل حب 🎀', url });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return; // المستخدم أغلق النافذة
      }
    }

    // 2) النسخ إلى الحافظة
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      say('تم نسخ الرابط ✨');
    } catch {
      say('انسخي الرابط من شريط العنوان 💛');
    }
  });
})();

/* ══════════════════════════════════════════════════════════
   8) تمرير ناعم مع نقل التركيز (وصول أفضل بلوحة المفاتيح)
   ══════════════════════════════════════════════════════════ */
(function smoothAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 8;

    window.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });

    // نقل التركيز للقسم للقارئ الشاشي
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    setTimeout(() => target.removeAttribute('tabindex'), 1200);
  });
})();
