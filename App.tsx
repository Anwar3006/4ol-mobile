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

export default function App() {
  useEffect(() => {
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
}
