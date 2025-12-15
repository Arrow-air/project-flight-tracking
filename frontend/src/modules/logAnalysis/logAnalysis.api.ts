import { useAuthStore } from '@/features/auth/auth.store';
import { supabase } from '@/lib/supabaseClient';
import { withErrorHandling, requireAuth } from '@/api/errorHandler';

// import type { 
//     // ParamDiffResult as LogParamDiffResult,
//     LogParamDiffOptions,
// } from '@/../../../supabase/functions/mavlink-parser/df-analysis/params';
// export type {
//     ParamDiffCell, ParamDiffRow,
// } from '@/../../../supabase/functions/mavlink-parser/df-analysis/params';

const ENTITY_NAME = 'log_analysis';

export interface LogParamDiffOptions {
    /**
     * Include fields that are unchanged from the default value.
     */
    includeUnchangedValues?: boolean;
    /**
     * Only include parameters that differ from one another.
     * If true, will show only parameters that differ across 2+ logs.
     */
    logDiffOnly?: boolean;
    /**
     * Whether to include parameters that have been auto-updated
     * by the autopilot at runtime.
     */
    includeAutoUpdated?: boolean;
  }

export interface ParamSummaryRecord {
    name: string;
    value?: number;
    default_value?: number;
    timeUs?: number;
}

export interface ParamDiffCell {
    logId: string;
    param?: ParamSummaryRecord;
    differsFromDefault?: boolean;
}

export interface ParamDiffRow {
    name: string;
    cells: ParamDiffCell[];
    allEqual: boolean;
    presentInAllLogs: boolean;
}

export interface FlightLogMeta {
    path: string;
    name: string;
    sizeBytes?: number;
    contentType?: string;
    createdAt?: string;
    updatedAt?: string;
    lastAccessedAt?: string;
    etag?: string;
    metadata?: Record<string, unknown>;
}

export interface LogParamDiffResult {
    logs: FlightLogMeta[];
    rows: ParamDiffRow[];
}

export interface LogParamDiffResponse {
    flightLegId: string;
    diff: LogParamDiffResult;
}

export async function getLogParamsDiff(
    flightLegId: string,
    options?: LogParamDiffOptions,
): Promise<LogParamDiffResponse | null> {
	const operation = 'get log params diff';

    const authStore = useAuthStore(); // TODO: shortly to replace with improved version
    requireAuth(authStore, operation);

    let logDiffQuery: string = '';
    if (options) {
        let queryParams: string[] = [];
        if (options?.includeUnchangedValues !== undefined) {
            queryParams.push(`includeUnchangedValues=${options.includeUnchangedValues}`);
        }
        if (options?.logDiffOnly !== undefined) {
            queryParams.push(`logDiffOnly=${options.logDiffOnly}`);
        }
        if (options?.includeAutoUpdated !== undefined) {
            queryParams.push(`includeAutoUpdated=${options.includeAutoUpdated}`);
        }
        logDiffQuery = queryParams.join('&');
        if (logDiffQuery.length > 0) {
            logDiffQuery = `?${logDiffQuery}`;
        }
    }

	const result = await withErrorHandling(async () => {
        let functionUrl = `mavlink-parser/logs/${flightLegId}/params/diff`;
        if (logDiffQuery.length > 0) {
            functionUrl += logDiffQuery;
        }
		const { data, error } = await supabase.functions.invoke<LogParamDiffResponse>(
            functionUrl, 
            {
                method: 'POST',
                body: { flightLegId },
            }
        );
        if (error) throw error;
        return data as LogParamDiffResponse;
    }, { operation, entity: ENTITY_NAME });

	return result;
}

