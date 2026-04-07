(function () {
  'use strict';

  var meta = document.querySelector('meta[name="app-api-base-url"]');
  var isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  var configuredBase = meta ? String(meta.getAttribute('content') || '').trim() : '';
  var base = configuredBase.replace(/\/+$/, '');

  if (base.slice(-4) === '/api') {
    base = base.slice(0, -4);
  }

  if (base && !isLocalhost) {
    try {
      var configuredHost = new URL(base).hostname;
      if (/^(localhost|127\.0\.0\.1)$/i.test(configuredHost)) {
        base = '';
      }
    } catch (_error) {
      base = '';
    }
  }

  if (!base) {
    base = isLocalhost ? 'http://localhost:4000' : window.location.origin;
  }

  window.TaxisServicesConfig = {
    apiBaseUrl: base,
    apiUrl: function (path) {
      if (/^https?:\/\//i.test(path)) {
        return path;
      }

      return base + (path.charAt(0) === '/' ? path : '/' + path);
    },
  };
})();
