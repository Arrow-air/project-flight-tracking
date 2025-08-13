import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const routes: Array<RouteRecordRaw> = [
 
    // Auth routes
    { path: '/login', name: 'Login', component: () => import('../views/auth/Login.vue') },
    { path: '/signup', name: 'Signup', component: () => import('../views/auth/Signup.vue') },
    { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/auth/ForgotPassword.vue') },
    { path: '/reset-password', name: 'ResetPassword', component: () => import('../views/auth/ResetPassword.vue') },
    
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    
    // Wait for auth store to finish loading before checking authentication
    if (authStore.loading) {
      // Wait for the auth store to finish initializing
      const checkAuthReady = (): Promise<void> => {
        return new Promise((resolve) => {
          const unwatch = authStore.$subscribe((mutation, state) => {
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
      // TODO: Remove this once we have a proper auth system
      // next(); // Allow access to the route for now
      
      // Redirect to login if trying to access protected route while not authenticated
      console.warn('Page requires auth, but user is not authenticated. Redirecting to login.');
      next({ name: 'Login' });
    } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
      // Redirect to home if trying to access login while authenticated
      next({ name: 'Home' });
    } else {
      next();
    }
  });

export default router;
