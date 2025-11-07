export interface AuthUser {
  id: string;
  email: string | null;
  name?: string;
  givenName?: string;
  familyName?: string;
  photo?: string;
  provider: 'apple' | 'google';
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AppleAuthResponse {
  user: string;
  email: string | null;
  fullName: {
    givenName: string | null;
    familyName: string | null;
  } | null;
  identityToken: string | null;
  authorizationCode: string | null;
}

export interface GoogleAuthResponse {
  type: 'success' | 'error' | 'cancel';
  authentication?: {
    accessToken: string;
    idToken?: string;
    refreshToken?: string;
  };
  params?: {
    access_token?: string;
    id_token?: string;
  };
}
