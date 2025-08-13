// Stateless API for aircraft maintenance logs

import { supabase } from '@/lib/supabaseClient'
import { withErrorHandling, requireAuth } from '@/api/errorHandler'
import { useAuthStore } from '@/stores/auth.store'

const ENTITY_NAME = 'aircraft_maintenance_log'

// Matches public.maintenance_log_type enum
export type MaintenanceLogType =
	| 'build'
	| 'maintenance'
	| 'upgrade'
	| 'repair'
	| 'trouble-shooting'
	| 'ground-run'
	| 'other'

// DB row (snake_case)
export interface MaintenanceLogRow {
	id: string
	created_at: string
	updated_at: string
	author_id: string | null
	aircraft_id: string
	log_type: MaintenanceLogType
	notes: string | null
}

// App-facing model (camelCase)
export interface MaintenanceLogData {
	id: string
	createdAt: string
	updatedAt: string
	authorId: string | null
	aircraftId: string
	logType: MaintenanceLogType
	notes: string | null
}

export type CreateMaintenanceLogInput = {
	logType: MaintenanceLogType
	notes?: string | null
}

export type UpdateMaintenanceLogInput = {
	logType?: MaintenanceLogType
	notes?: string | null
}

function mapRowToData(row: MaintenanceLogRow): MaintenanceLogData {
	return {
		id: row.id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		authorId: row.author_id,
		aircraftId: row.aircraft_id,
		logType: row.log_type,
		notes: row.notes,
	}
}

// List logs for an aircraft with optional type filter and sort order (default newest -> oldest)
export async function listMaintenanceLogs(
	aircraftId: string,
	options: { type?: MaintenanceLogType; order?: 'asc' | 'desc' } = {}
): Promise<MaintenanceLogData[]> {
	const authStore = useAuthStore()
	const operation = 'list maintenance logs'
	requireAuth(authStore, operation)
	if (!aircraftId) throw new Error('aircraftId is required')

	const result = await withErrorHandling(async () => {
		let query = supabase
			.from(ENTITY_NAME)
			.select('*')
			.eq('aircraft_id', aircraftId)
			.order('created_at', { ascending: options.order === 'asc' ? true : false })

		if (options.type) {
			query = query.eq('log_type', options.type)
		}

		const { data, error } = await query
		if (error) throw error
		return (data as MaintenanceLogRow[]).map(mapRowToData)
	}, { operation, entity: ENTITY_NAME, authStore })

	return result ?? []
}

// Get a single log by id
export async function getMaintenanceLog(id: string): Promise<MaintenanceLogData> {
	const authStore = useAuthStore()
	const operation = 'get maintenance log'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.select('*')
			.eq('id', id)
			.single()

		if (error) throw error
		return mapRowToData(data as MaintenanceLogRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Create a new maintenance log for an aircraft
export async function createMaintenanceLog(
	aircraftId: string,
	input: CreateMaintenanceLogInput
): Promise<MaintenanceLogData> {
	const authStore = useAuthStore()
	const operation = 'create maintenance log'
	requireAuth(authStore, operation)
	if (!aircraftId) throw new Error('aircraftId is required')
	if (!input?.logType) throw new Error('logType is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.insert([
				{
					aircraft_id: aircraftId,
					author_id: authStore.userId,
					log_type: input.logType,
					notes: input.notes ?? null,
				},
			])
			.select('*')
			.single()

		if (error) throw error
		return mapRowToData(data as MaintenanceLogRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Update an existing maintenance log (author can update own logs)
export async function updateMaintenanceLog(
	id: string,
	input: UpdateMaintenanceLogInput
): Promise<MaintenanceLogData> {
	const authStore = useAuthStore()
	const operation = 'update maintenance log'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	const payload: Partial<MaintenanceLogRow> = {
		log_type: input.logType ?? (undefined as any),
		notes: input.notes ?? (undefined as any),
	}

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.update(payload)
			.eq('id', id)
			.eq('author_id', authStore.userId)
			.select('*')
			.single()

		if (error) throw error
		return mapRowToData(data as MaintenanceLogRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Delete a maintenance log (author can delete own logs)
export async function deleteMaintenanceLog(id: string): Promise<void> {
	const authStore = useAuthStore()
	const operation = 'delete maintenance log'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	await withErrorHandling(async () => {
		const { error } = await supabase
			.from(ENTITY_NAME)
			.delete()
			.eq('id', id)
			.eq('author_id', authStore.userId)

		if (error) throw error
	}, { operation, entity: ENTITY_NAME, authStore })
}


