import { DataflashParserTS } from "../core/parser.ts";
import type { ParsedLog, ParsedMessage } from "../core/types.ts";
import { ParamExtractor, DefaultParamExtractor, ParamSummaryExtractor } from "./params.ts";
import type { ParamRecord, DefaultParamRecord, ParamSummaryRecord } from "./params.ts";
import {
  ModeExtractor,
  PositionExtractor,
  type ModeExtractorOptions,
  type PositionExtractorOptions,
  type ModeRecord,
  type PositionRecord,
} from "./index.ts";
import type { EnrichOptions } from "../enrich/postprocess.ts";
import { enrichParsedLog } from "../enrich/postprocess.ts";
import type { ExtractionContext } from "./types.ts";

export interface DataflashDataExtractorOptions {
  selectedMessages?: string[];
  enrich?: EnrichOptions;
}

export interface AttitudeRecord {
  timeUs?: number;
  roll?: number;
  pitch?: number;
  yaw?: number;
}

export interface AttitudeExtractorOptions {
  messageName?: string; // default "ATT"
  rollField?: string; // default "Roll"
  pitchField?: string; // default "Pitch"
  yawField?: string; // default "Yaw"
  timeField?: string; // default "TimeUS"
}

/**
 * High-level extractor that mirrors the original UAV Log Viewer pattern:
 * one class with multiple extract* methods for a DataFlash log.
 */
export class DataflashDataExtractor {
  private readonly parsed: ParsedLog;

  constructor(parsed: ParsedLog) {
    this.parsed = parsed;
  }

  /**
   * Convenience factory that parses a buffer (Uint8Array or ArrayBufferLike),
   * optionally enriches it, and returns a ready extractor instance.
   */
  static fromBuffer(
    buf: Uint8Array | ArrayBufferLike,
    options: DataflashDataExtractorOptions = {},
  ): DataflashDataExtractor {
    const buffer = buf instanceof Uint8Array ? buf.buffer : buf;
    const parser = new DataflashParserTS(buffer);
    const parsed = parser.parse(options.selectedMessages);
    const finalParsed = options.enrich ? enrichParsedLog(parsed, options.enrich) : parsed;
    return new DataflashDataExtractor(finalParsed);
  }

  /**
   * Extract mode timeline (raw + text) from MODE messages.
   */
  extractMode(opts?: ModeExtractorOptions): ModeRecord[] {
    const result = new ModeExtractor(opts).extract(this.ctx());
    return result?.data ?? [];
  }

  /**
   * Extract GPS/position track from GPS messages.
   */
  extractPosition(opts?: PositionExtractorOptions): PositionRecord[] {
    const result = new PositionExtractor(opts).extract(this.ctx());
    return result?.data ?? [];
  }

  /**
   * Extract attitude (roll/pitch/yaw) from ATT messages.
   */
  extractAttitude(opts: AttitudeExtractorOptions = {}): AttitudeRecord[] {
    const msgName = opts.messageName ?? "ATT";
    const rollField = opts.rollField ?? "Roll";
    const pitchField = opts.pitchField ?? "Pitch";
    const yawField = opts.yawField ?? "Yaw";
    const timeField = opts.timeField ?? "TimeUS";

    const message = this.parsed.messages[msgName];
    if (!message) return [];

    const roll = toArray<number>(message[rollField]);
    const pitch = toArray<number>(message[pitchField]);
    const yaw = toArray<number>(message[yawField]);
    if (!roll || !pitch || !yaw) return [];

    const len = Math.min(roll.length, pitch.length, yaw.length);
    const time = toArray<number>(message[timeField]);

    const data: AttitudeRecord[] = new Array(len);
    for (let i = 0; i < len; i++) {
      data[i] = {
        timeUs: time ? time[i] : undefined,
        roll: roll[i],
        pitch: pitch[i],
        yaw: yaw[i],
      };
    }
    return data;
  }

  /**
   * Extract current parameter values (PARM / PARAM_VALUE).
   */
  extractParams(): ParamRecord[] {
    const result = new ParamExtractor().extract(this.ctx());
    return result?.data ?? [];
  }

  /**
   * Extract default parameter values (from PARM.Default).
   */
  extractDefaultParams(): DefaultParamRecord[] {
    const result = new DefaultParamExtractor().extract(this.ctx());
    return result?.data ?? [];
  }

  /**
   * Convenience: get both current and default params together.
   */
  extractParamsSummary(): ParamSummaryRecord[] {
    const result = new ParamSummaryExtractor().extract(this.ctx());
    return result?.data ?? [];
  }

  private ctx(): ExtractionContext {
    return { parsed: this.parsed };
  }
}

function toArray<T>(field?: ParsedMessage[keyof ParsedMessage]): T[] | null {
  if (!field) return null;
  if (Array.isArray(field)) return field as T[];
  if (field instanceof Float64Array) return Array.from(field) as T[];
  return null;
}

