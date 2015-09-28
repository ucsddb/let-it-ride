(function() {
    'use strict';

    //Setting up route
    angular
        .module('members')
        .config(configure);

    configure.$inject = ['$stateProvider'];

    function configure($stateProvider) {
        // Members state routing
        $stateProvider.
        state('members', {
            abstract: true,
            url: '/members',
            template: '<ui-view/>'
        }).
        state('members.list', {
            url: '',
            templateUrl: 'modules/members/views/list-members.client.view.html'
        }).
        state('members.create', {
            url: '/create',
            templateUrl: 'modules/members/views/create-member.client.view.html'
        }).
        state('members.view', {
            url: '/:memberId',
            templateUrl: 'modules/members/views/view-member.client.view.html'
        }).
        state('members.edit', {
            url: '/:memberId/edit',
            templateUrl: 'modules/members/views/edit-member.client.view.html'
        });
    }
})();
