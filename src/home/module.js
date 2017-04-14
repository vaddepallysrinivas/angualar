'use strict';

var angular = require('angular');

var home = angular.module('home', []);

home

	.component('appContainer', require('./container.component'))
    .component('login', require('./login.component'))


//controllers
.controller('ErrorDialogController', require('./error-dialog.controller'));
	
module.exports = home;