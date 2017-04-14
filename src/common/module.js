'use strict';

var angular = require('angular');

var common = angular.module('common', []);

common.provider('commonConfig', [ function() {
	this.config = {};
	this.$get = function() {
		return {
			config: this.config
		};
	};
}] );

//Directives
common.directive('sepSpinner', require('./spinner.directive'));

//Services
common.factory('commonService', require('./commonService.service'));
common.service('spinner', require('./spinner.service'));

//Components

//Controllers
common.controller('YesNoDialogController', require('./yes-no-dialog.controller'));
common.controller('AlertDialogController', require('./alert-dialog.controller'));
common.controller('HttpDialogController', require('./http-dialog.controller'));

//Filters

module.exports = common;