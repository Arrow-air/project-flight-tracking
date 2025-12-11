import { DataflashDataExtractor } from "../dataflash/extract/index.ts";
import type { DataflashDataExtractorOptions } from "../dataflash/extract/dataflash.ts";

import type { TimeExtraction } from "../dataflash/extract/time.ts";
import type { FlightLogFile, FlightLogHandle, } from "storage";


export interface FlightTimeAnalysisResult extends TimeExtraction {
  /**
   * The log handle that was analyzed.
   */
//   logHandle: FlightLogHandle;
  /**
   * Convenience: total flight duration in minutes.
   */
  totalFlightMinutes: number;
}

/**
 * Analyze flight time, cumulative totals, and boot/runtime statistics
 * from a DataFlash log buffer.
 */
function analyzeFlightTimeBuffer(
  buf: Uint8Array | ArrayBufferLike,
  options: DataflashDataExtractorOptions = {},
): FlightTimeAnalysisResult {
  const extractor = DataflashDataExtractor.fromBuffer(buf, options);
  const time = extractor.extractTime();

  const flights = time?.flights ?? [];
  const events = time?.events ?? [];
  const totalFlightSeconds = time?.totalFlightSeconds ?? 0;
  const totalFlightMinutes = totalFlightSeconds / 60;
  const logDurationSec = time?.logDurationSec;
  const statFlightMinutes = time?.statFlightMinutes;
  const statRuntimeMinutes = time?.statRuntimeMinutes;

  const totalFlightMinutesAfter =
    time?.estimatedTotalFlightMinutesAfter ??
    (statFlightMinutes !== undefined
      ? statFlightMinutes + totalFlightMinutes
      : undefined);

  const totalRuntimeMinutesAfter =
    time?.estimatedTotalRuntimeMinutesAfter ??
    (statRuntimeMinutes !== undefined && logDurationSec !== undefined
      ? statRuntimeMinutes + logDurationSec / 60
      : undefined);

  return {
    events,
    flights,
    totalFlightSeconds,
    totalFlightMinutes,
    logStartUs: time?.logStartUs,
    logEndUs: time?.logEndUs,
    logDurationSec,
    statFlightMinutes,
    statRuntimeMinutes,
    estimatedTotalFlightMinutesAfter: totalFlightMinutesAfter,
    estimatedTotalRuntimeMinutesAfter: totalRuntimeMinutesAfter,
  };
}

export async function getLogTimeAnalysis(
  logHandles: FlightLogHandle[],
  options: DataflashDataExtractorOptions = {},
): Promise<FlightTimeAnalysisResult[]> {
  
  // Process sequentially to keep memory usage low with very large logs.
  const results: FlightTimeAnalysisResult[] = [];
  for (const log of logHandles) {
    const file: FlightLogFile = await log.download();
    const result = analyzeFlightTimeBuffer(file.bytes, options);
    results.push(result);
  }

  return results;
}
