<template>
	<div class="min-h-screen grid place-items-center p-6">
		<div class="card bg-base-100 shadow-xl w-full max-w-sm">
			<div class="card-body">
				
				<h2 class="card-title">Sign in</h2>
				<AuthLoginForm />

				<div class="divider"></div>

				<p class="text-sm text-base-content/70">
					No account?
					<a class="link link-primary" @click="handleRegisterCta">Create one</a>
				</p>

				<p class="text-sm text-base-content/70">
					Forgot password?
					<a class="link link-primary" @click="handleForgotPassword">Reset it</a>
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AuthLoginForm from '@/modules/auth/components/AuthLoginForm.vue';


const router = useRouter();
function handleForgotPassword() {
	router.push({ name: 'ForgotPassword' });
}

function handleRegisterCta() {
	router.push({ name: 'Register' });
}
</script>

<style scoped></style>
