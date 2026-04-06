(function () {
  'use strict';

  var page = document.body ? document.body.getAttribute('data-admin-page') : null;

  if (!page) {
    return;
  }

  var state = {
    csrfToken: '',
    admin: null,
    bookings: {
      page: 1,
      pageSize: 8,
      totalPages: 1,
      selectedId: null,
      search: '',
      status: '',
    },
    contacts: {
      page: 1,
      pageSize: 8,
      totalPages: 1,
      selectedId: null,
      search: '',
      status: '',
    },
  };

  function qs(selector) {
    return document.querySelector(selector);
  }

  function getApiUrl(path) {
    if (window.TaxiAnderluesConfig && typeof window.TaxiAnderluesConfig.apiUrl === 'function') {
      return window.TaxiAnderluesConfig.apiUrl(path);
    }

    return path;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function redirectToLogin() {
    window.location.href = 'admin-login.html';
  }

  function formatDate(value) {
    if (!value) {
      return 'Non renseigné';
    }

    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('fr-BE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  function formatStatusLabel(status) {
    var labels = {
      PENDING: 'En attente',
      IN_REVIEW: 'En cours',
      CONFIRMED: 'Confirmée',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
      SPAM: 'Spam',
      NEW: 'Nouveau',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolu',
      ARCHIVED: 'Archivé',
      LOCAL_TAXI: 'Taxi de proximité',
      AIRPORT_SHUTTLE: 'Navette aéroport',
      BUSINESS: 'Transport business',
      PMR: 'Transport PMR',
      PARCEL_DELIVERY: 'Livraison de colis',
      QUICK_REQUEST: 'Demande rapide',
    };

    return labels[status] || status;
  }

  function renderStatusPill(status) {
    return (
      '<span class="admin-status-pill ' +
      String(status || '').toLowerCase() +
      '">' +
      escapeHtml(formatStatusLabel(status || '')) +
      '</span>'
    );
  }

  function buildQuery(params) {
    var query = new URLSearchParams();

    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value !== '' && value !== null && value !== undefined) {
        query.set(key, value);
      }
    });

    return query.toString();
  }

  function apiRequest(path, options) {
    var requestOptions = options || {};
    var method = (requestOptions.method || 'GET').toUpperCase();
    var headers = {
      Accept: 'application/json',
    };

    if (requestOptions.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (!requestOptions.skipCsrf && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS' && state.csrfToken) {
      headers['X-CSRF-Token'] = state.csrfToken;
    }

    return fetch(getApiUrl(path), {
      method: method,
      credentials: 'include',
      headers: headers,
      body: requestOptions.body !== undefined ? JSON.stringify(requestOptions.body) : undefined,
    }).then(function (response) {
      return response
        .json()
        .catch(function () {
          return {};
        })
        .then(function (payload) {
          if (!response.ok) {
            if (response.status === 401 && !requestOptions.suppressRedirect) {
              redirectToLogin();
            }

            throw new Error(
              payload && payload.error && payload.error.message
                ? payload.error.message
                : 'Une erreur est survenue.'
            );
          }

          return payload;
        });
    });
  }

  function showMessage(element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.hidden = false;
    element.style.color = type === 'error' ? '#ff8b8b' : '#9ae6b4';
  }

  function clearMessage(element) {
    if (!element) {
      return;
    }

    element.hidden = true;
    element.textContent = '';
  }

  function renderDataList(element, fields) {
    element.innerHTML = fields
      .map(function (field) {
        return (
          '<div><dt>' +
          escapeHtml(field.label) +
          '</dt><dd>' +
          String(field.value == null ? 'Non renseigné' : field.value)
            .split('\n')
            .map(function (line) {
              return escapeHtml(line);
            })
            .join('<br>') +
          '</dd></div>'
        );
      })
      .join('');
  }

  function setLoadingRows(tbody, colspan, message) {
    tbody.innerHTML =
      '<tr><td colspan="' +
      colspan +
      '"><span class="admin-meta-sub">' +
      escapeHtml(message) +
      '</span></td></tr>';
  }

  function bindSearchInput(input, callback) {
    var timerId = null;

    input.addEventListener('input', function () {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(callback, 250);
    });
  }

  function loadSession() {
    return apiRequest('/api/admin/me', {
      suppressRedirect: true,
    }).then(function (payload) {
      state.admin = payload.data.admin;
      state.csrfToken = payload.data.csrfToken || '';

      var emailElement = qs('#admin-session-email');
      if (emailElement && state.admin) {
        emailElement.textContent = state.admin.email;
      }

      return payload.data;
    });
  }

  function loadDashboardSummary() {
    return apiRequest('/api/admin/dashboard').then(function (payload) {
      var data = payload.data;
      var latestBooking = data.recentBookings[0];
      var latestContact = data.recentContacts[0];
      var latestActivity = latestBooking;

      if (latestContact && (!latestBooking || new Date(latestContact.createdAt) > new Date(latestBooking.createdAt))) {
        latestActivity = latestContact;
      }

      qs('#summary-bookings-total').textContent = data.totals.bookings;
      qs('#summary-bookings-pending').textContent =
        'En attente: ' + String(data.bookingStatusCounts.PENDING || 0);
      qs('#summary-contacts-total').textContent = data.totals.contacts;
      qs('#summary-contacts-new').textContent = 'Nouveaux: ' + String(data.contactStatusCounts.NEW || 0);
      qs('#summary-last-activity').textContent = latestActivity ? formatDate(latestActivity.createdAt) : 'Aucune';
    });
  }

  function renderBookingsTable(items) {
    var tbody = qs('#bookings-table-body');

    if (!items.length) {
      setLoadingRows(tbody, 5, 'Aucune réservation trouvée.');
      return;
    }

    tbody.innerHTML = items
      .map(function (item) {
        var route = item.pickupLocation + (item.dropoffLocation ? ' → ' + item.dropoffLocation : '');
        var activeClass = item.id === state.bookings.selectedId ? ' class="is-active"' : '';

        return (
          '<tr data-booking-id="' +
          escapeHtml(item.id) +
          '"' +
          activeClass +
          '>' +
          '<td><span class="admin-meta-strong">' +
          escapeHtml(item.fullName) +
          '</span><span class="admin-meta-sub">' +
          escapeHtml(item.email || item.phone || 'Coordonnée à confirmer') +
          '</span></td>' +
          '<td>' +
          escapeHtml(formatStatusLabel(item.serviceType)) +
          '</td>' +
          '<td>' +
          escapeHtml(route) +
          '</td>' +
          '<td>' +
          renderStatusPill(item.status) +
          '</td>' +
          '<td>' +
          escapeHtml(formatDate(item.createdAt)) +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    tbody.querySelectorAll('tr[data-booking-id]').forEach(function (row) {
      row.addEventListener('click', function () {
        openBooking(row.getAttribute('data-booking-id'));
      });
    });
  }

  function renderContactsTable(items) {
    var tbody = qs('#contacts-table-body');

    if (!items.length) {
      setLoadingRows(tbody, 4, 'Aucun message trouvé.');
      return;
    }

    tbody.innerHTML = items
      .map(function (item) {
        var activeClass = item.id === state.contacts.selectedId ? ' class="is-active"' : '';

        return (
          '<tr data-contact-id="' +
          escapeHtml(item.id) +
          '"' +
          activeClass +
          '>' +
          '<td><span class="admin-meta-strong">' +
          escapeHtml(item.fullName) +
          '</span><span class="admin-meta-sub">' +
          escapeHtml(item.email || item.phone || 'Coordonnée à confirmer') +
          '</span></td>' +
          '<td>' +
          escapeHtml(item.subject) +
          '</td>' +
          '<td>' +
          renderStatusPill(item.status) +
          '</td>' +
          '<td>' +
          escapeHtml(formatDate(item.createdAt)) +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    tbody.querySelectorAll('tr[data-contact-id]').forEach(function (row) {
      row.addEventListener('click', function () {
        openContact(row.getAttribute('data-contact-id'));
      });
    });
  }

  function loadBookings() {
    clearMessage(qs('#bookings-inline-message'));
    setLoadingRows(qs('#bookings-table-body'), 5, 'Chargement des réservations...');

    return apiRequest(
      '/api/admin/bookings?' +
        buildQuery({
          page: state.bookings.page,
          pageSize: state.bookings.pageSize,
          status: state.bookings.status,
          search: state.bookings.search,
        })
    ).then(function (payload) {
      state.bookings.totalPages = payload.meta.totalPages;
      renderBookingsTable(payload.data);
      qs('#bookings-page-info').textContent = 'Page ' + payload.meta.page + ' sur ' + payload.meta.totalPages;
      qs('#bookings-prev').disabled = payload.meta.page <= 1;
      qs('#bookings-next').disabled = payload.meta.page >= payload.meta.totalPages;

      if (!state.bookings.selectedId && payload.data[0]) {
        openBooking(payload.data[0].id);
      }
    }).catch(function (error) {
      setLoadingRows(qs('#bookings-table-body'), 5, 'Impossible de charger les réservations.');
      showMessage(qs('#bookings-inline-message'), error.message, 'error');
      throw error;
    });
  }

  function loadContacts() {
    clearMessage(qs('#contacts-inline-message'));
    setLoadingRows(qs('#contacts-table-body'), 4, 'Chargement des messages...');

    return apiRequest(
      '/api/admin/contacts?' +
        buildQuery({
          page: state.contacts.page,
          pageSize: state.contacts.pageSize,
          status: state.contacts.status,
          search: state.contacts.search,
        })
    ).then(function (payload) {
      state.contacts.totalPages = payload.meta.totalPages;
      renderContactsTable(payload.data);
      qs('#contacts-page-info').textContent = 'Page ' + payload.meta.page + ' sur ' + payload.meta.totalPages;
      qs('#contacts-prev').disabled = payload.meta.page <= 1;
      qs('#contacts-next').disabled = payload.meta.page >= payload.meta.totalPages;

      if (!state.contacts.selectedId && payload.data[0]) {
        openContact(payload.data[0].id);
      }
    }).catch(function (error) {
      setLoadingRows(qs('#contacts-table-body'), 4, 'Impossible de charger les messages.');
      showMessage(qs('#contacts-inline-message'), error.message, 'error');
      throw error;
    });
  }

  function openBooking(id) {
    apiRequest('/api/admin/bookings/' + encodeURIComponent(id)).then(function (payload) {
      var booking = payload.data;
      state.bookings.selectedId = booking.id;
      renderDataList(qs('#booking-detail-fields'), [
        { label: 'Client', value: booking.fullName },
        { label: 'Contact', value: booking.email || booking.phone || 'Coordonnée à confirmer' },
        { label: 'Service', value: formatStatusLabel(booking.serviceType) },
        {
          label: 'Trajet',
          value: booking.pickupLocation + (booking.dropoffLocation ? ' → ' + booking.dropoffLocation : ''),
        },
        {
          label: 'Horaire',
          value: [booking.pickupDate, booking.pickupTime].filter(Boolean).join(' '),
        },
        { label: 'Passagers', value: booking.passengers || 'Non renseigné' },
        { label: 'Notes', value: booking.notes || 'Aucune note' },
        { label: 'Source', value: booking.sourcePage || 'Site web' },
        { label: 'Créée', value: formatDate(booking.createdAt) },
      ]);

      qs('#booking-status-select').value = booking.status;
      qs('#booking-detail-empty').hidden = true;
      qs('#booking-detail-content').hidden = false;
      loadBookings();
    });
  }

  function openContact(id) {
    apiRequest('/api/admin/contacts/' + encodeURIComponent(id)).then(function (payload) {
      var contact = payload.data;
      state.contacts.selectedId = contact.id;
      renderDataList(qs('#contact-detail-fields'), [
        { label: 'Contact', value: contact.fullName },
        { label: 'Coordonnées', value: contact.email || contact.phone || 'Coordonnée à confirmer' },
        { label: 'Sujet', value: contact.subject },
        { label: 'Message', value: contact.message },
        { label: 'Source', value: contact.sourcePage || 'Site web' },
        { label: 'Créé', value: formatDate(contact.createdAt) },
      ]);

      qs('#contact-status-select').value = contact.status;
      qs('#contact-detail-empty').hidden = true;
      qs('#contact-detail-content').hidden = false;
      loadContacts();
    });
  }

  function saveBooking() {
    if (!state.bookings.selectedId) {
      return;
    }

    apiRequest('/api/admin/bookings/' + encodeURIComponent(state.bookings.selectedId), {
      method: 'PATCH',
      body: {
        status: qs('#booking-status-select').value,
      },
    })
      .then(function () {
        showMessage(qs('#bookings-inline-message'), 'Réservation mise à jour.', 'success');
        return Promise.all([loadDashboardSummary(), loadBookings(), openBooking(state.bookings.selectedId)]);
      })
      .catch(function (error) {
        showMessage(qs('#bookings-inline-message'), error.message, 'error');
      });
  }

  function saveContact() {
    if (!state.contacts.selectedId) {
      return;
    }

    apiRequest('/api/admin/contacts/' + encodeURIComponent(state.contacts.selectedId), {
      method: 'PATCH',
      body: {
        status: qs('#contact-status-select').value,
      },
    })
      .then(function () {
        showMessage(qs('#contacts-inline-message'), 'Message mis à jour.', 'success');
        return Promise.all([loadDashboardSummary(), loadContacts(), openContact(state.contacts.selectedId)]);
      })
      .catch(function (error) {
        showMessage(qs('#contacts-inline-message'), error.message, 'error');
      });
  }

  function deleteBooking() {
    if (!state.bookings.selectedId || !window.confirm('Supprimer définitivement cette réservation ?')) {
      return;
    }

    apiRequest('/api/admin/bookings/' + encodeURIComponent(state.bookings.selectedId), {
      method: 'DELETE',
    })
      .then(function () {
        state.bookings.selectedId = null;
        qs('#booking-detail-content').hidden = true;
        qs('#booking-detail-empty').hidden = false;
        showMessage(qs('#bookings-inline-message'), 'Réservation supprimée.', 'success');
        return Promise.all([loadDashboardSummary(), loadBookings()]);
      })
      .catch(function (error) {
        showMessage(qs('#bookings-inline-message'), error.message, 'error');
      });
  }

  function deleteContact() {
    if (!state.contacts.selectedId || !window.confirm('Supprimer définitivement ce message ?')) {
      return;
    }

    apiRequest('/api/admin/contacts/' + encodeURIComponent(state.contacts.selectedId), {
      method: 'DELETE',
    })
      .then(function () {
        state.contacts.selectedId = null;
        qs('#contact-detail-content').hidden = true;
        qs('#contact-detail-empty').hidden = false;
        showMessage(qs('#contacts-inline-message'), 'Message supprimé.', 'success');
        return Promise.all([loadDashboardSummary(), loadContacts()]);
      })
      .catch(function (error) {
        showMessage(qs('#contacts-inline-message'), error.message, 'error');
      });
  }

  function bindDashboardEvents() {
    qs('#admin-logout-button').addEventListener('click', function () {
      apiRequest('/api/admin/logout', {
        method: 'POST',
      }).finally(function () {
        redirectToLogin();
      });
    });

    qs('#bookings-status-filter').addEventListener('change', function (event) {
      state.bookings.status = event.target.value;
      state.bookings.page = 1;
      loadBookings();
    });

    qs('#contacts-status-filter').addEventListener('change', function (event) {
      state.contacts.status = event.target.value;
      state.contacts.page = 1;
      loadContacts();
    });

    bindSearchInput(qs('#bookings-search'), function () {
      state.bookings.search = qs('#bookings-search').value.trim();
      state.bookings.page = 1;
      loadBookings();
    });

    bindSearchInput(qs('#contacts-search'), function () {
      state.contacts.search = qs('#contacts-search').value.trim();
      state.contacts.page = 1;
      loadContacts();
    });

    qs('#bookings-prev').addEventListener('click', function () {
      if (state.bookings.page > 1) {
        state.bookings.page -= 1;
        loadBookings();
      }
    });

    qs('#bookings-next').addEventListener('click', function () {
      if (state.bookings.page < state.bookings.totalPages) {
        state.bookings.page += 1;
        loadBookings();
      }
    });

    qs('#contacts-prev').addEventListener('click', function () {
      if (state.contacts.page > 1) {
        state.contacts.page -= 1;
        loadContacts();
      }
    });

    qs('#contacts-next').addEventListener('click', function () {
      if (state.contacts.page < state.contacts.totalPages) {
        state.contacts.page += 1;
        loadContacts();
      }
    });

    qs('#booking-save-button').addEventListener('click', saveBooking);
    qs('#booking-delete-button').addEventListener('click', deleteBooking);
    qs('#contact-save-button').addEventListener('click', saveContact);
    qs('#contact-delete-button').addEventListener('click', deleteContact);
  }

  function initLoginPage() {
    var form = qs('#admin-login-form');
    var message = form.querySelector('.form-message');
    var submitButton = form.querySelector('.form-submit');
    var defaultText = submitButton.textContent;

    loadSession()
      .then(function () {
        window.location.href = 'admin-dashboard.html';
      })
      .catch(function () {});

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearMessage(message);

      submitButton.disabled = true;
      submitButton.textContent = 'Connexion...';

      apiRequest('/api/admin/login', {
        method: 'POST',
        skipCsrf: true,
        suppressRedirect: true,
        body: {
          email: form.email.value,
          password: form.password.value,
        },
      })
        .then(function () {
          window.location.href = 'admin-dashboard.html';
        })
        .catch(function (error) {
          showMessage(message, error.message, 'error');
        })
        .finally(function () {
          submitButton.disabled = false;
          submitButton.textContent = defaultText;
        });
    });
  }

  function initDashboardPage() {
    loadSession()
      .then(function () {
        bindDashboardEvents();
        loadDashboardSummary().catch(function () {});
        loadBookings().catch(function () {});
        loadContacts().catch(function () {});
      })
      .catch(function () {
        redirectToLogin();
      });
  }

  if (page === 'login') {
    initLoginPage();
  }

  if (page === 'dashboard') {
    initDashboardPage();
  }
})();
