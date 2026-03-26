document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const navbar = document.querySelector('.navbar');
  const scrollTopBtn = document.querySelector('.scroll-top');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');

  const onScroll = () => {
    const isScrolled = window.scrollY > 40;
    navbar?.classList.toggle('scrolled', isScrolled);
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 420);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const openMenu = () => {
    if (!mobileMenu) {
      return;
    }
    mobileMenu.classList.add('open');
    body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    if (!mobileMenu) {
      return;
    }
    mobileMenu.classList.remove('open');
    body.style.overflow = '';
  };

  hamburger?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  const animatedItems = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && animatedItems.length) {
    const animationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.08
    });

    animatedItems.forEach((item) => animationObserver.observe(item));
  } else {
    animatedItems.forEach((item) => item.classList.add('visible'));
  }

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const normalizePath = (value) => {
    const cleaned = value.split('#')[0].split('?')[0];
    if (!cleaned || cleaned === '/') {
      return 'index.html';
    }
    return cleaned.split('/').pop() || 'index.html';
  };

  const currentPage = normalizePath(window.location.pathname);
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) {
      return;
    }
    const target = normalizePath(href);
    if (target === currentPage) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('form[data-enhanced-form]').forEach((form) => {
    const message = form.querySelector('.form-message');
    const submitButton = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async (event) => {
      const action = form.getAttribute('action');
      if (!action) {
        return;
      }

      event.preventDefault();

      if (!submitButton) {
        return;
      }

      if (form.hasAttribute('data-contact-form')) {
        const phone = form.querySelector('[name="phone"]');
        const email = form.querySelector('[name="email"]');
        const hasPhone = Boolean(phone?.value.trim());
        const hasEmail = Boolean(email?.value.trim());

        if (!hasPhone && !hasEmail) {
          if (message) {
            message.textContent = 'Ajoutez au moins un numero de telephone ou une adresse email.';
            message.classList.remove('is-success');
            message.classList.add('is-error');
            message.style.display = 'block';
          }
          return;
        }
      }

      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours...';
      message?.classList.remove('is-success', 'is-error');
      if (message) {
        message.style.display = 'none';
        message.textContent = '';
      }

      try {
        const response = await fetch(action, {
          method: form.method || 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: new FormData(form)
        });

        if (!response.ok) {
          throw new Error('request_failed');
        }

        form.reset();
        if (message) {
          message.textContent = 'Votre demande a bien ete envoyee. Nous vous recontactons rapidement.';
          message.classList.add('is-success');
        }
      } catch (error) {
        if (message) {
          message.textContent = 'L envoi a echoue. Appelez-nous au +32 486 06 79 27 si besoin.';
          message.classList.add('is-error');
        }
      } finally {
        if (message) {
          message.style.display = 'block';
        }
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  });
});
