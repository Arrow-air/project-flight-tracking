import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import router from '@/router';
import type { User, Session } from '@supabase/supabase-js';

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

      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        // Clear any stale local state
        user.value = null;
        session.value = null;
      } else if (initialSession) {
        session.value = initialSession as Session;
        user.value = initialSession.user as User;
      }

      supabase.auth.onAuthStateChange(async (event, newSession) => {
        const wasAuthenticated = !!user.value;

        session.value = (newSession as Session) || null;
        user.value = (newSession?.user as User) || null;

        if (!initialized.value) initialized.value = true;

        if (event === 'SIGNED_IN') {
          if (!wasAuthenticated && router.currentRoute.value.name === 'Login') {
            router.push({ name: 'Dashboard' });
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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
    } finally {
      loading.value = false;
    }
  }

  async function register(email: string, password: string, fullName?: string): Promise<void> {
    try {
      loading.value = true;
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      loading.value = true;
      await supabase.auth.signOut();
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updatePassword(newPassword: string): Promise<void> {
    try {
      loading.value = true;
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
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


