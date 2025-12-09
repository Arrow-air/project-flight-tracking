import type { ParsedMessage } from "../core/types.ts";
import type { ExtractionContext, ExtractionResult, Extractor } from "./types.ts";

export interface ParamRecord {
  timeUs?: number;
  name: string;
  value: number;
}

export interface DefaultParamRecord {
  name: string;
  defaultValue: number;
}

export interface ParamSummaryRecord {
  name: string;
  value?: number;
  default_value?: number;
  timeUs?: number; // time assigned in this log
}


export class ParamExtractor implements Extractor<"params", ParamRecord[]> {
  extract(ctx: ExtractionContext): ExtractionResult<"params", ParamRecord[]> | null {
    const { parsed } = ctx;
    const params = collectParams(parsed.messages);
    if (params.length === 0) return null;
    return { name: "params", data: params };
  }
}

export class DefaultParamExtractor implements Extractor<"defaultParams", DefaultParamRecord[]> {
  extract(ctx: ExtractionContext): ExtractionResult<"defaultParams", DefaultParamRecord[]> | null {
    const defaults = collectDefaultParams(ctx.parsed.messages);
    if (defaults.length === 0) return null;
    return { name: "defaultParams", data: defaults };
  }
}

export class ParamSummaryExtractor implements Extractor<"paramSummary", ParamSummaryRecord[]> {
  extract(ctx: ExtractionContext): ExtractionResult<"paramSummary", ParamSummaryRecord[]> | null {
    const { parsed } = ctx;
    const params = collectParams(parsed.messages);
    const defaults = collectDefaultParams(parsed.messages);
    const summary = consolidateParamSummary(params, defaults);
    return { name: "paramSummary", data: summary };
  }
}

function collectDefaultParams(messages: Record<string, ParsedMessage>): DefaultParamRecord[] {
  const msg = messages["PARM"];
  if (!msg) return [];

  const defaults = toArray<number>(msg["Default"]);
  const names = toArray<string>(msg["Name"]);
  if (!defaults || !names) return [];

  const len = Math.min(defaults.length, names.length);
  const results: DefaultParamRecord[] = new Array(len);
  for (let i = 0; i < len; i++) {
    results[i] = {
      name: names[i],
      defaultValue: defaults[i],
    };
  }
  return results;
}

function collectParams(messages: Record<string, ParsedMessage>): ParamRecord[] {
  const results: ParamRecord[] = [];

  const parm = messages["PARM"];
  if (parm) {
    const time = toArray<number>(parm["TimeUS"]) ??
      toArray<number>(parm["time_boot_ms"]);
    const names = toArray<string>(parm["Name"]);
    const values = toArray<number>(parm["Value"]);
    if (names && values) {
      const len = Math.min(names.length, values.length);
      for (let i = 0; i < len; i++) {
        results.push({
          timeUs: time ? time[i] : undefined,
          name: names[i],
          value: values[i],
        });
      }
    }
  }  

  const paramValue = messages["PARAM_VALUE"];
  if (paramValue) {
    const time = toArray<number>(paramValue["TimeUS"]) ??
      toArray<number>(paramValue["time_boot_ms"]);
    const names = toArray<string>(paramValue["param_id"]);
    const values = toArray<number>(paramValue["param_value"]);
    if (names && values) {
      const len = Math.min(names.length, values.length);
      for (let i = 0; i < len; i++) {
        results.push({
          timeUs: time ? time[i] : undefined,
          name: sanitizeName(names[i]),
          value: values[i],
        });
      }
    }
  }

  return results;
}

/**
 * Consolidate the parameter summary by appending new values if seen, otherwise creating new entries.
 * Helper to extract useful param info from a dataflash log.
 * @param params - The parameter records to consolidate.
 * @param defaults - The default parameter records to consolidate.
 * @returns The consolidated parameter summary.
 */
export function consolidateParamSummary(
  params: ParamRecord[], 
  defaults: DefaultParamRecord[]
): ParamSummaryRecord[] {
  const map = new Map<string, ParamSummaryRecord>();

  // 1. Process current values, append if seen, otherwise create new entry
  for (const param of params) {
    const existing = map.get(param.name); // Have we seen this param before?
    if (!existing) {
      map.set(param.name, {
        name: param.name,
        value: param.value,
        timeUs: param.timeUs,
      });
      continue;
    }

    const nextTime = param.timeUs ?? Number.NEGATIVE_INFINITY;
    const currentTime = existing.timeUs ?? Number.NEGATIVE_INFINITY;
    if (nextTime >= currentTime) {
      existing.value = param.value; // Update the value if it's newer
      existing.timeUs = param.timeUs;
    }
  }

  // 2. Process default values, append if seen, otherwise create new entry
  for (const def of defaults) {
    const existing = map.get(def.name) ?? { name: def.name };
    if (existing.default_value === undefined) {
      existing.default_value = def.defaultValue;
    }
    map.set(def.name, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  // return Array.from(map.values());
}


function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "");
}

function toArray<T>(field?: ParsedMessage[keyof ParsedMessage]): T[] | null {
  if (!field) return null;
  if (Array.isArray(field)) return field as T[];
  if (field instanceof Float64Array) return Array.from(field) as T[];
  return null;
}
