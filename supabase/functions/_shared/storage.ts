import { supabaseAdmin } from "./supabaseAdmin.ts";
// import type { StorageListResult } from "supabase";



export const FLIGHT_LOG_BUCKET_NAME = 'flight_logs';

export type FlightLogFile = {
    path: string;          // "flight_leg_id/log1.bin"
    name: string;          // "log1.bin"
    bytes: Uint8Array;     // raw file contents, ready for parsing
};

export async function getFlightLegLogs(flightLegId: string, limit: number = 5): Promise<FlightLogFile[]> {
    const { data: files, error: listError } = await supabaseAdmin
        .storage
        .from(FLIGHT_LOG_BUCKET_NAME)
        .list(flightLegId, {
            limit: limit,
            sortBy: { column: 'created_at', order: 'desc' },
            // filters: [{ column: 'name', op: 'eq', value: '*.bin' }],
        });
    if (listError) throw listError;
    if (!files || files.length === 0) return [];

    console.debug("Files", files);

    const results: FlightLogFile[] = [];

    // 2. Download each file
    // TODO: Parallelize later possibly?
    for (const file of files) {
        const path = `${flightLegId}/${file.name}`;

        const { data, error: downloadError } = await supabaseAdmin.storage
            .from(FLIGHT_LOG_BUCKET_NAME)
            .download(path);

        if (downloadError) throw downloadError;
        if (!data) continue;

        // In Deno / Edge Functions, `data` is a Blob
        const arrayBuffer = await data.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        results.push({
            path,
            name: file.name,
            bytes,
        });
    }

    return results;
}
