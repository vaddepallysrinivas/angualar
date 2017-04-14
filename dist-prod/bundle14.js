(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function dataCache($cacheFactory) {
	return $cacheFactory('sepCache');
}

dataCache.$inject = ['$cacheFactory'];

module.exports = dataCache;
},{}],2:[function(require,module,exports){
'use strict';

var Constants = {

	//Roles
	ROLE_SYSTEM_ADMIN: '1',
	ROLE_GLOBAL: '2',
	REGIONAL_MANAGER: '3',
	KEY_USER: '4',
	TRAINER: '5',
	INTERNAL: '6',
	EXTERNAL: '7',
	SUB_REGION: '8',
	PROJECT_KEY_USER: '9',
	
	//Regions
	REGION_LAT: 'LAT',
	REGION_WSE: 'WSE',
	REGION_MEA: 'MEA',
	REGION_ALL: 'ALL',

	//Clocks
	CLOCKS: {
		TIMEZONES: {
			ATLANTA: '-05:00',
			HELSINKI: '+03:00',
			MUNICH: '+01:00',
			SINGAPORE: '+08:00',
			NEWDELHI: '+05:30'
		}
	}

};

module.exports = Constants;
},{}],3:[function(require,module,exports){
'use strict';

var requestInterceptor = ['$q', '$injector', '$location', '$rootScope', '$timeout',
    function($q, /*jshint unused:false*/$injector, $location, $rootScope, $timeout) {
        var numOfRequests = 0;
        var hide = function() {
            numOfRequests--;
            if (numOfRequests <= 0) {
                $rootScope.$emit('spinner.toggle', {show: false});
            }
        };
        var show = function () {
            numOfRequests++;
            if (numOfRequests > 0) {
                $rootScope.$emit('spinner.toggle', {show: true, background: false});
            }
        };
        if(numOfRequests === 0) {
            $rootScope.$emit('spinner.toggle', {show: false});
        }
        var interceptorInstance = {
            request: function (config) {
                var commonService = $injector.get('commonService');
                commonService.$log.getInstance().debug('[' + config.method + '] -> '+ config.url);
                show();
                return config || $q.when(config);
            },
            response: function (response) {
                hide();
                if(response.config.method === 'POST' && response.status > 200 && response.status <= 210) {
                    var toastr = $injector.get('toastr');
                    toastr.success('Data Saved Successfully !', 'Success', {timeOut:2000});
                }
                return response || $q.when(response);
            },
            responseError: function (rejection) {
                hide();
                $rootScope.$emit('spinner.toggle', {show: false});
                var commonService = $injector.get('commonService');
                if(rejection.config.method === 'POST') {
                    var toastr = $injector.get('toastr');
                    var message = '<p>Unable to save data successfully.<br/>Please contact support team immediately!</p>';
                    toastr.error(message, 'Data Error', {timeOut: 0, allowHtml:true});
                }
                var error = rejection.data || {};
                error = error.error || {};
                commonService.$log.getInstance().debug(error.message);
                return $q.reject(error);
            }
        };
        return interceptorInstance;
    }
];


function httpInterceptor($httpProvider) {
    $httpProvider.interceptors.push(requestInterceptor);
    // $httpProvider.defaults.cache = false;
    
}

httpInterceptor.$inject = ['$httpProvider'];



module.exports = httpInterceptor;
},{}],4:[function(require,module,exports){
'use strict';

var angular = require('angular');
require('angular-animate');
require('angular-touch');
require('angular-ui-bootstrap');
require('angular-ui-router');
require('angular-toastr');
require('angular-ui-grid');


//Modules
require('./common/module');
//require('./admin/module');
//require('./training/module');
//require('./ptid/module');
//require('./reports/module');
require('./home/module');

// window.google.charts.load('current', {'packages':['corechart', 'bar']});

  // window.google.load("visualization", "1", {packages:["columnchart"]});
  angular.module('sep', [
		//3rd - party
		'ngAnimate',
		'ngTouch',
		'ui.bootstrap',
		'ui.router',
		'toastr',
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
  //.config(require('./app.decorators'))
  .config(require('./app.interceptors'))
 // .config(require('./app.events.config'))
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
	}])
  .factory('dataCache', require('./app.cache'))
  .constant('AppConstants', require('./app.constants'))
  .config(['toastrConfig', function(toastrConfig) {
  	angular.extend(toastrConfig, {
  		positionClass: 'toast-bottom-right',
  		closeButton: true
  	});
  }]);



},{"./app.cache":1,"./app.constants":2,"./app.interceptors":3,"./app.routing":5,"./app.values":6,"./common/module":13,"./home/module":26,"angular":undefined,"angular-animate":undefined,"angular-toastr":undefined,"angular-touch":undefined,"angular-ui-bootstrap":undefined,"angular-ui-grid":undefined,"angular-ui-router":undefined}],5:[function(require,module,exports){
'use strict';
var angular = require('angular');

function routing($stateProvider, $urlRouterProvider, UserDetails) {

	var breadcrumbs = {
		dashboard: {
			'Dashboard':'dashboard'
		},
		myProfile: {
			'Dashboard':'dashboard',
			'My Profile':'myProfile'
		},
		passwordManagement: {
			'Dashboard':'dashboard',
			'My Profile':'myProfile',
			'Password management':'passwordManagement'
		},
		qualificationLevels: {
			'Qualification':false,
			'Qualification Levels':'qualificationLevels'
		},
		qualificationProcess: {
			'Qualification':false,
			'Qualification Process':'qualificationProcess'
		},
		overview: {
			'Qualification':false,
			'Overview':'overview'
		},

		ftpNam: {
			'Training':false,
			'Flexi Training plan':false,
			'NAM':'ftpNam'
		},
		secLocations: {
			'Training':false,
			'SEC Locations':'secLocations'
		},
		trainingCalendar: {
			'Training':false,
			'Training Calendar':'trainingCalendar'
		},

		trainingPortfolio: {
			'Training':false,
			'Training Portfolio':'trainingPortfolio'
		},
	
	
		uploadTrainingResults: {
			'Training':false,
			'Upload Training Results':'uploadTrainingResults'
		},
	

	
		approvePtid: {
			'Requests':false,
			'PTID Management':false,
			'Approve PTID':'approvePtid'
		},
	
	
		requestPtid: {
			'Requests':false,
			'PTID Management':false,
			'Request PTID':'requestPtid'
		},
	
		trackPtid: {
			'Requests':false,
			'PTID Management':false,
			'Track PTID':'trackPtid'
		},
	
		requestTraining: {
			'Requests':false,
			'Request Training':'requestTraining'
		},
	
		sepWebaccess: {
			'Requests':false,
			'SEP Web Access':'sepWebaccess'
		},
	
		trainingChecklist: {
			'Training CheckList':'trainingChecklist'
		},


		serviceTypesProducts: {
			'Requests':false,
			'Service Types and Products':'serviceTypesProducts'
		},
	

	
	
		auditDataReport: {
			'Reports':false,
			'Audit Data Report':'auditDataReport'
		},
	
		courseReport: {
			'Reports':false,
			'Course Report':'courseReport'
		},
	
		customizeReport: {
			'Reports':false,
			'Customize Report':'customizeReport'
		},
	
		ipmReport: {
			'Reports':false,
			'IPM Report':'ipmReport'
		},
	
		levelPushReport: {
			'Reports':false,
			'Push Report':false,
			'Levels Push Report':'levelPushReport'
		},
	
		licenseLevelReport: {
			'Reports':false,
			'License Level Report':'licenseLevelReport'
		},
	
		pushReport1: {
			'Reports':false,
			'Push Report':false,
			'Push Report 1':'pushReport1'
		},
	
		supplierDetails: {
			'Reports':false,
			'Supplier Details':'supplierDetails'
		},
	
		supplierTrainingResults: {
			'Reports':false,
			'Supplier Training Results':'supplierTrainingResults'
		},
	
		technicianSearch: {
			'Reports':false,
			'Technician Search':'technicianSearch'
		},
	
		trainingConfirmation: {
			'Reports':false,
			'Training Confirmation':'trainingConfirmation'
		},
	
		trainingReport: {
			'Reports':false,
			'Training Report':'trainingReport'
		},
		
		usersReport: {
			'Reports':false,
			'Users Report':'usersReport'
		},
	
		faq: {
			'FAQ':'faq'
		},
	
		formsFiles: {
			'Documentation':false,
			'Forms And Files':'formsFiles'
		},
	
		glossary: {
			'Documentation':false,
			'Glossary':'glossary'
		},
	
		adminProjectManagement: {
			'Admin':false,
			'Project Management':'adminProjectManagement'
		},
	
		adminSupplierManagement: {
			'Admin':false,
			'Supplier Management':'adminSupplierManagement'
		},
		
		adminApproveTraining: {
			'Admin':false,
			'Approve Training':'adminApproveTraining'
		},
		
		adminUpdateTechnicianHistory: {
			'Admin':false,
			'Technician Management':false,
			'Update Technician History':'adminUpdateTechnicianHistory'
		},
		
		adminUpdateTechnicianProfile: {
			'Admin':false,
			'Technician Management':false,
			'Update Technician Profile':'adminUpdateTechnicianProfile'
		},
		
		adminReactivateDeactivatePtid: {
			'Admin':false,
			'Technician Management':false,
			'Reactivate Deactivate PTID':'adminReactivateDeactivatePtid'
		},
		
		adminMultipleDeactivatePtid: {
			'Admin':false,
			'Technician Management':false,
			'Multiple Deactivate PTID':'adminMultipleDeactivatePtid'
		},
		
		adminUserManagement: {
			'Admin':false,
			'User Management':'adminUserManagement'
		},
	
		adminMassDataUpload: {
			'Admin':false,
			'Mass Data Upload':'adminMassDataUpload'
		}
	
	};

	$urlRouterProvider.otherwise('/dashboard');
	//https://moz.com/blog/11-best-practices-for-urls

	angular.forEach(UserDetails.navs, function(value, key) {
		if(value.routeLink) {
			var urlSplit = value.url.split('/');
			var component = urlSplit[urlSplit.length-1];
			$stateProvider.state(value.routeLink, {
				url:value.url,
				template:'<'+component+'></'+component+'>',
				title:value.name,
				breadcrumbs:breadcrumbs[value.routeLink]
			});
			if(value.routeLink==='requestTraining'){
				$stateProvider.state('trainingChecklist', {
					url:'training/training-checklist',
					template:'<training-checklist></training-checklist>',
					title:'Training Checklist',
					breadcrumbs:breadcrumbs.trainingChecklist
				});
			}
		}
		
	});

	/* .......Footer........ */

	$stateProvider

	.state('sepOverview', {
		url:'/footer/sep-overview',
		templateUrl: '/epm/sep/modules/home/templates/sep-overview.html',
		breadcrumbs: {
			'Supplier Excellence Program - Overview':'sepOverview'
		},
		title: 'SEP Overview'
	})
	.state('secOverview', {
		url:'/footer/sec-overview',
		templateUrl: '/epm/sep/modules/home/templates/sec-overview.html',
		breadcrumbs: {
			'Supplier Excellence Center - Overview':'secOverview'
		},
		title: 'SEC Overview'
	})
	.state('ssiOverview', {
		url:'/footer/ssi-overview',
		templateUrl: '/epm/sep/modules/home/templates/ssi-overview.html',
		breadcrumbs: {
			'SSI Overview':'ssiOverview'
		},
		title: 'SSI Overview'
	})
	.state('privacyStatement', {
		url:'/footer/privacy-statement',
		templateUrl: '/epm/sep/modules/home/templates/privacy-statement.html',
		breadcrumbs: {
			'Privacy Statement':'privacyStatement'
		},
		title: 'Privacy Statement'
	})
	.state('termsOfUse', {
		url:'/footer/terms-of-use',
		templateUrl: '/epm/sep/modules/home/templates/terms-of-use.html',
		breadcrumbs: {
			'Terms of Use':'termsOfUse'
		},
		title: 'Terms of Use'
	})
	.state('contactUs', {
		url:'/contact-us',
		template:'<contact-us></contact-us>',
		breadcrumbs: {
			'Contact Us':'contactUs'
		},
		title: 'Contact Us'
	});
	
}

routing.$inject=['$stateProvider', '$urlRouterProvider', 'UserDetails'];

module.exports = routing;
},{"angular":undefined}],6:[function(require,module,exports){
'use strict';

var events = {
    showErrorDialog: 'error.dialog',
    spinnerToggle: 'spinner.toggle',
    activateParentController: 'activate.parent.controller',
    activateController: 'activate.controller',
    activateControllerFailed: 'activate.controller.failed'
};

var config = {
    events: events
};

module.exports = config;
},{}],7:[function(require,module,exports){
'use strict';

function alertDialogController($uibModalInstance, params) {

	/*jshint validthis:true*/
	var alertCtrl = this;
	
	alertCtrl.title = params.title || 'Alert';
	alertCtrl.message = params.message || 'Please Confirm !!';
	alertCtrl.okTitle = params.okTitle || 'OK';
	
	alertCtrl.ok = function () {
        $uibModalInstance.close();
    };

    alertCtrl.no = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

alertDialogController.$inject = ['$uibModalInstance', 'params'];

module.exports = alertDialogController;
},{}],8:[function(require,module,exports){
'use strict';

var angular = require('angular');
var moment = require('moment-timezone');

var drawClock = require('./sep-clock');

function configService($rootScope, $q, $window, commonConfig, $timeout, $interval, $location, $uibModal, $log, $http,uiGridConstants) {

    var apiBaseUrl = '';
    var baseUrl = apiBaseUrl + '/epm/newipm/sep/api';

    function $broadcast() {
        return $rootScope.$broadcast.apply($rootScope, arguments);
    }

    function broadcastErrorDialogEvent(error) {
        $broadcast(commonConfig.config.showErrorDialogEvent, error);
    }
    
    function activateParentController(requests, controllerId) {
        return $q.all(requests).then(function (/* jshint unused:false */ result) {
            var data = {controllerId: controllerId};
            $broadcast(commonConfig.config.activateParentControllerEvent, data);
        }, function(error){
           
        });
    }
    
    function activateController(requests, controllerId) {
        var deferred = $q.defer();
        $q.all(requests).then(function (/* jshint unused:false */ eventArgs) {
            var data = {controllerId: controllerId};
            $broadcast(commonConfig.config.activateControllerEvent, data);
            deferred.resolve(eventArgs);
        }).catch(function (reason) {
            $broadcast(commonConfig.config.activateControllerFailedEvent, reason);
            deferred.reject(reason);
        });
        return deferred.promise;
    }

    function yesNoDialog(title, message, yesCallback, noCallback, yesTitle, noTitle) {
        var modalInstance = $uibModal.open({
            templateUrl: '/epm/sep/modules/common/templates/yes-no-dialog.html',
            controller: 'YesNoDialogController',
            controllerAs:'yesNoCtrl',
            resolve: {
                params: function() {
                    return { 
                        title: title, 
                        message: message,
                        yesTitle: yesTitle,
                        noTitle: noTitle
                    };
                }
            }
        });

        modalInstance.result.then(function() {
            yesCallback();
        }, function() {
            noCallback();
        });
    }

    function alertDialog(title, message, okCallback, okTitle) {
        var modalInstance = $uibModal.open({
            templateUrl: '/epm/sep/modules/common/templates/alert-dialog.html',
            controller: 'AlertDialogController',
            controllerAs:'alertCtrl',
            resolve: {
                params: function() {
                    return { 
                        title: title, 
                        message: message,
                        okTitle: okTitle
                    };
                }
            }
        });
        modalInstance.result.then(function() {
            if(okCallback){
                okCallback();
            }
        }, function() {

        });
    }

    function httpDialog(isSuccess, message) {
        //var /* jshint unused:false */ modalInstance = 
        $uibModal.open({
            templateUrl: '/epm/sep/modules/common/templates/http-callback.html',
            controller: 'HttpDialogController',
            controllerAs:'httpCtrl',
            backdrop:false,
            windowClass: 'center-modal',
            resolve: {
                params: function() {
                    return { 
                        message: message,
                        isSuccess: isSuccess
                    };
                }
            }
        });
        //todo: Vinay and sravya will check this
        // modalInstance.rendered.then(function (modal) {
        //     var element = document.getElementById("modal-body"),
        //         rect = element.getBoundingClientRect(),
        //         modal = document.querySelector('.modal-dialog');

        //     modal.style.margin = 0;
        //     modal.style.left = rect.left + 'px';
        //     modal.style.top = rect.top + 'px';
        // });
    }

    function constructFileRequest(resource, data, params) {
        return {
            method: 'POST',
            url: baseUrl + resource,
            headers: { 'Content-Type': undefined },
            transformRequest: function(data) {
                var formData = new FormData();
                var columns = Object.keys(data);
                for(var i=0; i<columns.length; i++) {
                    formData.append(columns[i], data[columns[i]]);
                }
                return formData;
            },
            data: data,
            params:params
        };
    }

    function processDataForChart(data) {
        $log.debug('graph data',data);
        var info = [];
        //labels
        var labels = Object.keys(data);
        info.push(labels);
        labels.sort();
        //label data
        var labelData = [];
        for(var i=0; i<labels.length; i++){
            labelData.push(data[labels[i]]);
        }
        info.push(labelData);
        return info;
    }

    function drawBarChart(data, options, label, elementId) {
        if(!data) {
            return null;
        }
        var info = processDataForChart(data);
        var context = document.getElementById(elementId).getContext('2d');
        //context.clearRect(0,0, 230, 230);
        var barThickness = 30;
        var totalEntries = Object.keys(data).length;
        if(totalEntries>=10 && totalEntries < 12) {
            barThickness = 25;
        }else if(totalEntries >=12 && totalEntries < 15) {
            barThickness = 20;
        }
        else if(totalEntries > 15) {
            barThickness = 10;
        }
        var opt = {
            title:{
                display:true,
                text:options.titleText || 'Title',
                padding:25
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: options.yLabel || 'Y Label'
                    },
                    ticks: {
                        beginAtZero:true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: options.xLabel || 'X Label'
                    },
                    ticks: {
                        beginAtZero:true

                    },
                    barThickness:barThickness
                }]
            },
            legend:{
                display:true,
                position:'bottom',
                onClick:null
            },
            animation: {
                onComplete: function(){
                    context.font = /* jshint undef:false*/Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
                    context.fillStyle = this.chart.config.options.defaultFontColor;
                    context.textAlign = 'center';
                    context.textBaseline = 'bottom';
                    this.data.datasets.forEach(function (dataset) {
                        for (var i = 0; i < dataset.data.length; i++) {
                            var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                            context.fillText(dataset.data[i], model.x-1, model.y - 5);
                        }
                    });
                }
            }
        };
        /* jshint undef:false*/
        return new Chart(context, {
            type: 'bar',
            data: {
                labels: info[0],
                datasets: [{
                    label: label,
                    data: info[1],
                    backgroundColor: 'rgba(66,139,202,1)'
                }]
            },
            options: opt
        });

    }

    /**
     * http://momentjs.com/
     * http://momentjs.com/timezone/
     * Moment library is already included into our application, if times needs to be implemented
     * Implement it here in common service, we are going to use the same service across the application
     * new Moment(new Date()) - Normal Moment Obect
     * moment.tz('America/Los_Angles') - moment object with timezone - considers day light savings as well
     *
     * for all ISO Formats like UTC, YYYY-MM-DD - no need to pass the format
     * 
     */
     function createDate(date, format, tz) {
        var momentDate;
        //guessing timezone - is same as system date/time.
        //Advantage is in future if timezone comes into picture, this is the only place that will change
        if(!tz) {
            tz = moment.tz.guess();
        }
        if(moment.isMoment(date) || moment.isDate(date)) {
            throw new Error('In create date, date should be null or string, date obj will be created');
        }
        if(date && format) {
            momentDate = moment.tz(date, format, tz);
        }else if(date){
            if(!format) {
                throw new Error('Format is mandatory');
            }
            momentDate = moment.tz(date, format, tz);
        }else {
            momentDate = moment.tz(tz);
        }
        /*return new Date(momentDate.year(), 
            momentDate.month(), 
            momentDate.date(), 
            momentDate.hours(), 
            momentDate.minutes(), 
            momentDate.seconds());*/
            return momentDate.toDate();
        }

        function createMomentDate(date, format, tz) {
            var momentDate;
        //guessing timezone - is same as system date/time.
        //Advantage is in future if timezone comes into picture, this is the only place that will change
        if(!tz) {
            tz = moment.tz.guess();
        }
        if(date && format) {
            momentDate = moment.tz(date, format, tz);
        }else {
            momentDate = moment.tz(tz);
        }
        return momentDate;
    }

    /**
     * Converting date from UTC to normal date, based on time zone
     * @param  {[type]} date [date to convert]
     * @param  {[type]} tz   [tz is mandatory, else will guess based on system timezone]
     * @return {[type]}      [returns javascript date object]
     */
     function fromUTC(date, format, tz) {
        if(!tz) {
            tz = moment.tz.guess();
        }
        if(format) {
            moment.tz(date, format, tz).toDate();
        }
        return moment.tz(date, tz).toDate();
    }

    /**
     * Converting given time to UTC format
     * @param  {[type]} date       [date to convert]
     * @param  {[type]} dateFormat [date format, if any]
     * @param  {[type]} utcFormat  [utc date format]
     * @param  {[type]} tz         [tz is mandatory, else will guess based on system timezone]
     * @return {[type]}            [returns UTC string]
     */
     function toUTC(date, dateFormat, utcFormat, tz) {
        if(!tz) {
            tz = moment.tz.guess();
        }
        var utc;
        if(moment.isMoment(date)) {
            utc = date.toUTC();
        }else if(moment.isDate(date)) {
            utc = moment(date).toUTC();
        }else {
            if(!dateFormat) {
                throw new Error('Since date is a string, you need to provide the date format of your date');
            }
            utc = moment.tz(date, dateFormat, tz).toUTC();
        }
        if(utcFormat) {
            return utc.format(utcFormat);
        }
        return utc.format();
    }

    /**
     * Formats the given date into required format
     * @param  {[type]} date       [date to format]
     * @param  {[type]} dateFormat [date format convertion]
     * @param  {[type]} tz         [tz is mandatory, else will guess based on system timezone]
     * @return {[type]}            [formats the given date]
     */
     function formatDate(date, dateFormat, tz) {
        if(!tz) {
            tz = moment.tz.guess();
        }
        var momentDate;
        if(moment.isMoment(date)) {
            momentDate = date;
        }else if(moment.isDate(date)) {
            momentDate = moment(date);
        }else if(date){
            if(!dateFormat) {
                throw new Error('Since date is a string, you need to provide the date format of your date');
            }
            momentDate = moment.tz(date, dateFormat, tz);
        }
        return momentDate.format(dateFormat);
    }

    function exportToExcel(data, query) {
       var options = {
        headers: true,
        sheetid: 'users',
        column: {style:{Font:{Bold:'1'}}},
        rows: {1:{style:{Font:{Color:'#FF0077'}}}},
        cells: {1:{1:{
            style: {Font:{Color:'#00FFFF'}}
        }}}
    };
    /* jshint ignore:start */
    alasql(query, [options, data]);
       
        /* jshint ignore:end */
    }
    
    var service = {
        $broadcast: $broadcast,
        $rootScope: $rootScope,
        $q: $q,
        $window: $window,
        broadcastErrorDialogEvent: broadcastErrorDialogEvent,
        activateParentController: activateParentController,
        activateController: activateController,
        $interval: $interval,
        $timeout: $timeout,
        $location: $location,
        $uibModal: $uibModal,
        $log: $log,
        $http: $http,
        apiBaseUrl: apiBaseUrl,
        baseUrl: baseUrl,
        assetBaseUrl: '/epm/sep/assets/',
        htmlBaseUrl: '/epm/sep/modules/',
        yesNoDialog: yesNoDialog,
        alertDialog: alertDialog,
        httpDialog: httpDialog,
        drawClock: drawClock,
        drawBarChart: drawBarChart,
        constructFileRequest: constructFileRequest,
        createDate: createDate,
        formatDate: formatDate,
        exportToExcel:exportToExcel,
        uiGridConstants:uiGridConstants
    };

    return service;
}

