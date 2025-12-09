import type {
    MessageTypeId,
    MessageTypeName,
    MessageTypeInfo,
    MessageFieldName,
    FormatDefinition,
    ParsedLog,
    ParsedMessage,
} from "../dataflash/core/index.ts";
// import { DataflashParserTS } from '../dataflash/core/index.ts';
import { DataflashDataExtractor } from "../dataflash/extract/dataflash.ts";

/**
 * Misc. helper functions for understanding the format of a parsed log.
 * 
 */


export function printParsedLogSummary(
    buf: Uint8Array,
    selectedMessages?: string[],
): void {
    const selected = selectedMessages && selectedMessages.length > 0 ? selectedMessages : undefined;
    // const parsed = new DataflashParserTS(buf.buffer as ArrayBuffer).parse(selected);

    // One level of abstraction higher: use the extractor to get the parsed log.
    const extractor = DataflashDataExtractor.fromBuffer(buf, {
        selectedMessages: selected,
    });
    const parsed = extractor.getParsed();

    printFormatTable(parsed, 1);
    printMessageInfo(parsed, selected);
    printMessageTypeInfo(parsed, true, 0); // true: Print all message types.

    printParams(extractor); // 
}


function printFormatTable(
    parsed: ParsedLog,
    printTop: number = 5,
): void {

    const formatTable: Record<MessageTypeId, FormatDefinition> = parsed.formatTable;

    console.log("\nFormat table summary:");
    console.log(`Number of format table entries: ${Object.keys(formatTable).length}`);

    // Print the top N items of the formatTable object, omitting offsetArray
    const topFormatTable = Object.entries(formatTable)
        .slice(0, printTop)
        .map(([key, value]) => ({ [key]: value }));
    console.log(`${JSON.stringify(topFormatTable, null, 2)}`);

}


function printMessageTypeInfo(
    parsed: ParsedLog,
    printKeys: boolean = false,
    printTop: number = 5,
): void {
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


function printMessageInfo(
    parsed: ParsedLog,
    selected?: string[],
): void {
    const available = Object.keys(parsed.messages);
    const selectedMessages = selected && selected.length > 0 ? selected : available;
    console.log(
        `Parsed ${available.length} message types${selectedMessages.length ? ` (filtered: ${selectedMessages.join(", ")})` : ""}.`,
    );

    const sampleNames = selectedMessages.slice(0, 10);
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


function printParams(extractor: DataflashDataExtractor): void {
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
