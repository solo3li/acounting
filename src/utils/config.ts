import { Platform } from 'react-native';

export const getApiUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    // If running in a cloud IDE (like IDX, Gitpod, Codespaces) where hostname isn't localhost
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Cloud IDEs usually forward ports by replacing the port number in the subdomain or port
      return origin.replace('8081', '5000') + '/api';
    }
  }
  // Android Emulator needs 10.0.2.2 to access host localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();