configService.$inject = ['$rootScope', '$q', '$window', 
'commonConfig', '$timeout', '$interval', 
'$location', '$uibModal', '$log', '$http','uiGridConstants'];

module.exports = configService;
},{"./sep-clock":15,"angular":undefined,"moment-timezone":undefined}],9:[function(require,module,exports){
'use strict';
var angular = require('angular');
function DataService(commonService) {
	
	var $log = commonService.$log.getInstance('DataService');
	var $http = commonService.$http;
	var $q = commonService.$q;
	var baseUrl = commonService.baseUrl;

	var regions={},
	    roles={},
	    rolesMap={};

   function getRegionsList()
   {
   	  return regions;
   }

  function getRolesList()
   {
   	  return roles;
   }
   
  function getRolesMapList()
   {
   	  return rolesMap;
   }

	function getRegionDetails() {
		var deferred = $q.defer();
        regions=getRegionsList();
		if(!angular.equals({}, regions)) {
			deferred.resolve(regions);
		}else {
			$http.get(baseUrl+'/regionDetails').then(function(result){
                 
				regions=result.data;
				$log.debug('regions data',result.data);
				deferred.resolve(result.data);
			}, function(error){
				deferred.reject(error);
			});
		}
		return deferred.promise;
	}

	function getRoles() {
		var deferred = $q.defer();
		 roles=getRolesList();
		if(!angular.equals({}, roles)) {
			deferred.resolve(roles);
		}else {
			$http.get(baseUrl+'/roleDetails').then(function(result){
				roles=result.data;
				//dataCache.put('roles', result.data);
				deferred.resolve(result.data);
			}, function(error){
				deferred.reject(error);
			});
		}
		return deferred.promise;
	}

	function getRolesMap() {
		var deferred = $q.defer();
		 rolesMap=getRolesMapList();
		if(!angular.equals({}, rolesMap)) {
			deferred.resolve(rolesMap);
		}else {
			$http.get(baseUrl+'/roleDetails').then(function(result){
				//dataCache.put('rolesMap', result.data);
				var roles = result.data;
				var rolesMapData = {};
				for(var i=0; i<roles.length; i++) {
					rolesMapData[roles[i].key] = roles[i].name;
				}
				rolesMap=rolesMapData;
				//dataCache.put('rolesMap', rolesMap);
				deferred.resolve(rolesMap);
			}, function(error){
				deferred.reject(error);
			});
		}
		return deferred.promise;
	}


	var service = {
		getRegionDetails:getRegionDetails,
		getRoles: getRoles,
		getRolesMap: getRolesMap
	};

	return service;
}

DataService.$inject = ['commonService'];

module.exports = DataService;
},{"angular":undefined}],10:[function(require,module,exports){
'use strict';

var moment=require('moment-timezone');

function sepDateFilter() {
	return function(date, dateFormat, formatToConvert, tz) {
		if(!tz) {
            tz = moment.tz.guess();
        }
        var momentDate;
        if(moment.isMoment(date)) {
            momentDate = date;
        }else if(moment.isDate(date)) {
            momentDate = moment(date);
        }else if(date){
            if(!dateFormat) {
                throw new Error('Since date is a string, you need to provide the date format of your date');
            }
            momentDate = moment.tz(date, dateFormat, tz);
        }
        return momentDate.format(formatToConvert); 
	};
}

sepDateFilter.$inject = [];

function sepDateObjFilter() {
	return function(date, formatToConvert, tz) {
		//DD-MM-YYYY, YYYY/MM/Do
		if(!tz) {
            tz = moment.tz.guess();
        }
        var momentDate;
        if(moment.isMoment(date)) {
            momentDate = date;
        }else if(moment.isDate(date)) {
            momentDate = moment(date);
        }else {
        	throw new Error('Date needs to be object in order to use this filter');
        }
        return momentDate.format(formatToConvert); 
	}; 
}

sepDateObjFilter.$inject = [];

module.exports = {
	sepDateFilter: sepDateFilter,
	sepDateObjFilter: sepDateObjFilter
};
},{"moment-timezone":undefined}],11:[function(require,module,exports){
'use strict';

function httpDialogController($uibModalInstance, params) {

	/*jshint validthis:true*/
	var dialogCtrl = this;

	dialogCtrl.successMsg = 'Data Saved Successfully !';
	dialogCtrl.failureMsg = 'Data failed to save, please try again !';
	dialogCtrl.isSuccess = params.isSuccess;
	
	if(params.isSuccess) {
		dialogCtrl.message = params.message || dialogCtrl.successMsg;
		dialogCtrl.classType = 'success';
	}else{
		dialogCtrl.message = params.message || dialogCtrl.failureMsg;
		dialogCtrl.classType = 'danger';
	}
	
	dialogCtrl.closeAlert = function() {
		$uibModalInstance.dismiss();
	};

	setTimeout(function(){
    	$uibModalInstance.close();
    }, 1500);
}

httpDialogController.$inject = ['$uibModalInstance', 'params'];

module.exports = httpDialogController;
},{}],12:[function(require,module,exports){
'use strict';

var angular = require('angular');
function locationsDropdown(commonService,UserDetails,DataService,$scope) {
    var $log = commonService.$log.getInstance('LocationsDropdownController');
    /* jshint validthis:true */
    var ldCtrl=this;
    $log.debug('regions',UserDetails.userDetails.region,UserDetails.userDetails.subRegion);
    ldCtrl.selectedLocations={region:UserDetails.userDetails.region,subregion:UserDetails.userDetails.subRegion,country:UserDetails.userDetails.country};
    ldCtrl.allSubRegions=[];//regionalData.subRegionsInRegion[region]
    ldCtrl.allcountries=[];//smCtrl.regionalData.countriesInSubRegion[subRegion]
    ldCtrl.disableRegion = true;
    ldCtrl.disableSubRegion = true;
    ldCtrl.disableCountry = true;


    var role =UserDetails.userDetails.roleId;
    var region = UserDetails.userDetails.region;
    var subRegion = UserDetails.userDetails.subRegion;
    var country = UserDetails.userDetails.country;
    ldCtrl.selectedLocations={region:region,subRegion:subRegion,country:country};

    DataService.getRegionDetails().then(function(result){
       ldCtrl.regionalData=result;
       ldCtrl.allRegions=ldCtrl.regionalData.regions;
       ldCtrl.region=region;
       ldCtrl.allSubRegions=ldCtrl.regionalData.subRegionsInRegion[ldCtrl.region];
       ldCtrl.subRegion=subRegion;
       ldCtrl.allcountries=ldCtrl.regionalData.countriesInSubRegion[ldCtrl.subRegion];
       ldCtrl.country=country;

   });

    
    
   /* -------------- role based disable ---------- */
    angular.forEach(ldCtrl.roles, function(objRoles, key) { // jshint ignore:line

      if(objRoles.role===role)
      {
         ldCtrl.disableRegion = objRoles.disableRegion;
         ldCtrl.disableSubRegion = objRoles.disableSubRegion;
         ldCtrl.disableCountry = objRoles.disableCountry;
     }
 });

 /* -------------- role based and region based disable---------- */
    angular.forEach(ldCtrl.regionroles, function(objRegionRoles, key) { // jshint ignore:line

      if(objRegionRoles.role===role&&objRegionRoles.region===region)
      {
         ldCtrl.disableRegion = objRegionRoles.disableRegion;
         ldCtrl.disableSubRegion = objRegionRoles.disableSubRegion;
         ldCtrl.disableCountry = objRegionRoles.disableCountry;
     }
 });

 /* -------------- fill subregions ---------- */
    ldCtrl.loadSubregions=function()
    {
       ldCtrl.allSubRegions=ldCtrl.regionalData.subRegionsInRegion[ldCtrl.region];
       ldCtrl.allcountries=[];
       ldCtrl.selectedLocations={region:ldCtrl.region,subRegion:null,country:null};

      $scope.$watch(ldCtrl.selectedLocations, function() {
       ldCtrl.regionChanged();
       });

   };


    /* -------------- fill contries---------- */
   ldCtrl.loadCountries=function()
   {
       
       ldCtrl.allcountries=ldCtrl.regionalData.countriesInSubRegion[ldCtrl.subRegion]; 
       ldCtrl.selectedLocations={region:ldCtrl.region,subRegion:ldCtrl.subRegion,country:null};

       $scope.$watch(ldCtrl.selectedLocations, function() {
          ldCtrl.subRegionChanged();
        });
   };



   ldCtrl.loadData=function()
   {
   
    ldCtrl.selectedLocations={region:ldCtrl.region,subRegion:ldCtrl.subRegion,country:ldCtrl.country};
 
   $scope.$watch(ldCtrl.selectedLocations, function() {
      
       ldCtrl.countryChanged();
   });
        
   };
}


locationsDropdown.$inject=['commonService','UserDetails','DataService','$scope'];

module.exports = {
 templateUrl: '/epm/sep/modules/common/templates/locations-dropdown.html',
 controllerAs:'ldCtrl',
 controller: locationsDropdown,
 bindings: {
  selectedLocations: '=ngModel',
  regionChanged: '&',
  subRegionChanged: '&',
  countryChanged: '&',
  roles: '=',
  regionroles:'='
}
};



},{"angular":undefined}],13:[function(require,module,exports){
'use strict';

var angular = require('angular');

var common = angular.module('common', []);

//common.provider('commonConfig', [ function() {
//	this.config = {};
//	this.$get = function() {
//		return {
//			config: this.config
//		};
//	};
//}] );

//Directives
common.directive('sepSpinner', require('./spinner.directive'));

//Services
common.factory('commonService', require('./config.service'));
common.service('spinner', require('./spinner.service'));
common.service('DataService', require('./data.service'));
//Components

//Controllers
common.controller('YesNoDialogController', require('./yes-no-dialog.controller'));
common.controller('AlertDialogController', require('./alert-dialog.controller'));
common.controller('HttpDialogController', require('./http-dialog.controller'));

//Filters
common.filter('sepDateFilter', require('./date.filter').sepDateFilter);
common.filter('sepDateObjFilter', require('./date.filter').sepDateObjFilter);
common.filter('removeNull', require('./remove-null.filter'));

common.component('locationsDropdown',require('./locations-dropdown.component'));

module.exports = common;
},{"./alert-dialog.controller":7,"./config.service":8,"./data.service":9,"./date.filter":10,"./http-dialog.controller":11,"./locations-dropdown.component":12,"./remove-null.filter":14,"./spinner.directive":16,"./spinner.service":17,"./yes-no-dialog.controller":18,"angular":undefined}],14:[function(require,module,exports){
'use strict';

function removeNullFilter() {
	return function(input) {
		if(input === 'null' || input === 'undefined') {
			return null;
		}
		else {
			return input;
		}
	};
}


module.exports = removeNullFilter;
},{}],15:[function(require,module,exports){
'use strict';

var moment = require('moment-timezone');
// http://www.encodedna.com/html5/canvas/simple-analog-clock-using-canvas-javascript.htm
function drawClock(timezone, elementId, radius, interval, uiDate) {
	
	interval = interval || 1000;

	var runningClock = setInterval(function() {

		var date = timezone ? moment().utcOffset(timezone) : moment();
		var canvas = document.getElementById(elementId);
		
        uiDate = new Date();

        window.onresize = function(event) {
           
        };

		//stop clock if canvas id not found
        if(!canvas) {
        	clearInterval(runningClock);
        	return;
        }

        var ctx = canvas.getContext('2d');
        var angle;
        var secHandLength = radius || 60;

		ctx.clearRect(0, 0, canvas.width, canvas.height);        

		/* jshint unused:false */
        function OUTER_DIAL1() {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, secHandLength + 10, 0, Math.PI * 2);
            ctx.strokeStyle = '#92949C';
            ctx.stroke();
        }

        function OUTER_DIAL2() {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, secHandLength + 1, 0, Math.PI * 2);
            ctx.strokeStyle = '#929BAC';
            ctx.stroke();
        }

        function CENTER_DIAL() {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
            ctx.lineWidth = 3;
            ctx.fillStyle = '#353535';
            ctx.strokeStyle = '#0C3D4A';
            ctx.stroke();
        }

        function MARK_THE_HOURS() {

            for (var i = 0; i < 12; i++) {
                angle = (i - 3) * (Math.PI * 2) / 12;       // THE ANGLE TO MARK.
                ctx.lineWidth = 2;            // HAND WIDTH.
                ctx.beginPath();

                var x1 = (canvas.width / 2) + Math.cos(angle) * (secHandLength);
                var y1 = (canvas.height / 2) + Math.sin(angle) * (secHandLength);
                var x2 = (canvas.width / 2) + Math.cos(angle) * (secHandLength - (secHandLength / 7));
                var y2 = (canvas.height / 2) + Math.sin(angle) * (secHandLength - (secHandLength / 7));

                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);

                ctx.strokeStyle = '#466B76';
                ctx.stroke();
            }
        }

        function MARK_THE_SECONDS() {

            for (var i = 0; i < 60; i++) {
                angle = (i - 3) * (Math.PI * 2) / 60;       // THE ANGLE TO MARK.
                ctx.lineWidth = 2;            // HAND WIDTH.
                ctx.beginPath();

                var x1 = (canvas.width / 2) + Math.cos(angle) * (secHandLength);
                var y1 = (canvas.height / 2) + Math.sin(angle) * (secHandLength);
                var x2 = (canvas.width / 2) + Math.cos(angle) * (secHandLength - (secHandLength / 30));
                var y2 = (canvas.height / 2) + Math.sin(angle) * (secHandLength - (secHandLength / 30));

                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);

                ctx.strokeStyle = '#CCC';
                ctx.stroke();
            }
        }

        function SHOW_SECONDS() {

            var sec = date.seconds();
            angle = ((Math.PI * 2) * (sec / 60)) - ((Math.PI * 2) / 4);
            ctx.lineWidth = 0.5;              // HAND WIDTH.

            ctx.beginPath();
            // START FROM CENTER OF THE CLOCK.
            ctx.moveTo(canvas.width / 2, canvas.height / 2);   
            // DRAW THE LENGTH.
            ctx.lineTo((canvas.width / 2 + Math.cos(angle) * secHandLength),
                canvas.height / 2 + Math.sin(angle) * secHandLength);

            // DRAW THE TAIL OF THE SECONDS HAND.
            ctx.moveTo(canvas.width / 2, canvas.height / 2);    // START FROM CENTER.
            // DRAW THE LENGTH.
            ctx.lineTo((canvas.width / 2 - Math.cos(angle) * 20),
                canvas.height / 2 - Math.sin(angle) * 20);

            ctx.strokeStyle = '#586A73';        // COLOR OF THE HAND.
            ctx.stroke();
        }

        function SHOW_MINUTES() {

            var min = date.minutes();
            angle = ((Math.PI * 2) * (min / 60)) - ((Math.PI * 2) / 4);
            ctx.lineWidth = 1.5;              // HAND WIDTH.

            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);  // START FROM CENTER.
            // DRAW THE LENGTH.
            ctx.lineTo((canvas.width / 2 + Math.cos(angle) * secHandLength / 1.1),      
                canvas.height / 2 + Math.sin(angle) * secHandLength / 1.1);

            ctx.strokeStyle = '#999';  // COLOR OF THE HAND.
            ctx.stroke();
        }

        function SHOW_HOURS() {

            var hour = date.hours();
            var min = date.minutes();
            angle = ((Math.PI * 2) * ((hour * 5 + (min / 60) * 5) / 60)) - ((Math.PI * 2) / 4);
            ctx.lineWidth = 1.5;              // HAND WIDTH.

            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);     // START FROM CENTER.
            // DRAW THE LENGTH.
            ctx.lineTo((canvas.width / 2 + Math.cos(angle) * secHandLength / 1.5),      
                canvas.height / 2 + Math.sin(angle) * secHandLength / 1.5);

            ctx.strokeStyle = '#000';   // COLOR OF THE HAND.
            ctx.stroke();
        }

        //OUTER_DIAL1();
        OUTER_DIAL2();
        CENTER_DIAL();
        MARK_THE_HOURS();
        MARK_THE_SECONDS();

        SHOW_SECONDS();
        SHOW_MINUTES();
        SHOW_HOURS();

        
	}, interval);

	
}

