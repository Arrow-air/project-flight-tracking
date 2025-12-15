// Stateless API for authentication

import { supabase } from '@/lib/supabaseClient';
import { withErrorHandling } from '@/api/errorHandler';
import type { User, Session } from '@supabase/supabase-js';

const ENTITY_NAME = 'auth';

// Request types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface ResetPasswordInput {
  email: string;
  redirectTo?: string;
}

export interface UpdatePasswordInput {
  newPassword: string;
}

// Response types
export interface AuthResponse {
  user: User | null;
  session: Session | null;
}

export interface SessionResponse {
  session: Session | null;
}

// Helper to get redirect URL
function getRedirectURL(): string {
  let url =
    import.meta.env.VITE_SUPABASE_URL ??
    import.meta.env.VITE_VERCEL_URL ??
    window.location.origin ??
    'http://localhost:3000/';
  url = url.startsWith('http') ? url : `https://${url}`;
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
}

// Login with email and password
export async function login(input: LoginInput): Promise<AuthResponse> {
  const operation = '[auth] login';

  const result = await withErrorHandling(
    async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email.trim(),
        password: input.password,
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
      } as AuthResponse;
    },
    { operation, entity: ENTITY_NAME }
  );

  if (!result) throw new Error('Login was cancelled');
  return result;
}

// Register a new user
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const operation = '[auth] register';

  const result = await withErrorHandling(
    async () => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: input.fullName ? { full_name: input.fullName } : undefined,
          emailRedirectTo: getRedirectURL(),
        },
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
      } as AuthResponse;
    },
    { operation, entity: ENTITY_NAME }
  );

  if (!result) throw new Error('Registration was cancelled');
  return result;
}

// Logout current user
export async function logout(): Promise<void> {
  const operation = '[auth] logout';

  await withErrorHandling(
    async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    { operation, entity: ENTITY_NAME }
  );
}

// Request password reset email
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const operation = '[auth] reset password';

  await withErrorHandling(
    async () => {
      const redirectTo =
        input.redirectTo ?? `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(
        input.email,
        {
          redirectTo,
        }
      );
      if (error) throw error;
    },
    { operation, entity: ENTITY_NAME }
  );
}

// Update user password
export async function updatePassword(
  input: UpdatePasswordInput
): Promise<{ user: User | null }> {
  const operation = '[auth] update password';

  const result = await withErrorHandling(
    async () => {
      const { data, error } = await supabase.auth.updateUser({
        password: input.newPassword,
      });
      if (error) throw error;

      return { user: data.user } as { user: User | null };
    }, { operation, entity: ENTITY_NAME }
    );

  if (!result) throw new Error('Password update was cancelled');
  return result;
}

// Get current session
export async function getSession(): Promise<SessionResponse> {
  const operation = '[auth] get session';

  const result = await withErrorHandling(
    async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      return {
        session: data.session,
      } as SessionResponse;
    }, { operation, entity: ENTITY_NAME }
  );

  if (!result) throw new Error('Get session was cancelled');
  return result;
}
