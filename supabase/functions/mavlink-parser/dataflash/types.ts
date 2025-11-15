import type { FormatChar } from "./constants.ts";


export type FieldArray =
  | Float64Array
  | Array<number | string | number[]>;


export interface FormatDefinition {
  typeId: number;
  length: number;
  name: string;
  format: FormatChar[];
  columns: string[];
  fieldOffsets: number[];
  totalLength: number;
}

export interface MessageTypeInfo extends FormatDefinition {
  offsetArray: number[];
}


export interface ParsedMessage {
  [fieldName: string]: FieldArray;
}

export interface ParsedLog {
  formatTable: Record<number, FormatDefinition>;
  messageTypes: Record<string, MessageTypeInfo>;
  messages: Record<string, ParsedMessage>;
}
