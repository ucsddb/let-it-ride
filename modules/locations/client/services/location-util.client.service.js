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
                makeMarkers: makeMarkers
            };
            function getBounds(locations) {
                var bounds = new maps.LatLngBounds();
                locations.forEach(function(loc) {
                    bounds.extend(new maps.LatLng(loc.geometry[1], loc.geometry[0]));
                });
                return {
                    northeast: {
                        longitude: bounds.getSouthWest().lng(),
                        latitude: bounds.getSouthWest().lat()
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
                    bounds.extend(new maps.LatLng(loc.geometry[1], loc.geometry[0]));
                });
                return {
                    latitude: bounds.getCenter().lat(),
                    longitude: bounds.getCenter().lng()
                };
            }
            function makeMarkers (locations) {
                return locations.map(function(loc) {
                    var ret = {
                        id: loc._id,
                        longitude: loc.geometry[0],
                        latitude: loc.geometry[1],
                        address: loc.address,
                        onClick: onClick
                    };
                    return ret;

                    function onClick () {
                        ret.show = !ret.show;
                    }
                });
            }
        });
    }
})();
