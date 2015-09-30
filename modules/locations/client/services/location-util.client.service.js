(function() {
    'use strict';

    angular
        .module('locations')
        .factory('LocationUtilProvider', LocationUtilProvider);

    LocationUtilProvider.$inject = ['uiGmapGoogleMapApi'];

    function LocationUtilProvider(uiGmapGoogleMapApi) {
        return uiGmapGoogleMapApi.then(function(maps) {
            return {
                getBounds: getBounds,
                getCenter: getCenter,
                makeMarkers: makeMarkers,
                getZoomByBounds: getZoomByBounds
            };

            function getBounds(locations) {
                var bounds = new maps.LatLngBounds();
                locations.forEach(function(loc) {
                    bounds.extend(new maps.LatLng(loc.location.coordinates[1], loc.location.coordinates[0]));
                });
                return {
                    northeast: {
                        longitude: bounds.getNorthEast().lng(),
                        latitude: bounds.getNorthEast().lat()
                    },
                    southwest: {
                        longitude: bounds.getSouthWest().lng(),
                        latitude: bounds.getSouthWest().lat()
                    }
                };
            }

            function getCenter(locations) {
                var bounds = new maps.LatLngBounds();
                locations.forEach(function(loc) {
                    bounds.extend(new maps.LatLng(loc.location.coordinates[1], loc.location.coordinates[0]));
                });
                return {
                    latitude: bounds.getCenter().lat(),
                    longitude: bounds.getCenter().lng()
                };
            }

            function makeMarkers(locations) {
                return locations.map(function(loc) {
                    var ret = {
                        id: loc._id,
                        longitude: loc.location.coordinates[0],
                        latitude: loc.location.coordinates[1],
                        address: loc.address,
                        onClick: onClick
                    };
                    return ret;

                    function onClick() {
                        ret.show = !ret.show;
                    }
                });
            }

            function getZoomByBounds(bounds) {
                var MAX_ZOOM = 20;
                var MIN_ZOOM = 1;

                var ne = bounds.northeast;
                var sw = bounds.southwest;

                var worldCoordWidth = Math.abs(ne.longitude - sw.longitude);
                var worldCoordHeight = Math.abs(ne.latitude - sw.latitude);

                //Fit padding in pixels 
                var FIT_PAD = 40;
                var map = document.getElementsByClassName('angular-google-map-container')[0];

                for(var zoom = MAX_ZOOM; zoom >= MIN_ZOOM; --zoom) {
                    if(worldCoordWidth * (1 << zoom) + 2 * FIT_PAD <  map.offsetWidth &&
                        worldCoordHeight * (1 << zoom) + 2 * FIT_PAD < map.offsetHeight)
                        return zoom;
                }
                return 0;
            }
        });
    }
})();
