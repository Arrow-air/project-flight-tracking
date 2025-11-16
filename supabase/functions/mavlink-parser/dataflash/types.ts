import type { FormatChar } from "./constants.ts";


export type FieldArray =
  | Float64Array
  | Array<number | string | number[]>;


/**
 * A record of a FMT message.
 * 
 * FMT messages define the format of coming log messages.
 * All dataflash logs are described using this message type.
 * 
 * Example:
 * {
 *   typeId: 128,
 *   length: 89,
 *   name: "FMT",
 *   format: "BBnNZ",
 *   columns: "Type,Length,Name,Format,Columns",
 * }
 * 
 * This describes the shape of all FMT messages, 
 * which in turn define the shape of all other log messages.
 */
export interface FmtRecord {
  typeId: number;   // The type identifier for this message type.
  length: number;   // The length of the message in bytes.
  name: string;     // The name of the message type.
  format: string;   // The format of the message.
  columns: string;  // The columns of the message.
}

/**
 * A definition of a message format.
 * 
 * Higher utility version of FmtRecord.
 */
export interface FormatDefinition {
  typeId: number;         // The type identifier for this message type.
  length: number;         // The length of the payload in bytes.
  name: string;           // The name of the message type.
  format: FormatChar[];   // The format of the message. Each character represents a field.
  columns: string[];      // The columns of the message. Each string represents a field name.
  fieldOffsets: number[]; // The offset of each field in the message, in bytes.
  totalLength: number;    // Length of header + payload in bytes.
}

export interface MessageTypeInfo extends FormatDefinition {
  offsetArray: number[];  // Byte offsets of each message of this type in the log.
}


/**
 * A parsed message.
 */
export interface ParsedMessage {
  [fieldName: string]: FieldArray;
}

/**
 * The parsed dataflash log data.
 */
export interface ParsedLog {
  formatTable: Record<number, FormatDefinition>;
  messageTypes: Record<string, MessageTypeInfo>; // { messageTypeName: MessageTypeInfo }.
  messages: Record<string, ParsedMessage>; // { messageName: ParsedMessage }.
}
