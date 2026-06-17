// Stateless API for aircraft flight totals (read-only view)

import { supabase } from '@/lib/supabaseClient'
import { withErrorHandling, requireAuth } from '@/api/errorHandler'
import { useAuthStore } from '@/features/auth/auth.store'

const ENTITY_NAME = 'aircraft_flight_totals'

// DB row (snake_case)
interface AircraftFlightTotalRow {
  aircraft_id: string
  total_flight_minutes: number | null
  total_flight_legs: number
}

// App-facing model (camelCase)
export interface AircraftFlightTotal {
  aircraftId: string
  totalFlightMinutes: number | null
  totalFlightLegs: number
}

function mapRowToData(row: AircraftFlightTotalRow): AircraftFlightTotal {
  return {
    aircraftId: row.aircraft_id,
    totalFlightMinutes: row.total_flight_minutes,
    totalFlightLegs: row.total_flight_legs,
  }
}

// List all aircraft flight totals
export async function getAircraftFlightTotals(): Promise<AircraftFlightTotal[]> {
  const authStore = useAuthStore()
  const operation = 'list aircraft flight totals'
  requireAuth(authStore, operation)

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from(ENTITY_NAME)
      .select('*')

    if (error) throw error
    return (data as AircraftFlightTotalRow[]).map(mapRowToData)
  }, { operation, entity: ENTITY_NAME, authStore })

  return result ?? []
}

// Get flight total for a single aircraft
export async function getAircraftFlightTotal(aircraftId: string): Promise<AircraftFlightTotal | null> {
  const authStore = useAuthStore()
  const operation = 'get aircraft flight total'
  requireAuth(authStore, operation)

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from(ENTITY_NAME)
      .select('*')
      .eq('aircraft_id', aircraftId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return mapRowToData(data as AircraftFlightTotalRow)
  }, { operation, entity: ENTITY_NAME, authStore })

  return result ?? null
}
