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