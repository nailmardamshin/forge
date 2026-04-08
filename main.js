// Forge Landing — Interactions
document.addEventListener('DOMContentLoaded', () => {

  // === Scroll fade-in (threshold 0.25 for later trigger) ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // === Accordion for barriers — smooth scrollHeight ===
  document.querySelectorAll('.barrier-q').forEach(q => {
    q.addEventListener('click', () => {
      const barrier = q.parentElement;
      const answer = barrier.querySelector('.barrier-a');
      const wasOpen = barrier.classList.contains('open');

      // Close all open barriers
      document.querySelectorAll('.barrier.open').forEach(b => {
        if (b === barrier) return;
        b.querySelector('.barrier-a').style.maxHeight = '0';
        b.classList.remove('open');
      });

      if (wasOpen) {
        answer.style.maxHeight = '0';
        barrier.classList.remove('open');
      } else {
        barrier.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 36 + 'px';
      }
    });
  });

  // Open first barrier on load
  const firstBarrier = document.querySelector('.barrier');
  if (firstBarrier) {
    firstBarrier.classList.add('open');
    const firstAnswer = firstBarrier.querySelector('.barrier-a');
    firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 36 + 'px';
  }

  // Recalc open accordion on resize
  window.addEventListener('resize', () => {
    const open = document.querySelector('.barrier.open .barrier-a');
    if (open) open.style.maxHeight = open.scrollHeight + 36 + 'px';
  });

  // === Marquee — drag-to-scroll + hover-slow + momentum ===
  const strip = document.querySelector('.marquee-strip');
  const track = document.querySelector('.marquee-track');
  if (strip && track) {
    let isDragging = false;
    let startX;
    let offset = 0;
    let currentSpeed = 1.8;
    let targetSpeed = 1.8;
    let velocity = 0;

    track.style.animation = 'none';
    if (prefersReducedMotion) targetSpeed = 0;

    function getHalfWidth() {
      return track.scrollWidth / 2;
    }

    function animate() {
      // Smooth speed interpolation
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;

      if (!isDragging) {
        if (Math.abs(velocity) > 0.5) {
          // Momentum after drag
          offset += velocity;
          velocity *= 0.95;
        } else {
          // Normal auto-scroll
          offset -= currentSpeed;
          velocity = 0;
        }
      }

      const half = getHalfWidth();
      if (offset <= -half) offset += half;
      if (offset > 0) offset -= half;
      track.style.transform = `translateX(${offset}px)`;
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // Hover: slow down
    strip.addEventListener('mouseenter', () => {
      if (!isDragging) targetSpeed = 0.5;
    });
    strip.addEventListener('mouseleave', () => {
      targetSpeed = 1.8;
    });

    // Mouse drag
    strip.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      velocity = 0;
      strip.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      offset += dx;
      velocity = dx * 0.5;
      startX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      strip.style.cursor = 'grab';
    });

    strip.style.cursor = 'grab';

    // Touch drag with momentum
    strip.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      velocity = 0;
    }, { passive: true });

    strip.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      offset += dx;
      velocity = dx * 0.5;
      startX = e.touches[0].clientX;
    }, { passive: true });

    strip.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // === Scroll-triggered entrances (Point B, Final CTA) ===
  if (!prefersReducedMotion) {
    function observeEntrance(selector, opts) {
      const el = document.querySelector(selector);
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = opts.from;
      el.style.transition = opts.transition;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: opts.threshold || 0.3 });
      obs.observe(el);
    }

    observeEntrance('.point-b', {
      from: 'scale(0.96)',
      transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
      threshold: 0.4
    });

    observeEntrance('.final-cta', {
      from: 'translateY(24px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
      threshold: 0.2
    });
  }

  // === Stack-strip stagger delays ===
  document.querySelectorAll('.stack-strip span').forEach((span, i) => {
    span.style.animationDelay = (i * 0.03) + 's';
  });

  // === Nav shadow on scroll ===
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
