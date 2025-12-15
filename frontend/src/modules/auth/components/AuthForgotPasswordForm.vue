<template>
    <form class="space-y-4" @submit.prevent="handleForgotPassword">
        <div>
            <h2 class="text-2xl font-bold">Reset Password</h2>
            <p class="text-sm text-base-content/70 mt-2">
                Enter your email address and we'll send you a link to reset your password.
            </p>
        </div>

        <label class="form-control w-full">
            <span class="label">
                <span class="label-text">Email</span>
            </span>
            <input 
                v-model="email" 
                type="email" 
                placeholder="Email" 
                class="input input-bordered w-full"
                :class="{ 'input-error': !!error }"
                autocomplete="email"
                required 
            />
        </label>

        <button 
            type="submit" 
            class="btn btn-primary w-full" 
            :disabled="loading"
        >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span>{{ loading ? 'Sending...' : 'Send Reset Link' }}</span>
        </button>

        <div v-if="error" class="alert alert-error">
            <span>{{ error }}</span>
        </div>

        <div v-if="success" class="alert alert-success">
            <span>{{ success }}</span>
        </div>

        <div class="text-center">
            <button 
                type="button" 
                class="btn btn-link" 
                @click="emit('go-to-login')"
            >
                ← Back to Login
            </button>
        </div>
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

const { resetPassword } = useAuth();

const email = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

async function handleForgotPassword() {
    try {
        loading.value = true;
        error.value = '';
        success.value = '';

        if (!email.value.trim()) {
            const message = 'Email is required';
            error.value = message;
            emit('error', message);
            return;
        }

        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(email.value)) {
            const message = 'Please enter a valid email address';
            error.value = message;
            emit('error', message);
            return;
        }

        await resetPassword(email.value);

        success.value = 'Password reset link sent! Check your email for instructions.';
        emit('success', success.value);
        email.value = '';
    } catch (err) {
        const message =
            err instanceof Error
                ? err.message
                : 'Failed to send reset link. Please try again.';
        error.value = message;
        emit('error', message);
    } finally {
        loading.value = false;
    }
}
</script>
