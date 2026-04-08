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
      // Close all others
      document.querySelectorAll('.barrier.open').forEach(b => b.classList.remove('open'));
      // Toggle current
      if (!wasOpen) barrier.classList.add('open');
    });
  });

  // Open first barrier by default
  const firstBarrier = document.querySelector('.barrier');
  if (firstBarrier) firstBarrier.classList.add('open');
});
