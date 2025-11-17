import type { FormatChar } from "./constants.ts";


// Note: 
// ===============================================================
//   These types are used to describe the structure of the dataflash log.
//   Use these types more as comments than hard constraints.
//   This should help guide development and interaction with binary data.
// ===============================================================


// TODO
export type FieldArray =
  | Float64Array
  | Array<number | string | number[]>;


/**
 * A type identifier for a message type.
 * 
 *   This corresponds to a message type in the FMT message.
 *   Values are single-byte unsigned integers.
 * 
 * E.g. 128 (FMT), 129 (ATT), 130 (POS), etc.
 */
export type MessageTypeId = number; // 0-255

/**
 * A name for a message type.
 *   This corresponds to a message type in the FMT message.
 * 
 * E.g. "ATT", "POS", "PARAM", "DEFAULT_PARAM", etc.
 */
export type MessageTypeName = string;

/**
 * A name for a field in a parsed message.
 *   This corresponds to a column in the FMT message.
 * E.g. "TimeUS", "Roll", "Pitch", "Yaw", "Lat", "Lng", "Alt", etc.
 */
export type MessageFieldName = string;



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
  typeId: MessageTypeId;   // The type identifier for this message type.
  length: number;          // The length of the message in bytes.
  name: MessageTypeName;   // The name of the message type.
  format: string;          // The format of the message.
  columns: string;         // The comma-separated columns of the message, in a single string.
}

/**
 * A definition of a message format.
 * 
 * Higher utility version of FmtRecord.
 */
export interface FormatDefinition {
  typeId: MessageTypeId;        // The type identifier for this message type.
  length: number;               // The length of the payload in bytes.
  name: MessageTypeName;        // The name of the message type.
  format: FormatChar[];         // The format of the message. Each character represents a field's data type.
  columns: MessageFieldName[];  // The columns of the message. Each string represents a field name.
  fieldOffsets: number[];       // The offset of each field in the message, in bytes.
  totalLength: number;          // Length of header + payload in bytes.
}

/**
 * A message type info object, extending the FormatDefinition.
 * 
 */
export interface MessageTypeInfo extends FormatDefinition {
  offsetArray: number[];  // Byte offsets of each message of this type in the log.
}

/**
 * A map of message types to their format definitions + message locations.
 * { MessageTypeName: MessageTypeInfo }.
 * 
 * Examples:
 * 
 * {
 *   "FMT": {
 *     typeId: 128,
 *     length: 89,
 *     name: "FMT",
 *     format: ["BBnNZ"],
 *     columns: ["Type", "Length", "Name", "Format", "Columns"],
 *     fieldOffsets: [0, 1, 2, 3, 4],
 *     totalLength: 92,
 *     offsetArray: [123, 456, 789, ...],
 *   }
 * }
 */
// export type MessageTypeInfoMap = Record<MessageTypeName, MessageTypeInfo>;

/**
 * A parsed message, composed of field arrays with values for each message.
 * Efficient structure for time-series data access.
 * 
 * Example:
 * {
 *   "TimeUS": [1000, 2000, 3000],
 *   "Roll": [0.0, 0.1, 0.2],
 *   "Pitch": [0.0, 0.1, 0.2],
 *   "Yaw": [0.0, 0.1, 0.2],
 * }
 */
export interface ParsedMessage {
  [fieldName: MessageFieldName]: FieldArray;
}

/**
 * The parsed dataflash log data.
 */
export interface ParsedLog {
  formatTable: Record<MessageTypeId, FormatDefinition>; // { MessageTypeId: FormatDefinition }.
  messageTypes: Record<MessageTypeName, MessageTypeInfo>; // { MessageTypeName: MessageTypeInfo }.
  messages: Record<MessageTypeName, ParsedMessage>; // { messageName: ParsedMessage }.
}
