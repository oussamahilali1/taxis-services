(function () {
  'use strict';

  var body = document.body;
  var navbar = document.querySelector('.navbar');
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');
  var mobileClose = document.querySelector('.mobile-close');
  var mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  var scrollTopBtn = document.querySelector('.scroll-top');
  var heroBg = document.getElementById('heroBg');
  var focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var previouslyFocused = null;
  var closeTimer = null;

  function setNavbarState() {
    if (!navbar) {
      return;
    }

    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  function getFocusableElements(container) {
    return Array.prototype.slice.call(container.querySelectorAll(focusableSelector)).filter(function (element) {
      return !element.hasAttribute('hidden');
    });
  }

  function openMenu() {
    if (!mobileMenu || !hamburger) {
      return;
    }

    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    previouslyFocused = document.activeElement;
    mobileMenu.hidden = false;
    window.requestAnimationFrame(function () {
      mobileMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      body.classList.add('menu-open');

      var focusables = getFocusableElements(mobileMenu);
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    });
  }

  function closeMenu() {
    if (!mobileMenu || !hamburger) {
      return;
    }

    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');

    closeTimer = window.setTimeout(function () {
      mobileMenu.hidden = true;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    }, 220);
  }

  function trapMenuFocus(event) {
    if (!mobileMenu || mobileMenu.hidden || event.key !== 'Tab') {
      return;
    }

    var focusables = getFocusableElements(mobileMenu);
    if (focusables.length === 0) {
      return;
    }

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (mobileMenu && !mobileMenu.hidden && mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMenu);
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }

    trapMenuFocus(event);
  });

  function updateScrollTopButton() {
    if (!scrollTopBtn) {
      return;
    }

    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function updateHeroParallax() {
    if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (window.scrollY < window.innerHeight) {
      heroBg.style.transform = 'translateY(' + window.scrollY * 0.28 + 'px)';
    }
  }

  window.addEventListener('scroll', setNavbarState, { passive: true });
  window.addEventListener('scroll', updateScrollTopButton, { passive: true });
  window.addEventListener('scroll', updateHeroParallax, { passive: true });
  setNavbarState();
  updateScrollTopButton();

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

    animatedElements.forEach(function (element) {
      observer.observe(element);
    });
  } else {
    animatedElements.forEach(function (element) {
      element.classList.add('animated');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      var targetId = anchor.getAttribute('href');

      if (!targetId || targetId === '#') {
        return;
      }

      var target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      var offset = navbar ? navbar.offsetHeight : 72;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  function showFormMessage(element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.className = 'form-message ' + type;
    element.hidden = false;
  }

  function clearFieldState(field) {
    field.style.borderColor = '';
    field.removeAttribute('aria-invalid');
  }

  document.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      clearFieldState(field);
    });
    field.addEventListener('focus', function () {
      clearFieldState(field);
    });
  });

  document.querySelectorAll('form[action*="formspree"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var submitBtn = form.querySelector('.form-submit');
      var messageEl = form.querySelector('.form-message');
      var originalText = submitBtn ? submitBtn.textContent : '';
      var requiredFields = Array.prototype.slice.call(form.querySelectorAll('[required]'));
      var contactFields = Array.prototype.slice.call(form.querySelectorAll('[data-contact-field]'));
      var valid = true;

      if (messageEl) {
        messageEl.hidden = true;
        messageEl.textContent = '';
        messageEl.className = 'form-message';
      }

      requiredFields.forEach(function (field) {
        clearFieldState(field);
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          field.setAttribute('aria-invalid', 'true');
          valid = false;
        }
      });

      if (form.hasAttribute('data-requires-contact') && contactFields.length > 0) {
        var hasContact = contactFields.some(function (field) {
          return field.value.trim() !== '';
        });

        if (!hasContact) {
          contactFields.forEach(function (field) {
            field.style.borderColor = '#ef4444';
            field.setAttribute('aria-invalid', 'true');
          });
          valid = false;
          showFormMessage(messageEl, 'Veuillez indiquer au moins un téléphone ou une adresse email.', 'error');
        }
      }

      if (!valid) {
        if (messageEl && messageEl.hidden) {
          showFormMessage(messageEl, 'Veuillez compléter les champs obligatoires.', 'error');
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Form submit failed');
          }

          form.reset();
          showFormMessage(messageEl, 'Votre demande a bien ete envoyee. Nous revenons vers vous rapidement.', 'success');
        })
        .catch(function () {
          showFormMessage(messageEl, "Une erreur s'est produite. Vous pouvez aussi nous appeler directement.", 'error');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        });
    });
  });
})();
