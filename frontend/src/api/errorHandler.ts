import { type Ref } from 'vue';
import { getAuthContext } from '@/modules/auth/auth.helpers';
import { useAuth } from '@/modules/auth/useAuth';

export type ApiErrorType = 'auth' | 'network' | 'validation' | 'server' | 'cancelled' | 'unknown'

export class ApiError extends Error {
	name = 'ApiError';
	type: ApiErrorType;
	originalError: unknown;
	shouldLog: boolean;

	constructor(message: string, type: ApiErrorType, originalError: unknown = null, shouldLog = true) {
		super(message);
		this.type = type;
		this.originalError = originalError;
		this.shouldLog = shouldLog;
	};
}

type ErrorContext = {
	operation?: string;
	entity?: string;
}


/**
 * Error handler for API operations
 * @param {Error} error - Original error from API call
 * @param {Object} context - Context information
 * @param {string} context.operation - What operation was being performed
 * @param {string} context.entity - What entity (jobs, locations, etc.)
 * @returns {ApiError} - Standardized error object
 */
export function handleApiError(
    error: any, 
    context: ErrorContext = {}
): ApiError {
	const { operation = 'unknown operation', entity = 'data' } = context;

    // Handle request cancellation (don't treat as real errors)
	if (isRequestCancelled(error)) {
		console.log(`${entity} ${operation} request was cancelled`);
		return new ApiError(`${operation} was cancelled`, 'cancelled', error, false);
	}

    // Handle authentication errors
	if (isAuthError(error)) {
		console.error(`Auth error during [${entity}] ${operation}:`, error);
		// Use store directly for forceLogout - this is internal to errorHandler
		const auth = useAuth();
		auth.forceLogout('Authentication failed');
		return new ApiError('Authentication required. Please log in again.', 'auth', error);
	}

    // Handle validation errors
	if (isValidationError(error)) {
		const message = extractValidationMessage(error);
		console.warn(`Validation error during ${entity} ${operation}:`, message);
		return new ApiError(message, 'validation', error);
	}

    // Handle network errors
	if (isNetworkError(error)) {
		console.error(`Network error during [${entity}] ${operation}:`, error);
		return new ApiError('Network error. Please check your connection and try again.', 'network', error);
	}

    // Handle server errors
	if (isServerError(error)) {
		const message = extractServerMessage(error)
		console.error(`Server error during [${entity}] ${operation}:`, error)
		return new ApiError(message || `Failed to ${operation}`, 'server', error)
	}

	console.error(`Error during ${entity} ${operation}:`, error)
	return new ApiError(error?.message || `Failed to ${operation}`, 'unknown', error)
}

/**
 * Check if error is due to request cancellation
 * @param {Error} error - Original error from API call
 * @returns {boolean} - True if request was cancelled
 */
function isRequestCancelled(error: any): boolean {
	return (
        error?.name === 'AbortError' || 
        error?.code === 'NS_BINDING_ABORTED' || 
        error?.code === 'ECONNABORTED'
    );
}

/**
 * Check if error is authentication-related
 * @param {Error} error - Original error from API call
 * @returns {boolean} - True if error is authentication-related
 */
function isAuthError(error: any): boolean {
	if (
		error?.code === 'PGRST301' ||
		error?.message?.includes('JWT') ||
		error?.message?.includes('authentication') ||
		error?.message?.includes('User not authenticated')
	) {
		return true
	}
	if (error?.response?.status === 401) {
		return true
	}
	return false
}

function isValidationError(error: any): boolean {
	return (
		error?.response?.status === 400 ||
		error?.response?.status === 422 ||
		error?.message?.includes('required') ||
		error?.message?.includes('validation')
	)
}


/**
 * Check if error is network-related
 * @param {Error} error - Original error from API call
 * @returns {boolean} - True if error is network-related
 */
function isNetworkError(error: any): boolean {
	return (
        !error?.response || 
        error?.code === 'NETWORK_ERROR' || 
        error?.code === 'ENOTFOUND' || 
        error?.code === 'ECONNREFUSED'
    );
}

/**
 * Check if error is server-related
 * @param {Error} error - Original error from API call
 * @returns {boolean} - True if error is server-related
 */
function isServerError(error: any): boolean {
	return (
        (error?.response?.status as number | undefined) !== undefined && 
        error.response.status >= 500
    );
}

function extractValidationMessage(error: any): string {
	if (error?.details) return error.details
	if (error?.response?.data?.detail) return error.response.data.detail
	if (error?.response?.data?.message) return error.response.data.message
	return error?.message || 'Validation failed'
}

function extractServerMessage(error: any): string {
	if (error?.message) return error.message
	if (error?.response?.data?.detail) return error.response.data.detail
	if (error?.response?.data?.error) return error.response.data.error
	return 'Server error occurred'
}

interface WithErrorHandlingOptions {
	raw?: boolean;
}

export async function withErrorHandling<T>(
	apiCall: () => Promise<T>,
	context: ErrorContext,
	refs: { loading?: Ref<boolean>; error?: Ref<string | null> } = {},
	options: WithErrorHandlingOptions = {}
): Promise<T> {
	const { loading, error } = refs
	try {
		if (loading) loading.value = true;
		if (error) error.value = null;

		return await apiCall();
	} catch (err: any) {
		const originalError = err instanceof Error ? err : new Error(String(err));
		const apiError = handleApiError(err, context);
		if (error && apiError.shouldLog) {
			error.value = apiError.message
		}

		if (apiError.type === 'cancelled') {
			// We now actually throw the original error, so it can be handled by the caller
			throw originalError;
		}
		if (options.raw) {
			console.error("Raw error:", originalError);
			console.error("API error:", apiError);
			throw originalError || apiError;
		}
		throw apiError;
	} finally {
		if (loading) loading.value = false
	}
}

/**
 * Check if user is authenticated before performing an action
 * @param {string} operation - Operation name for error messages
 * @returns {void} - Throws an error if user is not authenticated
 */
export function requireAuth(operation: string = 'perform this action'): void {
	const authContext = getAuthContext();
	if (!authContext) {
		throw new ApiError(`User not authenticated to ${operation}`, 'auth');
	}
}

