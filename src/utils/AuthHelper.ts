import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

let memoryToken: string | null = null;

export const setTokenAsync = async (token: string) => {
  if (Platform.OS === 'web') {
    // TODO(security): MUST NOT store sensitive authentication tokens in localStorage. Implement HttpOnly cookies for web.
    // Storing in memory for now to prevent web crashes while being secure.
    memoryToken = token;
  } else {
    await SecureStore.setItemAsync('userToken', token);
  }
};

export const getTokenAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return memoryToken;
  } else {
    try {
      return await SecureStore.getItemAsync('userToken');
    } catch {
      return null;
    }
  }
};

export const deleteTokenAsync = async () => {
  if (Platform.OS === 'web') {
    memoryToken = null;
  } else {
    await SecureStore.deleteItemAsync('userToken');
  }
};
