// User profile-related routes

export const userRoutes = [
    { path: '/profile', name: 'Profile', component: () => import('@/modules/users/views/UserProfileView.vue'), meta: { requiresAuth: true } },
    
];
