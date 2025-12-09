import { DataflashDataExtractor } from "../dataflash/extract/index.ts";
import type { ParamSummaryRecord } from "../dataflash/extract/params.ts";

import type { DataflashDataExtractorOptions } from "../dataflash/extract/dataflash.ts";
import type { FlightLogFile } from "storage";

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


export function getLogParamsDiff(
  logs: FlightLogFile[],
  options: DataflashDataExtractorOptions = {},
): ParamDiffResult {

  const snapshots = logs.map((log) => ({
    meta: {
      id: log.path,
      name: log.name,
    } satisfies LogMetadata,
    summary: analyzeParamsBuffer(log.bytes, options).summary,
  }));

  const logsMeta = snapshots.map((s) => s.meta);
  const allNames = new Set<string>();

  console.log("allNames", allNames);
  // console.log("snapshots", snapshots);

  snapshots.forEach((s) => s.summary.forEach((p) => allNames.add(p.name)));

  const rows: ParamDiffRow[] = Array.from(allNames)
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
    const allEqual = values.every((v) => v === first);
    const presentInAllLogs = cells.every((c) => c.param !== undefined);
    return { name, cells, allEqual, presentInAllLogs };
  });

  return { logs: logsMeta, rows };
}

// function getLogParamsDiff(log: FlightLogFile): ParamDiffResult {
