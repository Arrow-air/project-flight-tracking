// Stateless API for flight notes (scoped to author)

import { supabase } from '@/lib/supabaseClient'
import { withErrorHandling, requireAuth } from '@/api/errorHandler'
import { useAuthStore } from '@/stores/auth.store'

const ENTITY_NAME = 'flight_notes'

// Enum type (sync with DB)
export type FlightNoteType = 'pilot' | 'admin' | 'engineer' | 'witness' | 'other';

// DB row (snake_case)
export interface FlightNoteRow {
	id: string
	created_at: string
	updated_at: string
	author_id: string
	flight_leg_id: string
	notes: string | null
	note_type: FlightNoteType
	user_profiles?: { full_name: string } | null
}

// App-facing model (camelCase)
export interface FlightNoteData {
	id: string
	createdAt: string
	updatedAt: string
	authorId: string
	flightLegId: string
	notes: string | null
	noteType: FlightNoteType
	authorName?: string | null
}

export type CreateFlightNoteInput = {
	noteType: FlightNoteType
	notes?: string | null
}

export type UpdateFlightNoteInput = {
	noteType?: FlightNoteType
	notes?: string | null
}

function mapRowToData(row: FlightNoteRow): FlightNoteData {
	return {
		id: row.id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		authorId: row.author_id,
		flightLegId: row.flight_leg_id,
		notes: row.notes,
		noteType: row.note_type,
		authorName: row.user_profiles?.full_name ?? null,
	}
}

// List notes for a flight leg; default newest first; optional type filter
export async function listFlightNotes(
	flightLegId: string,
	options: { type?: FlightNoteType; order?: 'asc' | 'desc' } = {}
): Promise<FlightNoteData[]> {
	const authStore = useAuthStore()
	const operation = 'list flight notes'
	requireAuth(authStore, operation)
	if (!flightLegId) throw new Error('flightLegId is required')

	const result = await withErrorHandling(async () => {
		let query = supabase
			.from(ENTITY_NAME)
			.select('*, user_profiles(full_name)')
			.eq('flight_leg_id', flightLegId)
			.eq('author_id', authStore.userId)
			.order('created_at', { ascending: options.order === 'asc' ? true : false })

		if (options.type) query = query.eq('note_type', options.type)

		const { data, error } = await query
		if (error) throw error
		return (data as FlightNoteRow[]).map(mapRowToData)
	}, { operation, entity: ENTITY_NAME, authStore })

	return result ?? []
}

export async function getFlightNote(id: string): Promise<FlightNoteData> {
	const authStore = useAuthStore()
	const operation = 'get flight note'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.select('*, user_profiles(full_name)')
			.eq('id', id)
			.eq('author_id', authStore.userId)
			.single()

		if (error) throw error
		return mapRowToData(data as FlightNoteRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

export async function createFlightNote(
	flightLegId: string,
	input: CreateFlightNoteInput
): Promise<FlightNoteData> {
	const authStore = useAuthStore()
	const operation = 'create flight note'
	requireAuth(authStore, operation)
	if (!flightLegId) throw new Error('flightLegId is required')
	if (!input?.noteType) throw new Error('noteType is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.insert([
				{
					author_id: authStore.userId,
					flight_leg_id: flightLegId,
					notes: input.notes ?? null,
					note_type: input.noteType,
				},
			])
			.select('*')
			.single()

		if (error) throw error
		return mapRowToData(data as FlightNoteRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

export async function updateFlightNote(id: string, input: UpdateFlightNoteInput): Promise<FlightNoteData> {
	const authStore = useAuthStore()
	const operation = 'update flight note'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	const payload: Partial<FlightNoteRow> = {
		notes: input.notes ?? (undefined as any),
		note_type: input.noteType ?? (undefined as any),
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
		return mapRowToData(data as FlightNoteRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

export async function deleteFlightNote(id: string): Promise<void> {
	const authStore = useAuthStore()
	const operation = 'delete flight note'
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


