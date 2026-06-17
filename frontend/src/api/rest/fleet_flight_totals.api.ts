// Stateless API for fleet-wide flight totals (read-only view)

import { supabase } from '@/lib/supabaseClient'
import { withErrorHandling, requireAuth } from '@/api/errorHandler'
import { useAuthStore } from '@/features/auth/auth.store'

const ENTITY_NAME = 'fleet_flight_totals'

// DB row (snake_case)
interface FleetFlightTotalRow {
  total_flight_minutes: number | null
  aircraft_with_logs: number
  total_aircraft: number
  total_flight_legs: number
}

// App-facing model (camelCase)
export interface FleetFlightTotal {
  totalFlightMinutes: number | null
  aircraftWithLogs: number
  totalAircraft: number
  totalFlightLegs: number
}

function mapRowToData(row: FleetFlightTotalRow): FleetFlightTotal {
  return {
    totalFlightMinutes: row.total_flight_minutes,
    aircraftWithLogs: row.aircraft_with_logs,
    totalAircraft: row.total_aircraft,
    totalFlightLegs: row.total_flight_legs,
  }
}

// Get fleet-wide flight totals
export async function getFleetFlightTotals(): Promise<FleetFlightTotal | null> {
  const authStore = useAuthStore()
  const operation = 'get fleet flight totals'
  requireAuth(authStore, operation)

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from(ENTITY_NAME)
      .select('*')
      .single()

    if (error) throw error
    return mapRowToData(data as FleetFlightTotalRow)
  }, { operation, entity: ENTITY_NAME, authStore })

  return result ?? null
}
