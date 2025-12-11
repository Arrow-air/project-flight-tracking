// Authentication-related routes

export const authRoutes = [
    { path: '/login', name: 'Login', component: () => import('@/features/auth/views/AuthLoginView.vue'), meta: { requiresAuth: false } },
    { path: '/signup', name: 'Signup', component: () => import('@/features/auth/views/AuthSignupView.vue'), meta: { requiresAuth: false } },
    { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/features/auth/views/AuthForgotPasswordView.vue'), meta: { requiresAuth: false } },
    { path: '/reset-password', name: 'ResetPassword', component: () => import('@/features/auth/views/AuthResetPasswordView.vue'), meta: { requiresAuth: false } }
];
