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