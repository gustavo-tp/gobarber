import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';

import AppProvider from './hooks';

import Routes from './routes';

const App: React.FC = () => {
  useEffect(() => {
    // Verificar se usuário está logado

    SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#321e38" />
      <AppProvider>
        <View style={{ flex: 1, backgroundColor: '#321e38' }}>
          <Routes />
        </View>
      </AppProvider>
    </NavigationContainer>
  );
};

export default App;
