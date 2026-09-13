import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestAllPermissions = async () => {
  await requestNotificationPermission();
  await requestLocationPermission();
};

export const requestNotificationPermission = async () => {
  const already = await SecureStore.getItemAsync('notif_asked');
  if (already) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const permStatus = await Notifications.getPermissionsAsync();
  if ((permStatus as any).granted === false) {
    await Notifications.requestPermissionsAsync();
  }

  await SecureStore.setItemAsync('notif_asked', 'true');
};

export const requestLocationPermission = async () => {
  const already = await SecureStore.getItemAsync('location_asked');
  if (already) return;

  await Location.requestForegroundPermissionsAsync();
  await SecureStore.setItemAsync('location_asked', 'true');
};

export const registerPushToken = async (): Promise<string | null> => {
  try {
    const permStatus = await Notifications.getPermissionsAsync();
    if (!(permStatus as any).granted) return null;
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
};
