<template>
	<div class="min-h-screen grid place-items-center p-6">
		<div class="card bg-base-100 shadow-xl w-full max-w-sm">
			<div class="card-body">
				<h2 class="card-title">Set a new password</h2>
				<p class="text-sm text-base-content/70">Enter your new password below.</p>

				<form class="space-y-3" @submit.prevent="onSubmit">
					<label class="form-control w-full">
						<span class="label"><span class="label-text">New password</span></span>
						<input v-model="password" type="password" class="input input-bordered w-full" required />
					</label>

					<button type="submit" class="btn btn-primary w-full" :disabled="loading">
						<span v-if="loading" class="loading loading-spinner loading-sm"></span>
						<span>Update password</span>
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
import { onMounted, ref } from 'vue'
import { supabase } from '../../lib/supabaseClient'

const password = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
	// Ensure we have a recovering session from the email link
	const { data } = await supabase.auth.getSession()
	if (!data.session) {
		errorMessage.value = 'Invalid or expired reset link. Please request a new link.'
	}
})

async function onSubmit() {
	loading.value = true
	successMessage.value = ''
	errorMessage.value = ''
	const { error } = await supabase.auth.updateUser({ password: password.value })
	loading.value = false
	if (error) {
		errorMessage.value = error.message
		return
	}
	successMessage.value = 'Password updated. You can now log in.'
}
</script>

<style scoped></style>
