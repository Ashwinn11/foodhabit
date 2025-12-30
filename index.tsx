import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

import App from './App';

// Suppress React Navigation pointerEvents deprecation warning
// This is a library issue and can't be fixed in user code
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated. Use style.pointerEvents',
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
registerRootComponent(App);
