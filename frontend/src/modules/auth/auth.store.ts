import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import router from '@/router';
import * as authApi from './auth.api';
import type { 
  User, Session, 
  SignInWithPasswordCredentials, 
  SignInWithOAuthCredentials,
} from './auth.types';
import {
  getAuthEmailRedirectURL,
  getPasswordResetRedirectURL,
} from './auth.helpers';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  // Getters
  const isAuthenticated = computed<boolean>(() => !!user.value && !!session.value);
  const isReady = computed<boolean>(() => initialized.value && (!loading.value || !!user.value));
  const userEmail = computed<string | null>(() => user.value?.email ?? null);
  const userId = computed<string | null>(() => user.value?.id ?? null);

  // Actions
  async function initialize(): Promise<void> {
    try {
      loading.value = true;

      const initialSession = await authApi.getSession();
      if (initialSession) {
        session.value = initialSession as Session;
        user.value = initialSession.user as User;
      } else {
        // Clear any stale local state
        user.value = null;
        session.value = null;
      }

      // Set up auth state change listener for reactive updates
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        const wasAuthenticated = !!user.value;

        session.value = (newSession as Session) || null;
        user.value = (newSession?.user as User) || null;

        if (!initialized.value) initialized.value = true;

        if (event === 'SIGNED_IN') {
          if (!wasAuthenticated && router.currentRoute.value.name === 'Login') {
            router.push({ name: 'Home' });
          }
        } else if (event === 'SIGNED_OUT') {
          router.push({ name: 'Login' });
        }
      });
    } catch (_err) {
      // Clear local state on initialization errors
      user.value = null;
      session.value = null;
    } finally {
      loading.value = false;
      if (!initialized.value) initialized.value = true;
    }
  }

  async function signInWithPassword(credentials: SignInWithPasswordCredentials): Promise<void> {
    try {
      loading.value = true;
      const authResponseData = await authApi.signInWithPassword(credentials);
      user.value = authResponseData.user as User;
      session.value = authResponseData.session as Session;
    } finally {
      loading.value = false;
    }
  }

  async function signInWithOAuth(credentials: SignInWithOAuthCredentials): Promise<void> {
    try {
      loading.value = true;
      await authApi.signInWithOAuth(credentials);
      // Note: OAuth redirects the user, so we don't update state here
      // The auth state change listener will handle the session update after redirect
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string, fullName?: string): Promise<void> {
    try {
      loading.value = true;
      const authResponseData = await authApi.signUpWithPassword({
        email,
        password,
        options: {
          // Provide the app-specific redirect for Supabase confirmation emails.
          emailRedirectTo: getAuthEmailRedirectURL(),
          data: fullName ? { full_name: fullName } : undefined,
        },
      });
      // Update state from API response when available (e.g., auto-confirm environments)
      const { user: authUser, session: authSession } = authResponseData;
      if (authUser) { user.value = authUser; }
      if (authSession) { session.value = authSession; }
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      loading.value = true;
      await authApi.signOut();
    } finally {
      user.value = null;
      session.value = null;
      loading.value = false;
      router.push({ name: 'Login' });
    }
  }

  async function resetPassword(email: string): Promise<void> {
    try {
      loading.value = true;
      await authApi.resetPassword({
        email,
        // Keep Supabase recovery emails pointed back at the app reset route.
        redirectTo: getPasswordResetRedirectURL(),
      });
    } finally {
      loading.value = false;
    }
  }

  async function updatePassword(newPassword: string): Promise<void> {
    try {
      loading.value = true;
      const { user: authUser } = await authApi.updatePassword({
        password: newPassword,
      });
      // Update user state if returned
      if (authUser) { user.value = authUser; }
    } finally {
      loading.value = false;
    }
  }

  function forceLogout(reason = 'Session invalid'): void {
    console.warn(`Force logout: ${reason}`);
    user.value = null;
    session.value = null;
    router.push({ name: 'Login' });
  }

  // Initialize auth on store creation
  initialize();

  return {
    
    // State
    user,
    session,
    loading,
    initialized,

    // Getters
    isAuthenticated,
    isReady,
    userEmail,
    userId,

    // Actions
    initialize,
    signInWithPassword,
    // Alias for components expecting login()
    login: signInWithPassword,
    signInWithOAuth,
    register,
    logout,
    resetPassword,
    updatePassword,
    forceLogout,
  };
});