module.exports = drawClock;
},{"moment-timezone":undefined}],16:[function(require,module,exports){
'use strict';

function spinner($window) {
    
    function link(scope, element, attrs) {
        scope.spinner = null;
        scope.$watch(attrs.sepSpinner, function (options) {
            options.radius = 15;
            options.width = 15;
            if (scope.spinner) {
                scope.spinner.stop();
            }
            scope.spinner = new $window.Spinner(options);
            scope.spinner.spin(element[0]);
        }, true);
    }

    var directive = {
        link: link,
        restrict: 'A'
    };
    
    return directive;
    
}

spinner.$inject = ['$window'];

module.exports = spinner;
},{}],17:[function(require,module,exports){
'use strict';

function spinnerService(commonService, commonConfig) {
	
	function spinnerToggle(show) {
        commonService.$broadcast(commonConfig.config.spinnerToggleEvent, {show: show});
    }

	function spinnerHide() {
        spinnerToggle(false);
    }
    
    function spinnerShow() {
        spinnerToggle(true);
    }

    return {
    	spinnerHide: spinnerHide,
    	spinnerShow: spinnerShow
    };
    
}

spinnerService.$inject = ['commonService', 'commonConfig'];

module.exports = spinnerService;
},{}],18:[function(require,module,exports){
'use strict';

function yesNoDialogController($uibModalInstance, params) {

	/*jshint validthis:true*/
	var yesNoCtrl = this;
	
	yesNoCtrl.title = params.title || 'Confirm ?';
	yesNoCtrl.yesTitle = params.yesTitle || 'YES';
	yesNoCtrl.noTitle = params.noTitle || 'NO';
	yesNoCtrl.message = params.message || 'Please Confirm !';

	yesNoCtrl.yes = function () {
        $uibModalInstance.close();
    };

    yesNoCtrl.no = function () {
        $uibModalInstance.dismiss('cancel');
    };

}

yesNoDialogController.$inject = ['$uibModalInstance', 'params'];

module.exports = yesNoDialogController;
},{}],19:[function(require,module,exports){
'use strict';

function contactUsControllerFn(commonService,DataService) {
	var $log = commonService.$log.getInstance('ContactUsController');

	/* jshint validthis:true */
	var cuCtrl=this;
	cuCtrl.feedback = {};
	cuCtrl.alerts = [];

	function showAlert(alertType, alertMessage) {
		for(var i=0;i<cuCtrl.alerts.length;i++){
			cuCtrl.alerts[i].show=false;
		}
		cuCtrl.alerts.push({type:alertType,message:alertMessage,show:true});
	}
	
	cuCtrl.closeAlert = function(index) {
		cuCtrl.alerts.splice(index,1);
	};
	
	function getCountries(){
		var countries=[];
		for(var subRegion in cuCtrl.regionDetails.countriesInSubRegion){
			for(var country in cuCtrl.regionDetails.countriesInSubRegion[subRegion]){
				countries.push(cuCtrl.regionDetails.countriesInSubRegion[subRegion][country]);
			}
		}
		return countries;
	}

	cuCtrl.submit = function(form) {
		if(form.$valid){
			showAlert('success','Success! Your message has been sent. Thank you for contacting SEP team.');
			cuCtrl.feedback = {};
			form.$setPristine();
		}
		else{
			var errormsg='';
			if(form.$error.required){
				errormsg+='All mandatory(*) fields are required. ';
				for(var i=0;i<form.$error.required.length;i++){
					form.$error.required[i].$setDirty();
				}
			}
			if(form.$error.email){
				errormsg+='Invalid Email Format. ';
			}
			showAlert('danger','Error! '+errormsg);
		}
	};
	commonService.activateController([DataService.getRegionDetails()], 'ContactUsController').then(function(results){
		cuCtrl.regionDetails=results[0];
		$log.debug('region details',results[0]);
		cuCtrl.countries=getCountries();
		$log.debug('countries',cuCtrl.countries);
	},function(error){
		
	});

}

contactUsControllerFn.$inject = ['commonService','DataService'];

module.exports = {
	templateUrl: '/epm/sep/modules/home/templates/contact-us.html',
	controllerAs:'cuCtrl',
	controller: contactUsControllerFn
};




},{}],20:[function(require,module,exports){
'use strict';

var angular = require('angular');

function containerController($scope, UserService, $rootScope, config, $uibModal, commonService, UserDetails) {
    
    var $log = commonService.$log.getInstance('ContainerController');

    /*jshint validthis:true*/
    var containerCtrl = this;
    var events = config.events;
    
    containerCtrl.isBusy = false;
    containerCtrl.showError = false;

    
    function activate() {
        commonService.activateParentController([], 'ContainerController').then(function() {
            
        }, function() {

        });
    }

    activate();
    
    containerCtrl.spinnerOptions = {
        radius: 40,
        lines: 7,
        length: 0,
        width: 30,
        speed: 1.7,
        corners: 1.0,
        trail: 100,
        color: '#5a91cc'
    };

    function toggleSpinner(on) {
        if(!containerCtrl.showError) {
            containerCtrl.isBusy = on;
        }
    }

    function captureInner(error) {
        var errorString = 'Error: ' + error.class + ' ' + error.data + ' ' + error.error + ' ' + error.location + '\n';
        if (error.stack) {
            errorString = errorString + 'Call Stack:\n';
            for (var i = error.stack.length - 1; i >= 0; --i) {
                var s = error.stack[i];
                errorString = errorString + '' + i + ':' + s.error + ', place:' + s.place + ',mcode:' + s.mcode + '\n';
            }
        }
        if (error.inner) {
            errorString = errorString + captureInner(error.inner);
        }
        return errorString;
    }

    function showError(data) {
        containerCtrl.showError = true;
        containerCtrl.isBusy = false;
        toggleSpinner(false);
        var errorMessage = '';
        if (data.exception) {
            var exc = data.exception;
            if (exc.config) {
                if (exc.status) {
                    errorMessage = errorMessage + 'Command:' + exc.status + ' ' + exc.statusText + ' ' + exc.config.url + '\n';
                    if (exc.status === 500) {
                        if (exc.data && exc.data.class) {
                            var error = exc.data; // cache error
                            errorMessage = errorMessage + captureInner(error);
                        }
                    }
                }
            }
        }
        // else if (data.data){
        //     errorMessage = angular.toJson(data.data);
        // } else {
        //     errorMessage = angular.toJson(data);
        // }
        if (!errorMessage && (data.exception && (typeof data.exception === 'string'))) {
            errorMessage = data.exception;
        }
        var stackTrace = data && data.exception ? data.exception.stack : '';
        if(stackTrace || errorMessage) {
            var modalInstance = $uibModal.open({
                templateUrl: '/epm/sep/modules/home/templates/error-dialog.html',
                controller: 'ErrorDialogController',
                controllerAs:'errorDialogCtrl',
                resolve: {
                    params: function() {
                        return { errorMessage: errorMessage, stackTrace: stackTrace };
                    }
                }
            });
            modalInstance.result.then(function() {
                containerCtrl.showError = false;
            }, function() {
                containerCtrl.showError = false;
            });
        }
        containerCtrl.showError = false;
    }

    $rootScope.$on('$stateChangeStart', function(event, toState,  /*jshint unused:false*/ toParams,  /*jshint unused:false*/ fromState,  /*jshint unused:false*/ fromParams) {
        $log.debug('Route Changed from ', fromState.url,  '->',  toState.url);
        if(toState.url.indexOf('/footer/') === -1 && toState.url.indexOf('training-checklist') === -1) {
            toggleSpinner(true); 
        }
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState,  /*jshint unused:false*/ toParams,  /*jshint unused:false*/ fromState,  /*jshint unused:false*/ fromParams){
        containerCtrl.breadcrumbs=toState.breadcrumbs;
        commonService.$window.document.title = 'SEP: ' + toState.title;
        
    });

    $rootScope.$on(events.showErrorDialog, function (event, data) {
        showError(data);
    });

	$rootScope.$on(events.spinnerToggle, function (event, data) {
        toggleSpinner(data.show);
    });

    $rootScope.$on(events.activateController, function (event, data) {
            $log.debug(data.controllerId + ' Controller Activated');
            toggleSpinner(false);
        }
    );

    $rootScope.$on(events.activateParentController, function (event, data) {
            $log.debug(data.controllerId + 'Parent Controller Activated');
            toggleSpinner(false);
        }
    );

    $rootScope.$on(events.activateControllerFailed, function(event, data) {
            toggleSpinner(false);
            showError(data);
            $log.debug(data.controllerId + 'Controller Activation Failed');
        }
    );
}

containerController.$inject = ['$scope', 'UserService', '$rootScope', 'config', '$uibModal', 'commonService', 'UserDetails'];

module.exports = {
    templateUrl: '/epm/sep/modules/home/templates/container.html',
    controllerAs: 'containerCtrl',
    controller: containerController,
    bindings: {
        breadcrumb: '<'
    }
};
},{"angular":undefined}],21:[function(require,module,exports){
'use strict';

var moment  = require('moment');

function dashboardControllerFn(commonService, DataService, UserDetails, UserService, AppConstants, $scope, $sce) {
    var $log = commonService.$log.getInstance('DashboardController');
    /* jshint validthis:true */
    var dCtrl = this;
    /* This is for holding previous charts and delete them, when new chart is generated*/
    var technicianChart;
    var supplierChart;
    dCtrl.region=UserDetails.userDetails.region;
    dCtrl.showAnnouncement = 0;
    dCtrl.sepAnnouncements = [
    $sce.trustAsHtml('The SEP Portal is optimized for Internet Explorer 7 or better.  Please upgrade your browser.'),
    $sce.trustAsHtml('FLX002: Flexi Commissioning & Integration (Level 2) Training is now available.  Please review the course outline and the Licensing Progression Chart.'),
    $sce.trustAsHtml('FLX003: Flexi Integration & Basic Troubleshooting (Level 3) Training is now available.  Please review the course outline and check the calendar for upcoming classes soon.'),
    $sce.trustAsHtml('For SEP Support, please contact the following email address sep.support@nokia.com'),
    $sce.trustAsHtml('The Service Supplier Licensing Process  has been updated to version 1.5.'),
    $sce.trustAsHtml('Reminder that all technician badges expire after one year.   An automated email reminder will be sent to the POC one month prior to badge expiration.'),
    $sce.trustAsHtml('Training requests should be made 10 days prior to start of training.'),
    $sce.trustAsHtml('Please review the Absence and Cancellation Policy on the  Training Registration Form prior to submitting.'),
    $sce.trustAsHtml('Training Registration Forms sent as Word documents will no longer be accepted.  Please use the online registration form to request training.'),
    $sce.trustAsHtml('<span style=\"color:#FF0000\"><b>Please note that your website session will automatically expire after 20 minutes of inactivity.</b></span>')];

    /**
     * [description]
     * @param  {[type]} )    {  dCtrl.showAnnouncement [This contains all announcements]
     * @param  {[type]} 6000 [Time interval to display the current announcement]
     */
     commonService.$interval(function() {
        dCtrl.showAnnouncement = ++dCtrl.showAnnouncement % dCtrl.sepAnnouncements.length;
    }, 6000);

    /**
     * [This is used to set the user details based on user who is logged in]
     */
     
     function processUserDetails() {
        dCtrl.userDetails = UserDetails.userDetails;
        if(UserDetails.userDetails.userPhoto) {
            dCtrl.userPhotoSrc = 'data:image/jpg;base64,'+dCtrl.userDetails.userPhoto;
        }else {
            dCtrl.userPhotoSrc = '/epm/sep/assets/images/default-profile.png';
        }
        dCtrl.fullName = UserDetails.userDetails.firstName+' '+UserDetails.userDetails.lastName;
        dCtrl.keyUser = UserDetails.keyUser;
        dCtrl.supplier = UserDetails.supplierId;
        if(!dCtrl.supplier || dCtrl.supplier === 'ZZZZ'){
            dCtrl.supplier='Not Applicable';
        }
        dCtrl.region = UserDetails.userDetails.region;
    }
    /**
     * [Draws the technician chart]
     * @param  {[type]} data [technician data]
     */
     function drawTechniciansChart(data) {
        if(technicianChart){
            technicianChart.destroy();
        }
        var options = {
            titleText:'Number of Technicians per Country',
            xLabel:'Country',
            yLabel:'Number of Technicians'
        };
        technicianChart=commonService.drawBarChart(data, options, 'Total Series 1', 'technicianChart');
    }
    /**
     * [Draws the supplier chart]
     * @param  {[type]} data [supplier data]
     */
     function drawSuppliersChart(data) {
        if(supplierChart){
            supplierChart.destroy();
        }
        var options = {
            titleText:'Number of Suppliers per Country',
            xLabel:'Country',
            yLabel:'Number of Suppliers'
        };
        supplierChart=commonService.drawBarChart(data, options, 'Total Series 1', 'supplierChart');
    }

    /**
     * [This is used to disable regions based on role who is logged in]
     * @param  {[type]} roleId [unique id used to identify the user]
     */
     function checkConstraints(roleId){
        dCtrl.disable={
            region:false,
            subRegion:false,
            country:false
        };


        if(roleId==='3'){
            dCtrl.disable.region=true;
        }
        else if(roleId==='8'){
            dCtrl.disable.region=true;
            dCtrl.disable.subRegion=true;
            dCtrl.subRegion=UserDetails.userDetails.subRegion;
        }
        else if(roleId==='4' || roleId==='5' || roleId==='6' || roleId==='7' || roleId==='9'){
            dCtrl.disable.region=true;
            dCtrl.disable.subRegion=true;
            dCtrl.disable.country=true;
            dCtrl.subRegion=UserDetails.userDetails.subRegion;
            dCtrl.country=UserDetails.userDetails.country;
        }

    }
    /**
     * [Used to draw the clock]
     * @param  {[type]} timezone  [Used to identify the country]
     * @param  {[type]} elementId [Element on which the clock needs to be drawn]
     * @param  {[type]} radius    [Radius of the clock]
     * @param  {[type]} interval  [Interval of the clock]
     */
     function drawClock(timezone, elementId, radius, interval) {
        var originalRadius = radius;
        interval = interval || 1000;
        var runningClock = setInterval(function() {
            var date = new Date(new Date().valueOf() + (timezone * 1000 * 60 * 60));
             // $log.debug('New date -',new Date());
             //  $log.debug('value in milliseconds -',new Date().valueOf() + (timezone * 1000 * 60 * 60));
             //  $log.debug('modified date -',date);
            var canvas = document.getElementById(elementId);

            //stop clock if canvas id not found
            if(!canvas) {
                clearInterval(runningClock);
                return;
            }
            var ctx = canvas.getContext('2d');
            var angle;
            var secHandLength = radius || 60;
            ctx.clearRect(0, 0, canvas.width, canvas.height);        

            function getWeekDay(day) {
                var days = ['Sun - ', 'Mon - ', 'Tue - ', 'Wed - ', 'Thu - ', 'Fri - ', 'Sat - ', 'Sun - '];
                return days[day];
            }

            setTimeout(function () {
                if(commonService.$window.innerWidth<= 1024) {
                    radius = 30;
                }else {
                    radius = originalRadius;
                }
                var getHours = (date.getUTCHours()/10 < 1)? '0'+date.getUTCHours() : date.getUTCHours();
                var getMinutes = (date.getUTCMinutes()/10 < 1)? '0'+date.getUTCMinutes() : date.getUTCMinutes();

                var formattedDate = getWeekDay(date.getDay()) + getHours + ':' + getMinutes;// + ':' + date.getUTCSeconds();
                // $log.debug('',date);
                $scope.$apply(function () {
                   switch(elementId) {
                    case 't1':
                    dCtrl.date1 = formattedDate;//new Date(date.year(), date.month(), date.day(), date.hour(), date.minute(), date.second());
                    break;
                    case 't2':
                    dCtrl.date2 = formattedDate; //new Date(date.year(), date.month(), date.day(), date.hours(), date.minutes(), date.seconds());
                    break;
                    case 't3':
                    dCtrl.date3 = formattedDate; //new Date(date.year(), date.month(), date.day(), date.hours(), date.minutes(), date.seconds());
                    break;
                    case 't4':
                    dCtrl.date4 = formattedDate; //new Date(date.year(), date.month(), date.day(), date.hours(), date.minutes(), date.seconds());
                    break;
                    case 't5':
                    dCtrl.date5 = formattedDate; //new Date(date.year(), date.month(), date.day(), date.hours(), date.minutes(), date.seconds());
                    break;
                }
            });
            }, 0);

            /* jshint unused:false */
            function OUTER_DIAL1() {
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, secHandLength + 10, 0, Math.PI * 2);
                ctx.strokeStyle = '#92949C';
                ctx.stroke();
            }

            function OUTER_DIAL2() {
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, secHandLength + 1, 0, Math.PI * 2);
                ctx.strokeStyle = '#929BAC';
                ctx.stroke();
            }

            function CENTER_DIAL() {
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
                ctx.lineWidth = 3;
                ctx.fillStyle = '#353535';
                ctx.strokeStyle = '#0C3D4A';
                ctx.stroke();
            }

            function MARK_THE_HOURS() {

                for (var i = 0; i < 12; i++) {
                    angle = (i - 3) * (Math.PI * 2) / 12;       // THE ANGLE TO MARK.
                    ctx.lineWidth = 2;            // HAND WIDTH.
                    ctx.beginPath();

                    var x1 = (canvas.width / 2) + Math.cos(angle) * (secHandLength);
                    var y1 = (canvas.height / 2) + Math.sin(angle) * (secHandLength);
                    var x2 = (canvas.width / 2) + Math.cos(angle) * (secHandLength - (secHandLength / 7));
                    var y2 = (canvas.height / 2) + Math.sin(angle) * (secHandLength - (secHandLength / 7));

                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);

                    ctx.strokeStyle = '#466B76';
                    ctx.stroke();
                }
            }

            function MARK_THE_SECONDS() {

                for (var i = 0; i < 60; i++) {
                    angle = (i - 3) * (Math.PI * 2) / 60;       // THE ANGLE TO MARK.
                    ctx.lineWidth = 2;            // HAND WIDTH.
                    ctx.beginPath();

                    var x1 = (canvas.width / 2) + Math.cos(angle) * (secHandLength);
                    var y1 = (canvas.height / 2) + Math.sin(angle) * (secHandLength);
                    var x2 = (canvas.width / 2) + Math.cos(angle) * (secHandLength - (secHandLength / 30));
                    var y2 = (canvas.height / 2) + Math.sin(angle) * (secHandLength - (secHandLength / 30));

                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);

                    ctx.strokeStyle = '#CCC';
                    ctx.stroke();
                }
            }

            function SHOW_SECONDS() {

                var sec = date.getUTCSeconds();
                angle = ((Math.PI * 2) * (sec / 60)) - ((Math.PI * 2) / 4);
                ctx.lineWidth = 0.5;              // HAND WIDTH.

                ctx.beginPath();
                // START FROM CENTER OF THE CLOCK.
                ctx.moveTo(canvas.width / 2, canvas.height / 2);   
                // DRAW THE LENGTH.
                ctx.lineTo((canvas.width / 2 + Math.cos(angle) * secHandLength),
                    canvas.height / 2 + Math.sin(angle) * secHandLength);

                // DRAW THE TAIL OF THE SECONDS HAND.
                ctx.moveTo(canvas.width / 2, canvas.height / 2);    // START FROM CENTER.
                // DRAW THE LENGTH.
                ctx.lineTo((canvas.width / 2 - Math.cos(angle) * 20),
                    canvas.height / 2 - Math.sin(angle) * 20);

                ctx.strokeStyle = '#586A73';        // COLOR OF THE HAND.
                ctx.stroke();
            }

            function SHOW_MINUTES() {

                var min = date.getUTCMinutes();
                angle = ((Math.PI * 2) * (min / 60)) - ((Math.PI * 2) / 4);
                ctx.lineWidth = 1.5;              // HAND WIDTH.

                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2);  // START FROM CENTER.
                // DRAW THE LENGTH.
                ctx.lineTo((canvas.width / 2 + Math.cos(angle) * secHandLength / 1.1),      
                    canvas.height / 2 + Math.sin(angle) * secHandLength / 1.1);

                ctx.strokeStyle = '#999';  // COLOR OF THE HAND.
                ctx.stroke();
            }

            function SHOW_HOURS() {

                var hour = date.getUTCHours();
                var min = date.getUTCMinutes();
                angle = ((Math.PI * 2) * ((hour * 5 + (min / 60) * 5) / 60)) - ((Math.PI * 2) / 4);
                ctx.lineWidth = 1.5;              // HAND WIDTH.

                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2);     // START FROM CENTER.
                // DRAW THE LENGTH.
                ctx.lineTo((canvas.width / 2 + Math.cos(angle) * secHandLength / 1.5),      
                    canvas.height / 2 + Math.sin(angle) * secHandLength / 1.5);

                ctx.strokeStyle = '#000';   // COLOR OF THE HAND.
                ctx.stroke();
            }

            //OUTER_DIAL1();
            OUTER_DIAL2();
            CENTER_DIAL();
            MARK_THE_HOURS();
            MARK_THE_SECONDS();

            SHOW_SECONDS();
            SHOW_MINUTES();
            SHOW_HOURS();
            
        }, interval);
}
/**
 * [Used to draw technician and supplier charts]
 * @param  {[type]} region    [Region of the user]
 * @param  {[type]} subRegion [Sub Region of the user]
 * @param  {[type]} country   [Country of the user]
 */
 function getChartDetails(region,subRegion,country){

    UserService.techniciansPerCountry(region,subRegion,country).then(function(result){
        drawTechniciansChart(result.data);
        $log.debug('technicians data success');
    },function(error){
       $log.debug('technicians data error',error);
   });

    UserService.suppliersPerCountry(region,subRegion,country).then(function(result){
        drawSuppliersChart(result.data);
        $log.debug('suppliers data success');
    },function(error){
       $log.debug('suppliers data error',error);
   });

}
/**
 * [drawClocks used to draw the clocks]
 * @param  {[type]} radius [clock radius]
 */

 function drawClocks(radius) {
    drawClock('-5', 't1', radius);
    drawClock('2', 't2', radius);
    drawClock('1', 't3', radius);
    drawClock('8', 't4', radius);
    drawClock('5.5', 't5', radius);
}



