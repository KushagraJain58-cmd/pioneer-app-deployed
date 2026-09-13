import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { WelcomeProfileProvider, useWelcomeProfile } from './src/context/WelcomeProfileContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import WelcomeScreen from './src/screens/welcome/WelcomeScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { token, isLoading } = useAuth();
  const { hasCompletedWelcome, isLoading: welcomeLoading } = useWelcomeProfile();

  // useEffect(() => {
  //   requestAllPermissions();
  // }, []);

  if (isLoading || welcomeLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6FCFF' }}>
        <ActivityIndicator size="large" color="#004877" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !hasCompletedWelcome ? (
        // Logged in but hasn't personalized yet — mirror the client's /welcome gate.
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WelcomeProfileProvider>
        <StatusBar style="light" backgroundColor="#004877" />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </WelcomeProfileProvider>
    </AuthProvider>
  );
}
