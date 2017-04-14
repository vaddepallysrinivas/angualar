'use strict';

var angular = require('angular');

function containerController($scope, $rootScope, config, $uibModal, commonService) {
    
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
        //if(stackTrace || errorMessage) {
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '/src/home/templates/error-dialog.html',
        //        controller: 'ErrorDialogController',
        //        controllerAs:'errorDialogCtrl',
        //        resolve: {
        //            params: function() {
        //                return { errorMessage: errorMessage, stackTrace: stackTrace };
        //            }
        //        }
        //    });
        //    modalInstance.result.then(function() {
        //        containerCtrl.showError = false;
        //    }, function() {
        //        containerCtrl.showError = false;
        //    });
        //}
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
        commonService.$window.document.title = 'LMS: ' + toState.title;
        
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

containerController.$inject = ['$scope', '$rootScope', 'config', '$uibModal', 'commonService',];

module.exports = {
    templateUrl: '/src/home/templates/container.html',
    controllerAs: 'containerCtrl',
    controller: containerController,
    bindings: {
        breadcrumb: '<'
    }
};