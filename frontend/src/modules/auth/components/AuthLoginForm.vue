<template>
    <form class="space-y-4" @submit.prevent="handleLogin">
        <label class="form-control w-full">
            <span class="label">
                <span class="label-text">Email</span>
            </span>
            <input v-model="email" type="email" placeholder="Email" class="input input-bordered w-full"
                :class="{ 'input-error': !!error }" autocomplete="email" />
        </label>

        <label class="form-control w-full">
            <span class="label">
                <span class="label-text">Password</span>
            </span>
            <input v-model="password" type="password" placeholder="Password" class="input input-bordered w-full"
                :class="{ 'input-error': !!error }" autocomplete="current-password" />
        </label>

        <button type="submit" class="btn btn-primary mt-2 w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
        </button>


        <div class="divider">OR</div>
        <OAuthGitHub :redirectTo="redirectTo" class="w-full" />

        <div v-if="error" class="alert alert-error">
            <span>{{ error }}</span>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/modules/auth/useAuth';

import OAuthGitHub from '@/modules/auth/components/OAuthGithub.vue';

const emit = defineEmits<{
    (e: 'success'): void;
    (e: 'error', message: string): void;
}>();

const { login } = useAuth();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const redirectTo = ref('http://localhost:54321/auth/v1/callback');
// const redirectTo = ref('http://localhost:54321/auth/v1/callback');

async function handleLogin() {
    try {
        loading.value = true;
        error.value = '';

        await login({
            email: email.value,
            password: password.value,
        });

        emit('success');
    } catch (err) {
        const message =
            err instanceof Error
                ? err.message
                : 'Login failed. Please check your credentials.';
        error.value = message;
        emit('error', message);
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped></style>
