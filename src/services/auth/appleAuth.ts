import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { AuthUser, AuthError, AppleAuthResponse } from '../../types/auth';

/**
 * Check if Apple Authentication is available on the device
 */
export const isAppleAuthAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    console.error('Error checking Apple Auth availability:', error);
    return false;
  }
};

/**
 * Sign in with Apple
 * Returns the authenticated user or throws an error
 */
export const signInWithApple = async (): Promise<AuthUser> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Process the credential
    const user: AuthUser = {
      id: credential.user,
      email: credential.email || null,
      givenName: credential.fullName?.givenName || undefined,
      familyName: credential.fullName?.familyName || undefined,
      name: credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : undefined,
      provider: 'apple',
    };

    return user;
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      const authError: AuthError = {
        message: 'Sign in was canceled',
        code: error.code,
      };
      throw authError;
    }

    const authError: AuthError = {
      message: error.message || 'Failed to sign in with Apple',
      code: error.code,
    };
    throw authError;
  }
};

/**
 * Get credential state for a user (check if still authenticated)
 */
export const getAppleCredentialState = async (
  userId: string
): Promise<AppleAuthentication.AppleAuthenticationCredentialState | null> => {
  try {
    const credentialState = await AppleAuthentication.getCredentialStateAsync(userId);
    return credentialState;
  } catch (error) {
    console.error('Error getting Apple credential state:', error);
    return null;
  }
};
