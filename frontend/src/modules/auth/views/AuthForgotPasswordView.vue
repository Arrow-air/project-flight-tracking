<template>
	<div class="min-h-screen grid place-items-center p-6">
		<AuthForgotPasswordForm @go-to-login="handleGoToLogin" />
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AuthForgotPasswordForm from '../components/AuthForgotPasswordForm.vue'

const router = useRouter();
function handleGoToLogin() {
	router.push({ name: 'Login' });
}
</script>

<style scoped></style>
