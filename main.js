// Forge Landing — Interactions
document.addEventListener('DOMContentLoaded', () => {

  // Scroll fade-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Accordion for barriers
  document.querySelectorAll('.barrier-q').forEach(q => {
    q.addEventListener('click', () => {
      const barrier = q.parentElement;
      const wasOpen = barrier.classList.contains('open');
      document.querySelectorAll('.barrier.open').forEach(b => b.classList.remove('open'));
      if (!wasOpen) barrier.classList.add('open');
    });
  });

  const firstBarrier = document.querySelector('.barrier');
  if (firstBarrier) firstBarrier.classList.add('open');

  // Marquee drag-to-scroll (seamless)
  const strip = document.querySelector('.marquee-strip');
  const track = document.querySelector('.marquee-track');
  if (strip && track) {
    let isDragging = false;
    let startX;
    let offset = 0;
    let rafId = null;
    const speed = 1; // px per frame (~60fps = ~60px/sec)

    // Stop CSS animation, use JS animation instead for seamless control
    track.style.animation = 'none';

    // Half width = one full set of logos (duplicate wraps)
    function getHalfWidth() {
      return track.scrollWidth / 2;
    }

    function animate() {
      if (!isDragging) {
        offset -= speed;
      }
      const half = getHalfWidth();
      // Wrap seamlessly
      if (offset <= -half) offset += half;
      if (offset > 0) offset -= half;
      track.style.transform = `translateX(${offset}px)`;
      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    // Mouse drag
    strip.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      strip.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      offset += dx;
      startX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      strip.style.cursor = 'grab';
    });

    strip.style.cursor = 'grab';

    // Touch drag
    strip.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
    }, { passive: true });

    strip.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      offset += dx;
      startX = e.touches[0].clientX;
    }, { passive: true });

    strip.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // === Nav shrink on scroll ===
  const navEl = document.querySelector('nav');
  let navTicking = false;
  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(() => {
        navEl.classList.toggle('nav-scrolled', window.scrollY > 20);
        navTicking = false;
      });
      navTicking = true;
    }
  });

  // === Counter animation for case stats ===
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function formatCounter(value, suffix, hasThousandSep) {
    const abs = Math.abs(value);
    let str = String(abs);
    if (hasThousandSep && abs >= 1000) {
      str = str.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    }
    const displaySuffix = (suffix === 'K+' && value === 0) ? '' : suffix;
    return (value < 0 ? '-' : '') + str + displaySuffix;
  }

  function parseCounterTarget(text) {
    const m = text.trim().match(/^(-?)([\d\s\u00a0]+)(K\+|%)?$/);
    if (!m) return null;
    const numStr = m[2].replace(/[\s\u00a0]/g, '');
    const value = parseInt(numStr, 10);
    if (isNaN(value)) return null;
    return {
      value: m[1] === '-' ? -value : value,
      suffix: m[3] || '',
      hasThousandSep: /[\s\u00a0]/.test(m[2])
    };
  }

  function animateCounter(el, parsed, duration) {
    const { value, suffix, hasThousandSep } = parsed;
    duration = duration || 1500;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.round(easeOutExpo(progress) * value);
      el.textContent = formatCounter(current, suffix, hasThousandSep);
      if (progress < 1) requestAnimationFrame(tick);
    }

    el.textContent = formatCounter(0, suffix, hasThousandSep);
    requestAnimationFrame(tick);
  }

  if (!prefersReducedMotion) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target, entry.target._counterParsed);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.case-stat strong').forEach(el => {
      const parsed = parseCounterTarget(el.textContent);
      if (parsed) {
        el._counterParsed = parsed;
        counterObserver.observe(el);
      }
    });
  }
});
