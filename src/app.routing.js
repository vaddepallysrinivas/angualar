'use strict';
var angular = require('angular');

function routing($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');
    $stateProvider
    .state('login', {
        url: '/login',
        templateUrl: 'src/home/templates/login.html',
        title: 'login'
    });
}

routing.$inject=['$stateProvider', '$urlRouterProvider'];

module.exports = routing;