<template>

    <!-- Navbar Header -->
    <div class="navbar bg-base-100/70 backdrop-blur supports-[backdrop-filter]:bg-base-100/60">

        <!-- Logo -->
        <div class="flex-1">
            <RouterLink to="/" class="btn btn-ghost text-xl">Arrow Air • Flight Tracking</RouterLink>
        </div>

        <!-- Navbar Links -->
        <div class="flex-none">
            <ul class="menu menu-horizontal px-1">
                <li><RouterLink to="/aircraft">Aircraft</RouterLink></li>
                <li><RouterLink to="/flights">Flights</RouterLink></li>
                <!-- <li><RouterLink to="/upload">Upload</RouterLink></li> -->
            </ul>
        </div>

        <!-- Divider between nav items and user actions -->
        <div class="divider divider-horizontal mx-2 h-8 self-stretch"></div>

        <!-- User Actions -->
        <div class="flex gap-2">

            <!-- Theme Toggle -->
            <label class="swap swap-rotate" aria-label="Toggle theme">
                <input type="checkbox" class="theme-controller" value="dark" />
                <!-- sun -->
                <svg class="swap-off h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M5 12a7 7 0 1 0 14 0A7 7 0 0 0 5 12m7-9a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1m0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1M1 13a1 1 0 1 1 0-2H2a1 1 0 1 1 0 2zm20 0a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2zM4.222 5.636a1 1 0 0 1 1.414-1.414l.707.707A1 1 0 0 1 5.636 6.343zM17.657 19.071a1 1 0 0 1 1.414-1.415l.707.708a1 1 0 0 1-1.414 1.414zM4.222 18.364a1 1 0 0 1 1.414 0l.707.707a1 1 0 1 1-1.414 1.415l-.707-.708a1 1 0 0 1 0-1.414M18.364 4.222a1 1 0 0 1 1.414 0l.707.707a1 1 0 1 1-1.414 1.415l-.707-.708a1 1 0 0 1 0-1.414" />
                </svg>
                <!-- moon -->
                <svg class="swap-on h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79" />
                </svg>
            </label>

            <!-- User Profile Dropdown -->
            <template v-if="isAuthenticated">
                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full">
                            <img alt="Tailwind CSS Navbar component"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                        </div>
                    </div>
                    <ul tabindex="0"
                        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        
                        <li><RouterLink to="/profile">Profile</RouterLink></li>
                        <li><RouterLink to="/aircraft">My Aircraft</RouterLink></li>
                        <li><a @click="handleLogout">Logout</a></li>
                    </ul>
                </div>
            </template>

            <!-- Login and Signup Buttons -->
            <template v-else>
                <RouterLink to="/login" class="btn btn-ghost">Log in</RouterLink>
                <RouterLink to="/signup" class="btn btn-primary">Sign up</RouterLink>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
// const loading = computed(() => authStore.loading);

async function handleLogout() {
    await authStore.logout();
}
</script>

<style scoped></style>
