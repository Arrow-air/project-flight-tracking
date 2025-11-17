import type { ParsedLog, ParsedMessage } from "../types.ts";
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

export interface ParamsSummary {
  params: ParamRecord[];
  defaults: DefaultParamRecord[];
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

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "");
}

function toArray<T>(field?: ParsedMessage[keyof ParsedMessage]): T[] | null {
  if (!field) return null;
  if (Array.isArray(field)) return field as T[];
  if (field instanceof Float64Array) return Array.from(field) as T[];
  return null;
}
