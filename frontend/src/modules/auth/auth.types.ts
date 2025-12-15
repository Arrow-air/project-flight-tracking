import type { Session, User, UserResponse } from '@supabase/supabase-js';
// Typical for Supabase auth login and session management
export type { Session, User, UserResponse };

import type {
  AuthError,
  AuthResponse,
  SignInWithPasswordCredentials,
  SignInWithOAuthCredentials, Provider,
  AuthResponsePassword,
  SignUpWithPasswordCredentials,
  SignOut,
} from '@supabase/auth-js';

// Supabase auth API types
export type {
  AuthError,
  AuthResponse,
  SignInWithPasswordCredentials,
  AuthResponsePassword,
  SignUpWithPasswordCredentials,
  SignOut,
};

/**
 * Input payload for password reset requests.
 * Callers are responsible for providing an absolute redirect URL.
 */
export interface ResetPasswordInput {
  email: string;
  redirectTo: string;
}

/** Minimal shape for updating the authenticated user's password. */
export interface UpdatePasswordInput {
  password: string;
}

// Imported types from Supabase automatically generated types
// For OAuth providers, we use the Provider type from Supabase
export type { SignInWithOAuthCredentials };
export type OAuthProvider = Provider;
