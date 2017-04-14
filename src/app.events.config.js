'use strict';

var config = require('./app.values');

function commonConfig(commonConfigProvider) {
    commonConfigProvider.config.spinnerToggleEvent = config.events.spinnerToggle;
    commonConfigProvider.config.showErrorDialogEvent = config.events.showErrorDialog;
    commonConfigProvider.config.activateParentControllerEvent = config.events.activateParentController;
    commonConfigProvider.config.activateControllerEvent = config.events.activateController;
    commonConfigProvider.config.activateControllerFailedEvent = config.events.activateControllerFailed;
}

commonConfig.$inject = ['commonConfigProvider'];

module.exports = commonConfig;