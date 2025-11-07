import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthUser, AuthError } from '../../types/auth';

// Complete the browser session when returning from the browser
WebBrowser.maybeCompleteAuthSession();

// Configuration interface for Google OAuth
export interface GoogleAuthConfig {
  clientId: string; // Your Google OAuth client ID (web client ID for Expo)
  redirectUri?: string;
}

/**
 * Sign in with Google using OAuth 2.0 (Web flow)
 *
 * Setup instructions:
 * 1. Go to Google Cloud Console (console.cloud.google.com)
 * 2. Create or select a project
 * 3. Enable Google+ API
 * 4. Create OAuth 2.0 credentials (Web application type)
 * 5. Add authorized redirect URIs:
 *    - For development: https://auth.expo.io/@your-username/foodhabit
 *    - Get your redirect URI using: AuthSession.makeRedirectUri()
 * 6. Copy the Web Client ID and use it in config
 */
export const signInWithGoogle = async (config: GoogleAuthConfig): Promise<AuthUser> => {
  try {
    const redirectUri = config.redirectUri || AuthSession.makeRedirectUri({
      scheme: 'foodhabit',
      path: 'redirect',
    });

    // Configure the auth request
    const authRequestConfig: AuthSession.AuthRequestConfig = {
      clientId: config.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false, // Google web OAuth doesn't require PKCE
    };

    const authRequest = new AuthSession.AuthRequest(authRequestConfig);

    // Discovery endpoint for Google
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const result = await authRequest.promptAsync(discovery);

    if (result.type === 'success') {
      // Get the access token from the result
      const accessToken = result.params.access_token;

      if (!accessToken) {
        throw new Error('No access token received from Google');
      }

      // Fetch user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo = await userInfoResponse.json();

      // Create AuthUser object
      const user: AuthUser = {
        id: userInfo.id,
        email: userInfo.email || null,
        name: userInfo.name,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name,
        photo: userInfo.picture,
        provider: 'google',
      };

      return user;
    } else if (result.type === 'cancel') {
      const error: AuthError = {
        message: 'Sign in was canceled',
        code: 'ERR_REQUEST_CANCELED',
      };
      throw error;
    } else if (result.type === 'error') {
      const error: AuthError = {
        message: result.error?.message || 'Failed to sign in with Google',
        code: result.error?.code,
      };
      throw error;
    }

    throw new Error('Unexpected auth result type');
  } catch (error: any) {
    if (error.message && error.code) {
      throw error; // Already an AuthError
    }

    const authError: AuthError = {
      message: error.message || 'Failed to sign in with Google',
      code: error.code,
    };
    throw authError;
  }
};

/**
 * Get the redirect URI for your app
 * Use this to configure your Google OAuth client
 */
export const getGoogleRedirectUri = (): string => {
  return AuthSession.makeRedirectUri({
    scheme: 'foodhabit',
    path: 'redirect',
  });
};
