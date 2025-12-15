// Stateless API for authentication

import { supabase } from '@/lib/supabaseClient';
import { withErrorHandling } from '@/api/errorHandler';

import type {
	Session, User, AuthResponse,
	SignInWithPasswordCredentials, SignUpWithPasswordCredentials,
	AuthResponsePassword, SignOut,
	ResetPasswordInput, UpdatePasswordInput,
	SignInWithOAuthCredentials,
} from '@/modules/auth/auth.types';


const ENTITY_NAME = 'auth';

/**
 * Calls Supabase's password-based sign-in endpoint.
 * The caller is responsible for passing any captcha tokens or other options.
 */
export async function signInWithPassword(
    credentials: SignInWithPasswordCredentials
): Promise<AuthResponsePassword['data']> {
	
	const operation = '[auth] sign in with password';
	const result = await withErrorHandling(
		async () => {
			const authResponse = await supabase.auth.signInWithPassword(credentials);
			if (authResponse.error) throw authResponse.error;
			return authResponse.data as AuthResponsePassword['data'];
		},
		{ operation, entity: ENTITY_NAME },
		undefined,
		{ raw: true }
	);

	if (!result) throw new Error('Sign in with password was unsuccessful');
	return result;
}

/**
 * Wraps Supabase's password-based registration call.
 * Pass feature-specific redirect URLs via credentials.options.emailRedirectTo.
 */
export async function signUpWithPassword(
	credentials: SignUpWithPasswordCredentials): 
Promise<AuthResponse['data']> {
	const operation = 'register with password';

	const result = await withErrorHandling(
		async () => {
			const authResponse = await supabase.auth.signUp(credentials);
			if (authResponse.error) throw authResponse.error;
			return authResponse.data as AuthResponse['data'];
		},
		{ operation, entity: ENTITY_NAME },
		undefined,
		{ raw: true }
	);

	if (!result) throw new Error('Registration was cancelled');
	return result;
}

/** Forwards the sign-out request to Supabase. */
export async function signOut(signoutOptions?: SignOut): Promise<void> {
	const operation = 'sign out';

	await withErrorHandling(
		async () => {
			const { error } = await supabase.auth.signOut(signoutOptions);
			if (error) throw error;
		},
		{ operation, entity: ENTITY_NAME },
		undefined,
		{ raw: true }
	);
}

/**
 * Sends a password reset email.
 * The caller must provide a fully-qualified redirect URL in input.redirectTo.
 */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
	const operation = 'reset password';

	await withErrorHandling(
		async () => {
			const { error } = await supabase.auth.resetPasswordForEmail(
				input.email,
				{
					redirectTo: input.redirectTo,
				}
			);
			if (error) throw error;
		},
		{ operation, entity: ENTITY_NAME },
		undefined,
		{ raw: true }
	);
}

/** Updates the authenticated user's password. */
export async function updatePassword(
	input: UpdatePasswordInput
): Promise<{ user: User | null }> {
	const operation = 'update password';

	const result = await withErrorHandling(
		async () => {
			const { data, error } = await supabase.auth.updateUser({
				password: input.password,
			});
			if (error) throw error;

			return { user: data.user } as { user: User | null };
		},
		{ operation, entity: ENTITY_NAME },
		undefined,
		{ raw: true } 
    );

	if (!result) throw new Error('Password update was cancelled');
	return result;
}

/**
 * Initiates OAuth sign-in with the specified provider.
 * This will redirect the user to the OAuth provider's login page.
 */
export async function signInWithOAuth(credentials: SignInWithOAuthCredentials): Promise<void> {
	const operation = '[auth] sign in with OAuth';

	await withErrorHandling(
		async () => {
			const { error } = await supabase.auth.signInWithOAuth(credentials);
			if (error) throw error;
		},
		{ operation, entity: ENTITY_NAME },
		undefined,
		{ raw: true }
	);
}

/**
 * Retrieves the current session (if any).
 * Returns null when no session is active.
 */
export async function getSession(): Promise<Session | null> {
	const operation = 'get session';

	const result = await withErrorHandling(
		async () => {
			const sessionResponse = await supabase.auth.getSession();
			if (sessionResponse.error) throw sessionResponse.error;
			return {
				session: sessionResponse.data.session as Session | null,
			};
		},
		{ operation, entity: ENTITY_NAME },
		undefined,
		{ raw: true }
	);

	if (!result) throw new Error('Get session was cancelled');
	return result.session;
}
