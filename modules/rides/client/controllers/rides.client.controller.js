(function() {
    'use strict';

    // Rides controller
    angular
        .module('rides')
        .controller('RidesController', RidesController)
        .controller('EditModalInstanceCtrl', EditModalInstanceCtrl);

    RidesController.$inject = ['$scope', '$location', 'Rides', 'Locations', 'Members', 'LocationUtilProvider', '$http', '$uibModal', 'uiGridConstants', '_', 'Socket'];
    EditModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', '$http'];

    function refreshAddresses($scope, $http) {
        return function(address) {
            var params = {
                address: address,
                sensor: false
            };
            return $http.get(
                'https://maps.googleapis.com/maps/api/geocode/json', {
                    params: params
                }
            ).then(function(response) {
                $scope.addresses = response.data.results;
            });
        };
    }

    function EditModalInstanceCtrl($scope, $uibModalInstance, $http) {
        $scope.overrides = {
            pickup: {},
            dropoff: {},
        };
        $scope.ok = function() {
            $uibModalInstance.close($scope.overrides);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.refreshAddresses = refreshAddresses($scope, $http);
    }

    function RidesController($scope, $location, Rides, Locations, Members, LocationUtilProvider, $http, $uibModal, uiGridConstants, _, Socket) {
        $scope.editSelected = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'myModalContent.html',
                controller: 'EditModalInstanceCtrl'
            });

            modalInstance.result.then(function(overrides) {
                $scope.gridApi.selection.getSelectedRows().forEach(function(row) {
                    if(overrides.pickup.selected) {
                        row.pickupLocation = {
                            address: overrides.pickup.selected.formatted_address,
                            location: {
                                coordinates: [overrides.pickup.selected.geometry.location.lng, overrides.pickup.selected.geometry.location.lat]
                            }
                        };
                    }
                    if(overrides.dropoff.selected) {
                        row.dropoffLocation = {
                            address: overrides.dropoff.selected.formatted_address,
                            location: {
                                coordinates: [overrides.dropoff.selected.geometry.location.lng, overrides.dropoff.selected.geometry.location.lat]
                            }
                        };
                    }
                });
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        $scope.gridOptions = {
            enableFiltering: true,
            showColumnFooter: true,
            data: Members.query(),
            columnDefs: [{
                name: 'name',
                enableCellEdit: false,
                aggregationType: uiGridConstants.aggregationTypes.count
            }, {
                name: 'Pickup Location',
                field: 'pickupLocation.address',
                cellTooltip: true,
                enableCellEdit: false,
            }, {
                name: 'Dropoff Location',
                field: 'dropoffLocation.address',
                cellTooltip: true,
                enableCellEdit: false,
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
        $scope.refreshAddresses = refreshAddresses($scope, $http);
        $scope.progress = {
            to: 0,
            from: 0
        };

        if(!Socket.socket) {
            Socket.connect();
        }

        Socket.on('rideMessage', function(message) {
            console.log('Recieved message');
            console.log(message);
            if(!message) return;
            if(message.progress) {
                $scope.progress[message.id] = message.progress * 100;
            } else if(message.result) {
                var solutions = _.get(message.result, 'problem.solutions.solution');
                var routes = _.get(_.min(solutions, function(sol) {
                    return sol.cost;
                }), 'routes.route', []);
                if(message.id === 'to') {
                    $scope.toResults = _.map(routes, function(r) {
                        return {
                            driver: r.vehicleId,
                            passengers: _(r.act).pluck('shipmentId').uniq().value()
                        };
                    });
                } else if(message.id === 'from') {
                    $scope.fromResults = _.map(routes, function(r) {
                        return {
                            driver: r.vehicleId,
                            passengers: _(r.act).pluck('shipmentId').uniq().value()
                        };
                    });
                }
            } else if(message.message) {
                $scope.error = message.message;
            }
        });

        var DIRECTION = {
            TO: 0,
            FROM: 1
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

            Socket.emit('rideMessage', {
                people: dataForTo,
                destination: $scope.address.selected,
                id: 'to'
            });
            Socket.emit('rideMessage', {
                people: dataForFrom,
                destination: $scope.address.selected,
                id: 'from'
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

        $scope.$on('$destroy', function() {
            Socket.removeListener('rideMessage');
        });
    }
})();
