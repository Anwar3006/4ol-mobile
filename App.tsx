import 'react-native-url-polyfill/auto';
import React, {useEffect} from 'react';
import {ToastProvider} from 'react-native-toast-notifications';
import {Provider} from 'react-redux';
import {MenuProvider} from 'react-native-popup-menu';
import {store} from './src/store';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Route from './src/navigation';
import {PaperProvider} from 'react-native-paper';
import {
  setupNotificationCategories,
  setupNotificationHandlers,
} from './src/services/notificationActions';
import {checkRedirect} from './src/services/checkRedirect';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://37e214a286dff0e65d5e624ae863189d@o4509994271637504.ingest.de.sentry.io/4509994289791056',

  // ✅ FIXED: Disable PII collection to comply with App Store privacy requirements
  // Sentry will still report crashes and errors, but without tracking user data
  sendDefaultPii: false,

  // ✅ FIXED: Disable Session Replay to prevent tracking user behavior
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  
  // ✅ FIXED: Removed tracking integrations
  integrations: [
    // Session replay removed - was tracking user interactions
    // Feedback integration removed - was collecting user data
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
  useEffect(() => {
    checkRedirect();
    setupNotificationHandlers();
    setupNotificationCategories();
  }, []);
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <PaperProvider>
          <ToastProvider>
            <MenuProvider>
              <Route />
            </MenuProvider>
          </ToastProvider>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
});
