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
  var focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
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

  function getFieldContainer(field) {
    return field.closest('.form-group, .form-check');
  }

  function getFieldErrorElement(field, createIfMissing) {
    var container = getFieldContainer(field);
    var fieldKey = field.name || field.id;

    if (!container || !fieldKey) {
      return null;
    }

    var existing = container.querySelector('.field-error[data-field="' + fieldKey + '"]');
    if (existing) {
      return existing;
    }

    if (!createIfMissing) {
      return null;
    }

    var errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.dataset.field = fieldKey;
    errorEl.hidden = true;
    container.appendChild(errorEl);
    return errorEl;
  }

  function clearFieldState(field) {
    var container = getFieldContainer(field);
    var errorEl = getFieldErrorElement(field, false);

    field.style.borderColor = '';
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');

    if (container) {
      container.classList.remove('has-error');
    }

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
      errorEl.removeAttribute('id');
    }
  }

  function setFieldError(field, message) {
    var container = getFieldContainer(field);
    var errorEl = getFieldErrorElement(field, true);
    var errorId = (field.id || field.name || 'field') + '-error';

    field.style.borderColor = '#ef4444';
    field.setAttribute('aria-invalid', 'true');

    if (container) {
      container.classList.add('has-error');
    }

    if (errorEl) {
      errorEl.id = errorId;
      errorEl.textContent = message;
      errorEl.hidden = false;
      field.setAttribute('aria-describedby', errorId);
    }
  }

  function clearFormFieldStates(form) {
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      clearFieldState(field);
    });
  }

  document.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      clearFieldState(field);
    });
    field.addEventListener('change', function () {
      clearFieldState(field);
    });
    field.addEventListener('focus', function () {
      clearFieldState(field);
    });
  });

  function getApiUrl(path) {
    if (window.TaxisServicesConfig && typeof window.TaxisServicesConfig.apiUrl === 'function') {
      return window.TaxisServicesConfig.apiUrl(path);
    }

    return path;
  }

  var captchaConfig = (function () {
    var modeMeta = document.querySelector('meta[name="app-captcha-mode"]');
    var providerMeta = document.querySelector('meta[name="app-captcha-provider"]');
    var siteKeyMeta = document.querySelector('meta[name="app-captcha-site-key"]');
    var mode = modeMeta ? String(modeMeta.getAttribute('content') || '').trim().toLowerCase() : '';
    var provider = providerMeta ? String(providerMeta.getAttribute('content') || '').trim().toLowerCase() : '';
    var siteKey = siteKeyMeta ? String(siteKeyMeta.getAttribute('content') || '').trim() : '';

    return {
      mode: mode,
      provider: provider,
      siteKey: siteKey,
      enabled: Boolean(siteKey && provider && mode && mode !== 'off'),
    };
  })();

  var captchaScriptPromise = null;

  function getCaptchaApi() {
    if (captchaConfig.provider === 'turnstile') {
      return window.turnstile || null;
    }

    if (captchaConfig.provider === 'hcaptcha') {
      return window.hcaptcha || null;
    }

    return null;
  }

  function loadCaptchaScript() {
    if (!captchaConfig.enabled) {
      return Promise.resolve(null);
    }

    var existingApi = getCaptchaApi();
    if (existingApi) {
      return Promise.resolve(existingApi);
    }

    if (captchaScriptPromise) {
      return captchaScriptPromise;
    }

    captchaScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src =
        captchaConfig.provider === 'turnstile'
          ? 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
          : 'https://js.hcaptcha.com/1/api.js?render=explicit';

      script.onload = function () {
        var api = getCaptchaApi();
        if (api) {
          resolve(api);
          return;
        }

        reject(new Error('Captcha API unavailable after script load.'));
      };

      script.onerror = function () {
        reject(new Error('Captcha script failed to load.'));
      };

      document.head.appendChild(script);
    });

    return captchaScriptPromise;
  }

  function ensureCaptchaTokenField(form) {
    var tokenField = getFieldByName(form, 'captchaToken');
    if (tokenField) {
      return tokenField;
    }

    tokenField = document.createElement('input');
    tokenField.type = 'hidden';
    tokenField.name = 'captchaToken';
    form.appendChild(tokenField);
    return tokenField;
  }

  function resetCaptcha(form) {
    if (!captchaConfig.enabled) {
      return;
    }

    var api = getCaptchaApi();
    var tokenField = getFieldByName(form, 'captchaToken');

    if (tokenField) {
      tokenField.value = '';
    }

    if (api && form && form._captchaWidgetId !== undefined && form._captchaWidgetId !== null) {
      api.reset(form._captchaWidgetId);
    }
  }

  function attachCaptcha(form) {
    if (!captchaConfig.enabled) {
      return;
    }

    var container = form.querySelector('.form-captcha');
    var widgetTarget = container ? container.querySelector('.form-captcha-widget') : null;
    var note = container ? container.querySelector('.form-captcha-note') : null;
    var tokenField = ensureCaptchaTokenField(form);

    if (!container || !widgetTarget || widgetTarget.dataset.rendered === 'true') {
      return;
    }

    loadCaptchaScript()
      .then(function (api) {
        var widgetId = api.render(widgetTarget, {
          sitekey: captchaConfig.siteKey,
          theme: 'light',
          callback: function (token) {
            tokenField.value = token || '';
            container.dataset.failed = 'false';
          },
          'expired-callback': function () {
            tokenField.value = '';
          },
          'error-callback': function () {
            tokenField.value = '';
            container.dataset.failed = 'true';
            if (note) {
              note.textContent = "Le contrôle anti-spam doit être rechargé avant l'envoi.";
            }
          },
        });

        form._captchaWidgetId = widgetId;
        widgetTarget.dataset.rendered = 'true';
      })
      .catch(function () {
        container.dataset.failed = 'true';
        if (note) {
          note.textContent = "Le contrôle anti-spam n'a pas pu être chargé.";
        }
      });
  }

  function getCaptchaError(form, payload) {
    if (!captchaConfig.enabled) {
      return '';
    }

    var container = form.querySelector('.form-captcha');
    if (!container) {
      return captchaConfig.mode === 'required' ? "Le contrôle anti-spam est indisponible." : '';
    }

    if (container.dataset.failed === 'true') {
      return "Le contrôle anti-spam n'a pas pu être chargé. Rechargez la page ou contactez-nous directement.";
    }

    if (captchaConfig.mode === 'required' && !payload.captchaToken) {
      return 'Veuillez confirmer le contrôle anti-spam.';
    }

    return '';
  }

  function splitDateTime(value) {
    if (!value || value.indexOf('T') === -1) {
      return { pickupDate: '', pickupTime: '' };
    }

    var parts = value.split('T');
    return {
      pickupDate: parts[0] || '',
      pickupTime: parts[1] ? parts[1].slice(0, 5) : '',
    };
  }

  function normalizeLookupKey(value) {
    return String(value || '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function normalizeServiceType(value) {
    var normalized = normalizeLookupKey(value);
    var serviceMap = {
      local_taxi: 'LOCAL_TAXI',
      'taxi de proximite': 'LOCAL_TAXI',
      airport_shuttle: 'AIRPORT_SHUTTLE',
      'navette aeroport': 'AIRPORT_SHUTTLE',
      business: 'BUSINESS',
      'transport business': 'BUSINESS',
      pmr: 'PMR',
      'transport pmr': 'PMR',
      parcel_delivery: 'PARCEL_DELIVERY',
      'livraison de colis': 'PARCEL_DELIVERY',
      quick_request: 'QUICK_REQUEST',
      'demande rapide': 'QUICK_REQUEST',
    };

    return serviceMap[normalized] || String(value || '').trim();
  }

  function toBoolean(value) {
    return value === 'on' || value === 'true' || value === true;
  }

  function resetFormUi(messageEl) {
    if (!messageEl) {
      return;
    }

    messageEl.hidden = true;
    messageEl.textContent = '';
    messageEl.className = 'form-message';
  }

  function getFieldByName(form, name) {
    var field = form.elements.namedItem(name);
    return field && field.tagName ? field : null;
  }

  function normalizeServerFieldPath(path) {
    var aliases = {
      fullName: 'name',
      pickupLocation: 'pickup',
      dropoffLocation: 'dropoff',
      serviceType: 'service',
      datetime: 'datetime',
      pickupDate: 'datetime',
      pickupTime: 'datetime',
      contactQuick: 'contact_quick',
      'metadata.company': 'company',
      'metadata.vehicleType': 'vehicle',
      'metadata.vehiclePreference': 'vehicle',
      'metadata.luggage': 'luggage',
      'metadata.childSeatNeeded': 'child_seat',
      'metadata.accessibilityNeeded': 'accessibility',
      'metadata.airportDetails.flightNumber': 'flight_number',
      'metadata.airportDetails.airportName': 'airport_name',
      'metadata.airportDetails.terminal': 'terminal',
      'metadata.airportDetails.direction': 'airport_direction',
    };

    return aliases[path] || path;
  }

  function applyFieldErrors(form, errors) {
    var firstField = null;

    errors.forEach(function (error) {
      var fieldName = normalizeServerFieldPath(error.path || error.field || '');
      var field = getFieldByName(form, fieldName);

      if (!field) {
        return;
      }

      setFieldError(field, error.message);

      if (!firstField) {
        firstField = field;
      }
    });

    return firstField;
  }

  function buildApiError(payload) {
    var error = new Error(
      payload && payload.error && payload.error.message
        ? payload.error.message
        : 'Une erreur est survenue.'
    );

    error.details = payload && payload.error ? payload.error.details : undefined;
    error.code = payload && payload.error ? payload.error.code : undefined;
    return error;
  }

  function normalizePhoneValue(value) {
    return String(value || '')
      .trim()
      .replace(/[^0-9+()./\-\s]/g, '');
  }

  function isPhoneLike(value) {
    var normalized = normalizePhoneValue(value);
    var digits = normalized.replace(/[^0-9]/g, '');

    return normalized.length >= 6 && normalized.length <= 25 && digits.length >= 6;
  }

  function isEmailLike(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function validateBookingPayload(form, payload) {
    var errors = [];
    var isQuickRequest =
      payload.requestVariant === 'quick' ||
      payload.serviceType === 'QUICK_REQUEST' ||
      payload.serviceType === 'Demande rapide';

    if (!payload.pickupLocation) {
      errors.push({
        path: 'pickup',
        message: "L'adresse de prise en charge est obligatoire.",
      });
    }

    if (!payload.dropoffLocation) {
      errors.push({
        path: 'dropoff',
        message: "L'adresse de destination est obligatoire.",
      });
    }

    if (isQuickRequest) {
      if (!payload.contactQuick) {
        errors.push({
          path: 'contact_quick',
          message: 'Veuillez indiquer un telephone ou un email.',
        });
      } else if (!isEmailLike(payload.contactQuick) && !isPhoneLike(payload.contactQuick)) {
        errors.push({
          path: 'contact_quick',
          message: 'Veuillez indiquer un telephone ou un email valide.',
        });
      }

      return errors;
    }

    if (!payload.serviceType) {
      errors.push({
        path: 'service',
        message: 'Veuillez selectionner un service.',
      });
    }

    if (!payload.passengers) {
      errors.push({
        path: 'passengers',
        message: 'Veuillez indiquer le nombre de passagers.',
      });
    }

    if (!payload.fullName) {
      errors.push({
        path: 'name',
        message: 'Le nom complet est obligatoire.',
      });
    }

    if (!payload.phone) {
      errors.push({
        path: 'phone',
        message: 'Le numero de telephone est obligatoire.',
      });
    } else if (!isPhoneLike(payload.phone)) {
      errors.push({
        path: 'phone',
        message: 'Le numero de telephone est invalide.',
      });
    }

    if (payload.email && !isEmailLike(payload.email)) {
      errors.push({
        path: 'email',
        message: "L'adresse email est invalide.",
      });
    }

    if (!payload.dateTime && !(payload.pickupDate && payload.pickupTime)) {
      errors.push({
        path: 'datetime',
        message: "La date et l'heure souhaitees sont obligatoires.",
      });
    }

    if (payload.company && payload.company.length > 120) {
      errors.push({
        path: 'company',
        message: "Le nom de l'entreprise est trop long.",
      });
    }

    if (payload.luggage && payload.luggage.length > 160) {
      errors.push({
        path: 'luggage',
        message: 'La description des bagages est trop longue.',
      });
    }

    if (payload.notes && payload.notes.length > 500) {
      errors.push({
        path: 'notes',
        message: 'Les precisions utiles ne doivent pas depasser 500 caracteres.',
      });
    }

    return errors;
  }

  function validateContactPayload(payload) {
    var errors = [];

    if (!payload.fullName) {
      errors.push({
        path: 'name',
        message: 'Le nom complet est obligatoire.',
      });
    }

    if (!payload.message || payload.message.length < 10) {
      errors.push({
        path: 'message',
        message: 'Veuillez decrire votre demande en quelques mots.',
      });
    }

    if (!payload.phone && !payload.email && !payload.contactQuick) {
      errors.push({
        path: 'phone',
        message: 'Veuillez indiquer un telephone ou une adresse email.',
      });
    }

    if (payload.phone && !isPhoneLike(payload.phone)) {
      errors.push({
        path: 'phone',
        message: 'Le numero de telephone est invalide.',
      });
    }

    if (payload.email && !isEmailLike(payload.email)) {
      errors.push({
        path: 'email',
        message: "L'adresse email est invalide.",
      });
    }

    return errors;
  }

  function validateFormPayload(form, payload) {
    return form.getAttribute('data-api-form') === 'contact'
      ? validateContactPayload(payload)
      : validateBookingPayload(form, payload);
  }

  function buildBookingPayload(form) {
    var data = new FormData(form);
    var dateTime = (data.get('datetime') || '').trim();
    var schedule = splitDateTime(data.get('datetime'));
    var vehicleType = (data.get('vehicle') || '').trim();

    return {
      fullName: (data.get('name') || '').trim(),
      phone: (data.get('phone') || '').trim(),
      email: (data.get('email') || '').trim(),
      contactQuick: (data.get('contact_quick') || '').trim(),
      pickupLocation: (data.get('pickup') || '').trim(),
      dropoffLocation: (data.get('dropoff') || '').trim(),
      dateTime: dateTime,
      pickupDate: (data.get('pickupDate') || '').trim() || schedule.pickupDate,
      pickupTime: (data.get('pickupTime') || '').trim() || schedule.pickupTime,
      passengers: (data.get('passengers') || '').trim(),
      serviceType: normalizeServiceType(data.get('service')),
      notes: (data.get('notes') || '').trim(),
      sourcePage: (data.get('source_page') || '').trim(),
      website: (data.get('website') || '').trim(),
      company: (data.get('company') || '').trim(),
      vehicleType: vehicleType,
      vehiclePreference: vehicleType,
      luggage: (data.get('luggage') || '').trim(),
      childSeat: toBoolean(data.get('child_seat')),
      accessibility: toBoolean(data.get('accessibility')),
      flightNumber: (data.get('flight_number') || data.get('flightNumber') || '').trim(),
      airportName: (data.get('airport_name') || data.get('airportName') || data.get('airport') || '').trim(),
      airportTerminal: (data.get('airport_terminal') || data.get('airportTerminal') || data.get('terminal') || '').trim(),
      airportDirection: (data.get('airport_direction') || data.get('airportDirection') || '').trim(),
      captchaToken: (data.get('captchaToken') || data.get('captcha_token') || '').trim(),
      requestVariant: form.getAttribute('data-form-variant') || 'full',
    };
  }

  function buildContactPayload(form) {
    var data = new FormData(form);
    var service = (data.get('service') || '').trim();
    var subject = (data.get('subject') || '').trim();

    return {
      fullName: (data.get('name') || '').trim(),
      phone: (data.get('phone') || '').trim(),
      email: (data.get('email') || '').trim(),
      subject: subject || service,
      service: service,
      message: (data.get('message') || data.get('notes') || '').trim(),
      sourcePage: (data.get('source_page') || '').trim(),
      website: (data.get('website') || '').trim(),
      contactQuick: (data.get('contact_quick') || '').trim(),
      captchaToken: (data.get('captchaToken') || data.get('captcha_token') || '').trim(),
    };
  }

  function getFormPayload(form) {
    return form.getAttribute('data-api-form') === 'contact' ? buildContactPayload(form) : buildBookingPayload(form);
  }

  function getFormEndpoint(form) {
    return form.getAttribute('data-api-form') === 'contact' ? '/api/contacts' : '/api/bookings';
  }

  function getSuccessMessage(form) {
    return form.getAttribute('data-api-form') === 'contact'
      ? 'Votre message a bien ete envoye. Nous revenons vers vous rapidement.'
      : 'Votre demande a bien ete envoyee. Nous revenons vers vous rapidement.';
  }

  document.querySelectorAll('form[data-api-form]').forEach(function (form) {
    attachCaptcha(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var submitBtn = form.querySelector('.form-submit');
      var captchaContainer = form.querySelector('.form-captcha');
      var messageEl = form.querySelector('.form-message');
      var originalText = submitBtn ? submitBtn.textContent : '';
      var payload = getFormPayload(form);
      var clientErrors = [];
      var firstField = null;
      var captchaError = '';

      resetFormUi(messageEl);
      clearFormFieldStates(form);
      clientErrors = validateFormPayload(form, payload);
      firstField = applyFieldErrors(form, clientErrors);

      if (clientErrors.length > 0) {
        showFormMessage(messageEl, 'Veuillez corriger les champs signales.', 'error');
        if (firstField && typeof firstField.focus === 'function') {
          firstField.focus();
        }
        return;
      }

      captchaError = getCaptchaError(form, payload);
      if (captchaError) {
        showFormMessage(messageEl, captchaError, 'error');
        if (captchaContainer && typeof captchaContainer.scrollIntoView === 'function') {
          captchaContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }

      fetch(getApiUrl(getFormEndpoint(form)), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return {};
            })
            .then(function (payload) {
              if (!response.ok) {
                throw buildApiError(payload);
              }

              form.reset();
              resetFormUi(messageEl);
              clearFormFieldStates(form);
              resetCaptcha(form);
              showFormMessage(messageEl, getSuccessMessage(form), 'success');
            });
        })
        .catch(function (error) {
          var invalidField = null;

          if (error && error.details && error.details.length) {
            invalidField = applyFieldErrors(form, error.details);
          }

          showFormMessage(
            messageEl,
            error && error.message
              ? error.message
              : "Une erreur s'est produite. Vous pouvez aussi nous appeler directement.",
            'error'
          );

          if (invalidField && typeof invalidField.focus === 'function') {
            invalidField.focus();
          }
        })
        .finally(function () {
          resetCaptcha(form);

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        });
    });
  });
})();
