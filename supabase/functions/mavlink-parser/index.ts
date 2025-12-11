import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { functionCORS } from "../_shared/cors.ts";
import { listFlightLegLogs, type FlightLogHandle } from "storage";

import { getLogParamsDiff } from "./df-analysis/params.ts";
import { getLogTimeAnalysis } from "./df-analysis/flight-time.ts";

// import type { ParamSummaryRecord } from "./dataflash/extract/params.ts";
// import { PARAM_MESSAGES } from "./df-analysis/index.ts";
// import type { ParamDiffResult } from "./df-analysis/params.ts";
// import { printParsedLogSummary } from "./df-analysis/misc.ts";


const functionName = 'mavlink-parser'; // MUST match the folder name under `supabase/functions`
const app = new Hono().basePath(`/${functionName}`);

// Hono CORS middleware: https://hono.dev/docs/middleware/builtin/cors
app.use('*', cors({
  // origin: '*',
  origin: (requestOrigin: string | null) => {
    if (!requestOrigin) return ''; // Must have one

    const allowedExact = functionCORS.origin; // From shared config
    if (allowedExact.includes(requestOrigin)) return requestOrigin;

    const isVercelPreview =
      requestOrigin.startsWith('https://project-flight-tracking-') &&
      requestOrigin.endsWith('-arrow-air.vercel.app');
    if (isVercelPreview) return requestOrigin; 

    return ''; // Not allowed → no ACAO header
  },
  allowMethods: functionCORS.allowMethods,
  allowHeaders: functionCORS.allowHeaders,
  // exposeHeaders: functionCORS.exposeHeaders,
  maxAge: functionCORS.maxAge,
  // credentials: functionCORS.credentials,
  credentials: false,
}));

app.get('/health', (c) => { return handleHealthCheck(c); }); // Health check endpoint
app.post('/logs/:flightLegId/params/diff', async (c) => { return await handleLogParamsDiff(c); });
app.post('/logs/:flightLegId/time/analysis', async (c) => { return await handleLogTimeAnalysis(c); });

app.notFound((c) => c.json({ error: 'Function Not Found' }, 404));

app.onError((err, c) => {
  console.error('Hono error handler:', err);
  return c.json({ error: err.message ?? 'Internal Server Error' }, 500);
});

Deno.serve(app.fetch);


// ======================================================
// Route functions
// ======================================================

function handleHealthCheck(c: Context): Response {
  return c.json({
    ok: true,
    function: functionName,
    routes: [
      'GET    /health',
      'POST   /logs/:flightLegId/params/diff',
      'POST   /logs/:flightLegId/time/analysis',
    ],
  });
}


async function handleLogParamsDiff(c: Context): Promise<Response> {
  const flightLegId = c.req.param('flightLegId');
  if (!flightLegId || typeof flightLegId !== "string") {
    return c.json({ error: 'Flight leg ID is required' }, 400);
  }

  // You can still also read query params if you want options:
  // e.g. /logs/123/params/diff?includeAutoUpdated=false
  const includeUnchangedValues = c.req.query('includeUnchangedValues') === 'true'; // default false
  const logDiffOnly = c.req.query('logDiffOnly') !== 'false'; // default true
  const includeAutoUpdated = c.req.query('includeAutoUpdated') !== 'false'; // default true
  
  try {
    // 1) Fetch flight leg log handles from storage
    // console.log("Fetching flight leg logs from storage");
    const logs: FlightLogHandle[] = await listFlightLegLogs(flightLegId);
    // console.log("Logs fetched from storage", logs.length);

    // 2) Analyze the log parameters
    const diff = await getLogParamsDiff(logs, {}, {
      includeUnchangedValues: includeUnchangedValues,
      logDiffOnly: logDiffOnly,
      includeAutoUpdated: includeAutoUpdated,
    });

    return c.json({ flightLegId, diff });
  } catch (err) {
    console.error(err);
    const message = (err as Error).message ?? 'Unknown error';
    return c.json({ error: message }, 500);
  }
}


async function handleLogTimeAnalysis(c: Context): Promise<Response> {
  const flightLegId = c.req.param('flightLegId');
  if (!flightLegId || typeof flightLegId !== "string") {
    return c.json({ error: 'Flight leg ID is required' }, 400);
  }

  try {
    // 1) Fetch flight leg log handles from storage
    // console.log("Fetching flight leg logs from storage");
    const logs: FlightLogHandle[] = await listFlightLegLogs(flightLegId);
    // console.log("Logs fetched from storage", logs.length);

    // 2) Analyze the log time
    const timeAnalyses = await getLogTimeAnalysis(logs, {});
    return c.json({ flightLegId, timeAnalyses });
  } catch (err) {
    console.error(err);
    const message = (err as Error).message ?? 'Unknown error';
    return c.json({ error: message }, 500);
  }
}


// interface LogParamAnalysis {
//   path: string;
//   name: string;
//   sizeBytes: number;
//   sizeMB: number;
//   summary: ParamSummaryRecord[];
//   nonDefaultParams: ParamSummaryRecord[];
//   unchangedParams: ParamSummaryRecord[];
//   totalParamsCount: number;
//   nonDefaultParamsCount: number;
//   unchangedParamsCount: number;
//   error?: string;
// }

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

