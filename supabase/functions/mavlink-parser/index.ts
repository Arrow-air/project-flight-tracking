import { DataflashParserTS } from "./dataflash/parser.ts";
import type { ParsedLog, ParsedMessage } from "./dataflash/types.ts";

export function parseDataflashLog(buf: Uint8Array, selectedMessages?: string[]) {
  return new DataflashParserTS(buf.buffer as ArrayBuffer).parse(selectedMessages);
}

if (import.meta.main) {
  const run = async () => {
    const [logPath, ...selectedMessages] = Deno.args;
    if (!logPath) {
      console.error("Usage: deno run index.ts <path/to/log.bin> [MESSAGE ...]");
      Deno.exit(1);
    }

    console.log(`Reading log: ${logPath}`);
    const fileBytes = await Deno.readFile(logPath);
    const parsed = parseDataflashLog(
      fileBytes,
      selectedMessages.length > 0 ? selectedMessages : undefined,
    );
    printSummary(parsed, selectedMessages);
  };

  await run();
}

function printSummary(parsed: ParsedLog, selected: string[]): void {

  // Print the format table.
  printFormatTable(parsed, 1);

  // Print the message info.
  printMessageInfo(parsed, selected);
  
  // Print the message type info.
  const printAllMessageTypes = true;
  printMessageTypeInfo(parsed, printAllMessageTypes, 0);

}


function printFormatTable(parsed: ParsedLog, printTop: number = 5): void {
  const formatTable = parsed.formatTable;
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
    for (const [messageTypeName, messageTypeInfo] of Object.entries(messageTypes)) {
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

  for (const name of sampleNames) {
    const msg = parsed.messages[name];
    if (!msg) {
      console.log(`- ${name}: not found in log`);
      continue;
    }
    const recordCount = getRecordCount(msg);
    const sample = getSampleRecord(msg);
    console.log(`- ${name}: ${recordCount} records`);
    console.log(`  sample -> ${JSON.stringify(sample)}`);
  }
}


function getRecordCount(message: ParsedMessage): number {
  const field = Object.values(message)[0];
  return field ? field.length : 0;
}

function getSampleRecord(message: ParsedMessage): Record<string, unknown> {
  const sample: Record<string, unknown> = {};
  for (const [field, values] of Object.entries(message)) {
    sample[field] = values?.[0];
  }
  return sample;
}
