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
                name: 'Destination',
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

        // Create new Ride
        $scope.create = function() {
            // Create new Ride object
            var ride = new Rides({
                data: $scope.gridOptions.data
            });
            ride.$save().then(function(response) {
                // $location.path('rides/' + r);

                // Clear form fields
                $scope.name = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
})();
