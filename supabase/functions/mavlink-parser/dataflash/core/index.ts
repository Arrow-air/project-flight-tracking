// Public surface for low-level DataFlash parsing primitives.

export { DataflashParserTS } from "./parser.ts";

export { parseField } from "../binary.ts";
export { buildFormatDefinition, parseFmtRecord } from "./fmt.ts";
export {
  DF_HEADER1,
  DF_HEADER2,
  DF_HEADER_LENGTH,
  FMT_TYPE_ID,
  type FormatChar,
} from "./constants.ts";

export type {
  MessageTypeId,
  MessageTypeName,
  MessageTypeInfo,
  MessageFieldName,
  FieldArray,
  FmtRecord,
  FormatDefinition,
  ParsedLog,
  ParsedMessage,
} from "./types.ts";