commonService.activateController([
    UserService.quickLinks(),
    UserService.techniciansPerCountry(),
    UserService.suppliersPerCountry(),
    DataService.getRegionDetails(),
    DataService.getRoles()
    ], 'DashboardController')
.then(function(results){
    dCtrl.quickLinks=results[0].data;
    drawTechniciansChart(results[1].data);
    drawSuppliersChart(results[2].data);
    dCtrl.regionDetails=results[3];
    dCtrl.roleDetails=results[4];

},function(error){
    $log.debug(error);
});

/**
 * [Used to drwa the chart when the user changes the region]
 */
 dCtrl.getChartRegion = function(){
    getChartDetails(dCtrl.region);
};
/**
 * [Used to draw chart when the user changes the subregion]
 */
 dCtrl.getChartSubRegion = function(){
    if(dCtrl.region){
        getChartDetails(dCtrl.region,dCtrl.subRegion);
    }
};
/**
 * [Used to draw chart when the user changes the country]
 */
 dCtrl.getChartCountry = function(){
    if(dCtrl.subRegion){
        getChartDetails(dCtrl.region,dCtrl.subRegion,dCtrl.country);
    }
};


commonService.$window.onresize = function(event) {
        // if(commonService.$window.innerWidth<= 1024) {
        //     drawClocks(30);
        // }
    };

    
    drawClocks(40);
    processUserDetails();
    checkConstraints(UserDetails.userDetails.roleId);
    
}
dashboardControllerFn.$inject = ['commonService', 'DataService', 'UserDetails', 'UserService', 'AppConstants', '$scope','$sce'];

