<template>
    <form class="space-y-4" @submit.prevent="handleRegister">
        <h2 class="card-title">Register</h2>
        <p class="text-base-content/70">Create your account</p>

        <label class="form-control w-full">
            <span class="label">
                <span class="label-text">Full Name</span>
            </span>
            <input v-model="fullName" type="text" placeholder="Full Name" class="input input-bordered w-full"
                :class="{ 'input-error': !!error }" autocomplete="name" />
        </label>

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
                :class="{ 'input-error': !!error }" autocomplete="new-password" />
        </label>

        <label class="form-control w-full">
            <span class="label">
                <span class="label-text">Confirm Password</span>
            </span>
            <input v-model="confirmPassword" type="password" placeholder="Confirm Password"
                class="input input-bordered w-full" :class="{ 'input-error': !!error }" autocomplete="new-password" />
        </label>

        <button type="submit" class="btn btn-primary mt-2 w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span>{{ loading ? 'Creating Account...' : 'Create Account' }}</span>
        </button>

        <div v-if="error" class="alert alert-error">
            <span>{{ error }}</span>
        </div>

        <div v-if="success" class="alert alert-success">
            <span>{{ success }}</span>
        </div>

        <div class="divider">OR</div>

        <p class="text-sm text-base-content/70 text-center">
            Already have an account?
            <a class="link link-primary" @click="emit('go-to-login')">Sign in</a>
        </p>
    </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/modules/auth/useAuth';

const emit = defineEmits<{
    (e: 'success', message: string): void;
    (e: 'error', message: string): void;
    (e: 'go-to-login'): void;
}>();

const { register } = useAuth();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

async function handleRegister() {
    try {
        loading.value = true;
        error.value = '';
        success.value = '';

        if (!fullName.value.trim()) {
            error.value = 'Full name is required';
            emit('error', error.value);
            return;
        }
        if (!email.value.trim()) {
            error.value = 'Email is required';
            emit('error', error.value);
            return;
        }
        if (password.value.length < 6) {
            error.value = 'Password must be at least 6 characters';
            emit('error', error.value);
            return;
        }
        if (password.value !== confirmPassword.value) {
            error.value = 'Passwords do not match';
            emit('error', error.value);
            return;
        }

        await register(email.value, password.value, fullName.value);

        success.value =
            'Account created successfully! Please check your email to confirm your account.';
        emit('success', success.value);

        fullName.value = '';
        email.value = '';
        password.value = '';
        confirmPassword.value = '';
    } catch (err) {
        const message =
            err instanceof Error
                ? err.message
                : 'Registration failed. Please try again.';
        error.value = message;
        console.error("Registration failed:", err);
        emit('error', message);
    } finally {
        loading.value = false;
    }
}
</script>
