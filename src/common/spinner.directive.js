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