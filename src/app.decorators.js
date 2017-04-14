'use strict';

var angular = require('angular');

function decorators($provide) {
    $provide.decorator('$exceptionHandler', ['$injector', '$delegate', function($injector, $delegate) {
        return function(exception, cause) {
            $delegate(exception, cause);
            var errorData = {exception: exception, cause: cause};
            var common = $injector.get('commonService');
            common.broadcastErrorDialogEvent(errorData);
        };
    }]);
    $provide.decorator('$q', ['$delegate', function($delegate) {
        function seqAll(promises) {
            var deferred = $delegate.defer();
            var results = [];
            var j = 0;
            function recursive(promise) {
                j++;
                promise.then(function(data){
                    results.push(data);
                    if (j < promises.length) {
                        recursive(promises[j]);
                    } else {
                        deferred.resolve(results);
                    }
                }, function(error) {
                    //todo: Error data need to be made generic
                    deferred.reject('promises[' + (j - 1) + ']' + ' rejected with status: ' + error.status);
                    return;
                });
            }
            recursive(promises[j]);
            return deferred.promise;
        }
        $delegate.seqAll = seqAll;
        return $delegate;
    }]);
    
    $provide.decorator('$log', ['$delegate', function($delegate){
        
        var enhanceLogger = function ($log) {
            var _$log = (function ($log) {
                return {
                    log: $log.log,
                    info: $log.info,
                    warn: $log.warn,
                    debug: $log.debug,
                    error: $log.error
                };
            })($log);

            var prepareLogFn = function (logFn, className) {
                className = className || 'Logger: ';
                var enhancedLogFn = function () {
                    try {
                        var args = Array.prototype.slice.call(arguments);   
                        args[0] = [className, args[0]].join('');
                        logFn.apply(null, args);
                    }
                    catch(error) {
                        $log.error('LogEnhancer ERROR: ' + error);
                    }

                };
                enhancedLogFn.logs = [];
                return enhancedLogFn;
            };

            var getInstance = function (className) {
                className = (className !== undefined) ? className + ': ' : 'Logger: ';
                var instance = {
                    log: prepareLogFn(_$log.log, className),
                    info: prepareLogFn(_$log.info, className),
                    warn: prepareLogFn(_$log.warn, className),
                    debug: prepareLogFn(_$log.debug, className),
                    error: prepareLogFn(_$log.error, className) 
                };

                if(angular.isDefined(angular.makeTryCatch)) {
                    // Attach instance specific tryCatch() functionality...
                    instance.tryCatch = angular.makeTryCatch(instance.error, instance);
                }

                return instance;
            };

            $log.getInstance = getInstance;

            return $log;
        };

        return enhanceLogger($delegate);
    }]);
}

decorators.$inject = ['$provide'];

module.exports = decorators;