import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getTokenAsync } from './src/utils/AuthHelper';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import TransactionDetailsScreen from './src/screens/TransactionDetailsScreen';
import AccountDetailsScreen from './src/screens/AccountDetailsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator({ setToken }: { setToken: (token: string | null) => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'الرئيسية') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'الحسابات') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'المعاملات') iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          else if (route.name === 'الإعدادات') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4facfe',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#16213e',
          borderTopWidth: 0,
          elevation: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        }
      })}
    >
      <Tab.Screen name="الرئيسية">
        {props => <DashboardScreen {...props} setToken={setToken} />}
      </Tab.Screen>
      <Tab.Screen name="الحسابات" component={AccountsScreen} />
      <Tab.Screen name="المعاملات" component={TransactionsScreen} />
      <Tab.Screen name="الإعدادات">
        {props => <SettingsScreen {...props} setToken={setToken} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    getTokenAsync().then(token => {
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
          <Stack.Group>
            <Stack.Screen name="Main">
              {props => <MainTabNavigator {...props} setToken={setUserToken} />}
            </Stack.Screen>
            <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
            <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
