<template>
	<div class="min-h-screen grid place-items-center p-6">
		<div class="card bg-base-100 shadow-xl w-full max-w-md">
			<div class="card-body">
				<AuthUpdatePasswordForm
					@success="handleSuccess"
					@error="handleError"
					@invalid-session="handleInvalidSession" />

					<div class="divider">OR</div>

				<p class="text-sm text-base-content/70 text-center">
					<a class="link link-primary" @click="handleGoToLogin">← Back to Login</a>
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AuthUpdatePasswordForm from '@/modules/auth/components/AuthUpdatePasswordForm.vue'

const router = useRouter()

function handleGoToLogin() {
	router.push({ name: 'Login' })
}

async function handleSuccess() {
	// Wait a bit before redirecting to login
	const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
	await sleep(2000);
	router.push({ name: 'Login' });
}

function handleError() {
	// Error is handled by the form component
	console.error('Password reset error');
}

function handleInvalidSession() {
	// Could redirect to forgot password or show a message
	console.warn('Invalid reset session');
}
</script>

<style scoped></style>
