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
  const available = Object.keys(parsed.messages);
  console.log(
    `Parsed ${available.length} message types${selected.length ? ` (filtered: ${selected.join(", ")})` : ""}.`,
  );
  const sampleNames = (selected.length > 0 ? selected : available).slice(0, 5);
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
