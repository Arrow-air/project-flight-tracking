import { DataflashDataExtractor } from "../dataflash/extract/index.ts";
import type { ParamSummaryRecord } from "../dataflash/extract/params.ts";

import type { DataflashDataExtractorOptions } from "../dataflash/extract/dataflash.ts";
import type { FlightLogFile, FlightLogHandle, } from "storage";

// Messages that contain parameter values.
export const PARAM_MESSAGES = ["PARM", "PARAM_VALUE"] as const;




export interface ParamAnalysisResult {
  /**
   * Summary of all parameter values.
   */
  summary: ParamSummaryRecord[];
  /**
   * Parameters that have a non-default value.
   */
  nonDefaultParams: ParamSummaryRecord[];
  /**
   * Parameters that have not changed from the default value.
   */
  unchangedParams: ParamSummaryRecord[];
}

export interface LogMetadata {
  id: string;            // stable ID in your system
  name?: string;        // human-friendly: filename or flight name
  createdAt?: Date;     // time log was recorded
}

/**
 * Options for analyzing parameter differences between logs.
 * @property {boolean} nonDefaultOnly - Values must differ from the default value.
 * @property {boolean} logDiffOnly - Log param values must differ.
 */
export interface LogParamDiffOptions {
  /**
   * Only include parameters that differ from the default value.
   */
  nonDefaultOnly?: boolean;
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

export interface ParamDiffCell {
  logId: string;
  param?: ParamSummaryRecord;
  differsFromDefault?: boolean;
}

export interface ParamDiffRow {
  name: string;                 // param name
  cells: ParamDiffCell[];       // one per log, in same order as snapshots
  allEqual: boolean;            // true if values are identical across logs
  presentInAllLogs: boolean;    // false if missing from any log
}

export interface ParamDiffResult {
  logs: LogMetadata[];        // column headers
  rows: ParamDiffRow[];       // table rows
}

/**
 * Analyze parameter values from a DataFlash log buffer.
 */
export function analyzeParamsBuffer(
  buf: Uint8Array | ArrayBufferLike,
  options: DataflashDataExtractorOptions = {},
): ParamAnalysisResult {

  const extractor = DataflashDataExtractor.fromBuffer(buf, {
    selectedMessages: options.selectedMessages ?? [...PARAM_MESSAGES],
    enrich: options.enrich,
  });

  const summary = extractor.extractParamsSummary();
  const nonDefaultParams = summary.filter((p) => p.default_value !== p.value);
  const unchangedParams = summary.filter((p) => p.default_value === p.value);

  return {
    summary,
    nonDefaultParams,
    unchangedParams,
  };
}



const autoUpdatedNames = new Set([
  'MOT_THST_HOVER',
  'STAT_BOOTCNT',
  'STAT_FLTTIME',
  'STAT_RUNTIME',
  'BARO1_GND_PRESS',
  'COMPASS_DEC',
]);

const autoUpdatedPrefixes = [
  /^STAT_/,
  /^INS_GYR[0-9]+_CALTEMP$/,
  /^INS_GYR[0-9]*OFFS_/,
  /^INS_GYROFFS_/,
];

function isLikelyUserConfig(name: string): boolean {
  // Fallback heuristics
  if (autoUpdatedNames.has(name)) return false;
  if (autoUpdatedPrefixes.some(rx => rx.test(name))) return false;

  return true;
}

export async function getLogParamsDiff(
  logHandles: FlightLogHandle[],
  options: DataflashDataExtractorOptions = {},
  logDiffOptions: LogParamDiffOptions = {
    nonDefaultOnly: true,
    logDiffOnly: true,
    includeAutoUpdated: false,
  },
): Promise<ParamDiffResult> {

  // Process sequentially to keep memory usage low with very large logs.
  const snapshots: { meta: LogMetadata; summary: ParamSummaryRecord[] }[] = [];

  for (const log of logHandles) {
    const file: FlightLogFile = await log.download(); // fetch on-demand
    const summary = analyzeParamsBuffer(file.bytes, options).summary;

    snapshots.push({
      meta: { id: log.path, name: log.name } satisfies LogMetadata,
      summary,
    });
    // allow GC to reclaim the large buffer once we move to the next log
  }

  const logsMeta = snapshots.map((s) => s.meta);
  const allNames = new Set<string>();

  snapshots.forEach((s) => s.summary.forEach((p) => allNames.add(p.name)));
  // console.log("allNames", allNames);
  // console.log("snapshots", snapshots);


  let rows: ParamDiffRow[] = Array.from(allNames)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const cells: ParamDiffCell[] = snapshots.map((s) => {
        const param = s.summary.find((p) => p.name === name);
        const differsFromDefault =
          param?.default_value !== undefined && param.value !== param.default_value;
        return { logId: s.meta.id, param, differsFromDefault };
      });

      const values = cells.map((c) => c.param?.value);
      const first = values[0];
      const allEqual = values.every((v) => v === first); // true if all values are the same
      const presentInAllLogs = cells.every((c) => c.param !== undefined);

      return { name, cells, allEqual, presentInAllLogs };
    });

  if (logDiffOptions.nonDefaultOnly) {
    // Remove rows where all values are same as default
    rows = rows.filter((r) => r.cells.every((c) => c.differsFromDefault ?? false));
  }
  if (logDiffOptions.logDiffOnly) {
    rows = rows.filter((r) => !r.allEqual); // true if not all values are the same
  }
  if (!logDiffOptions.includeAutoUpdated) {
    // Remove rows where the parameter is likely to be auto-updated by the autopilot.
    rows = rows.filter((r) => isLikelyUserConfig(r.name));
  }

  console.log("Rows returned: ", rows.length);
  // With default: 1216
  // With nonDefaultOnly: 274
  // With logDiffOnly: 14
  // With nonDefaultOnly and !includeAutoUpdated: 260
  console.log("Rows: ", rows.map((r) => r.name));

  return { logs: logsMeta, rows };
}

// function getLogParamsDiff(log: FlightLogFile): ParamDiffResult {
