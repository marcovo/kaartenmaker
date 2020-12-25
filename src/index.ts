import UserInterface from "./Main/UserInterface";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import Vue from 'vue/dist/vue.esm.js';
require('./components/CutoutSettingsModal.vue');
require('./components/Bookmarks.vue');

(() => {
    window.addEventListener('error', function(event) {
        if(event.error && event.error.isUserError) {
            alert(event.error.message);
            event.preventDefault();
        }
    });

    window.addEventListener('unhandledrejection', function (event) {
        if(event.reason.isUserError) {
            alert(event.reason.message);
            event.preventDefault();
        }
    })

    Vue.config.errorHandler = function(error, vm, info) {
        if(error.isUserError) {
            alert(error.message);
        } else {
            throw error;
        }
    }
})();

// Boot the system
import './Main/Boot';

// Build the user interface
const userInterface = new UserInterface();

require('./sandbox');
