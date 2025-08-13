<template>
	<div class="min-h-screen grid place-items-center p-6">
		<div class="card bg-base-100 shadow-xl w-full max-w-sm">
			<div class="card-body">
				<h2 class="card-title">Create account</h2>

				<form class="space-y-3" @submit.prevent="handleRegister">
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Email</span></span>
						<input v-model.trim="email" type="email" class="input input-bordered w-full" required />
					</label>

					<label class="form-control w-full">
						<span class="label"><span class="label-text">Password</span></span>
						<input v-model="password" type="password" class="input input-bordered w-full" required />
					</label>

					<label class="form-control w-full">
						<span class="label"><span class="label-text">Confirm Password</span></span>
						<input v-model="confirmPassword" type="password" class="input input-bordered w-full" required />
					</label>

					<label class="form-control w-full">
						<span class="label"><span class="label-text">Full Name</span></span>
						<input v-model="fullName" type="text" class="input input-bordered w-full" required />
					</label>

					<button type="submit" class="btn btn-primary w-full mt-2" :disabled="loading">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span>Create account</span>
					</button>
				</form>

				<!-- Divider -->
				<div class="divider"></div>

				<!-- Go to login -->
				<p class="text-sm text-base-content/70">
					Already have an account?
					<a class="link link-primary" href="/login">Sign in</a>
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

// Form data
const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

async function handleRegister() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''
    
    // Validation
    if (!fullName.value.trim()) {
      error.value = 'Full name is required'
      return;
    }
    
    if (!email.value.trim()) {
      error.value = 'Email is required'
      return;
    }
    
    if (password.value.length < 6) {
      error.value = 'Password must be at least 6 characters';
      return;
    }
    
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match'
      return;
    }
    
    await authStore.register(email.value, password.value, fullName.value)
    
    success.value = 'Account created successfully! Please check your email to confirm your account.'
      // Clear form
      fullName.value = ''
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message || 'Registration failed. Please try again.';
    } else {
      error.value = 'Registration failed. Please try again.';
    }
    console.error('Registration Error:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped></style>

