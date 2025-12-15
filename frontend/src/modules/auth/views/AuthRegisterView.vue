<template>
    <div class="min-h-screen grid place-items-center p-6">
        <div class="card bg-base-100 shadow-xl w-full max-w-md">
            <div class="card-body">
                <AuthRegisterForm @go-to-login="handleGoToLogin" @success="handleSuccess" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AuthRegisterForm from '@/modules/auth/components/AuthRegisterForm.vue';

const router = useRouter();

function handleGoToLogin() {
    router.push({ name: 'Login' });
}

async function handleSuccess() {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(2000); // Wait 2 seconds, then redirect to login
    router.push({ name: 'Login' });
}
</script>

<style scoped></style>
