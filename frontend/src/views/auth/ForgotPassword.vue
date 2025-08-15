<template>
	<div class="min-h-screen grid place-items-center p-6">
		<div class="card bg-base-100 shadow-xl w-full max-w-sm">
			<div class="card-body">
				<h2 class="card-title">Forgot password</h2>
				<p class="text-sm text-base-content/70">Enter your email and we'll send you a reset link.</p>

				<form class="space-y-3" @submit.prevent="onSubmit">
					<label class="form-control w-full">
						<span class="label"><span class="label-text">Email</span></span>
						<input v-model.trim="email" type="email" class="input input-bordered w-full" required />
					</label>

					<button type="submit" class="btn btn-primary w-full" :disabled="loading">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span>Send reset link</span>
					</button>
				</form>

				<div v-if="successMessage" class="alert alert-success mt-2">
					<span>{{ successMessage }}</span>
				</div>
				<div v-if="errorMessage" class="alert alert-error mt-2">
					<span>{{ errorMessage }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../../lib/supabaseClient'

const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function onSubmit() {
	loading.value = true
	successMessage.value = ''
	errorMessage.value = ''
	const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
		redirectTo: `${window.location.origin}/reset-password`,
	})
	loading.value = false
	if (error) {
		errorMessage.value = error.message
		return
	}
	successMessage.value = 'Check your inbox for the reset link.'
}
</script>

<style scoped></style>
