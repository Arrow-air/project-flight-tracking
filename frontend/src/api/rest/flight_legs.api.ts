// Stateless API for flight legs (user-scoped via pilot_id)

import { supabase } from '@/lib/supabaseClient'
import { withErrorHandling, requireAuth } from '@/api/errorHandler'
import { useAuthStore } from '@/stores/auth.store'

const ENTITY_NAME = 'flight_legs'

// DB row (snake_case)
export interface FlightLegRow {
	id: string
	created_at: string
	updated_at: string
	pilot_id: string
	aircraft_id: string
	location: string | null
	altitude_m: number | null
	temp_c: number | null
	title: string | null
	description: string | null
	user_profiles?: { full_name: string } | null
}

// App-facing model (camelCase)
export interface FlightLegData {
	id: string
	createdAt: string
	updatedAt: string
	pilotId: string
	aircraftId: string
	location: string | null
	altitudeM: number | null
	tempC: number | null
	title: string | null
	description: string | null
	pilotName?: string | null
}

export type CreateFlightLegInput = {
	aircraftId: string
	location?: string | null
	altitudeM?: number | null
	tempC?: number | null
	title?: string | null
	description?: string | null
}

export type UpdateFlightLegInput = {
	aircraftId?: string
	location?: string | null
	altitudeM?: number | null
	tempC?: number | null
	title?: string | null
	description?: string | null
}

function mapRowToData(row: FlightLegRow): FlightLegData {
	return {
		id: row.id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		pilotId: row.pilot_id,
		aircraftId: row.aircraft_id,
		location: row.location,
		altitudeM: row.altitude_m,
		tempC: row.temp_c,
		title: row.title,
		description: row.description,
		pilotName: row.user_profiles?.full_name ?? null,
	}
}

// List current user's flight legs with optional filters and sort
export async function listFlightLegs(options: {
	aircraftId?: string
	order?: 'asc' | 'desc'
} = {}): Promise<FlightLegData[]> {
	const authStore = useAuthStore()
	const operation = 'list flight legs'
	requireAuth(authStore, operation)

	const result = await withErrorHandling(async () => {
		let query = supabase
			.from(ENTITY_NAME)
			.select('*, user_profiles(full_name)')
			.eq('pilot_id', authStore.userId)
			.order('created_at', { ascending: options.order === 'asc' ? true : false })

		if (options.aircraftId) {
			query = query.eq('aircraft_id', options.aircraftId)
		}

		const { data, error } = await query
		if (error) throw error
		return (data as FlightLegRow[]).map(mapRowToData)
	}, { operation, entity: ENTITY_NAME, authStore })

	return result ?? []
}

// Get single flight leg by id
export async function getFlightLeg(id: string): Promise<FlightLegData> {
	const authStore = useAuthStore()
	const operation = 'get flight leg'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.select('*, user_profiles(full_name)')
			.eq('id', id)
			.eq('pilot_id', authStore.userId)
			.single()

		if (error) throw error
		return mapRowToData(data as FlightLegRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Create a flight leg
export async function createFlightLeg(input: CreateFlightLegInput): Promise<FlightLegData> {
	const authStore = useAuthStore()
	const operation = 'create flight leg'
	requireAuth(authStore, operation)
	if (!input?.aircraftId) throw new Error('aircraftId is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.insert([
				{
					pilot_id: authStore.userId,
					aircraft_id: input.aircraftId,
					location: input.location ?? null,
					altitude_m: input.altitudeM ?? null,
					temp_c: input.tempC ?? null,
					title: input.title ?? null,
					description: input.description ?? null,
				},
			])
			.select('*')
			.single()

		if (error) throw error
		return mapRowToData(data as FlightLegRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Update a flight leg (only own records)
export async function updateFlightLeg(id: string, input: UpdateFlightLegInput): Promise<FlightLegData> {
	const authStore = useAuthStore()
	const operation = 'update flight leg'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	const payload: Partial<FlightLegRow> = {
		aircraft_id: input.aircraftId ?? (undefined as any),
		location: input.location ?? (undefined as any),
		altitude_m: input.altitudeM ?? (undefined as any),
		temp_c: input.tempC ?? (undefined as any),
		title: input.title ?? (undefined as any),
		description: input.description ?? (undefined as any),
	}

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.update(payload)
			.eq('id', id)
			.eq('pilot_id', authStore.userId)
			.select('*')
			.single()

		if (error) throw error
		return mapRowToData(data as FlightLegRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Delete a flight leg (only own records)
export async function deleteFlightLeg(id: string): Promise<void> {
	const authStore = useAuthStore()
	const operation = 'delete flight leg'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	await withErrorHandling(async () => {
		const { error } = await supabase
			.from(ENTITY_NAME)
			.delete()
			.eq('id', id)
			.eq('pilot_id', authStore.userId)

		if (error) throw error
	}, { operation, entity: ENTITY_NAME, authStore })
}


