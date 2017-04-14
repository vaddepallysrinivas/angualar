'use strict';

var events = {
    showErrorDialog: 'error.dialog',
    spinnerToggle: 'spinner.toggle',
    activateParentController: 'activate.parent.controller',
    activateController: 'activate.controller',
    activateControllerFailed: 'activate.controller.failed'
};

var config = {
    events: events
};

module.exports = config;