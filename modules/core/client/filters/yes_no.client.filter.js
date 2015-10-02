(function() {
    'use strict';

    //Yes No filter used for changing truthy/falsey values to Yes/No
    angular
        .module('core')
        .filter('yes_no', yes_no);

    yes_no.$inject = [];

    function yes_no() {
        return function(text) {
            if(text)
                return 'Yes';
            return 'No';
        };
    }
})();
