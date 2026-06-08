import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';

import ReportsScreen from './src/screens/ReportsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('userToken').then(token => {
      setUserToken(token);
    });
  }, []);

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} setToken={setUserToken} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard">
              {props => <DashboardScreen {...props} setToken={setUserToken} />}
            </Stack.Screen>
            <Stack.Screen name="Accounts" component={AccountsScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
