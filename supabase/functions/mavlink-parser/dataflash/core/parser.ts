import { DF_HEADER1, DF_HEADER2, DF_HEADER_LENGTH, FMT_TYPE_ID } from "./constants.ts";
import type { FormatChar } from "./constants.ts";

import { parseField } from "./binary.ts";
import type {
  MessageTypeId, MessageTypeName,
  FieldArray,
  MessageTypeInfo,
  ParsedLog,
  ParsedMessage,
  FmtRecord,FormatDefinition,
} from "./types.ts";
import { buildFormatDefinition, parseFmtRecord } from "./fmt.ts";
// import { assert } from "node:assert";

type ParsedValue = number | string | number[];

const DEFAULT_FMT_RECORD: FmtRecord = {
  typeId: FMT_TYPE_ID,
  length: 89,
  name: "FMT",
  format: "BBnNZ",
  columns: "Type,Length,Name,Format,Columns",
};

export class DataflashParserTS {
  private readonly buffer: ArrayBufferLike; // The buffer containing the loaded dataflash log.
  private readonly view: DataView; // The data view of the buffer.
  private readonly formatTable: Record<MessageTypeId, FormatDefinition>; // { typeId: FormatDefinition }.
  private readonly offsetsByType: Record<MessageTypeId, number[]>; // { typeId: offsets[] }.
  private readonly messages: Record<MessageTypeName, ParsedMessage>; // { messageName: ParsedMessage }.
  private messageTypes: Record<MessageTypeName, MessageTypeInfo>; // { messageTypeName: MessageTypeInfo }.
  private scanned = false; // Whether the log has been scanned.

  constructor(buffer: ArrayBufferLike) {
    this.buffer = buffer;
    this.view = new DataView(buffer); // Don't worry about the types, endianness of buffer
    this.formatTable = {};
    this.offsetsByType = {};
    this.messages = {};
    this.messageTypes = {};

    const fmtDefinition = buildFormatDefinition(DEFAULT_FMT_RECORD);
    this.formatTable[FMT_TYPE_ID] = fmtDefinition;
  }

  /**
   * Parses the dataflash log and returns the parsed data.
   * @param selectedMessages - The messages to parse. If not provided, all messages will be parsed.
   * @returns The parsed data.
   */
  parse(selectedMessages?: MessageTypeName[]): ParsedLog {
    // Build the format table and message types.
    this.scanLog();

    // Parse the selected message types, if provided. Otherwise, parse all message types.
    const targetNames: MessageTypeName[] = selectedMessages ?? Object.keys(this.messageTypes) as MessageTypeName[];
    for (const name of targetNames) {
      const info = this.messageTypes[name];
      if (!info) {
        continue; // Message type not found, so move to the next message.
      }
      this.decodeMessagesOfType(info, name);
    }

    return {
      formatTable: Object.fromEntries(
        Object.values(this.messageTypes).map((info) => [
          info.typeId,
          {
            typeId: info.typeId,
            length: info.length,
            name: info.name,
            format: info.format,
            columns: info.columns,
            fieldOffsets: info.fieldOffsets,
            totalLength: info.totalLength,
          },
        ]),
      ),
      messageTypes: this.messageTypes,
      messages: this.messages,
    };
  }

