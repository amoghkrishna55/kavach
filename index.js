/**
 * @format
 */

import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Polyfill for TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'text-encoding';

global.Buffer = Buffer;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
