// Stateless API for flight leg logs: storage + DB metadata

import { supabase } from '@/lib/supabaseClient'
import { withErrorHandling, requireAuth } from '@/api/errorHandler'
import { useAuthStore } from '@/stores/auth.store'

const ENTITY_NAME = 'flight_leg_logs'
const DEFAULT_BUCKET = 'flight_logs'

export interface FlightLogRow {
	id: string
	created_at: string
	updated_at: string
	flight_leg_id: string
	uploaded_by_id: string
	size_bytes: number | null
	bucket: string
	object_path: string
	content_type: string | null
	checksum_sha256: string | null
	user_profiles?: { full_name: string } | null
}

export interface FlightLogData {
	id: string
	createdAt: string
	updatedAt: string
	flightLegId: string
	uploadedById: string
	uploadedByName?: string | null
	sizeBytes: number | null
	bucket: string
	objectPath: string
	contentType: string | null
	checksumSha256: string | null
}

function mapRowToData(row: FlightLogRow): FlightLogData {
	return {
		id: row.id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		flightLegId: row.flight_leg_id,
		uploadedById: row.uploaded_by_id,
		uploadedByName: row.user_profiles?.full_name ?? null,
		sizeBytes: row.size_bytes,
		bucket: row.bucket,
		objectPath: row.object_path,
		contentType: row.content_type,
		checksumSha256: row.checksum_sha256,
	}
}

export async function listFlightLogs(
	flightLegId: string,
	options: { order?: 'asc' | 'desc' } = {}
): Promise<FlightLogData[]> {
	const authStore = useAuthStore()
	const operation = 'list flight logs'
	requireAuth(authStore, operation)
	if (!flightLegId) throw new Error('flightLegId is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.select('*, user_profiles(full_name)')
			.eq('flight_leg_id', flightLegId)
			.eq('uploaded_by_id', authStore.userId)
			.order('created_at', { ascending: options.order === 'asc' ? true : false })

		if (error) throw error
		return (data as FlightLogRow[]).map(mapRowToData)
	}, { operation, entity: ENTITY_NAME, authStore })

	return result ?? []
}

export async function getFlightLog(id: string): Promise<FlightLogData> {
	const authStore = useAuthStore()
	const operation = 'get flight log'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.select('*, user_profiles(full_name)')
			.eq('id', id)
			.eq('uploaded_by_id', authStore.userId)
			.single()

		if (error) throw error
		return mapRowToData(data as FlightLogRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

async function computeSha256Hex(file: File): Promise<string> {
	const buffer = await file.arrayBuffer()
	// @ts-ignore - subtle exists in modern browsers
	const digest = await crypto.subtle.digest('SHA-256', buffer)
	const bytes = new Uint8Array(digest as ArrayBuffer)
	return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function safeFilename(name: string) {
    const dot = name.lastIndexOf('.')
    const base = (dot > -1 ? name.slice(0, dot) : name)
      .normalize('NFKD')
      .replace(/[^\w.-]+/g, '-')   // collapse weird chars
      .replace(/-+/g, '-')         // collapse repeats
      .replace(/^-|-$/g, '')       // trim dashes
      .toLowerCase()
    const ext = dot > -1 ? name.slice(dot).toLowerCase() : ''
    const trimmed = base.length > 60 ? base.slice(-60) : base
    return `${trimmed}${ext || ''}`
}

export async function uploadFlightLog(
	flightLegId: string,
	file: File,
	options: { bucket?: string } = {}
): Promise<FlightLogData> {
	const authStore = useAuthStore()
	const operation = 'upload flight log'
	requireAuth(authStore, operation);
	if (!flightLegId) throw new Error('flightLegId is required');
	if (!file) throw new Error('file is required');

	const bucket = options.bucket || DEFAULT_BUCKET

    const safe = safeFilename(file.name)           // e.g. "2025-08-13-flight1.bin"
    const date = new Date()
    const yyyy = String(date.getFullYear())
    const mm   = String(date.getMonth() + 1).padStart(2, '0')
    const dd   = String(date.getDate()).padStart(2, '0')

    const objectPath = `${authStore.userId}/${flightLegId}/${yyyy}/${mm}/${dd}/${crypto.randomUUID()}_${safe}`
	const contentType = file.type || 'application/octet-stream'
	const sizeBytes = file.size
	let checksumSha256: string | null = null

	const result = await withErrorHandling(async () => {
		try {
			checksumSha256 = await computeSha256Hex(file)
		} catch (_e) {
			checksumSha256 = null
		}

		const { error: uploadError } = await supabase
			.storage
			.from(bucket)
			.upload(objectPath, file, { contentType, upsert: false })

		if (uploadError) throw uploadError

		const { data, error } = await supabase
			.from(ENTITY_NAME)
			.insert([
				{
					flight_leg_id: flightLegId,
					uploaded_by_id: authStore.userId,
					size_bytes: sizeBytes,
					bucket,
					object_path: objectPath,
					content_type: contentType,
					checksum_sha256: checksumSha256,
				},
			])
			.select('*, user_profiles(full_name)')
			.single()

		if (error) throw error
		return mapRowToData(data as FlightLogRow)
	}, { operation, entity: ENTITY_NAME, authStore })

	if (!result) throw new Error('Operation cancelled')
	return result
}

export async function deleteFlightLog(id: string): Promise<void> {
	const authStore = useAuthStore()
	const operation = 'delete flight log'
	requireAuth(authStore, operation)
	if (!id) throw new Error('id is required')

	await withErrorHandling(async () => {
		// Get object path first
		const { data: row, error: selErr } = await supabase
			.from(ENTITY_NAME)
			.select('*')
			.eq('id', id)
			.eq('uploaded_by_id', authStore.userId)
			.single()
		if (selErr) throw selErr

		const bucket = (row as FlightLogRow).bucket || DEFAULT_BUCKET
		const objectPath = (row as FlightLogRow).object_path

		const { error: delStorageErr } = await supabase.storage.from(bucket).remove([objectPath])
		if (delStorageErr) throw delStorageErr

		const { error } = await supabase
			.from(ENTITY_NAME)
			.delete()
			.eq('id', id)
			.eq('uploaded_by_id', authStore.userId)
		if (error) throw error
	}, { operation, entity: ENTITY_NAME, authStore })
}

export async function getSignedUrl(objectPath: string, expiresInSeconds = 3600, bucket = DEFAULT_BUCKET): Promise<string> {
	const operation = 'get signed url'
	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectPath, expiresInSeconds)
		if (error) throw error
		return data?.signedUrl || ''
	}, { operation, entity: ENTITY_NAME })
	return result || ''
}


