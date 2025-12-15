<template>
    <button 
        :class="buttonClasses"
        :disabled="loading || disabled"
        @click="handleGitHubLogin" 
        v-bind="$attrs"
    >
        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
        <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span>{{ loading ? loadingText : buttonText }}</span>
    </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '@/modules/auth/useAuth';
import type { SignInWithOAuthCredentials, OAuthProvider } from '@/modules/auth/auth.types';

const props = withDefaults(
    defineProps<{
        color?: string;
        variant?: 'outline' | 'ghost' | 'link';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
        buttonText?: string;
        loadingText?: string;
        redirectTo?: string;
    }>(),
    {
        color: 'neutral',
        variant: undefined,
        size: 'md',
        disabled: false,
        buttonText: 'Continue with GitHub',
        loadingText: 'Redirecting...',
        redirectTo: undefined,
    }
);

const emit = defineEmits<{
    (e: 'success'): void;
    (e: 'error', message: string): void;
}>();

const { signInWithOAuth } = useAuth();
const loading = ref(false);

const buttonClasses = computed(() => {
    const classes = ['btn', 'gap-2'];
    
    // Add variant classes
    if (props.variant === 'outline') {
        classes.push('btn-outline');
    } else if (props.variant === 'ghost') {
        classes.push('btn-ghost');
    } else if (props.variant === 'link') {
        classes.push('btn-link');
    }
    
    // Add color classes
    classes.push(`btn-${props.color}`);
    
    // Add size classes
    if (props.size === 'sm') {
        classes.push('btn-sm');
    } else if (props.size === 'lg') {
        classes.push('btn-lg');
    }
    
    return classes.join(' ');
});

async function handleGitHubLogin() {
    try {
        loading.value = true;

        const provider: OAuthProvider = 'github';
        // const redirectTo = props.redirectTo ?? undefined;
        // const redirectTo = undefined;
        // Construct the redirectTo URL - this is where Supabase redirects AFTER OAuth completes
        // For local dev, use the current origin; otherwise use the configured site URL
        // const redirectTo = props.redirectTo || 
        //   (import.meta.env.DEV 
        //     ? window.location.origin 
        //     : import.meta.env.VITE_SITE_URL || window.location.origin);

        const credentials: SignInWithOAuthCredentials = {
            provider,
            // options: {
            //   redirectTo,
            // },
        };
        await signInWithOAuth(credentials);
        // Note: OAuth will redirect the user, so we emit success
        // The actual authentication will be handled by the auth state change listener
        emit('success');
    } catch (err) {
        const message =
            err instanceof Error
                ? err.message
                : 'GitHub login failed. Please try again.';
        emit('error', message);
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped></style>
