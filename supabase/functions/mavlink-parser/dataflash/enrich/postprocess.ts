import { resolveModeString } from "./modes.ts";
import {
  applyMultiplier,
  type UnitMessageMap,
  type UnitFieldDefinition,
} from "./units.ts";
import type { ParsedLog, ParsedMessage } from "../core/types.ts";

export interface ModeEnrichmentOptions {
  messageName?: string; // Defaults to "MODE"
  fieldName?: string; // Defaults to "Mode"
  mavType?: number; // Optional MAV_TYPE code to pick the right mode table
  outputFieldName?: string; // Defaults to "<fieldName>Text"
}

export interface EnrichOptions {
  units?: UnitMessageMap;
  mode?: ModeEnrichmentOptions;
}

/**
 * Produce a new ParsedLog with optional unit scaling and mode string fields.
 * Raw fields are preserved; enriched fields are added alongside them.
 */
export function enrichParsedLog(parsed: ParsedLog, options: EnrichOptions = {}): ParsedLog {
  const messages: Record<string, ParsedMessage> = {};

  for (const [messageName, message] of Object.entries(parsed.messages)) {
    // Shallow copy message so we do not mutate the original ParsedLog.
    const enriched: ParsedMessage = { ...message };

    if (options.units) {
      applyUnits(messageName, enriched, options.units[messageName]);
    }

    if (options.mode) {
      applyModeStrings(messageName, enriched, options.mode);
    }

    messages[messageName] = enriched;
  }

  return {
    ...parsed,
    messages,
  };
}

function applyModeStrings(
  messageName: string,
  target: ParsedMessage,
  opts: ModeEnrichmentOptions,
): void {
  const msgName = opts.messageName ?? "MODE";
  if (messageName !== msgName) return;

  const fieldName = opts.fieldName ?? "Mode";
  const source = target[fieldName];
  if (!source) return;

  const outField = opts.outputFieldName ?? `${fieldName}Text`;
  const values = new Array(source.length);

  for (let i = 0; i < source.length; i++) {
    const raw = (source as Array<number | string>)[i];
    const modeValue = typeof raw === "number" ? raw : undefined;
    values[i] = modeValue !== undefined ? resolveModeString(modeValue, opts.mavType) ?? "" : "";
  }

  target[outField] = values;
}

function applyUnits(
  messageName: string,
  target: ParsedMessage,
  unitFields?: Record<string, UnitFieldDefinition>,
): void {
  if (!unitFields) return;

  for (const [fieldName, unitDef] of Object.entries(unitFields)) {
    const source = target[fieldName];
    if (!source) continue;

    const outputName = unitDef.outputFieldName ?? `${fieldName}_scaled`;

    // Only scale numeric arrays; leave string arrays alone.
    if (Array.isArray(source)) {
      const scaled = source.map((value) =>
        typeof value === "number" ? applyMultiplier(value, unitDef.multiplierCode) : value
      );
      target[outputName] = scaled;
      continue;
    }

    if (source instanceof Float64Array) {
      const scaled = new Float64Array(source.length);
      for (let i = 0; i < source.length; i++) {
        scaled[i] = applyMultiplier(source[i], unitDef.multiplierCode);
      }
      target[outputName] = scaled;
    }
  }
}
