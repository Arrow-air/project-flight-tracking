import type { FormatChar } from "./constants.ts";
import { parseField, sizeOfFormatChar } from "./binary.ts";
import type { FormatDefinition } from "./types.ts";

export interface FmtRecord {
  typeId: number;
  length: number;
  name: string;
  format: string;
  columns: string;
}

export function parseFmtRecord(
  view: DataView,
  offset: number,
): FmtRecord {
  let cursor = offset;
  const [typeIdRaw, nextAfterType] = parseField(view, cursor, "B");
  const typeId = ensureNumber(typeIdRaw, "Type");
  const [lengthRaw, nextAfterLength] = parseField(view, nextAfterType, "B");
  const length = ensureNumber(lengthRaw, "Length");
  const [nameRaw, nextAfterName] = parseField(view, nextAfterLength, "n");
  const name = ensureString(nameRaw, "Name");
  const [formatRaw, nextAfterFormat] = parseField(view, nextAfterName, "N");
  const format = ensureString(formatRaw, "Format");
  const [columnsRaw] = parseField(view, nextAfterFormat, "Z");
  const columns = ensureString(columnsRaw, "Columns");

  return {
    typeId,
    length,
    name,
    format,
    columns,
  };
}

export function buildFormatDefinition(record: FmtRecord): FormatDefinition {
  const formatChars = record.format
    .split("")
    .filter(Boolean) as FormatChar[];
  const rawColumns = record.columns.split(",");
  const normalizedColumns = formatChars.map((_, index) => {
    const column = rawColumns[index]?.trim() ?? "";
    return column === "" ? `field_${index}` : column;
  });

  const fieldOffsets: number[] = new Array(formatChars.length);
  let runningOffset = 0;
  for (let i = 0; i < formatChars.length; i++) {
    fieldOffsets[i] = runningOffset;
    runningOffset += sizeOfFormatChar(formatChars[i]);
  }

  return {
    typeId: record.typeId,
    length: record.length,
    name: record.name.trim(),
    format: formatChars,
    columns: normalizedColumns,
    fieldOffsets,
    totalLength: runningOffset,
  };
}

function ensureNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number") {
    throw new Error(`Expected numeric value for ${fieldName}`);
  }
  return value;
}

function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`Expected string value for ${fieldName}`);
  }
  return value.trim();
}
