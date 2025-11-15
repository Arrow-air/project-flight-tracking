import { DF_HEADER1, DF_HEADER2, FMT_TYPE_ID } from "./constants.ts";
import type { FormatChar } from "./constants.ts";
import { parseField } from "./binary.ts";
import type {
  FieldArray,
  MessageTypeInfo,
  ParsedLog,
  ParsedMessage,
} from "./types.ts";
import { buildFormatDefinition, type FmtRecord, parseFmtRecord } from "./fmt.ts";

type ParsedValue = number | string | number[];

const DEFAULT_FMT_RECORD: FmtRecord = {
  typeId: FMT_TYPE_ID,
  length: 89,
  name: "FMT",
  format: "BBnNZ",
  columns: "Type,Length,Name,Format,Columns",
};

export class DataflashParserTS {
  private readonly buffer: ArrayBufferLike;
  private readonly view: DataView;
  private readonly formatTable: Record<number, MessageTypeInfo>;
  private readonly offsetsByType: Record<number, number[]>;
  private readonly messages: Record<string, ParsedMessage>;
  private messageTypes: Record<string, MessageTypeInfo>;
  private scanned = false;

  constructor(buffer: ArrayBufferLike) {
    this.buffer = buffer;
    this.view = new DataView(buffer);
    this.formatTable = {};
    this.offsetsByType = {};
    this.messages = {};
    this.messageTypes = {};

    const fmtDefinition = buildFormatDefinition(DEFAULT_FMT_RECORD);
    this.formatTable[FMT_TYPE_ID] = {
      ...fmtDefinition,
      offsetArray: [],
    };
  }

  parse(selectedMessages?: string[]): ParsedLog {
    this.scanLog();

    const targetNames = selectedMessages ?? Object.keys(this.messageTypes);
    for (const name of targetNames) {
      const info = this.messageTypes[name];
      if (!info) {
        continue;
      }
      this.decodeMessage(info, name);
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

  private scanLog(): void {
    if (this.scanned) {
      return;
    }

    const logLength = this.buffer.byteLength;
    let cursor = 0;

    while (cursor <= logLength - 3) {
      if (
        this.view.getUint8(cursor) !== DF_HEADER1 ||
        this.view.getUint8(cursor + 1) !== DF_HEADER2
      ) {
        cursor += 1;
        continue;
      }

      const typeId = this.view.getUint8(cursor + 2);
      const payloadOffset = cursor + 3;

      if (!this.offsetsByType[typeId]) {
        this.offsetsByType[typeId] = [];
      }
      this.offsetsByType[typeId].push(payloadOffset);

      if (typeId === FMT_TYPE_ID) {
        const record = parseFmtRecord(this.view, payloadOffset);
        this.formatTable[record.typeId] = {
          ...buildFormatDefinition(record),
          offsetArray: [],
        };

        cursor = payloadOffset +
          this.formatTable[FMT_TYPE_ID].totalLength;
        continue;
      }

      const definition = this.formatTable[typeId];
      if (definition) {
        cursor = payloadOffset + definition.totalLength;
      } else {
        cursor = payloadOffset;
      }
    }

    const messageTypes: Record<string, MessageTypeInfo> = {};
    for (const info of Object.values(this.formatTable)) {
      const offsets = (this.offsetsByType[info.typeId] ?? []).filter(
        (offset) => offset + info.totalLength <= logLength,
      );
      messageTypes[info.name] = {
        ...info,
        offsetArray: offsets,
      };
    }

    this.messageTypes = messageTypes;
    this.scanned = true;
  }

  private decodeMessage(info: MessageTypeInfo, nameOverride?: string): void {
    const offsets = info.offsetArray;
    if (offsets.length === 0) {
      return;
    }

    const messageName = nameOverride ?? info.name;
    const result: ParsedMessage = {};
    const fieldCount = info.format.length;

    for (let fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
      const columnName = this.columnName(info, fieldIndex);
      result[columnName] = this.createFieldArray(
        info.format[fieldIndex],
        offsets.length,
      );
    }

    offsets.forEach((offset, sampleIndex) => {
      let cursor = offset;
      for (let fieldIndex = 0; fieldIndex < fieldCount; fieldIndex++) {
        const columnName = this.columnName(info, fieldIndex);
        const fieldType = info.format[fieldIndex];
        const [value, nextOffset] = parseField(this.view, cursor, fieldType);
        this.writeFieldValue(result[columnName], sampleIndex, value);
        cursor = nextOffset;
      }
    });

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
