/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Setup from './SetUp';
import {name as appName} from './app.json';
console.ignoredYellowBox = ['Remote debugger'];

AppRegistry.registerComponent(appName, () => Setup);
console.disableYellowBox = true;
