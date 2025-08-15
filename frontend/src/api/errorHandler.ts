import { type Ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

export type ApiErrorType = 'auth' | 'network' | 'validation' | 'server' | 'cancelled' | 'unknown'

export class ApiError extends Error {
	name = 'ApiError'
	type: ApiErrorType
	originalError: unknown
	shouldLog: boolean

	constructor(message: string, type: ApiErrorType, originalError: unknown = null, shouldLog = true) {
		super(message)
		this.type = type
		this.originalError = originalError
		this.shouldLog = shouldLog
	}
}

type ErrorContext = {
	operation?: string
	entity?: string
	authStore?: ReturnType<typeof useAuthStore>
}

export function handleApiError(error: any, context: ErrorContext = {}): ApiError {
	const { operation = 'unknown operation', entity = 'data', authStore } = context
	const auth = authStore || useAuthStore()

	if (isRequestCancelled(error)) {
		console.log(`${entity} ${operation} request was cancelled`)
		return new ApiError(`${operation} was cancelled`, 'cancelled', error, false)
	}

	if (isAuthError(error)) {
		console.error(`Auth error during [${entity}] ${operation}:`, error)
		auth.forceLogout('Authentication failed')
		return new ApiError('Authentication required. Please log in again.', 'auth', error)
	}

	if (isValidationError(error)) {
		const message = extractValidationMessage(error)
		console.warn(`Validation error during ${entity} ${operation}:`, message)
		return new ApiError(message, 'validation', error)
	}

	if (isNetworkError(error)) {
		console.error(`Network error during [${entity}] ${operation}:`, error)
		return new ApiError('Network error. Please check your connection and try again.', 'network', error)
	}

	if (isServerError(error)) {
		const message = extractServerMessage(error)
		console.error(`Server error during [${entity}] ${operation}:`, error)
		return new ApiError(message || `Failed to ${operation}`, 'server', error)
	}

	console.error(`Error during ${entity} ${operation}:`, error)
	return new ApiError(error?.message || `Failed to ${operation}`, 'unknown', error)
}

function isRequestCancelled(error: any): boolean {
	return error?.name === 'AbortError' || error?.code === 'NS_BINDING_ABORTED' || error?.code === 'ECONNABORTED'
}

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

function isNetworkError(error: any): boolean {
	return !error?.response || error?.code === 'NETWORK_ERROR' || error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED'
}

function isServerError(error: any): boolean {
	return (error?.response?.status as number | undefined) !== undefined && error.response.status >= 500
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

export async function withErrorHandling<T>(
	apiCall: () => Promise<T>,
	context: ErrorContext,
	refs: { loading?: Ref<boolean>; error?: Ref<string | null> } = {}
): Promise<T | null> {
	const { loading, error } = refs
	try {
		if (loading) loading.value = true
		if (error) error.value = null
		return await apiCall()
	} catch (err: any) {
		const apiError = handleApiError(err, context)
		if (error && apiError.shouldLog) {
			error.value = apiError.message
		}
		if (apiError.type === 'cancelled') return null
		throw apiError
	} finally {
		if (loading) loading.value = false
	}
}

export function requireAuth(authStore: ReturnType<typeof useAuthStore>, operation = 'perform this action'): void {
	if (!authStore.isAuthenticated) {
		throw new ApiError(`User not authenticated to ${operation}`, 'auth')
	}
}

