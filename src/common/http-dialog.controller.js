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