'use strict';

var angular = require('angular');

function commonService($rootScope, $q, $window, commonConfig, $timeout, $interval, $location, $uibModal, $log, $http, uiGridConstants) {

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
            templateUrl: 'src/common/templates/yes-no-dialog.html',
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
            templateUrl: 'src/common/templates/alert-dialog.html',
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
            templateUrl: 'src/common/templates/http-callback.html',
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
        assetBaseUrl: '/assets/',
        htmlBaseUrl: '/src/',
        yesNoDialog: yesNoDialog,
        alertDialog: alertDialog,
        httpDialog: httpDialog,
        drawBarChart: drawBarChart,
        constructFileRequest: constructFileRequest,
        exportToExcel:exportToExcel,
        uiGridConstants:uiGridConstants
    };

    return service;
}

commonService.$inject = ['$rootScope', '$q', '$window',
'commonConfig', '$timeout', '$interval', 
'$location', '$uibModal', '$log', '$http','uiGridConstants'];

module.exports = commonService;