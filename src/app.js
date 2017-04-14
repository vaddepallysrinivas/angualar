'use strict';

var angular = require('angular');
require('angular-animate');
require('angular-touch');
require('angular-ui-bootstrap');
require('angular-ui-router');
require('angular-ui-grid');


//Modules
require('./common/module');
require('./home/module');


  angular.module('lms', [
		//3rd - party
		'ngAnimate',
		'ngTouch',
		'ui.bootstrap',
		'ui.router',
		'ui.grid',
		'ui.grid.resizeColumns',
		'ui.grid.autoResize',
		'ui.grid.edit',
		'ui.grid.autoResize',
		'ui.grid.selection',
		'ui.grid.pagination',


		//Modules
		'common',
		'home',
		//'admin',
		//'training',
		//'ptid',
		//'reports'
		])
  .value('config', require('./app.values'))
  .config(require('./app.routing'))
  .config(require('./app.decorators'))
  .config(require('./app.interceptors'))
  .config(require('./app.events.config'))
  .config(['$compileProvider', '$logProvider', function($compileProvider, $logProvider) {
  	$compileProvider.debugInfoEnabled(false);
			/*
				Always $logProvider.debugEnabled(false) - This will not show any log statements in production.
			*/
			$logProvider.debugEnabled(true);
		}]).
  config(['$httpProvider', function($httpProvider) {
	    //initialize get if not there

	    // $httpProvider.defaults.cache = false;
	    if (!$httpProvider.defaults.headers.get) {
	        $httpProvider.defaults.headers.get = {};    
	    }    
	    //disable IE ajax request caching
	    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
	    // extra
	    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
	    /*jshint sub:true*/
	    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
  
	    if (!$httpProvider.defaults.headers.post) {
	        $httpProvider.defaults.headers.post = {};    
	    }    

	    $httpProvider.defaults.headers.post['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        
	    $httpProvider.defaults.headers.post['Cache-Control'] = 'no-cache';
	    /*jshint sub:true*/
	    $httpProvider.defaults.headers.post['Pragma'] = 'no-cache';
	}]);
  //.factory('dataCache', require('./app.cache'))
  //.constant('AppConstants', require('./app.constants'))
  

