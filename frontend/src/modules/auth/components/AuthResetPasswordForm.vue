<template>
    <form class="space-y-4" @submit.prevent="handleResetPassword">
        <h2 class="card-title">Set New Password</h2>
        <p class="text-base-content/70">
            Enter your new password below.
        </p>

        <label class="form-control w-full">
            <span class="label">
                <span class="label-text">New Password</span>
            </span>
            <input v-model="password" type="password" placeholder="New Password"
                class="input input-bordered w-full" :class="{ 'input-error': !!error }"
                autocomplete="new-password" required />
        </label>

        <label class="form-control w-full">
            <span class="label">
                <span class="label-text">Confirm New Password</span>
            </span>
            <input v-model="confirmPassword" type="password" placeholder="Confirm New Password"
                class="input input-bordered w-full" :class="{ 'input-error': !!error }"
                autocomplete="new-password" required />
        </label>

        <button type="submit" class="btn btn-primary mt-2 w-full" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span>{{ loading ? 'Updating Password...' : 'Update Password' }}</span>
        </button>

        <div v-if="error" class="alert alert-error">
            <span>{{ error }}</span>
        </div>

        <div v-if="success" class="alert alert-success">
            <span>{{ success }}</span>
        </div>

        <div class="divider">OR</div>

        <p class="text-sm text-base-content/70 text-center">
            <a class="link link-primary" @click="emit('go-to-login')">← Back to Login</a>
        </p>
    </form>
</template>
  
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuth } from '@/modules/auth/useAuth';
  
  const emit = defineEmits<{
    (e: 'success', message: string): void;
    (e: 'error', message: string): void;
    (e: 'go-to-login'): void;
    (e: 'invalid-session'): void;
  }>();
  
  const { updatePassword, session, initialized } = useAuth();
  
  // Form fields
  const password = ref('');
  const confirmPassword = ref('');
  const loading = ref(false);
  const error = ref('');
  const success = ref('');
  const invalidNotified = ref(false);
  
  watch(
    () => [initialized, session] as const,
    ([ready, current]) => {
      if (ready && !current && !invalidNotified.value) {
        const message = 'Invalid or expired reset link. Please request a new password reset.';
        error.value = message;
        invalidNotified.value = true;
        emit('error', message);
        emit('invalid-session');
      }
    },
    { immediate: true }
  );
  
  async function handleResetPassword() {
    try {
      loading.value = true;
      error.value = '';
      success.value = '';
  
      if (!password.value.trim()) {
        const message = 'Password is required';
        error.value = message;
        emit('error', message);
        return;
      }
      if (password.value.length < 6) {
        const message = 'Password must be at least 6 characters';
        error.value = message;
        emit('error', message);
        return;
      }
      if (password.value !== confirmPassword.value) {
        const message = 'Passwords do not match';
        error.value = message;
        emit('error', message);
        return;
      }
  
      await updatePassword(password.value);
  
      success.value = 'Password updated successfully!';
      emit('success', success.value);
  
      password.value = '';
      confirmPassword.value = '';
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update password. Please try again.';
      error.value = message;
      emit('error', message);
    } finally {
      loading.value = false;
    }
  }
  </script>
  
  