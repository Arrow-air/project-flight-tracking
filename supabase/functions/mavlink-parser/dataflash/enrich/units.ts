// Unit and multiplier helpers distilled from the legacy JsDataflashParser.

export type UnitCode = string;
export type MultiplierCode = string;

export interface UnitFieldDefinition {
  unitCode: UnitCode;
  multiplierCode?: MultiplierCode;
  outputFieldName?: string; // Optional name for the scaled/display-ready field.
}

export type UnitFieldMap = Record<string, UnitFieldDefinition>;
export type UnitMessageMap = Record<string, UnitFieldMap>;



// Matches the legacy multipliers table: code -> scale factor.
export const MULTIPLIERS: Record<MultiplierCode, number> = {
  "-": 0, // no multiplier e.g. a string
  "?": 1, // unknown multiplier
  "2": 1e2,
  "1": 1e1,
  "0": 1e0,
  A: 1e-1,
  B: 1e-2,
  C: 1e-3,
  D: 1e-4,
  E: 1e-5,
  F: 1e-6,
  G: 1e-7,
  "!": 3.6, // ampere*second => mAh or km/h => m/s
  "/": 3600, // ampere*second => ampere*hour
};

// Reverse lookup for displaying prefix-only unit hints.
export const MULTIPLIER_PREFIX: Record<number, string> = {
  0.000001: "n",
  0.001: "m",
  1000: "M",
};

// Matches the legacy unit code mapping.
export const UNIT_SYMBOLS: Record<UnitCode, string> = {
  "-": "",             // no units (string, constant, Pi, etc.)
  "?": "UNKNOWN",      // units which haven't been worked out yet....
  A: "A",              // Ampere
  d: "°",              // angular degrees, -180 to 180
  b: "B",              // bytes
  k: "°/s",            // degrees per second. Degrees are NOT SI, but is some situations more user-friendly than radians
  D: "°",              // degrees of latitude
  e: "°/s/s",          // degrees per second per second. Degrees are NOT SI, but is some situations more user-friendly than radians
  E: "rad/s",          // radians per second
  G: "Gauss",          // Gauss is not an SI unit, but 1 tesla = 10000 gauss so a simple replacement is not possible here
  h: "°",              // angular degrees, 0 to 359
  i: "A.s",            // Ampere second
  J: "W.s",            // Joule (Watt second) Joule is not an SI unit, but 1 watt = 1 joule/second so a simple replacement is not possible here
  L: "rad/s/s",        // radians per second per second
  m: "m",              // metres
  n: "m/s",            // metres per second
  O: "°C",             // degrees Celsius. Not SI, but Kelvin is too cumbersome for most users
  "%": "%",            // percent
  S: "satellites",     // number of satellites
  s: "s",              // seconds
  q: "rpm",            // revolutions per minute (rpm). Not SI, but sometimes more intuitive than Hertz
  r: "rad",            // radians
  U: "°",              // degrees of longitude
  u: "ppm",            // pulses per minute (NOT parts per million)
  v: "V",              // Volt
  P: "Pa",             // Pascal
  w: "Ohm",            // Ohm
  Y: "us",             // pulse width modulation in microseconds
  z: "Hz",             // Hertz
  "#": "instance",     // instance number for message
};

export function resolveUnitSymbol(unitCode?: UnitCode): string | undefined {
  if (!unitCode) return undefined;
  return UNIT_SYMBOLS[unitCode];
}

export function applyMultiplier(value: number, multiplierCode?: MultiplierCode): number {
  if (!multiplierCode) return value;
  const scale = MULTIPLIERS[multiplierCode];
  if (scale === undefined) return value;
  if (scale === 0) return value;
  return value * scale;
}

export function formatValueWithUnit(
  value: number,
  unitCode?: UnitCode,
  multiplierCode?: MultiplierCode,
): string {
  const scaled = applyMultiplier(value, multiplierCode);
  const unit = resolveUnitSymbol(unitCode);
  return unit ? `${scaled} ${unit}` : `${scaled}`;
}
