// Composable wrapper for auth store
// Provides a clean, stable interface for accessing authentication state and actions

import { useAuthStore } from './auth.store';

/**
 * Composable for accessing authentication state and actions
 * This is the primary way components and other modules should access auth
 * 
 * @returns Auth state and actions
 */
export function useAuth() {
  const store = useAuthStore();

  return {
    // State (reactive refs)
    user: store.user,
    session: store.session,
    loading: store.loading,
    initialized: store.initialized,

    // Getters (computed)
    isAuthenticated: store.isAuthenticated,
    isReady: store.isReady,
    userEmail: store.userEmail,
    userId: store.userId,

    // Actions
    initialize: store.initialize,
    login: store.login,
    signInWithOAuth: store.signInWithOAuth,
    register: store.register,
    logout: store.logout,
    resetPassword: store.resetPassword,
    updatePassword: store.updatePassword,
    forceLogout: store.forceLogout,
  };
}