module.exports = {
	templateUrl: '/epm/sep/modules/home/templates/dashboard.html',
    controllerAs:'dCtrl',
    controller: dashboardControllerFn
};

},{"moment":undefined}],22:[function(require,module,exports){
'use strict';

function errorDialogController($uibModalInstance, params) {
    
    /*jshint validthis:true */
    var self = this;
    
    self.text = params.errorMessage;
    
    if (params.stackTrace) {
        self.text = self.text + '\n' + params.stackTrace;
    }
    
    self.errorMessage = params.errorMessage;
    self.stackTrace = params.stackTrace;
    
    self.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

errorDialogController.$inject = ['$uibModalInstance', 'params'];

module.exports = errorDialogController;
},{}],23:[function(require,module,exports){
'use strict';

function fileUpload($parse) {

	return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          
          element.bind('change', function(){
            // scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             //});
          });
       }
    };

}

fileUpload.$inject = ['$parse'];

module.exports = fileUpload;
},{}],24:[function(require,module,exports){
'use strict';

function formsFilesControllerFn(commonService, UserDetails) {
	commonService.activateController([], 'formsFilesController');
	/* jshint validthis:true */
	var ffCtrl = this;

	ffCtrl.approveTraining = true;
	ffCtrl.approvePtid = true;
	ffCtrl.massUpload = true;
	ffCtrl.uploadTraining = true;

	var roleId = UserDetails.userDetails.roleId;
	if (roleId === 5 || roleId === 6 || roleId === 7)
	{
		ffCtrl.approveTraining = false;
		ffCtrl.approvePtid = false;
		ffCtrl.massUpload = false;
		ffCtrl.uploadTraining = false;
	}
	
}

formsFilesControllerFn.$inject = ['commonService','UserDetails'];

module.exports = {
	templateUrl: '/epm/sep/modules/home/templates/forms-files.html',
	controllerAs:'ffCtrl',
	controller: formsFilesControllerFn
};




},{}],25:[function(require,module,exports){
'use strict';

function glossaryControllerFn(commonService) {
   
    commonService.activateController([], 'glossaryController');
}

glossaryControllerFn.$inject = ['commonService'];

module.exports = {
    templateUrl: '/epm/sep/modules/home/templates/glossary.html',
    controllerAs:'glossaryCtrl',
    controller: glossaryControllerFn
};




},{}],26:[function(require,module,exports){
'use strict';

var angular = require('angular');

var home = angular.module('home', []);

home
	.component('navbar', require('./navbar.component'))
	.component('appContainer', require('./container.component'))
	.component('dashboard', require('./dashboard.component'))
	.component('myProfile', require('./my-profile.component'))
	.component('passwordManagement', require('./password-mgnt.component'))
	.component('formsFiles', require('./forms-files.component'))
	.component('glossary', require('./glossary.component'))
	.component('serviceTypesProducts', require('./service-types.component'))
	.component('qualificationLevels', require('./qualification-levels.component'))
	.component('qualificationProcess', require('./qualification-process.component'))
	.component('overview', require('./overview.component'))
	.component('contactUs', require('./contact-us.component'))

//controllers
	.controller('ErrorDialogController', require('./error-dialog.controller'))

//services
	.service('UserService', require('./user.service'))

//directives
	.directive('navbartree', require('./navbartree.directive'))
	.directive('navbarleaf', require('./navbarleaf.directive'))
	.directive('fileModel', require('./file-model.directive'));
	
module.exports = home;
},{"./contact-us.component":19,"./container.component":20,"./dashboard.component":21,"./error-dialog.controller":22,"./file-model.directive":23,"./forms-files.component":24,"./glossary.component":25,"./my-profile.component":27,"./navbar.component":28,"./navbarleaf.directive":29,"./navbartree.directive":30,"./overview.component":31,"./password-mgnt.component":32,"./qualification-levels.component":33,"./qualification-process.component":34,"./service-types.component":35,"./user.service":36,"angular":undefined}],27:[function(require,module,exports){
'use strict';
var $ = require('jquery');

function myProfileControllerFn(commonService, UserDetails, UserService, $state) {
	var $log = commonService.$log.getInstance('MyProfileController');
	
	/* jshint validthis:true */
	var mpCtrl = this;
	mpCtrl.user = UserDetails.userDetails;
	$log.debug('userdetails',mpCtrl.user);
	mpCtrl.alerts=[];

	if(!mpCtrl.user.supplierId || mpCtrl.user.supplierId === 'ZZZZ'){
		mpCtrl.user.supplierId='Not Applicable';
	}
	if(!mpCtrl.user.company || mpCtrl.user.company==='null') {
		mpCtrl.user.company='Not Applicable';
	}

	if(mpCtrl.user.userPhoto){
		mpCtrl.isPhoto=true;
	}


	/**
	 * Display Alerts
	 * @param  {[type]} alertType    [description]
	 * @param  {[type]} alertMessage [description]
	 * @return {[type]}              [description]
	 */
	 function showAlert(alertType, alertMessage) {
	 	for(var i=0;i<mpCtrl.alerts.length;i++){
	 		mpCtrl.alerts[i].show=false;
	 	}
	 	mpCtrl.alerts.push({type:alertType,message:alertMessage,show:true});
	 }

	 mpCtrl.closeAlert = function(index) {
	 	mpCtrl.alerts.splice(index,1);
	 };

	 String.prototype.endsWith = function(suffix) {
	 	return this.indexOf(suffix, this.length - suffix.length) !== -1;
	 };

	 function clearFileUpload(){
	 	/* -------------- clear photo ---------- */
	 	$('#profilePhoto').val('').clone(true);
	 }

	 mpCtrl.removePhoto=function(){

	 };


	/**
	 * Submit Form
	 * @param  {[type]} form [description]
	 * @return {[type]}      [description]
	 */
	 mpCtrl.submitProfile = function(form) {
	 	var toString = Object.prototype.toString;
	 	if(toString.call(mpCtrl.user.userPhoto) === '[object String]'){
	 		delete mpCtrl.user.userPhoto;
	 	}

	 	var fileErrorMsg = '', fileErrorFlag=0;
	 	if(mpCtrl.user.userPhoto && !mpCtrl.user.userPhoto.type.endsWith('jpg') && !mpCtrl.user.userPhoto.type.endsWith('jpeg')) {
	 		fileErrorMsg = fileErrorMsg + 'Only .jpg or .jpeg file formats are allowed.';
	 		fileErrorFlag = 1;
	 	} 

	 	if(mpCtrl.user.userPhoto && mpCtrl.user.userPhoto.size > 1024*512){
	 		fileErrorMsg = fileErrorMsg + 'File size must not exceed 512 KB. ';
	 		fileErrorFlag = 1;
	 	}

	 	if(form.$valid){
	 		if(fileErrorFlag === 0){
	 			if(mpCtrl.user.supplierId === 'Not Applicable'){
	 				mpCtrl.user.supplierId='ZZZZ';
	 			}
	 			UserService.updateProfile(mpCtrl.user).then(function(data){
	 				UserDetails.userDetails = data.data;
	 				showAlert('success','Success! Profile has been updated.');
	 				clearFileUpload();
	 				$log.debug('user',mpCtrl.user);
	 			}, function(error){
	 				showAlert('danger','Failed! Profile could not be updated.');
	 				clearFileUpload();
	 			});
	 		}
	 		else {
	 			showAlert('danger','Error! '+fileErrorMsg);
	 		}
	 	}
	 	else{
	 		var errormsg='';
	 		if(form.$error.required){
	 			errormsg+='All mandatory(*) fields are required. ';
	 			for(var i=0;i<form.$error.required.length;i++){
	 				form.$error.required[i].$setDirty();
	 			}
	 		}
	 		if(form.$error.email){
	 			errormsg+='Invalid Email Format. ';
	 		}
	 		showAlert('danger','Error! '+errormsg+fileErrorMsg);
	 	}
	 };

	 commonService.activateController([], 'MyProfileController');

	}

	myProfileControllerFn.$inject = ['commonService','UserDetails', 'UserService', '$state'];

/**
 * Export MyProfileController 
 * @type {Object}
 */
 module.exports = {
 	templateUrl: '/epm/sep/modules/home/templates/my-profile.html',
 	controllerAs:'mpCtrl',
 	controller: myProfileControllerFn
 };

},{"jquery":undefined}],28:[function(require,module,exports){
'use strict';
var angular = require('angular');
require('./container.component');

function navbarCtrl($scope, UserDetails, $q, commonService) {

	/* jshint validthis:true */
	var navbarCtrl = this;

	function activate() {
		function insertChildNav(navs, childNav) {
			for(var i=0; i<navs.length; i++) {
				if(navs[i].navId === childNav.parentId){
					navs[i].navItems.push(childNav);
					break;
				} else{
					insertChildNav(navs[i].navItems, childNav);
				}
			}
		}
		
		navbarCtrl.navs = angular.copy(UserDetails.navs) || [];    
		    
		for(var i=0;i<navbarCtrl.navs.length;i++) {
			if(navbarCtrl.navs[i].parentId) {
				var childNav = navbarCtrl.navs[i];
				navbarCtrl.navs.splice(i,1);
				insertChildNav(navbarCtrl.navs, childNav);
				i--;
			}
		}		
		navbarCtrl.email=UserDetails.userDetails.username+'('+UserDetails.userDetails.roleDescription+'-'+UserDetails.userDetails.country+')';
		navbarCtrl.lastLogonDate=UserDetails.userDetails.lastLogonDate;
	}
	activate();
	
}

navbarCtrl.$inject = ['$scope','UserDetails','$q','commonService'];

var component = {
	require: { parent: '^appContainer' },
	templateUrl: '/epm/sep/modules/home/templates/navbar.html',
	controllerAs: 'navbarCtrl',
	controller: navbarCtrl,
	bindings: {
		breadcrumb: '='
	}
};

module.exports = component;
},{"./container.component":20,"angular":undefined}],29:[function(require,module,exports){
'use strict';

function navbarleaf($compile) {

  function link(scope, element) {
    if (scope.navbarleaf.navItems.length>0) {
      element.append('<navbartree navbartree="navbarleaf.navItems"></navbartree>');
      element.addClass('dropdown-submenu');
      $compile(element.contents())(scope);
    }
  }

  var directive = {
    restrict: 'E',
    replace: true,
    scope: {
      navbarleaf: '='
    },
    link: link,
    templateUrl: '/epm/sep/modules/home/templates/navbar-li.html'
  };

  return directive;

}

navbarleaf.$inject = ['$compile'];

module.exports = navbarleaf;
},{}],30:[function(require,module,exports){
'use strict';

function navbartree() {

	var directive = {

		restrict: 'E',
		replace: true,
		scope: {
			navbartree: '='
		},
		templateUrl: '/epm/sep/modules/home/templates/navbar-ul.html'

	};

	return directive;
}


module.exports = navbartree;
},{}],31:[function(require,module,exports){
'use strict';



module.exports = {
	templateUrl: '/epm/sep/modules/home/templates/overview.html',
};

},{}],32:[function(require,module,exports){
'use strict';

function passwordManagementControllerFn(commonService) {
    commonService.activateController([], 'PasswordManagementController');
}

passwordManagementControllerFn.$inject = ['commonService'];

module.exports = {
    templateUrl: '/epm/sep/modules/home/templates/password-mgnt.html',
    controllerAs:'pmCtrl',
    controller: passwordManagementControllerFn
};


},{}],33:[function(require,module,exports){
'use strict';

module.exports = {
	templateUrl: '/epm/sep/modules/home/templates/qualification-levels.html'
};

},{}],34:[function(require,module,exports){
'use strict';

function qualificationProcessControllerFn(commonService, UserDetails){
	commonService.activateController([], 'QualificationProcessController');
	/* jshint validthis:true */
	var qpCtrl = this;

	var roleId = UserDetails.userDetails.roleId;
	var region = UserDetails.userDetails.region.toUpperCase();

	if (roleId === '2')
	{
		qpCtrl.apac=true;
		qpCtrl.china=true;
		qpCtrl.nam=true;
	}
	else if (region === 'APAC')
	{
		qpCtrl.apac=true;
	}
	else if (region === 'CHINA')
	{
		qpCtrl.china=true;
	}
	else if (region === 'NAM')
	{
		qpCtrl.nam=true;
	}
	else{
		qpCtrl.apac=false;
		qpCtrl.china=false;
		qpCtrl.nam=false;
	}
}

qualificationProcessControllerFn.$inject = ['commonService','UserDetails'];
module.exports = {
	templateUrl: '/epm/sep/modules/home/templates/qualification-process.html',
	controllerAs:'qpCtrl',
	controller: qualificationProcessControllerFn
};


},{}],35:[function(require,module,exports){
'use strict';

function serviceTypesProductsControllerFn(commonService) {
    commonService.activateController([], 'serviceTypesProductsController');
}
serviceTypesProductsControllerFn.$inject = ['commonService'];

module.exports = {
     templateUrl: '/epm/sep/modules/home/templates/service-types.html',
    controllerAs:'serviceTypesProductsCtrl',
    controller: serviceTypesProductsControllerFn
};




},{}],36:[function(require,module,exports){
'use strict';

function UserService(commonService, dataCache, UserDetails) {
	var $log = commonService.$log.getInstance('UserService');

	var baseUrl = commonService.baseUrl;
	var $http = commonService.$http;
	var $q = commonService.$q;

	/**
	 * Returns Sep User Information
	 * @return {[User]}
	 */
	 function getUser() {
	 	var deferred = $q.defer();
	 	$http.get(baseUrl+'/').then(function(data) {
	 		deferred.resolve(data);
	 	}, function(error){
	 		deferred.reject(error);
	 	});
	 	return deferred.promise;
	 }

	 function updateProfile(userObj) {
	 	var deferred = $q.defer();
	 	$http(commonService.constructFileRequest('/updateProfile', userObj)).then(function(data) {
	 		deferred.resolve(data);
	 	}, function(error) {
	 		deferred.reject(error);
	 	});
	 	return deferred.promise;
	 }

	 function quickLinks() {
	 	var deferred = $q.defer();
	 	if(dataCache.get('quickLinks')) {
	 		deferred.resolve(dataCache.get('quickLinks'));
	 	}else {
	 		$http.get(baseUrl+'/quickLinks').then(function(data) {
	 			dataCache.put('quickLinks', data);
	 			deferred.resolve(data);
	 		}, function(error){
	 			deferred.reject(error);
	 		});
	 	}
	 	return deferred.promise;
	 }

	 function techniciansPerCountry(region, subRegion, country) {
	 	var deferred = $q.defer();
	 	if(!region && !subRegion && !country) {
	 		region = UserDetails.userDetails.region;
	 		if(UserDetails.userDetails.roleId === '8') {
	 			subRegion = UserDetails.userDetails.subRegion;
	 		}
	 		else if(UserDetails.userDetails.roleId === '4' || UserDetails.userDetails.roleId === '5' || UserDetails.userDetails.roleId === '6' || UserDetails.userDetails.roleId === '7' || UserDetails.userDetails.roleId === '9') {
	 			subRegion = UserDetails.userDetails.subRegion;
	 			country = UserDetails.userDetails.country;
	 		}
	 	}
	 	$http.get(baseUrl+'/techniciansPerCountry', {
	 		params: {
	 			region:region,
	 			subRegion:subRegion,
	 			country:country
	 		}
	 	}).then(function(data) {
	 		deferred.resolve(data);
	 	}, function(error){
	 		deferred.reject(error);
	 	});
	 	return deferred.promise;
	 }

	 function suppliersPerCountry(region, subRegion, country) {
	 	var deferred = $q.defer();
	 	if(!region && !subRegion && !country) {
	 		region = UserDetails.userDetails.region;
	 		if(UserDetails.userDetails.roleId === '8') {
	 			subRegion = UserDetails.userDetails.subRegion;
	 		}
	 		else if(UserDetails.userDetails.roleId === '4' || UserDetails.userDetails.roleId === '5' || UserDetails.userDetails.roleId === '6' || UserDetails.userDetails.roleId === '7' || UserDetails.userDetails.roleId === '9') {
	 			subRegion = UserDetails.userDetails.subRegion;
	 			country = UserDetails.userDetails.country;
	 		}
	 	}
	 	$http.get(baseUrl+'/suppliersPerCountry', {
	 		params: {
	 			region:region,
	 			subRegion:subRegion,
	 			country:country
	 		}
	 	}).then(function(data) {
	 		deferred.resolve(data);
	 	}, function(error){
	 		deferred.reject(error);
	 	});
	 	return deferred.promise;
	 }

	 return {
	 	getUser: getUser,
	 	updateProfile: updateProfile,
	 	quickLinks: quickLinks,
	 	techniciansPerCountry: techniciansPerCountry,
	 	suppliersPerCountry: suppliersPerCountry
	 };
	}

	UserService.$inject = ['commonService', 'dataCache', 'UserDetails'];

	module.exports = UserService;
},{}]},{},[4])
//# sourceMappingURL=bundle.js14.map
