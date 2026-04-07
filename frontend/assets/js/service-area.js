(function () {
  'use strict';

  var DEFAULT_SERVICE_AREA_DATA_URL = 'assets/data/service-area.geojson';
  var EMPTY_FEATURE_COLLECTION = {
    type: 'FeatureCollection',
    features: [],
  };

  var serviceAreaBase = {
    name: 'Anderlues',
    coordinates: [50.4073, 4.271],
  };

  var serviceAreaState = {
    url: '',
    geoJson: cloneFeatureCollection(EMPTY_FEATURE_COLLECTION),
    promise: null,
  };

  function cloneFeatureCollection(geoJson) {
    return JSON.parse(JSON.stringify(geoJson || EMPTY_FEATURE_COLLECTION));
  }

  function isFiniteNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }

  function isCoordinatePair(point) {
    return Array.isArray(point) && point.length >= 2 && isFiniteNumber(point[0]) && isFiniteNumber(point[1]);
  }

  function coordinatesMatch(pointA, pointB) {
    return pointA && pointB && pointA[0] === pointB[0] && pointA[1] === pointB[1];
  }

  function normalizeRing(ring) {
    if (!Array.isArray(ring)) {
      return null;
    }

    var normalized = ring
      .filter(isCoordinatePair)
      .map(function (point) {
        return [Number(point[0]), Number(point[1])];
      });

    if (normalized.length < 3) {
      return null;
    }

    if (!coordinatesMatch(normalized[0], normalized[normalized.length - 1])) {
      normalized.push([normalized[0][0], normalized[0][1]]);
    }

    return normalized.length >= 4 ? normalized : null;
  }

  function normalizeGeometry(geometry) {
    if (!geometry || typeof geometry !== 'object') {
      return null;
    }

    if (geometry.type === 'Polygon') {
      var polygonRings = Array.isArray(geometry.coordinates)
        ? geometry.coordinates.map(normalizeRing).filter(Boolean)
        : [];

      return polygonRings.length
        ? {
            type: 'Polygon',
            coordinates: polygonRings,
          }
        : null;
    }

    if (geometry.type === 'MultiPolygon') {
      var multiPolygon = Array.isArray(geometry.coordinates)
        ? geometry.coordinates
            .map(function (polygon) {
              return Array.isArray(polygon) ? polygon.map(normalizeRing).filter(Boolean) : [];
            })
            .filter(function (polygon) {
              return polygon.length;
            })
        : [];

      return multiPolygon.length
        ? {
            type: 'MultiPolygon',
            coordinates: multiPolygon,
          }
        : null;
    }

    return null;
  }

  function normalizeFeature(feature) {
    if (!feature || feature.type !== 'Feature') {
      return null;
    }

    var geometry = normalizeGeometry(feature.geometry);
    if (!geometry) {
      return null;
    }

    return {
      type: 'Feature',
      properties: feature.properties && typeof feature.properties === 'object' ? feature.properties : {},
      geometry: geometry,
    };
  }

  function normalizeFeatureCollection(geoJson) {
    if (!geoJson || geoJson.type !== 'FeatureCollection' || !Array.isArray(geoJson.features)) {
      return cloneFeatureCollection(EMPTY_FEATURE_COLLECTION);
    }

    return {
      type: 'FeatureCollection',
      features: geoJson.features.map(normalizeFeature).filter(Boolean),
    };
  }

  function getPolygonFeatures(geoJson) {
    return normalizeFeatureCollection(geoJson).features;
  }

  function ringContainsPoint(ring, point) {
    var inside = false;
    var pointLng = point[0];
    var pointLat = point[1];

    for (var index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
      var current = ring[index];
      var last = ring[previous];
      var currentLng = current[0];
      var currentLat = current[1];
      var lastLng = last[0];
      var lastLat = last[1];

      var intersects =
        currentLat > pointLat !== lastLat > pointLat &&
        pointLng <
          ((lastLng - currentLng) * (pointLat - currentLat)) / ((lastLat - currentLat) || 0.000000000001) +
            currentLng;

      if (intersects) {
        inside = !inside;
      }
    }

    return inside;
  }

  function polygonContainsPoint(polygon, point) {
    if (!polygon || !polygon.length || !ringContainsPoint(polygon[0], point)) {
      return false;
    }

    return !polygon.slice(1).some(function (hole) {
      return ringContainsPoint(hole, point);
    });
  }

  function featureContainsPoint(feature, point) {
    if (!feature || !feature.geometry) {
      return false;
    }

    if (feature.geometry.type === 'Polygon') {
      return polygonContainsPoint(feature.geometry.coordinates, point);
    }

    if (feature.geometry.type === 'MultiPolygon') {
      return feature.geometry.coordinates.some(function (polygon) {
        return polygonContainsPoint(polygon, point);
      });
    }

    return false;
  }

  function flattenCoordinates(features) {
    var points = [];

    features.forEach(function (feature) {
      if (!feature || !feature.geometry) {
        return;
      }

      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach(function (ring) {
          ring.forEach(function (point) {
            points.push(point);
          });
        });
      }

      if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(function (polygon) {
          polygon.forEach(function (ring) {
            ring.forEach(function (point) {
              points.push(point);
            });
          });
        });
      }
    });

    return points;
  }

  function createProjection(bounds, width, height, padding) {
    var lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0.0001);
    var latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.0001);
    var scaleX = (width - padding * 2) / lngSpan;
    var scaleY = (height - padding * 2) / latSpan;

    return function project(point) {
      var lng = point[0];
      var lat = point[1];

      return {
        x: padding + (lng - bounds.minLng) * scaleX,
        y: height - padding - (lat - bounds.minLat) * scaleY,
      };
    };
  }

  function getGeoBounds(features) {
    var points = flattenCoordinates(features).concat([[serviceAreaBase.coordinates[1], serviceAreaBase.coordinates[0]]]);
    var lngs = points.map(function (point) {
      return point[0];
    });
    var lats = points.map(function (point) {
      return point[1];
    });

    return {
      minLng: Math.min.apply(null, lngs),
      maxLng: Math.max.apply(null, lngs),
      minLat: Math.min.apply(null, lats),
      maxLat: Math.max.apply(null, lats),
    };
  }

  function toPathData(ring, project) {
    return (
      ring
        .map(function (point, index) {
          var projected = project(point);
          return (index === 0 ? 'M' : 'L') + projected.x.toFixed(2) + ' ' + projected.y.toFixed(2);
        })
        .join(' ') + ' Z'
    );
  }

  function addPolygonPaths(feature, project, polygonPaths) {
    if (!feature || !feature.geometry) {
      return;
    }

    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates.forEach(function (ring) {
        polygonPaths.push(
          '<path d="' + toPathData(ring, project) + '" class="service-area-svg-polygon" aria-hidden="true"></path>'
        );
      });
    }

    if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach(function (polygon) {
        polygon.forEach(function (ring) {
          polygonPaths.push(
            '<path d="' +
              toPathData(ring, project) +
              '" class="service-area-svg-polygon" aria-hidden="true"></path>'
          );
        });
      });
    }
  }

  function buildFallbackMapMarkup(features, isCompact) {
    var width = 420;
    var height = isCompact ? 280 : 340;
    var padding = 28;
    var bounds = getGeoBounds(features);
    var project = createProjection(bounds, width, height, padding);
    var basePoint = project([serviceAreaBase.coordinates[1], serviceAreaBase.coordinates[0]]);
    var polygonPaths = [];

    features.forEach(function (feature) {
      addPolygonPaths(feature, project, polygonPaths);
    });

    return (
      '<div class="service-area-map-fallback">' +
      '<svg viewBox="0 0 ' +
      width +
      ' ' +
      height +
      '" role="img" aria-label="Carte indicative de la zone de couverture autour d&#39;Anderlues">' +
      '<defs>' +
      '<linearGradient id="service-area-bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#f8fafc"></stop>' +
      '<stop offset="100%" stop-color="#e8eef6"></stop>' +
      '</linearGradient>' +
      '</defs>' +
      '<rect width="' +
      width +
      '" height="' +
      height +
      '" rx="20" fill="url(#service-area-bg)"></rect>' +
      '<path d="M0 ' +
      (height - 70) +
      ' C 90 ' +
      (height - 96) +
      ', 160 ' +
      (height - 44) +
      ', 260 ' +
      (height - 70) +
      ' S 380 ' +
      (height - 92) +
      ', ' +
      width +
      ' ' +
      (height - 64) +
      '" class="service-area-svg-road" aria-hidden="true"></path>' +
      polygonPaths.join('') +
      '<circle cx="' +
      basePoint.x.toFixed(2) +
      '" cy="' +
      basePoint.y.toFixed(2) +
      '" r="7" class="service-area-svg-base"></circle>' +
      '<circle cx="' +
      basePoint.x.toFixed(2) +
      '" cy="' +
      basePoint.y.toFixed(2) +
      '" r="17" class="service-area-svg-base-ring"></circle>' +
      '<text x="' +
      Math.min(basePoint.x + 14, width - 138).toFixed(2) +
      '" y="' +
      Math.max(basePoint.y - 12, 24).toFixed(2) +
      '" class="service-area-svg-label">Base Anderlues</text>' +
      '</svg>' +
      '</div>'
    );
  }

  function createFallbackMap(element, geoJson) {
    if (!element || element.dataset.mapReady === 'true') {
      return;
    }

    var features = getPolygonFeatures(geoJson);
    element.innerHTML = buildFallbackMapMarkup(features, element.classList.contains('service-area-map--compact'));
    element.dataset.mapReady = 'true';
    element.dataset.mapMode = features.length ? 'fallback-boundary' : 'fallback-base';
  }

  function createLeafletBaseMarker(map) {
    if (typeof window.L.circleMarker === 'function') {
      return window.L.circleMarker(serviceAreaBase.coordinates, {
        radius: 7,
        color: '#ffffff',
        weight: 2,
        fillColor: '#111827',
        fillOpacity: 1,
      }).addTo(map);
    }

    return window.L.marker(serviceAreaBase.coordinates).addTo(map);
  }

  function polygonStyle() {
    return {
      color: '#d92d20',
      weight: 3,
      opacity: 0.95,
      fillColor: '#ef4444',
      fillOpacity: 0.14,
    };
  }

  function fitLeafletMap(map, boundaryLayer, isCompact) {
    if (boundaryLayer) {
      var bounds = boundaryLayer.getBounds();
      if (bounds && bounds.isValid()) {
        bounds.extend(serviceAreaBase.coordinates);
        map.fitBounds(bounds, {
          padding: isCompact ? [22, 22] : [28, 28],
          maxZoom: isCompact ? 11 : 12,
        });
        return;
      }
    }

    map.setView(serviceAreaBase.coordinates, 11);
  }

  function createLeafletBoundaryLayer(map, geoJson) {
    var features = getPolygonFeatures(geoJson);
    if (!features.length || typeof window.L.geoJSON !== 'function') {
      return null;
    }

    return window.L.geoJSON(
      {
        type: 'FeatureCollection',
        features: features,
      },
      {
        style: polygonStyle,
        onEachFeature: function (feature, layer) {
          var properties = feature && feature.properties ? feature.properties : {};
          var title = properties.name || 'Zone de couverture';
          var note = properties.note ? '<br><span>' + String(properties.note) + '</span>' : '';
          layer.bindPopup('<strong>' + title + '</strong>' + note);
        },
      }
    ).addTo(map);
  }

  function createLeafletMap(element, geoJson) {
    if (!element || typeof window.L === 'undefined' || typeof window.L.map !== 'function' || element.dataset.mapReady === 'true') {
      return null;
    }

    var map = window.L.map(element, {
      scrollWheelZoom: false,
      dragging: true,
      tap: true,
      zoomControl: true,
      attributionControl: true,
    });

    map.setView(serviceAreaBase.coordinates, 11);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    var boundaryLayer = createLeafletBoundaryLayer(map, geoJson);
    var baseMarker = createLeafletBaseMarker(map);
    baseMarker.bindPopup('Base Anderlues');

    fitLeafletMap(map, boundaryLayer, element.classList.contains('service-area-map--compact'));

    function refreshMapSize() {
      map.invalidateSize();
    }

    window.addEventListener('load', refreshMapSize);
    window.addEventListener('resize', refreshMapSize);
    map.whenReady(refreshMapSize);

    element.dataset.mapReady = 'true';
    element.dataset.mapMode = boundaryLayer ? 'leaflet-boundary' : 'leaflet-base';

    return map;
  }

  function getBoundarySourceUrl(elements) {
    var firstElement = elements[0];
    if (!firstElement) {
      return DEFAULT_SERVICE_AREA_DATA_URL;
    }

    return firstElement.getAttribute('data-service-area-src') || DEFAULT_SERVICE_AREA_DATA_URL;
  }

  function fetchBoundaryGeoJson(url) {
    if (typeof window.fetch !== 'function') {
      return Promise.resolve(cloneFeatureCollection(EMPTY_FEATURE_COLLECTION));
    }

    return window
      .fetch(url, {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/geo+json, application/json',
        },
      })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load service area boundary');
        }

        return response.json();
      })
      .then(normalizeFeatureCollection)
      .catch(function () {
        return cloneFeatureCollection(EMPTY_FEATURE_COLLECTION);
      });
  }

  function loadServiceAreaGeoJson(url) {
    var resolvedUrl = url || DEFAULT_SERVICE_AREA_DATA_URL;

    if (serviceAreaState.promise && serviceAreaState.url === resolvedUrl) {
      return serviceAreaState.promise;
    }

    serviceAreaState.url = resolvedUrl;
    serviceAreaState.promise = fetchBoundaryGeoJson(resolvedUrl).then(function (geoJson) {
      serviceAreaState.geoJson = cloneFeatureCollection(geoJson);
      window.serviceAreaGeoJson = cloneFeatureCollection(geoJson);
      return geoJson;
    });

    return serviceAreaState.promise;
  }

  function isCoordinateInServiceArea(latitude, longitude) {
    var point = [longitude, latitude];

    return serviceAreaState.geoJson.features.some(function (feature) {
      return featureContainsPoint(feature, point);
    });
  }

  function renderServiceAreaMap(element, geoJson) {
    try {
      if (typeof window.L !== 'undefined' && typeof window.L.map === 'function') {
        createLeafletMap(element, geoJson);
        return;
      }
    } catch (error) {
      element.innerHTML = '';
      element.dataset.mapReady = 'false';
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('Leaflet map fallback triggered:', error);
      }
    }

    createFallbackMap(element, geoJson);
  }

  function initServiceAreaMaps() {
    var elements = Array.prototype.slice.call(document.querySelectorAll('[data-service-area-map]'));
    if (!elements.length) {
      return;
    }

    loadServiceAreaGeoJson(getBoundarySourceUrl(elements)).then(function (geoJson) {
      elements.forEach(function (element) {
        renderServiceAreaMap(element, geoJson);
      });
    });
  }

  window.serviceAreaGeoJson = cloneFeatureCollection(EMPTY_FEATURE_COLLECTION);
  window.isCoordinateInServiceArea = isCoordinateInServiceArea;
  window.TaxiServiceArea = {
    base: serviceAreaBase,
    dataUrl: DEFAULT_SERVICE_AREA_DATA_URL,
    initMaps: initServiceAreaMaps,
    isCoordinateInServiceArea: isCoordinateInServiceArea,
    loadGeoJson: loadServiceAreaGeoJson,
    getGeoJson: function () {
      return cloneFeatureCollection(serviceAreaState.geoJson);
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceAreaMaps);
  } else {
    initServiceAreaMaps();
  }
})();
