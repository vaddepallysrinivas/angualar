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