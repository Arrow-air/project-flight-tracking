import type { FormatChar } from "./constants.ts";

export const FORMAT_CHAR_SIZE: Record<FormatChar, number> = {
  a: 64,
  b: 1,
  B: 1,
  c: 2,
  C: 2,
  d: 8,
  E: 4,
  e: 4,
  f: 4,
  h: 2,
  H: 2,
  i: 4,
  I: 4,
  L: 4,
  M: 1,
  n: 4,
  N: 16,
  q: 8,
  Q: 8,
  Z: 64,
};

export function sizeOfFormatChar(ch: FormatChar): number {
  const size = FORMAT_CHAR_SIZE[ch];
  if (size == null) {
    throw new Error(`Unknown format character "${ch}"`);
  }
  return size;
}

type FieldValue = number | string | number[];

export function parseField(
  view: DataView,
  offset: number,
  ch: FormatChar,
): [FieldValue, number] {
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
      const value = high * 4294967296 + low;
      return [value, offset + 8];
    }
    case "q": {
      const low = view.getInt32(offset, true);
      const high = view.getInt32(offset + 4, true);
      let value = high * 4294967296 + low;
      if (low < 0) {
        value += 4294967296;
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
