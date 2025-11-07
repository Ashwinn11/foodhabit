import { Session, User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | null;
  name?: string;
  givenName?: string;
  familyName?: string;
  photo?: string;
  provider: 'apple' | 'google';
  // Supabase session data
  session?: Session;
  supabaseUser?: User;
}

export interface AuthError {
  message: string;
  code?: string;
}

export type AuthProvider = 'apple' | 'google';

export interface SupabaseAuthResult {
  session: Session | null;
  user: User | null;
  error: Error | null;
}
