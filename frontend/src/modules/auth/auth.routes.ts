// Authentication-related routes

export const authRoutes = [
    { path: '/login', name: 'Login', component: () => import('@/modules/auth/views/AuthLoginView.vue'), meta: { requiresAuth: false } },
    { path: '/signup', name: 'Register', component: () => import('@/modules/auth/views/AuthRegisterView.vue'), meta: { requiresAuth: false } },
    { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/modules/auth/views/AuthForgotPasswordView.vue'), meta: { requiresAuth: false } },
    { path: '/reset-password', name: 'ResetPassword', component: () => import('@/modules/auth/views/AuthResetPasswordView.vue'), meta: { requiresAuth: false } }
];
