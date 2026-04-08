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

  // Open first barrier by default
  const firstBarrier = document.querySelector('.barrier');
  if (firstBarrier) firstBarrier.classList.add('open');

  // Marquee drag-to-scroll
  const strip = document.querySelector('.marquee-strip');
  const track = document.querySelector('.marquee-track');
  if (strip && track) {
    let isDragging = false;
    let startX, scrollStart;

    strip.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      track.style.animationPlayState = 'paused';
      strip.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const current = parseFloat(getComputedStyle(track).transform.split(',')[4]) || 0;
      track.style.animation = 'none';
      track.style.transform = `translateX(${current + dx}px)`;
      startX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      strip.style.cursor = 'grab';
      // Resume animation from current position
      const current = parseFloat(getComputedStyle(track).transform.split(',')[4]) || 0;
      track.style.animation = '';
      track.style.animationPlayState = 'running';
    });

    strip.style.cursor = 'grab';

    // Touch support
    strip.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      track.style.animationPlayState = 'paused';
    }, { passive: true });

    strip.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const current = parseFloat(getComputedStyle(track).transform.split(',')[4]) || 0;
      track.style.animation = 'none';
      track.style.transform = `translateX(${current + dx}px)`;
      startX = e.touches[0].clientX;
    }, { passive: true });

    strip.addEventListener('touchend', () => {
      isDragging = false;
      track.style.animation = '';
      track.style.animationPlayState = 'running';
    });
  }
});
