import type { ParsedLog, ParsedMessage } from "../core/types.ts";
import type { ExtractionContext, ExtractionResult, Extractor } from "./types.ts";

export interface PositionRecord {
  timeUs?: number;
  lat?: number;
  lon?: number;
  alt?: number;
  relAlt?: number;
  sats?: number;
  status?: number;
  speed?: number;
  course?: number;
}

export interface PositionExtractorOptions {
  messageName?: string; // e.g., "GPS"
  latField?: string; // e.g., "Lat" (raw int32 * 1e7)
  lonField?: string; // e.g., "Lng" or "Lon"
  altField?: string; // e.g., "Alt" (cm)
  relAltField?: string; // e.g., "AltRel" (cm)
  satsField?: string; // e.g., "NSats"
  statusField?: string; // e.g., "Status"
  speedField?: string; // e.g., "Spd"
  courseField?: string; // e.g., "GCrs" or "COG"
  timeField?: string; // e.g., "TimeUS"
  latLonScale?: number; // default 1e7
  altScale?: number; // default 100 (cm -> m)
  speedScale?: number; // optional scaling for speed
}

export class PositionExtractor implements Extractor<"position", PositionRecord[]> {
  private readonly opts: Required<PositionExtractorOptions>;

  constructor(opts: PositionExtractorOptions = {}) {
    this.opts = {
      messageName: opts.messageName ?? "GPS",
      latField: opts.latField ?? "Lat",
      lonField: opts.lonField ?? "Lng",
      altField: opts.altField ?? "Alt",
      relAltField: opts.relAltField ?? "AltRel",
      satsField: opts.satsField ?? "NSats",
      statusField: opts.statusField ?? "Status",
      speedField: opts.speedField ?? "Spd",
      courseField: opts.courseField ?? "GCrs",
      timeField: opts.timeField ?? "TimeUS",
      latLonScale: opts.latLonScale ?? 1e7,
      altScale: opts.altScale ?? 100,
      speedScale: opts.speedScale ?? 1,
    };
  }

  extract(ctx: ExtractionContext): ExtractionResult<"position", PositionRecord[]> | null {
    const message = ctx.parsed.messages[this.opts.messageName];
    if (!message) return null;

    const latValues = toArray<number>(message[this.opts.latField]);
    const lonValues = toArray<number>(message[this.opts.lonField]);
    if (!latValues || !lonValues) return null;

    const len = Math.min(latValues.length, lonValues.length);
    const timeValues = toArray<number>(message[this.opts.timeField]);
    const altValues = toArray<number>(message[this.opts.altField]);
    const relAltValues = toArray<number>(message[this.opts.relAltField]);
    const satsValues = toArray<number>(message[this.opts.satsField]);
    const statusValues = toArray<number>(message[this.opts.statusField]);
    const speedValues = toArray<number>(message[this.opts.speedField]);
    const courseValues = toArray<number>(message[this.opts.courseField]);

    const data: PositionRecord[] = new Array(len);
    for (let i = 0; i < len; i++) {
      data[i] = {
        timeUs: timeValues ? timeValues[i] : undefined,
        lat: latValues[i] / this.opts.latLonScale,
        lon: lonValues[i] / this.opts.latLonScale,
        alt: altValues ? altValues[i] / this.opts.altScale : undefined,
        relAlt: relAltValues ? relAltValues[i] / this.opts.altScale : undefined,
        sats: satsValues ? satsValues[i] : undefined,
        status: statusValues ? statusValues[i] : undefined,
        speed: speedValues ? speedValues[i] / this.opts.speedScale : undefined,
        course: courseValues ? courseValues[i] : undefined,
      };
    }

    return { name: "position", data };
  }
}

function toArray<T>(field?: ParsedMessage[keyof ParsedMessage]): T[] | null {
  if (!field) return null;
  if (Array.isArray(field)) return field as T[];
  if (field instanceof Float64Array) return Array.from(field) as T[];
  return null;
}
