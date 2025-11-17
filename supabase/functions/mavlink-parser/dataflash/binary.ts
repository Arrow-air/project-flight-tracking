import type { FormatChar } from "./constants.ts";
import { FORMAT_CHAR_SIZE } from "./constants.ts";

type FieldValue = number | string | number[];


export function sizeOfFormatChar(ch: FormatChar): number {
  const size = FORMAT_CHAR_SIZE[ch];
  if (size == null) {
    throw new Error(`Unknown format character "${ch}"`);
  }
  return size;
}

/**
 * Parse a field from the binary data.
 * Returns the value and the new offset.
 * @param view - The DataView to parse from.
 * @param offset - The offset to start parsing from.
 * @param ch - The format character to parse.
 * @returns The value and the new offset.
 * @throws An error if the format character is unknown.
 */
export function parseField(
  view: DataView,
  offset: number,
  ch: FormatChar,
): [FieldValue, number] {

  // Used to join two 32-bit integers into a 64-bit integer.
  const UINT32_RANGE = 2 ** 32; // 4294967296

  switch (ch) {
    case "a": {
      const values = new Array<number>(32);
      for (let i = 0; i < 32; i++) {
        values[i] = view.getInt16(offset, true);
        offset += 2;
      }
      return [values, offset];
    }
    case "b": {
      const value = view.getInt8(offset);
      return [value, offset + 1];
    }
    case "B":
    case "M": {
      const value = view.getUint8(offset);
      return [value, offset + 1];
    }
    case "h": {
      const value = view.getInt16(offset, true);
      return [value, offset + 2];
    }
    case "H": {
      const value = view.getUint16(offset, true);
      return [value, offset + 2];
    }
    case "i":
    case "L": {
      const value = view.getInt32(offset, true);
      return [value, offset + 4];
    }
    case "I": {
      const value = view.getUint32(offset, true);
      return [value, offset + 4];
    }
    case "f": {
      const value = view.getFloat32(offset, true);
      return [value, offset + 4];
    }
    case "d": {
      const value = view.getFloat64(offset, true);
      return [value, offset + 8];
    }
    case "Q": {
      const low = view.getUint32(offset, true);
      const high = view.getUint32(offset + 4, true);
      const value = high * UINT32_RANGE + low;
      return [value, offset + 8];
    }
    case "q": {
      const low = view.getInt32(offset, true);
      const high = view.getInt32(offset + 4, true);
      let value = high * UINT32_RANGE + low;
      if (low < 0) {
        value += UINT32_RANGE;
      }
      return [value, offset + 8];
    }
    case "n": {
      return [readAscii(view, offset, 4), offset + 4];
    }
    case "N": {
      return [readAscii(view, offset, 16), offset + 16];
    }
    case "Z": {
      return [readAscii(view, offset, 64), offset + 64];
    }
    case "c": {
      const value = view.getInt16(offset, true) / 100;
      return [value, offset + 2];
    }
    case "C": {
      const value = view.getUint16(offset, true) / 100;
      return [value, offset + 2];
    }
    case "E": {
      const value = view.getUint32(offset, true) / 100;
      return [value, offset + 4];
    }
    case "e": {
      const value = view.getInt32(offset, true) / 100;
      return [value, offset + 4];
    }
    default:
      throw new Error(`Unsupported format character "${ch}"`);
  }
}

function readAscii(view: DataView, offset: number, length: number): string {
  const bytes = new Uint8Array(
    view.buffer,
    view.byteOffset + offset,
    length,
  );
  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) {
      break;
    }
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}
