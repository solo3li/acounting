import { Platform } from 'react-native';

export const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Connect to the deployed Railway backend by default
  return 'https://acounting-production-9a8d.up.railway.app/api';
};

export const API_URL = getApiUrl();
