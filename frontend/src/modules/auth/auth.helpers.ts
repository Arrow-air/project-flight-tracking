// Pure helper functions for authentication checks
// These can be used in API files without Vue reactivity

import { useAuthStore } from './auth.store';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContext {
    userId: string;
    user: User;
    session: Session;
    isAuthenticated: true;
}

// Helper to build a canonical application URL for Supabase redirects.
function getRedirectURL(basePath: string = ''): string {
    const rawBase =
        import.meta.env.VITE_SITE_URL ??
        import.meta.env.VITE_VERCEL_URL ??
        window.location.origin ??
        'http://localhost:3000';

    const normalizedBase = rawBase.startsWith('http')
        ? rawBase
        : `https://${rawBase}`;

    const trimmedBase = normalizedBase.endsWith('/')
        ? normalizedBase.slice(0, -1)
        : normalizedBase;

    const normalizedPath = basePath.startsWith('/')
        ? basePath
        : `/${basePath}`;

    return `${trimmedBase}${normalizedPath}`;
}

/** Default confirm-email redirect for Supabase sign-up links. */
export function getAuthEmailRedirectURL(): string {
    return getRedirectURL('/auth/callback');
}

/** Default password-reset redirect for Supabase recovery links. */
export function getPasswordResetRedirectURL(): string {
    return getRedirectURL('/reset-password');
}

/**
 * Ensures the user is authenticated, throwing an error if not
 * @param operation - Operation name for error messages
 * @returns Auth context with userId, user, and session
 * @throws Error if user is not authenticated
 */
export function ensureAuthenticated(operation: string = 'perform this action'): AuthContext {
    const store = useAuthStore();

    if (!store.isAuthenticated || !store.user || !store.session || !store.userId) {
        throw new Error(`User not authenticated to ${operation}`);
    }

    return {
        userId: store.userId,
        user: store.user,
        session: store.session,
        isAuthenticated: true as const,
    };
}

/**
 * Gets the current authentication context without throwing
 * @returns Auth context if authenticated, null otherwise
 */
export function getAuthContext(): AuthContext | null {
    const store = useAuthStore();

    if (!store.isAuthenticated
        || !store.user
        || !store.session
        || !store.userId
    ) {
        return null;
    }

    return {
        userId: store.userId,
        user: store.user,
        session: store.session,
        isAuthenticated: true as const,
    };
}

/**
 * Gets the current user ID if authenticated
 * @returns User ID or null
 */
export function getUserId(): string | null {
    const store = useAuthStore();
    return store.isAuthenticated ? store.userId : null;
}

