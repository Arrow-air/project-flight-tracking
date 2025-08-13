// Stateless API for aircraft data

import { supabase } from '@/lib/supabaseClient';
import { withErrorHandling, requireAuth } from '@/api/errorHandler';
import { useAuthStore } from '@/stores/auth.store';

const ENTITY_NAME = 'aircraft'

// Database row shape (snake_case) from Supabase
export interface AircraftRow {
	id: string
	created_at: string
	updated_at: string
	owner_id: string | null
	name: string | null
	aircraft_type: string | null
	notes: string | null
	serial_number: string
}

// App-facing shape (camelCase)
export interface AircraftData {
	id: string
	createdAt: string
	updatedAt: string
	ownerId: string | null
	name: string | null
	aircraftType: string | null
	notes: string | null
	serialNumber: string
}

export type CreateAircraftInput = {
	name?: string | null
	aircraftType?: string | null
	notes?: string | null
	serialNumber: string
}

export type UpdateAircraftInput = Partial<CreateAircraftInput>;

function mapRowToData(row: AircraftRow): AircraftData {
	return {
		id: row.id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		ownerId: row.owner_id,
		name: row.name,
		aircraftType: row.aircraft_type,
		notes: row.notes,
		serialNumber: row.serial_number,
	}
}

// List current user's aircraft
export async function listAircraft(): Promise<AircraftData[]> {
	const authStore = useAuthStore()
	const operation = 'list aircraft'
	requireAuth(authStore, operation)

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from('aircraft')
			.select('*')
			.eq('owner_id', authStore.userId) // TODO: Should be only aircraft privileged to see (admin, self, etc.)
			.order('updated_at', { ascending: false })

		if (error) throw error
		return (data as AircraftRow[]).map(mapRowToData)
	}, { operation, entity: ENTITY_NAME, authStore })

	return result ?? []
}

// Get one by id
export async function getAircraft(id: string): Promise<AircraftData> {
	const authStore = useAuthStore()
	const operation = 'get aircraft'
	requireAuth(authStore, operation)

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from('aircraft')
			.select('*')
			.eq('id', id)
			.eq('owner_id', authStore.userId)
			.single()

		if (error) throw error
		return mapRowToData(data as AircraftRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Create new aircraft
export async function createAircraft(input: CreateAircraftInput): Promise<AircraftData> {
	const authStore = useAuthStore()
	const operation = 'create aircraft'
	requireAuth(authStore, operation)

	if (!input?.serialNumber) throw new Error('serialNumber is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from('aircraft')
			.insert([
				{
					name: input.name ?? null,
					aircraft_type: input.aircraftType ?? null,
					notes: input.notes ?? null,
					serial_number: input.serialNumber,
					owner_id: authStore.userId,
				},
			])
			.select('*')
			.single()

		if (error) throw error
		return mapRowToData(data as AircraftRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Update aircraft (only own records)
export async function updateAircraft(id: string, input: UpdateAircraftInput): Promise<AircraftData> {
	const authStore = useAuthStore()
	const operation = 'update aircraft'
	requireAuth(authStore, operation)

	const payload: Partial<AircraftRow> = {
		name: input.name ?? undefined as any,
		aircraft_type: input.aircraftType ?? undefined as any,
		notes: input.notes ?? undefined as any,
		serial_number: input.serialNumber ?? undefined as any,
	}

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from('aircraft')
			.update(payload)
			.eq('id', id)
			.eq('owner_id', authStore.userId)
			.select('*')
			.single()

		if (error) throw error
		return mapRowToData(data as AircraftRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

// Delete aircraft (only own records)
export async function deleteAircraft(id: string): Promise<void> {
	const authStore = useAuthStore()
	const operation = 'delete aircraft'
	requireAuth(authStore, operation)

	await withErrorHandling(async () => {
		const { error } = await supabase
			.from('aircraft')
			.delete()
			.eq('id', id)
			.eq('owner_id', authStore.userId)

		if (error) throw error
	}, { operation, entity: ENTITY_NAME, authStore })
}

