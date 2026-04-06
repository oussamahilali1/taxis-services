(function () {
  'use strict';

  var meta = document.querySelector('meta[name="app-api-base-url"]');
  var configuredBase = meta ? meta.getAttribute('content') || '' : '';
  var base = configuredBase.replace(/\/+$/, '');
  var isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

  if (base.slice(-4) === '/api') {
    base = base.slice(0, -4);
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
