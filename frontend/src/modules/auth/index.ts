// Auth module entry point
// Single import location for consuming auth functionality

// Composable for components and Vue code
export { useAuth } from './useAuth';

// Helper functions for API files and pure functions
export {
  ensureAuthenticated,
  getAuthContext,
  getUserId,
  getAuthEmailRedirectURL,
  getPasswordResetRedirectURL,
} from './auth.helpers';
export type { AuthContext } from './auth.helpers';

export type {
  ResetPasswordInput,
  UpdatePasswordInput,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from './auth.types';

export { default as AuthLoginForm } from './components/AuthLoginForm.vue';
export { default as AuthRegisterForm } from './components/AuthRegisterForm.vue';
export { default as AuthForgotPasswordForm } from './components/AuthForgotPasswordForm.vue';
export { default as AuthResetPasswordForm } from './components/AuthResetPasswordForm.vue';

export { authRoutes } from './auth.routes';

