import React from 'react';
import { DefaultTheme, Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View } from 'react-native';

import createStore from './src/store/store';
import Root from './src/Root';

const { store, persistor } = createStore();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StoreProvider store={store}>
        <PersistGate loading={
          <View style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        } persistor={persistor}>
          <Root />
        </PersistGate>
      </StoreProvider>
    </PaperProvider>
  );
}

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#004d40',
    accent: '#546e7a',
  },
};
