(function() {
    'use strict';

    // Members controller
    angular
        .module('members')
        .controller('MembersController', MembersController);

    MembersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Members', 'Papa', '_'];

    function MembersController($scope, $stateParams, $location, Authentication, Members, Papa, _) {
        $scope.authentication = Authentication;

        // Create new Member
        $scope.create = function() {
            $scope.error = null;
            var header = 'name,pickupLocation,dropoffLocation,driver\n',
                cleanedData = $scope.data.replace(/\s*,\s*/g, ','),
                sortedData;

            var parseObj = Papa.parse(header + cleanedData, {
                header: true,
                fastMode: false,
                newline: '\n',
                delimiter: ','
            });

            if(parseObj.errors.length) {
                console.log('Error parsing member data');
                $scope.error = _.pluck(parseObj.errors, 'message').join(', ');
                return;
            } 
            
            parseObj.data.forEach(function(memberData) {
                memberData.driver = memberData.driver.toLowerCase() === 'yes';
            });
            
            Members.saveAll(parseObj.data, function(results) {
                // Redirect after save
                $location.path('members');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Member
        $scope.remove = function(member) {
            if(member) {
                member.$remove();

                for(var i in $scope.members) {
                    if($scope.members[i] === member) {
                        $scope.members.splice(i, 1);
                    }
                }
            } else {
                $scope.member.$remove(function() {
                    $location.path('members');
                });
            }
        };

        // Update existing Member
        $scope.update = function() {
            var member = $scope.member;

            member.$update(function() {
                $location.path('members/' + member._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Members
        $scope.find = function() {
            $scope.members = Members.query();
        };

        // Find existing Member
        $scope.findOne = function() {
            $scope.member = Members.get({
                memberId: $stateParams.memberId
            });
        };
    }
})();
