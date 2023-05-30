/**
 * @format
 */

import {AppRegistry} from 'react-native';
// import App from './App';
// import Test from './temp';
// import App from './demo.js';
// import A from './a.js'
import Test from './op.js';
import {name as appName} from './app.json';
global.Buffer = require('buffer').Buffer;

// AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(appName, () => Test);