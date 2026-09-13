import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

const HEADER_STYLE = {
  headerStyle: { backgroundColor: '#004877' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' as const },
};

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen as any} options={{ ...HEADER_STYLE, headerShown: true, title: 'Verify OTP' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ ...HEADER_STYLE, headerShown: true, title: 'Forgot Password' }} />
    </Stack.Navigator>
  );
}
