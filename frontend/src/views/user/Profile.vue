<template>
	<section class="max-w-3xl mx-auto px-6 py-10 space-y-6">
		<div class="flex items-end justify-between">
			<div>
				<h1 class="text-3xl font-bold">Profile</h1>
				<p class="text-base-content/70">Manage your account details and security</p>
			</div>
			<button class="btn" @click="handleLogout" :disabled="authLoading">
				<span v-if="authLoading" class="loading loading-spinner loading-sm"></span>
				<span v-else>Logout</span>
			</button>
		</div>

		<!-- Account Info -->
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<div class="flex items-center gap-4">
					<div class="avatar">
						<div class="w-16 rounded-full">
							<img alt="User avatar" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
						</div>
					</div>
					<div>
						<div class="font-semibold text-lg">{{ displayName || userEmail || 'User' }}</div>
						<div class="text-base-content/70">{{ userEmail || '—' }}</div>
					</div>
				</div>

				<div class="mt-4">
					<label class="label"><span class="label-text">User ID</span></label>
					<div class="join w-full">
						<input class="input input-bordered join-item w-full" :value="userId" readonly />
						<button class="btn join-item" @click="copyUserId">Copy</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Change Password -->
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">Change password</h2>

				<form class="grid gap-4" @submit.prevent="handleChangePassword">
					<label class="form-control w-full">
						<span class="label"><span class="label-text">New password</span></span>
						<input v-model="newPassword" type="password" class="input input-bordered w-full" minlength="8" required />
					</label>

					<label class="form-control w-full">
						<span class="label"><span class="label-text">Confirm new password</span></span>
						<input v-model="confirmPassword" type="password" class="input input-bordered w-full" minlength="8" required />
					</label>

					<button type="submit" class="btn btn-primary" :disabled="formLoading">
						<span v-if="formLoading" class="loading loading-spinner loading-sm"></span>
						<span v-else>Update password</span>
					</button>
				</form>

				<div v-if="errorMessage" class="alert alert-error mt-2">
					<span>{{ errorMessage }}</span>
				</div>
				<div v-if="successMessage" class="alert alert-success mt-2">
					<span>{{ successMessage }}</span>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const userEmail = computed(() => authStore.userEmail)
const userId = computed(() => authStore.userId)
const authLoading = computed(() => authStore.loading)
const displayName = computed<string>(() => {
	// Attempt to use Supabase user metadata full_name if present
	// @ts-ignore - optional chaining into user metadata may not be typed
	return (authStore.user as any)?.user_metadata?.full_name || ''
})

const newPassword = ref('')
const confirmPassword = ref('')
const formLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleLogout() {
	await authStore.logout()
}

async function handleChangePassword() {
	try {
		formLoading.value = true
		errorMessage.value = ''
		successMessage.value = ''

		if (newPassword.value.length < 8) {
			throw new Error('Password must be at least 8 characters long.')
		}
		if (newPassword.value !== confirmPassword.value) {
			throw new Error('Passwords do not match.')
		}

		await authStore.updatePassword(newPassword.value)
		successMessage.value = 'Password updated successfully.'
		newPassword.value = ''
		confirmPassword.value = ''
	} catch (err) {
		if (err instanceof Error) {
			errorMessage.value = err.message
		} else {
			errorMessage.value = 'Failed to update password.'
		}
	} finally {
		formLoading.value = false
	}
}

async function copyUserId() {
	try {
		await navigator.clipboard.writeText(userId.value)
		successMessage.value = 'User ID copied to clipboard.'
		setTimeout(() => (successMessage.value = ''), 1500)
	} catch (_e) {
		errorMessage.value = 'Could not copy User ID.'
		setTimeout(() => (errorMessage.value = ''), 1500)
	}
}
</script>

<style scoped></style>


