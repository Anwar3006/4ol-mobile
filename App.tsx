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

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
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
