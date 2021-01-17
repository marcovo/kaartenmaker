import UserInterface from "./Main/UserInterface";
import * as $ from "jquery";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import Vue from 'vue/dist/vue.esm.js';
require('./components/CutoutSettingsModal.vue');
require('./components/CutoutTemplates.vue');
require('./components/Bookmarks.vue');
require('./components/CoordinatePanel.vue');

(() => {
    const logError = function(error) {
        try {
            const message = <Record<string, any>>{};
            if(typeof error.fileName !== 'undefined') message.fileName = error.fileName;
            if(typeof error.lineNumber !== 'undefined') message.lineNumber = error.lineNumber;
            if(typeof error.columnNumber !== 'undefined') message.columnNumber = error.columnNumber;
            if(typeof error.message !== 'undefined') message.message = error.message;
            if(typeof error.stack !== 'undefined') message.stack = error.stack;

            message.navigator = <Record<string, any>>{};
            for(const key of ['appCodeName', 'appName', 'appVersion', 'cookieEnabled', 'language', 'onLine', 'platform', 'userAgent']) {
                message.navigator[key] = navigator[key];
            }

            message.raw = error;

            Promise.resolve().then(() => {
                if(typeof userInterface === 'undefined') {
                    message.bootError = true;
                    return;
                }

                return userInterface.requestErrorReport(JSON.stringify(message)).then((description) => {
                    message.description = description;
                });
            }).then(() => {
                $.post('server.php?request=js_error', {
                    message: JSON.stringify(message),
                });
            });
        } catch(e) {
            console.log(e);
        }
    }

    window.addEventListener('error', function(event) {
        if(event.error && event.error.isUserError) {
            alert(event.error.message);
            event.preventDefault();
        } else {
            logError(event.error);
        }
    });

    window.addEventListener('unhandledrejection', function (event) {
        if(event.reason.isUserError) {
            alert(event.reason.message);
            event.preventDefault();
        } else {
            logError(event.reason);
        }
    })

    Vue.config.errorHandler = function(error, vm, info) {
        if(error.isUserError) {
            alert(error.message);
        } else {
            logError(error);
            throw error;
        }
    }
})();

// Boot the system
import './Main/Boot';

// Build the user interface
const userInterface = new UserInterface();

require('./sandbox');
