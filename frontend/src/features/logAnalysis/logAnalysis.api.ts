import { useAuthStore } from '@/features/auth/auth.store';
import { supabase } from '@/lib/supabaseClient';
import { withErrorHandling, requireAuth } from '@/api/errorHandler';

import type { ParamDiffResult as LogParamDiffResult,
} from '@/../../../supabase/functions/mavlink-parser/df-analysis/params';
export type {
    ParamDiffCell, ParamDiffRow,
} from '@/../../../supabase/functions/mavlink-parser/df-analysis/params';

const ENTITY_NAME = 'log_analysis';

// export interface ParamSummaryRecord {
//     name: string;
//     value?: number;
//     default_value?: number;
//     timeUs?: number;
// }

// export interface ParamDiffCell {
//     logId: string;
//     param?: ParamSummaryRecord;
//     differsFromDefault?: boolean;
// }

// export interface ParamDiffRow {
//     name: string;
//     cells: ParamDiffCell[];
//     allEqual: boolean;
//     presentInAllLogs: boolean;
// }

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

// export interface LogParamDiffResult {
//     logs: FlightLogMeta[];
//     rows: ParamDiffRow[];
// }

export interface LogParamDiffResponse {
    flightLegId: string;
    diff: LogParamDiffResult;
}

export async function getLogParamsDiff(
    flightLegId: string,
): Promise<LogParamDiffResponse | null> {
	const operation = 'get log params diff';

    const authStore = useAuthStore(); // TODO: shortly to replace with improved version
    requireAuth(authStore, operation);

	const result = await withErrorHandling(async () => {
		const { data, error } = await supabase.functions.invoke<LogParamDiffResponse>(
            `mavlink-parser/logs/${flightLegId}/params/diff`, 
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

