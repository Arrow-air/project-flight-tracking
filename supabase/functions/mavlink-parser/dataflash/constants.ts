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


export type FormatChar =
  | "a"
  | "b"
  | "B"
  | "h"
  | "H"
  | "i"
  | "I"
  | "f"
  | "d"
  | "Q"
  | "q"
  | "n"
  | "N"
  | "Z"
  | "c"
  | "C"
  | "E"
  | "e"
  | "L"
  | "M";
