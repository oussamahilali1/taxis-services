/* ================================================================
   TAXI ANDERLUES — Main JavaScript
   Menu, Scroll, Animations, Form Handling
   ================================================================ */

(function () {
  'use strict';

  // ── Navbar Scroll Effect ──
  const navbar = document.querySelector('.navbar');

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ── Mobile Menu ──
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  function openMenu() {
    if (mobileMenu) {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMenu() {
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // ── Scroll to Top ──
  const scrollTopBtn = document.querySelector('.scroll-top');

  function handleScrollTop() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScrollTop, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Intersection Observer for Animations ──
  var animatedElements = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window && animatedElements.length > 0) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    animatedElements.forEach(function (el) {
      el.classList.add('animated');
    });
  }

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = navbar ? navbar.offsetHeight : 72;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ── Active Nav Link on Scroll ──
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ── Form Handling (Booking + Contact) ──
  var forms = document.querySelectorAll('form[action*="formspree"]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('.form-submit');
      var messageEl = form.querySelector('.form-message');
      var originalText = submitBtn ? submitBtn.textContent : '';

      // Validate required fields
      var requiredFields = form.querySelectorAll('[required]');
      var isValid = true;

      requiredFields.forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          isValid = false;
        }
      });

      if (!isValid) {
        if (messageEl) {
          messageEl.textContent = 'Veuillez remplir tous les champs obligatoires.';
          messageEl.className = 'form-message error';
          messageEl.style.display = 'block';
        }
        return;
      }

      // Submit
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }

      var formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
        .then(function (response) {
          if (response.ok) {
            if (messageEl) {
              messageEl.textContent = 'Votre demande a ete envoyee avec succes. Nous vous recontactons rapidement.';
              messageEl.className = 'form-message success';
              messageEl.style.display = 'block';
            }
            form.reset();
          } else {
            throw new Error('Erreur serveur');
          }
        })
        .catch(function () {
          if (messageEl) {
            messageEl.textContent = "Une erreur s'est produite. Veuillez reessayer ou nous appeler directement.";
            messageEl.className = 'form-message error';
            messageEl.style.display = 'block';
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        });
    });
  });

  // Clear field error on focus
  document.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('focus', function () {
      this.style.borderColor = '';
    });
  });

  // ── Hero Booking Form (non-Formspree) ──
  var heroForm = document.querySelector('.hero-card .booking-form');
  if (heroForm && !heroForm.action.includes('formspree')) {
    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Scroll to the full booking form
      var bookingSection = document.getElementById('booking');
      if (bookingSection) {
        var offset = navbar ? navbar.offsetHeight : 72;
        var top = bookingSection.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  }
})();