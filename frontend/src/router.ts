import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/features/auth/auth.store';

import { authRoutes } from '@/features/auth/auth.routes';

const routes: Array<RouteRecordRaw> = [

    // Auth routes (no layout)
    ...authRoutes,

    // App with default layout
    {
        path: '/',
        component: () => import('@/layouts/DefaultLayout.vue'),
        children: [
            { path: '', name: 'Home', component: () => import('@/views/Home.vue'), meta: { requiresAuth: false } },
            { path: 'profile', name: 'Profile', component: () => import('@/views/user/Profile.vue'), meta: { requiresAuth: true } },

            // Aircraft Pages
            { path: 'aircraft', name: 'AircraftList', component: () => import('@/views/aircraft/ListAircraftPage.vue'), meta: { requiresAuth: true } },
            { path: 'aircraft/:id', name: 'Aircraft', component: () => import('@/views/aircraft/AircraftPage.vue'), meta: { requiresAuth: true } },

            // Flight Pages
            { path: 'flights', name: 'Flights', component: () => import('@/views/flights/ListFlightsPage.vue'), meta: { requiresAuth: true } },
            { path: 'flights/:flight_id', name: 'Flight Record', component: () => import('@/views/flights/FlightRecordPage.vue'), meta: { requiresAuth: true } },
        ]
    }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();
    
    // Wait for auth store to finish loading before checking authentication
    if (authStore.loading) {
      // Wait for the auth store to finish initializing
      const checkAuthReady = (): Promise<void> => {
        return new Promise((resolve) => {
          const unwatch = authStore.$subscribe((_mutation, state) => {
            if (!state.loading) {
              unwatch();
              resolve();
            }
          });
          
          // If already not loading, resolve immediately
          if (!authStore.loading) {
            unwatch();
            resolve();
          }
        });
      };
      
      await checkAuthReady();
    }
    
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {      
      // Redirect to login if trying to access protected route while not authenticated
      console.warn('Page requires auth, but user is not authenticated. Redirecting to login.');
      next({ name: 'Login' });
    } else if ((to.name === 'Login' || to.name === 'Signup') && authStore.isAuthenticated) {
      // Redirect to home if trying to access login while authenticated
      next({ name: 'Home' });
    } else {
      next();
    }
  });

export default router;