  /**
   * Scans the log for message types and offsets.
   * This is used to determine the message types and offsets in the log.
   * We want to:
   * - Determine where each message of each type is (offsetsByType)
   * - Determine the format of each message type. (formatTable)
   * - Find all message types. ()
   */
  private scanLog(): void {
    if (this.scanned) { return; } // If the log has already been scanned, exit.

    const logLength = this.buffer.byteLength;
    let cursor = 0; // Current byte offset in the log buffer.

    // Traverse the log buffer until the end of the file.
    while (cursor <= logLength - 3) {
      const byte0 = this.view.getUint8(cursor);
      const byte1 = this.view.getUint8(cursor + 1);
      const typeId = this.view.getUint8(cursor + 2);      
      const payloadOffset = cursor + DF_HEADER_LENGTH; // Where the payload starts in the buffer.

      // [1] Check if the current position is a valid dataflash header.
      if ( byte0 !== DF_HEADER1 || byte1 !== DF_HEADER2 ) {
        cursor += 1; // Step to next byte in buffer, could be start of valid header.
        continue; // The current position is not a valid dataflash header, so move to the next position.
      }

      // [2] Keep track of the offsets for this message type.
      // We want to know where each of this message type's payloads are in the log.
      if (!this.offsetsByType[typeId]) {
        this.offsetsByType[typeId] = []; // Initialize offsets array for this message type.
      }
      this.offsetsByType[typeId].push(payloadOffset);

      // [3] Parse the FMT message.
      // Record how messages of this type are formatted.
      if (typeId === FMT_TYPE_ID) {
        const record: FmtRecord = parseFmtRecord(this.view, payloadOffset);
        const newDefinition: FormatDefinition = buildFormatDefinition(record); // More usable
        this.formatTable[record.typeId] = newDefinition;
        cursor = payloadOffset + newDefinition.totalLength; // Header + payload.
        continue;
      }

      // Not FMT, so we move to the next message.
      const definition: FormatDefinition | undefined = this.formatTable[typeId];
      if (definition) {
        cursor = payloadOffset + definition.totalLength;
      } else { cursor = payloadOffset; }
    }

    // [4] Traversed all messages, now build the message types.
    const messageTypes: Record<string, MessageTypeInfo> = {};
    for (const definition of Object.values(this.formatTable) as FormatDefinition[]) {
      // Get the offsets for this message type.
      const offsets = (this.offsetsByType[definition.typeId] ?? []).filter(
        (offset) => offset + definition.totalLength <= logLength,
      );
      const info: MessageTypeInfo = {
        ...definition,
        offsetArray: offsets,
      };
      messageTypes[definition.name] = info;
    }

    this.messageTypes = messageTypes; // Store the message types.
    this.scanned = true; // The log has now been scanned.
  }

  /**
   * Decodes all messages of a given type and returns the parsed data.
   * @param info - The message type info, including the offsets of all messages of this type in the log`.
   * @param nameOverride - The name of the message to decode. If not provided, the message name will be used.
   * @returns void
   */
  private decodeMessagesOfType(info: MessageTypeInfo, nameOverride?: MessageTypeName): void {
    const offsets = info.offsetArray;
    if (offsets.length === 0) {
      return; // No messages of this type, so exit.
    }

    const messageName: MessageTypeName = nameOverride ?? info.name;
    const fieldCount = info.format.length;
    const result: ParsedMessage = {};

    // Create the field arrays for each field.
    for (let fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
      const columnName = this.columnName(info, fieldIndex);
      result[columnName] = this.createFieldArray(
        info.format[fieldIndex],
        offsets.length,
      );
    }

    // Decode each message of this type.
    offsets.forEach((offset, sampleIndex) => {
      let cursor = offset;

      // Parse each field of the message.
      for (let fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
        const columnName = this.columnName(info, fieldIndex);
        const fieldType = info.format[fieldIndex];
        const [value, nextOffset] = parseField(this.view, cursor, fieldType);

        // Write the value to the field array.
        this.writeFieldValue(result[columnName], sampleIndex, value);
        cursor = nextOffset;
      }
    });

    // Store parsed messages of this message type
    this.messages[messageName] = result;
  }

  private columnName(info: MessageTypeInfo, index: number): string {
    return info.columns[index] ?? `field_${index}`;
  }

  private createFieldArray(
    ch: FormatChar,
    length: number,
  ): FieldArray {
    switch (ch) {
      case "a":
      case "n":
      case "N":
      case "Z":
        return new Array(length);
      default:
        return new Float64Array(length);
    }
  }

  private writeFieldValue(
    target: FieldArray,
    index: number,
    value: ParsedValue,
  ): void {
    if (target instanceof Float64Array) {
      target[index] = value as number;
      return;
    }
    target[index] = value;
  }
}
