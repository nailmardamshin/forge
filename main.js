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
            entry.target.classList.add('in-view');
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
    span.style.animationDelay = (i * 0.04) + 's';
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
    duration = duration || 2000;
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

  // === Burger menu ===
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking any link OR the form CTA button
    mobileMenu.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // === Lead modal ===
  const modal = document.querySelector('#leadModal');
  const leadForm = document.querySelector('#leadForm');
  const formStatus = document.querySelector('#formStatus');
  const modalContent = document.querySelector('#modalContent');
  const modalSuccess = document.querySelector('#modalSuccess');

  function resetModalState() {
    if (modalContent) modalContent.hidden = false;
    if (modalSuccess) modalSuccess.hidden = true;
    if (leadForm) leadForm.reset();
    if (formStatus) {
      formStatus.className = 'form-status';
      formStatus.textContent = '';
    }
    // Reset submit button state (was stuck as disabled+"Отправляем…" after success)
    const submitBtn = leadForm ? leadForm.querySelector('.lead-submit') : null;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
    }
    // Clear consent error state
    const consentLabel = leadForm ? leadForm.querySelector('.form-consent') : null;
    if (consentLabel) consentLabel.classList.remove('error');
  }

  function openModal(source) {
    if (!modal) return;
    resetModalState();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const resolvedSource = source || 'modal';
    if (leadForm) {
      const sourceInput = leadForm.querySelector('input[name="source"]');
      if (sourceInput) sourceInput.value = resolvedSource;
    }
    // Metrica goal: user showed intent by opening the lead modal
    if (typeof window.forgeTrackGoal === 'function') {
      window.forgeTrackGoal('lead_modal_opened', { source: resolvedSource });
    }
    setTimeout(() => {
      const first = leadForm?.querySelector('input[name="name"]');
      if (first) first.focus();
    }, 120);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    // Reset state after close animation
    setTimeout(resetModalState, 400);
  }

  // Open triggers
  document.querySelectorAll('[data-lead-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.leadModal);
    });
  });

  // Close triggers
  if (modal) {
    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // Form submit
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = leadForm.querySelector('.lead-submit');
      const originalText = submitBtn.textContent;

      // Clear any stale error states from previous submit attempts
      const consentLabelInit = leadForm.querySelector('.form-consent');
      if (consentLabelInit) consentLabelInit.classList.remove('error');

      // Client-side validation
      const required = ['name', 'company', 'contact'];
      for (const field of required) {
        const input = leadForm.querySelector(`[name="${field}"]`);
        if (!input.value.trim()) {
          input.focus();
          formStatus.className = 'form-status error';
          formStatus.textContent = 'Заполните все обязательные поля';
          return;
        }
      }

      // Consent checkbox — must be actively checked (FZ-152 / GDPR)
      const consentInput = leadForm.querySelector('input[name="consent"]');
      const consentLabel = leadForm.querySelector('.form-consent');
      if (consentInput && !consentInput.checked) {
        if (consentLabel) consentLabel.classList.add('error');
        consentInput.focus();
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Нужно согласие на обработку персональных данных';
        return;
      }
      if (consentLabel) consentLabel.classList.remove('error');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем…';
      formStatus.className = 'form-status';
      formStatus.textContent = '';

      const formData = new FormData(leadForm);
      const data = Object.fromEntries(formData.entries());
      // Explicit proof-of-consent fields for legal audit (FZ-152)
      data.consent = true;
      data.consent_timestamp = new Date().toISOString();
      data.consent_text_version = '2025-10-15';

      try {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          const serverMessage = err && err.error ? err.error : null;
          const status = response.status;
          const enriched = new Error(serverMessage || `HTTP ${status}`);
          enriched.serverMessage = serverMessage;
          enriched.status = status;
          throw enriched;
        }

        // Success — replace form content with success block
        if (modalContent) modalContent.hidden = true;
        if (modalSuccess) modalSuccess.hidden = false;
        // Metrica goal: actual conversion — lead successfully submitted to the backend
        if (typeof window.forgeTrackGoal === 'function') {
          window.forgeTrackGoal('lead_submitted', { source: data.source || 'modal' });
        }
        // Auto-close after 6 seconds
        setTimeout(closeModal, 6000);
      } catch (error) {
        console.error('Lead submission error:', error);
        formStatus.className = 'form-status error';
        // Show server message if we have it (e.g. "Требуется согласие...")
        // Otherwise fall back to network-error copy with Telegram lifeline
        if (error && error.serverMessage) {
          formStatus.textContent = '✗ ' + error.serverMessage;
        } else {
          formStatus.innerHTML = '✗ Не&nbsp;удалось отправить. Проверьте интернет или напишите в&nbsp;<a href="https://t.me/nmardamshin" target="_blank" rel="noopener">Telegram</a>.';
        }
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ===============================================================
  // Cookie consent + Yandex Metrica loader
  // ===============================================================
  //
  // How it works:
  //  - On load we check localStorage for a saved consent decision.
  //  - If the user already accepted analytics (and the version matches
  //    the current policy) — Metrica is loaded immediately.
  //  - If no decision yet (or the policy version bumped) — we show the
  //    cookie banner. Nothing is loaded until the user decides.
  //  - Accept → save decision, load Metrica. Reject → save decision,
  //    Metrica stays off. Footer "Управление cookies" re-opens the
  //    banner so the user can change their mind.
  //
  // Metrica is loaded DYNAMICALLY only after consent — no tracking
  // requests hit Yandex before the user agrees.
  //
  // To enable Metrica for real: set METRICA_COUNTER_ID to the real
  // numeric ID (e.g. 12345678) once the counter is registered on
  // metrika.yandex.ru. While it is null, the loader is a no-op and the
  // banner still works — the user's decision is recorded for later.
  //
  // Bump CONSENT_VERSION whenever the cookies/Metrica section of the
  // Privacy Policy changes in a way that should re-prompt the user.
  // ===============================================================

  const METRICA_COUNTER_ID = 108474355;
  const CONSENT_KEY = 'forge_cookie_consent';
  const CONSENT_VERSION = '2025-10-15';

  // Goal tracker — safe no-op if Metrica is not loaded (no consent, blocked, etc.)
  // Register matching goal IDs in Metrica UI: Настройки счётчика → Цели → JavaScript-событие
  window.forgeTrackGoal = function(name, params) {
    if (!METRICA_COUNTER_ID) return;
    if (typeof window.ym !== 'function') return;
    try {
      if (params && Object.keys(params).length) {
        window.ym(METRICA_COUNTER_ID, 'reachGoal', name, params);
      } else {
        window.ym(METRICA_COUNTER_ID, 'reachGoal', name);
      }
    } catch (e) {
      console.warn('Metrica goal failed:', name, e);
    }
  };

  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAcceptBtn = document.getElementById('cookieAccept');
  const cookieRejectBtn = document.getElementById('cookieReject');
  const manageCookiesBtn = document.getElementById('manageCookies');

  function getConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Re-prompt if the policy version bumped
      if (parsed.version !== CONSENT_VERSION) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analytics) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        analytics: Boolean(analytics),
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      // localStorage may be blocked (private mode, quota). Fail quietly —
      // the banner will show again next visit.
      console.warn('Cookie consent: could not persist decision', e);
    }
  }

  function showBanner() {
    if (!cookieBanner) return;
    cookieBanner.hidden = false;
    cookieBanner.setAttribute('aria-hidden', 'false');
  }

  function hideBanner() {
    if (!cookieBanner) return;
    cookieBanner.hidden = true;
    cookieBanner.setAttribute('aria-hidden', 'true');
  }

  let metricaLoaded = false;
  function loadMetrica() {
    if (metricaLoaded) return;
    if (!METRICA_COUNTER_ID) {
      // No counter configured yet — consent is recorded, but nothing to load.
      return;
    }
    metricaLoaded = true;

    // Standard Yandex Metrica snippet, inlined so we control exactly when
    // the request fires.
    (function(m, e, t, r, i, k, a) {
      m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    window.ym(METRICA_COUNTER_ID, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
      trackHash: true
    });
  }

  // Boot: restore decision or show banner
  const storedConsent = getConsent();
  if (storedConsent === null) {
    showBanner();
  } else if (storedConsent.analytics === true) {
    loadMetrica();
  }
  // else: user rejected analytics previously, do nothing

  if (cookieAcceptBtn) {
    cookieAcceptBtn.addEventListener('click', () => {
      saveConsent(true);
      hideBanner();
      loadMetrica();
    });
  }
  if (cookieRejectBtn) {
    cookieRejectBtn.addEventListener('click', () => {
      saveConsent(false);
      hideBanner();
    });
  }
  if (manageCookiesBtn) {
    manageCookiesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showBanner();
    });
  }

  // Metrica goal: clicks on Telegram links anywhere on the page
  // (nav, hero, modal, footer, case cards, etc.) — alternative conversion path.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="t.me/"]');
    if (!link) return;
    if (typeof window.forgeTrackGoal === 'function') {
      const href = link.getAttribute('href') || '';
      // Detect which block the link lives in, for segmentation
      let location = 'other';
      if (link.closest('nav')) location = 'nav';
      else if (link.closest('.modal')) location = 'modal';
      else if (link.closest('footer')) location = 'footer';
      else if (link.closest('.hero')) location = 'hero';
      window.forgeTrackGoal('telegram_click', { href, location });
    }
  });
});
