// Dataflash constants.
// https://gitlab.nps.edu/sasc/ardupilot/-/blob/ae4dae171580e15ec9cdcd949cecf4f6a58df3e4/libraries/DataFlash/LogStructure.h

/**
 * The header definition of a dataflash log packet.
 * Each packet in the log starts with this 3-byte header, then payload.
 * 
 * Message:
 *    HEADER1  HEADER2  TYPE  PAYLOAD...
 *    A3       95       tt    [tt-specific payload]
 */
export const DF_HEADER1 = 0xa3; // Decimal 163
export const DF_HEADER2 = 0x95; // Decimal 149
export const DF_HEADER_LENGTH = 3; // The length of the header (in bytes).

/**
 * The type identifier for the FMT message.
 * FMT messages are used to define the format of the log messages.
 * 
 * Ardupilot Dataflash logs are self-describing, so the first messages are FMT messages.
 * 
 * At the beginning of a log file, we expect to find a series of FMT messages, 
 * which will be used to define the format of the remaining log messages.
 */
export const FMT_TYPE_ID = 128; // Decimal 128


// Keys: format characters (letters).
// Values: size of the field in bytes.
// Used to interpret the binary data in the log.
export const FORMAT_CHAR_SIZE = {
  a: 64,   // int16_t[32]
  b: 1,    // Int8
  B: 1,    // Uint8
  c: 2,    // Int16 / 100
  C: 2,    // Uint16 / 100
  d: 8,    // Float64
  e: 4,    // Int32 / 100
  E: 4,    // Uint32 / 100
  f: 4,    // Float32
  h: 2,    // Int16
  H: 2,    // Uint16
  i: 4,    // Int32
  I: 4,    // Uint32
  L: 4,    // Int32 (latitude/longitude)
  M: 1,    // Uint8 (flight mode)
  n: 4,    // char[4]
  N: 16,   // char[16]
  q: 8,    // Int64
  Q: 8,    // Uint64 
  Z: 64,   // char[64]
} as const satisfies Record<string, number>;

export type FormatChar = keyof typeof FORMAT_CHAR_SIZE;
