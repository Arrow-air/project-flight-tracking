import type { ParamSummaryRecord } from "./dataflash/extract/params.ts";
import { PARAM_MESSAGES } from "./df-analysis/index.ts";
import { analyzeParamsBuffer, getLogParamsDiff } from "./df-analysis/params.ts";
// import { printParsedLogSummary } from "./df-analysis/misc.ts";

import { listFlightLegLogs } from "storage";
import type { FlightLogHandle } from "storage";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const flightLegId = url.searchParams.get('flightLegId');

  if (!flightLegId || typeof flightLegId !== "string") {
    return new Response('Flight leg ID is required', { status: 400 });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // 1) Fetch flight leg log handles from storage
    console.log("Fetching flight leg logs from storage");
    const logs: FlightLogHandle[] = await listFlightLegLogs(flightLegId);
    console.log("Logs fetched from storage", logs.length);

    // Perform analysis on each log
    // const analyses = logs.map(analyzeLogParams);
    // const payload = { flightLegId, analyses };

    const diff = await getLogParamsDiff(logs, {}, {
      nonDefaultOnly: true,
      logDiffOnly: false,
      includeAutoUpdated: false,
    });
    const payload = { flightLegId, diff };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});


interface LogParamAnalysis {
  path: string;
  name: string;
  sizeBytes: number;
  sizeMB: number;
  summary: ParamSummaryRecord[];
  nonDefaultParams: ParamSummaryRecord[];
  unchangedParams: ParamSummaryRecord[];
  totalParamsCount: number;
  nonDefaultParamsCount: number;
  unchangedParamsCount: number;
  error?: string;
}

// function analyzeLogParams(log: FlightLogFile): LogParamAnalysis {
//   try {
//     const { summary, nonDefaultParams, unchangedParams } = analyzeParamsBuffer(log.bytes, {
//       selectedMessages: [...PARAM_MESSAGES],
//     });
//     return {
//       path: log.path,
//       name: log.name,
//       sizeBytes: log.bytes.length,
//       sizeMB: Math.round(log.bytes.length / 1024 / 1024),
//       summary,
//       nonDefaultParams,
//       unchangedParams,
//       totalParamsCount: summary.length,
//       nonDefaultParamsCount: nonDefaultParams.length,
//       unchangedParamsCount: unchangedParams.length,
//     };
//   } catch (error) {
//     console.error(`Failed to extract params for ${log.name}`, error);
//     return {
//       path: log.path,
//       name: log.name,
//       sizeBytes: log.bytes.length,
//       sizeMB: Math.round(log.bytes.length / 1024 / 1024),
//       summary: [],
//       nonDefaultParams: [],
//       unchangedParams: [],
//       totalParamsCount: 0,
//       nonDefaultParamsCount: 0,
//       unchangedParamsCount: 0,
//       error: (error as Error).message ?? "Unknown parser error",
//     };
//   }
// }


// if (import.meta.main) {
//   const run = async () => {
//     const [logPath, ...selectedMessages] = Deno.args;
//     let logPathToUse = logPath;
//     if (!logPath) {
//       // console.error("Usage: deno run index.ts <path/to/log.bin> [MESSAGE ...]");
//       // Deno.exit(1);
      
//       const DEFAULT_LOG_PATH = "./test12.bin";
//       console.log("Using default log path: ${DEFAULT_LOG_PATH}");
//       logPathToUse = DEFAULT_LOG_PATH;
//     }

//     console.log(`Reading log: ${logPathToUse}`);
//     const fileBytes = await Deno.readFile(logPathToUse);
//     printParsedLogSummary(fileBytes, selectedMessages);
//   };

//   await run();
// }

