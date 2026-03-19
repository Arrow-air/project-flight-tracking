import { supabaseAdmin } from "./supabaseAdmin.ts";
// import type { StorageListResult } from "supabase";


export const FLIGHT_LOG_BUCKET_NAME = 'flight_logs';

export type FlightLogFile = {
    path: string;          // "flight_leg_id/log1.bin"
    name: string;          // "log1.bin"
    bytes: Uint8Array;     // raw file contents, ready for parsing
};

/**
 * A handle to a flight leg log file in the storage bucket.
 * Use the `download` method to fetch the file on demand.
 */
export interface FlightLogHandle {
    path: string;                  // "flight_leg_id/log1.bin"
    name: string;                  // "log1.bin"
    sizeBytes?: number;            // size in bytes (if available)
    contentType?: string;          // MIME type (if available)
    createdAt?: Date;              // created timestamp (if available)
    updatedAt?: Date;              // last updated timestamp (if available)
    lastAccessedAt?: Date;         // last accessed timestamp (if available)
    etag?: string;                 // cache/etag identifier
    metadata?: Record<string, unknown>; // provider metadata
    download: () => Promise<FlightLogFile>; // lazily fetches the file
}

/**
 * A file object from the storage bucket.
 * Soft extends the `StorageFile` interface with additional properties.
 */
type StorageFile = {
    name: string;
    created_at?: string | null;
    updated_at?: string | null;
    last_accessed_at?: string | null;
    metadata?: Record<string, unknown>;
    etag?: string;
};


export async function getFlightLegLog(
    flightLegId: string, 
    logName?: string,
): Promise<FlightLogFile> {
    if (!logName) throw new Error("logName is required");
    const path = `${flightLegId}/${logName}`;
    return await downloadFlightLog(path, logName);
}


/**
 * Lists flight leg logs without downloading their contents. Use the returned
 * handle's `download` method to fetch the file on demand.
 */
export async function listFlightLegLogs(
    flightLegId: string,
    limit?: number,
): Promise<FlightLogHandle[]> {

    // Fetch file objects from storage bucket.
    const { data: files, error: listError } = await supabaseAdmin
        .storage
        .from(FLIGHT_LOG_BUCKET_NAME)
        .list(flightLegId, {
            limit: limit ?? undefined,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (listError) throw listError;
    if (!files || files.length === 0) return [];

    // Map file objects to flight log handles.
    return files.map((file) => {
        const fileWithExtras = file as StorageFile;
        const path = `${flightLegId}/${file.name}`;
        const metadata = (fileWithExtras.metadata ?? {}) as Record<string, unknown>;

        const sizeBytes = typeof metadata.size === "number" ? metadata.size : undefined;
        const contentType = typeof metadata.mimetype === "string" ? metadata.mimetype : undefined;
        const createdAt = fileWithExtras.created_at ? new Date(fileWithExtras.created_at) : undefined;
        const updatedAt = fileWithExtras.updated_at ? new Date(fileWithExtras.updated_at) : undefined;
        const lastAccessedAt = fileWithExtras.last_accessed_at ? new Date(fileWithExtras.last_accessed_at) : undefined;
        const etag = typeof fileWithExtras.etag === "string" ? fileWithExtras.etag : undefined;

        return {
            path,
            name: file.name,
            sizeBytes,
            contentType,
            createdAt,
            updatedAt,
            lastAccessedAt,
            etag,
            metadata,
            download: () => downloadFlightLog(path, file.name),
        };
    });
}

/**
 * Gets flight leg logs.
 * @deprecated Use {@link listFlightLegLogs} instead. Then download each file on demand.
 * @param flightLegId - The flight leg ID.
 * @param limit - The maximum number of logs to return.
 * @returns The flight leg logs.
 */
export async function getFlightLegLogs(
    flightLegId: string, 
    limit: number = 5,
): Promise<FlightLogFile[]> {
    // 1) Collect flight log handles.
    const handles = await listFlightLegLogs(flightLegId, limit);
    const results: FlightLogFile[] = [];

    // 2) Download each file and return the results.
    for (const handle of handles) {
        results.push(await handle.download());
    }
    return results;
}

/**
 * Downloads a flight leg log.
 * @param path - The path to the log file.
 * @param name - The name of the log file.
 * @returns FlightLogFile - The flight leg log.
 */
async function downloadFlightLog(path: string, name: string): Promise<FlightLogFile> {
    const { data, error: downloadError } = await supabaseAdmin.storage
        .from(FLIGHT_LOG_BUCKET_NAME)
        .download(path);

    if (downloadError) throw downloadError;
    if (!data) throw new Error("Log not found");

    const arrayBuffer = await data.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    return { path, name, bytes };
}
