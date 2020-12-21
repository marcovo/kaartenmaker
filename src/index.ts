import UserInterface from "./Main/UserInterface";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
require('./components/CutoutSettingsModal.vue');

// Boot the system
import './Main/Boot';

// Build the user interface
const userInterface = new UserInterface();

require('./sandbox');
