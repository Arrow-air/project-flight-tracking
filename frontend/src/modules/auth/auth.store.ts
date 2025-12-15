import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import router from '@/router';
import * as authApi from './auth.api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  // Getters
  const isAuthenticated = computed<boolean>(() => !!user.value && !!session.value);
  const isReady = computed<boolean>(() => initialized.value && (!loading.value || !!user.value));
  const userEmail = computed<string>(() => user.value?.email || '');
  const userId = computed<string>(() => user.value?.id || '');

  // Actions
  async function initialize(): Promise<void> {
    try {
      loading.value = true;

      const { session: initialSession } = await authApi.getSession();
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

  async function login(email: string, password: string): Promise<void> {
    try {
      loading.value = true;
      const { user: authUser, session: authSession } = await authApi.login({email, password});
      if (authUser && authSession) {
        user.value = authUser;
        session.value = authSession as Session;
      }
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string, fullName?: string): Promise<void> {
    try {
      loading.value = true;
      const { user: authUser, session: authSession } = await authApi.register({
        email,
        password,
        fullName,
      });
      // Update state from API response
      if (authUser && authSession) {
        user.value = authUser;
        session.value = authSession;
      }
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      loading.value = true;
      await authApi.logout();
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
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } finally {
      loading.value = false;
    }
  }

  async function updatePassword(newPassword: string): Promise<void> {
    try {
      loading.value = true;
      const { user: authUser } = await authApi.updatePassword({ newPassword });
      // Update user state if returned
      if (authUser) {
        user.value = authUser;
      }
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
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    forceLogout,
  };
});


