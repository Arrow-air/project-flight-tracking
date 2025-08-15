<template>
	<div class="min-h-screen grid place-items-center p-6">
		<div class="card bg-base-100 shadow-xl w-full max-w-sm">
			<div class="card-body">
				<h2 class="card-title">Sign in</h2>

				<form class="space-y-3" @submit.prevent="handleLogin">
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Email</span></span>
						<input v-model.trim="email" type="email" class="input input-bordered w-full" required />
					</label>

					<label class="form-control w-full">
						<span class="label"><span class="label-text">Password</span></span>
						<input v-model="password" type="password" class="input input-bordered w-full" required />
					</label>

					<button type="submit" class="btn btn-primary w-full mt-2" :disabled="loading">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span>Sign in</span>
					</button>
				</form>

				<div class="divider"></div>

				
				<p class="text-sm text-base-content/70">
					No account?
					<a class="link link-primary" href="/signup">Create one</a>
				</p>

				<p class="text-sm text-base-content/70">
					Forgot password?
					<a class="link link-primary" href="/forgot-password">Reset it</a>
				</p>

				<!-- Error message -->
				<div v-if="error" class="alert alert-error mt-2">
					<span>{{ error }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

// Record the user's login state
const authStore = useAuthStore();

// Form fields
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  try {
    loading.value = true;
    error.value = '';
    
    await authStore.login(email.value, password.value);
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message || 'Login failed. Please check your credentials.';
    } else {
      error.value = 'Login failed. Please check your credentials.';
    }
    console.error('Login Error:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped></style>

