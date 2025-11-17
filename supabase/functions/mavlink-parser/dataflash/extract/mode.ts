import type { ParsedLog, ParsedMessage } from "../types.ts";
import { resolveModeString } from "../enrich/modes.ts";
import type { ExtractionContext, ExtractionResult, Extractor } from "./types.ts";

export interface ModeRecord {
  timeUs?: number;
  mode: number;
  modeText?: string;
}

export interface ModeExtractorOptions {
  messageName?: string;
  modeField?: string;
  timeField?: string;
  mavType?: number;
}

export class ModeExtractor implements Extractor<"mode", ModeRecord[]> {
  private readonly messageName: string;
  private readonly modeField: string;
  private readonly timeField?: string;
  private readonly mavType?: number;

  constructor(opts: ModeExtractorOptions = {}) {
    this.messageName = opts.messageName ?? "MODE";
    this.modeField = opts.modeField ?? "Mode";
    this.timeField = opts.timeField;
    this.mavType = opts.mavType;
  }

  extract(ctx: ExtractionContext): ExtractionResult<"mode", ModeRecord[]> | null {
    const message = ctx.parsed.messages[this.messageName];
    if (!message) return null;

    const modeValues = toArray<number>(message[this.modeField]);
    if (!modeValues) return null;

    const timeValues = this.timeField ? toArray<number>(message[this.timeField]) : null;

    const data: ModeRecord[] = [];
    for (let i = 0; i < modeValues.length; i++) {
      const mode = modeValues[i];
      data.push({
        timeUs: timeValues ? timeValues[i] : undefined,
        mode,
        modeText: resolveModeString(mode, this.mavType),
      });
    }

    return { name: "mode", data };
  }
}

function toArray<T>(field?: ParsedMessage[keyof ParsedMessage]): T[] | null {
  if (!field) return null;
  if (Array.isArray(field)) return field as T[];
  if (field instanceof Float64Array) return Array.from(field) as T[];
  return null;
}
