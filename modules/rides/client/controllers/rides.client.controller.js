(function() {
    'use strict';

    // Rides controller
    angular
        .module('rides')
        .controller('RidesController', RidesController);

    RidesController.$inject = ['$scope', '$location', 'Rides', 'Locations', 'Members', 'LocationUtilProvider', '$http', 'uiGridConstants', '_'];

    function RidesController($scope, $location, Rides, Locations, Members, LocationUtilProvider, $http, uiGridConstants, _) {
        $scope.gridOptions = {
            enableFiltering: true,
            showColumnFooter: true,
            data: Members.query(),
            columnDefs: [{
                name: 'name',
                enableCellEdit: true,
                aggregationType: uiGridConstants.aggregationTypes.count
            }, {
                name: 'Pickup Location',
                field: 'pickupLocation.address',
                enableCellEdit: true,
                cellTooltip: true
            }, {
                name: 'Dropoff Location',
                field: 'dropoffLocation.address',
                enableCellEdit: true,
                cellTooltip: true
            }, {
                name: 'Can Drive',
                field: 'driver',
                filter: {
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [{
                        value: true,
                        label: 'Yes'
                    }, {
                        value: false,
                        label: 'No'
                    }]
                },
                cellFilter: 'yes_no',
                editableCellTemplate: 'ui-grid/dropdownEditor',
                editDropdownValueLabel: 'driver',
                editDropdownOptionsArray: [{
                    id: true,
                    driver: 'Yes'
                }, {
                    id: false,
                    driver: 'No'
                }],
                aggregationType: function(rows) {
                    return _.filter(rows, 'entity.driver').length;
                },
                aggregationLabel: 'Num. Drivers: '
            }, {
                name: 'Capacity',
                field: 'capacity',
                aggregationType: uiGridConstants.aggregationTypes.sum,
                aggregationLabel: 'Available Seats: '
            }],
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
                    if(colDef.field === 'driver') {
                        rowEntity.capacity = newValue ? 4 : -1;
                    } else if(colDef.field === 'capacity') {
                        rowEntity.capacity = rowEntity.driver && parseInt(newValue) < 0 ? 0 : newValue;
                    }
                    $scope.$apply();
                });
            }
        };

        $scope.removeSelected = function() {
            $scope.gridOptions.data = _.difference($scope.gridOptions.data, $scope.gridApi.selection.getSelectedRows());
        };

        $scope.address = {};
        $scope.refreshAddresses = function(address) {
            var params = {
                address: address,
                sensor: false
            };
            return $http.get(
                'http://maps.googleapis.com/maps/api/geocode/json', {
                    params: params
                }
            ).then(function(response) {
                $scope.addresses = response.data.results;
            });
        };

        // Create new Rides
        $scope.create = function() {
            $scope.error = '';
            if(_.isEmpty($scope.address)) {
                $scope.error = 'Please provide a destination.';
                return;
            }
            $scope.showResults = true;

            var dataForTo = massageData($scope.gridOptions.data, DIRECTION.TO),
                dataForFrom = massageData($scope.gridOptions.data, DIRECTION.FROM);

            // Create new Ride object
            var ride1 = new Rides({
                people: dataForTo,
                destination: $scope.address.selected
            });
            var ride2 = new Rides({
                people: dataForFrom,
                destination: $scope.address.selected
            });
            ride1.$save().then(function(response) {
                var solutions = _.get(response, 'problem.solutions.solution');
                var routes = _.get(_.min(solutions, function(sol) {
                    return sol.cost;
                }), 'routes.route', []);
                $scope.toResults = _.map(routes, function(r) {
                    return {
                        driver: r.vehicleId,
                        passengers: _(r.act).pluck('shipmentId').uniq().value()
                    };
                });
            }, function(errorResponse) {
                $scope.error = 'To event: ' + errorResponse.data.message;
            });
            ride2.$save().then(function(response) {
                var solutions = _.get(response, 'problem.solutions.solution');
                var routes = _.get(_.min(solutions, function(sol) {
                    return sol.cost;
                }), 'routes.route', []);
                $scope.fromResults = _.map(routes, function(r) {
                    return {
                        driver: r.vehicleId,
                        passengers: _(r.act).pluck('shipmentId').uniq().value()
                    };
                });
            }, function(errorResponse) {
                $scope.error = 'From event: ' + errorResponse.data.message;
            });
        };

        function massageData(people, direction) {
            people = _.cloneDeep(people);
            _.each(people, function(person) {
                if(DIRECTION.TO === direction) {
                    person.start = {
                        longitude: _.get(person, 'pickupLocation.location.coordinates[0]'),
                        latitude: _.get(person, 'pickupLocation.location.coordinates[1]'),
                    };
                    person.end = {
                        longitude: _.get($scope.address, 'selected.geometry.location.lng'),
                        latitude: _.get($scope.address, 'selected.geometry.location.lat'),
                    };
                } else if(DIRECTION.FROM === direction) {
                    person.start = {
                        longitude: _.get($scope.address, 'selected.geometry.location.lng'),
                        latitude: _.get($scope.address, 'selected.geometry.location.lat'),
                    };
                    person.end = {
                        longitude: _.get(person, 'dropoffLocation.location.coordinates[0]'),
                        latitude: _.get(person, 'dropoffLocation.location.coordinates[1]'),
                    };
                }
                delete person.dropoffLocation;
                delete person.pickupLocation;
            });
            return people;
        }
    }

    var DIRECTION = {
        TO: 0,
        FROM: 1
    };
})();
