<template>
    <section v-if="authLoading">
        <div class="flex items-center justify-center h-screen">
            <p class="text-base-content/70">Loading...</p>
            <div class="loading loading-spinner loading-lg"></div>
        </div>
    </section>
    
    <section v-else class="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div class="flex items-end justify-between">
            <div>
                <h1 class="text-3xl font-bold">Profile</h1>
                <p class="text-base-content/70">Manage your account details and security</p>
            </div>
            <button class="btn" @click="logout" :disabled="authLoading">
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
                            <img alt="User avatar"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                        </div>
                    </div>
                    <div>
                        <div class="font-semibold text-lg">{{ displayName || userEmail || 'User' }}</div>
                        <div class="text-base-content/70">{{ userEmail || '—' }}</div>
                    </div>
                </div>

                <ItemBadge :label="'User ID'" :value="userId ?? ''" copyable />
            </div>
        </div>

        <!-- Update Password -->
        <div class="card bg-base-100 shadow">
            <div class="card-body">
                <AuthUpdatePasswordForm />
            </div>
        </div>

    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/modules/auth/useAuth';

import ItemBadge from '@/components/general/ItemBadge.vue';
import AuthUpdatePasswordForm from '@/modules/auth/components/AuthUpdatePasswordForm.vue';

const { 
    user, loading, userEmail, userId, 
    logout, 
} = useAuth();


const authLoading = computed(() => loading.valueOf() ?? false);
const displayName = computed<string>(() => user?.user_metadata?.full_name ?? '');


</script>

<style scoped></style>
