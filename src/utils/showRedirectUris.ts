import { Alert, Platform } from 'react-native';
import { getAllRedirectUris } from '../services/auth/googleAuth';

/**
 * Shows all redirect URIs that need to be configured in Google Cloud Console
 * This is helpful for setting up OAuth during development
 */
export const showRedirectUris = () => {
  const uris = getAllRedirectUris();

  const message = `
DEVELOPMENT (Expo Go):
${uris.development}

PRODUCTION (Standalone Build):
${uris.production}

Add both URIs to your Google Cloud Console:
1. Go to console.cloud.google.com
2. Select your project
3. Go to APIs & Services > Credentials
4. Click on your OAuth 2.0 Client ID
5. Add both URIs to "Authorized redirect URIs"
  `.trim();

  if (Platform.OS === 'web') {
    console.log('=== GOOGLE OAUTH REDIRECT URIs ===');
    console.log(message);
    console.log('==================================');
  } else {
    Alert.alert('Google OAuth Redirect URIs', message, [
      { text: 'Copy Development URI', onPress: () => console.log('Dev URI:', uris.development) },
      { text: 'Copy Production URI', onPress: () => console.log('Prod URI:', uris.production) },
      { text: 'OK' },
    ]);
  }

  return uris;
};

/**
 * Log redirect URIs to console for easy access
 */
export const logRedirectUris = () => {
  const uris = getAllRedirectUris();
  console.log('=== GOOGLE OAUTH REDIRECT URIs ===');
  console.log('Development (Expo Go):', uris.development);
  console.log('Production (Standalone):', uris.production);
  console.log('==================================');
  return uris;
};
