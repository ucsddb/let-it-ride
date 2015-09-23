(function() {
    'use strict';

    angular
        .module('core')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Authentication', 'LocationUtilProvider', 'Papa', '_', 'Rides'];

    function HomeController($scope, Authentication, LocationUtilProvider, Papa, _, Rides) {
        var vm = this;
        // This provides Authentication context.
        vm.authentication = Authentication;

        init();

        // TODO: figure out way to use container class for all views except home
        // Ugly hack to remove container class to the view content for Home page image
        $scope.$on('$destroy', function() {
            angular.element(document.getElementsByClassName('main-container')).addClass('container');
        });

        function init() {
            angular.element(document.getElementsByClassName('main-container')).removeClass('container');
        }

        $scope.genRides = function() {
            // var responses = Papa.parse($scope.text, {header: true}).data;

            // var drivers = [], passenger = [];
            // _.forEach(responses, function(a) {
            //     if(a.driving === 'yes')
            //         drivers.push(a);
            //     else
            //         passenger.push(a);
            // });

            // $scope.drivers = drivers;

            var ride = new Rides({
                data: Papa.parse($scope.text, {
                    header: true
                }).data
            });
            ride.$save().then(function(res) {
                var result = _.min(res.toJSON().problem.solutions.solution, function(a) {
                    return a.cost;
                });

                $scope.result = result.routes.route.map(function(a) {
                    return {
                        driver: a.vehicleId,
                        pass: _.uniq(a.act.map(function(b) {
                            return b.shipmentId;
                        }))
                    };
                });
            });
        };
    }
})();
