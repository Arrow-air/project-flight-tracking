// Stateless API for aircraft data

import { supabase } from '@/lib/supabaseClient';
import { withErrorHandling, requireAuth } from '@/api/errorHandler';
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";
import { useAuth } from '@/modules/auth/useAuth';

const ENTITY_NAME = 'aircraft'

// Imported types from Supabase automatically generated types
export type AircraftRow = Tables<"aircraft">;
export type AircraftInsert = TablesInsert<"aircraft">;
export type AircraftUpdate = TablesUpdate<"aircraft">;
export type TAircraftID = Tables<"aircraft">["id"];

// List current user's aircraft
export async function listAircraft(): Promise<AircraftRow[]> {
  const operation = 'list aircraft'
  requireAuth(operation);

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('aircraft')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as AircraftRow[];
  }, { operation, entity: ENTITY_NAME })

  return result ?? []
}

// Get one by id
export async function getAircraft(id: TAircraftID): Promise<AircraftRow> {
  const operation = 'get aircraft'
  requireAuth(operation);

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('aircraft')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error
    return data as AircraftRow;
  }, { operation, entity: ENTITY_NAME })

  if (!result) throw new Error('Operation cancelled')
  return result;
}

// Create new aircraft
export async function createAircraft(input: AircraftInsert): Promise<AircraftRow> {
  const operation = 'create aircraft';
  requireAuth(operation);

  input.owner_id = useAuth().userId ?? null;
  

  if (!input?.serial_number) throw new Error('serial_number is required')

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('aircraft')
      .insert(input)
      .select('*')
      .single()

    if (error) throw error
    return data as AircraftRow;
  }, { operation, entity: ENTITY_NAME })

  if (!result) throw new Error('Operation cancelled')
  return result;
}

// Update aircraft (only own records)
export async function updateAircraft(
  id: TAircraftID, 
  input: AircraftUpdate
): Promise<AircraftRow> {
  const operation = 'update aircraft'
  requireAuth(operation);

  if (input.id && input.id !== id) throw new Error('id mismatch');

  const result = await withErrorHandling(async () => {
    const { data, error } = await supabase
      .from('aircraft')
      .update(input)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as AircraftRow;
  }, { operation, entity: ENTITY_NAME })

  if (!result) throw new Error('Operation cancelled')
  return result;
}

// Delete aircraft (only own records)
export async function deleteAircraft(id: TAircraftID): Promise<void> {
  const operation = 'delete aircraft';
  requireAuth(operation);

  await withErrorHandling(async () => {
    const { error } = await supabase
      .from('aircraft')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
  }, { operation, entity: ENTITY_NAME });
}

