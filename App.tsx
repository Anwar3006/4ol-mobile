import 'react-native-url-polyfill/auto';
import React from 'react';
import {ToastProvider} from 'react-native-toast-notifications';
import {Provider} from 'react-redux';
import {store} from './src/store';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Route from './src/navigation';
import {PaperProvider} from 'react-native-paper';

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <PaperProvider>
          <ToastProvider>
            <Route />
          </ToastProvider>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
