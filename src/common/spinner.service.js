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