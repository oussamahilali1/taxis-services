/* ============================================================
   TAXI ANDERLUES — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const scrollTopBtn = document.querySelector('.scroll-top');

  /* ── Navbar scroll effect ─────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ──────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');

  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const closeMenu = () => {
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  };
  mobileClose?.addEventListener('click', closeMenu);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ── Scroll animations ────────────────────────────────── */
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

  document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));

  /* ── Scroll to top ────────────────────────────────────── */
  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* -- Booking form -------------------------------------- */
  const bookingForms = document.querySelectorAll('.booking-form');
  bookingForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      const action = form.getAttribute('action');
      if (action && action.trim() !== '') {
        return;
      }
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = 'Reservation envoyee';
      btn.style.background = '#2ecc71';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  });

/* ── Active nav link ──────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPage) {
      a.style.color = 'var(--gold)';
    }
  });

});
