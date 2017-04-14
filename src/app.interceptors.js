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