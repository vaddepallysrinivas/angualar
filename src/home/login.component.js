'use strict';

function loginController(commonService) {
    commonService.activateController([], 'loginController');
}

loginController.$inject = ['commonService'];

module.exports = {
    templateUrl: '/src/home/templates/login.html',
    controllerAs: 'lgnCtrl',
    controller: loginController
};

