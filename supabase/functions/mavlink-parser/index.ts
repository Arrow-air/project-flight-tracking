import { DataflashParserTS } from "./dataflash/core/parser.ts";
import type {
  MessageTypeId, MessageTypeName, MessageTypeInfo,
  MessageFieldName, FormatDefinition, ParsedLog, ParsedMessage,
} from "./dataflash/core/types.ts";

import { DataflashDataExtractor } from "./dataflash/extract/index.ts";
import type { ParamSummaryRecord } from "./dataflash/extract/params.ts";

import { getFlightLegLogs, type FlightLogFile } from "storage";


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

    // Fetch flight leg logs from storage
    const logs = await getFlightLegLogs(flightLegId);

    // Perform analysis on each log
    const analyses = logs.map(analyzeLogParams);
    const payload = { flightLegId, analyses };

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
//     const parsed = parseDataflashLog(
//       fileBytes,
//       selectedMessages.length > 0 ? selectedMessages : undefined,
//     );


//     // printSummary(parsed, selectedMessages);

//     const extractor = DataflashDataExtractor.fromBuffer(fileBytes, {
//       selectedMessages: selectedMessages.length > 0 ? selectedMessages : undefined,
//     });
//     printParams(extractor);
//   };

//   await run();
// }


export function parseDataflashLog(buf: Uint8Array, selectedMessages?: string[]) {
  return new DataflashParserTS(buf.buffer as ArrayBuffer).parse(selectedMessages);
}

const PARAM_MESSAGES = ["PARM", "PARAM_VALUE"];

interface LogParamAnalysis {
  path: string;
  name: string;
  sizeBytes: number;
  sizeMB: number;
  summary: ParamSummaryRecord[];
  error?: string;
}

function analyzeLogParams(log: FlightLogFile): LogParamAnalysis {
  try {
    const extractor = DataflashDataExtractor.fromBuffer(log.bytes, {
      selectedMessages: PARAM_MESSAGES,
    });
    const summary = extractor.extractParamsSummary();
    return {
      path: log.path,
      name: log.name,
      sizeBytes: log.bytes.length,
      sizeMB: Math.round(log.bytes.length / 1024 / 1024),
      summary,
    };
  } catch (error) {
    console.error(`Failed to extract params for ${log.name}`, error);
    return {
      path: log.path,
      name: log.name,
      sizeBytes: log.bytes.length,
      sizeMB: Math.round(log.bytes.length / 1024 / 1024),
      summary: [],
      error: (error as Error).message ?? "Unknown parser error",
    };
  }
}


function _printSummary(parsed: ParsedLog, selected: string[]): void {

  // // Print the format table.
  printFormatTable(parsed, 1);

  // Print the message info.
  printMessageInfo(parsed, selected);
  
  // // Print the message type info.
  const printAllMessageTypes = true;
  printMessageTypeInfo(parsed, printAllMessageTypes, 0);

}


function printFormatTable(parsed: ParsedLog, printTop: number = 5): void {
  const formatTable: Record<MessageTypeId, FormatDefinition> = parsed.formatTable;
  console.log("\nFormat table summary:");
  console.log(`Number of format table entries: ${Object.keys(formatTable).length}`);

  // Print the top N items of the formatTable object, omitting offsetArray
  const topFormatTable = Object.entries(formatTable)
    .slice(0, printTop)
    .map(([key, value]) => ({ [key]: value }));
  console.log(`${JSON.stringify(topFormatTable, null, 2)}`);

}


function printMessageTypeInfo(parsed: ParsedLog, printKeys: boolean = false, printTop: number = 5): void {
  const messageTypes = parsed.messageTypes;

  console.log("\nMessageTypeInfo summary:");
  console.log(`Number of message types: ${Object.keys(messageTypes).length}`);
  console.log(`Number of non-empty message types: ${Object.values(messageTypes).filter((value) => value.offsetArray.length > 0).length}`);

  // Print the keys of the messageTypes object
  if (printKeys) {
    for (const [messageTypeName, messageTypeInfo] of Object.entries(messageTypes) as [MessageTypeName, MessageTypeInfo][]) {
      console.log(`- ${messageTypeName}: ${messageTypeInfo.offsetArray.length} messages`);
    }
  }

  // Print the top N items of the messageTypes object, omitting offsetArray
  const N_TOP_MESSAGE_TYPES = printTop >= 0 ? printTop : 5;
  const topMessageTypesWithoutOffsetArray = Object.entries(messageTypes)
    .slice(0, N_TOP_MESSAGE_TYPES)
    .reduce((acc, [key, value]) => {
      // Spread all keys except offsetArray
      const { offsetArray: _ignoredOffsetArray, ...rest } = value;
      acc[key] = rest;
      return acc;
    }, {} as Record<string, Omit<(typeof messageTypes)[string], "offsetArray">>);
  console.log(`\nMessage type info (top ${N_TOP_MESSAGE_TYPES}, without offsetArray): ${JSON.stringify(topMessageTypesWithoutOffsetArray, null, 2)}`);
}


function printMessageInfo(parsed: ParsedLog, selected: string[]): void {
  const available = Object.keys(parsed.messages);
  console.log(
    `Parsed ${available.length} message types${selected.length ? ` (filtered: ${selected.join(", ")})` : ""}.`,
  );

  const sampleNames = (selected.length > 0 ? selected : available).slice(0, 10);
  if (sampleNames.length === 0) {
    console.log("No messages decoded.");
    return;
  }

  for (const name of sampleNames as MessageTypeName[]) {
    const msg = parsed.messages[name];
    if (!msg) {
      console.log(`- ${name}: not found in log`);
      continue;
    }
    const recordCount = getRecordCount(msg);
    const sample: Record<MessageFieldName, unknown> = getSampleRecord(msg);
    console.log(`- ${name}: ${recordCount} records`);
    console.log(`  sample -> ${JSON.stringify(sample)}`);
  }
}


function getRecordCount(message: ParsedMessage): number {
  const field = Object.values(message)[0];
  return field ? field.length : 0;
}

function getSampleRecord(message: ParsedMessage): Record<MessageFieldName, unknown> {
  const sample: Record<MessageFieldName, unknown> = {};
  for (const [field, values] of Object.entries(message)) {
    sample[field] = values?.[0];
  }
  return sample;
}

function _printParams(extractor: DataflashDataExtractor): void {
  const summary = extractor.extractParamsSummary();
  console.log("\nPARAM values:");
  if (summary.length === 0) {
    console.log("- none found");
  } else {
    for (const p of summary) {
      console.log(
        `- ${p.name} = ${p.value}${p.timeUs !== undefined ? ` @${p.timeUs}` : ""}`,
      );
    }
  }

  console.log("\nDefault PARAM values:");
  if (summary.length === 0) {
    console.log("- none found");
  } else {
    for (const d of summary) {
      console.log(`- ${d.name} = ${d.default_value}`);
    }
  }
}
