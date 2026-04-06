var serviceAreaGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Zone locale',
        note: 'Replace these placeholder coordinates with the final approved GeoJSON polygon.',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [4.131, 50.466],
            [4.192, 50.492],
            [4.291, 50.503],
            [4.379, 50.475],
            [4.418, 50.418],
            [4.387, 50.352],
            [4.304, 50.327],
            [4.208, 50.338],
            [4.146, 50.389],
            [4.131, 50.466],
          ],
        ],
      },
    },
  ],
};

(function () {
  'use strict';

  var serviceAreaBase = {
    name: 'Anderlues',
    coordinates: [50.4073, 4.271],
  };

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

  // Local-only helper for validating regular taxi rides.
  // Do not use this helper to block "Navette Aeroport" bookings:
  // airport shuttle coverage is nationwide across Belgium.
  function isCoordinateInServiceArea(latitude, longitude) {
    var point = [longitude, latitude];

    return serviceAreaGeoJson.features.some(function (feature) {
      return featureContainsPoint(feature, point);
    });
  }

  function createServiceAreaMap(element) {
    if (!element || typeof window.L === 'undefined') {
      return null;
    }

    var map = window.L.map(element, {
      scrollWheelZoom: false,
      dragging: true,
      tap: true,
      zoomControl: true,
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    var polygonLayer = window.L.geoJSON(serviceAreaGeoJson, {
      style: function () {
        return {
          color: '#b98b00',
          weight: 2.5,
          fillColor: '#F5C71A',
          fillOpacity: 0.24,
        };
      },
    }).addTo(map);

    var baseMarker = window.L.marker(serviceAreaBase.coordinates).addTo(map);
    baseMarker.bindPopup('Base Anderlues');

    var bounds = polygonLayer.getBounds();
    if (bounds.isValid()) {
      bounds.extend(serviceAreaBase.coordinates);
      map.fitBounds(bounds, { padding: [26, 26] });
    }

    function refreshMapSize() {
      map.invalidateSize();
    }

    window.addEventListener('load', refreshMapSize);
    window.addEventListener('resize', refreshMapSize);

    return map;
  }

  function initServiceAreaMaps() {
    if (typeof window.L === 'undefined') {
      return;
    }

    document.querySelectorAll('[data-service-area-map]').forEach(function (element) {
      if (element.dataset.mapReady === 'true') {
        return;
      }

      element.dataset.mapReady = 'true';
      createServiceAreaMap(element);
    });
  }

  window.serviceAreaGeoJson = serviceAreaGeoJson;
  window.isCoordinateInServiceArea = isCoordinateInServiceArea;
  window.TaxiServiceArea = {
    base: serviceAreaBase,
    initMaps: initServiceAreaMaps,
    isCoordinateInServiceArea: isCoordinateInServiceArea,
    serviceAreaGeoJson: serviceAreaGeoJson,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceAreaMaps);
  } else {
    initServiceAreaMaps();
  }
})();
