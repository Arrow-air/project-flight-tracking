// Stateless API for aircraft maintenance logs

import { supabase } from '@/lib/supabaseClient';
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/lib/database.types";
import { withErrorHandling, requireAuth } from '@/api/errorHandler';
import { useAuth } from '@/modules/auth/useAuth';


const ENTITY_NAME = 'aircraft_maintenance_log';

// Imported types from Supabase automatically generated types
export type MaintenanceLogType = Enums<"maintenance_log_type">;
export type MaintenanceLogRow = Tables<"aircraft_maintenance_log">;
export type MaintenanceLogInsert = TablesInsert<"aircraft_maintenance_log">;
export type MaintenanceLogUpdate = TablesUpdate<"aircraft_maintenance_log">;
export type TMaintenanceLogID = Tables<"aircraft_maintenance_log">["id"];


// List logs for an aircraft with optional type filter and sort order (default newest -> oldest)
export async function listMaintenanceLogs(
  aircraftId: string,
  options: { type?: MaintenanceLogType; order?: 'asc' | 'desc' } = {}
): Promise<MaintenanceLogRow[]> {
  const operation = 'list maintenance logs'
  requireAuth(operation)
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

    const { data, error } = await query;
    if (error) throw error;
    return data as MaintenanceLogRow[];
  }, { operation, entity: ENTITY_NAME })

  return result ?? []
}

// Get a single log by id
export async function getMaintenanceLog(
  id: TMaintenanceLogID
): Promise<MaintenanceLogRow> {
  const operation = 'get maintenance log';
  requireAuth(operation);
  if (!id) throw new Error('id is required');

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from(ENTITY_NAME)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error;
    return data as MaintenanceLogRow;
  }, { operation, entity: ENTITY_NAME })

  if (!result) throw new Error('Operation cancelled');
  return result;
}

// Create a new maintenance log for an aircraft
export async function createMaintenanceLog(
  input: MaintenanceLogInsert
): Promise<MaintenanceLogRow> {
  const operation = 'create maintenance log'
  requireAuth(operation)
  if (!input?.aircraft_id) throw new Error('aircraft_id is required')
  if (!input?.log_type) throw new Error('log_type is required')

  input.author_id = useAuth().userId ?? null; // Logged-in user is author

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from(ENTITY_NAME)
      .insert(input)
      .select('*')
      .single();

    if (error) throw error;
    return data as MaintenanceLogRow;
  }, { operation, entity: ENTITY_NAME })

  if (!result) throw new Error('Operation cancelled')
  return result;
}

// Update an existing maintenance log (author can update own logs)
export async function updateMaintenanceLog(
  id: TMaintenanceLogID,
  update: MaintenanceLogUpdate
): Promise<MaintenanceLogRow> {
  const operation = 'update maintenance log'
  requireAuth(operation);
  if (!id) throw new Error('id is required');
  if (update.id && update.id !== id) throw new Error('id mismatch');

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from(ENTITY_NAME)
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error;
    return data as MaintenanceLogRow;
  }, { operation, entity: ENTITY_NAME })

  if (!result) throw new Error('Operation cancelled')
  return result
}

// Delete a maintenance log (author can delete own logs)
export async function deleteMaintenanceLog(id: TMaintenanceLogID): Promise<void> {
  const operation = 'delete maintenance log'
  requireAuth(operation);
  if (!id) throw new Error('id is required')

  await withErrorHandling(async () => {
    const { error } = await supabase
      .from(ENTITY_NAME)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error
  }, { operation, entity: ENTITY_NAME })
}


