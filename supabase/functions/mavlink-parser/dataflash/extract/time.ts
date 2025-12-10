import type { ParsedMessage } from "../core/types.ts";
import type { ExtractionContext, ExtractionResult, Extractor } from "./types.ts";

export type TimeEventLabel =
  | "armed"
  | "disarmed"
  | "auto_armed"
  | "land_complete"
  | "land_complete_maybe"
  | "not_landed"
  | "interlock_enabled"
  | "interlock_disabled"
  | "ekf_yaw_reset";

export interface TimeEvent {
  timeUs: number;
  label: TimeEventLabel;
  source: "EV" | "ARM";
  rawId?: number;
  rawState?: number;
}

export interface FlightSegment {
  startUs: number;
  endUs: number;
  durationSec: number;
  startEvent?: TimeEvent;
  endEvent?: TimeEvent;
}

/**
 * Time extraction result from a DataFlash log buffer.
 */
export interface TimeExtraction {
  events: TimeEvent[];
  flights: FlightSegment[];
  totalFlightSeconds: number;
  logStartUs?: number;
  logEndUs?: number;
  logDurationSec?: number;
  /**
   * Cumulative runtime reported by the autopilot (STAT_RUNTIME), in minutes.
   */
  statRuntimeMinutes?: number;
  /**
   * Cumulative flight time reported by the autopilot (STAT_FLTTIME), in minutes.
   */
  statFlightMinutes?: number;
  /**
   * Estimated total flight time after this log completes, in minutes.
   * Computed as STAT_FLTTIME + measuredFlightSeconds/60 when both are available.
   */
  estimatedTotalFlightMinutesAfter?: number;
  /**
   * Estimated total runtime after this log completes, in minutes.
   * Computed as STAT_RUNTIME + logDurationSec/60 when both are available.
   */
  estimatedTotalRuntimeMinutesAfter?: number;
}

type MaybeNumber = number | undefined;

/**
 * Mapping of Event IDs (EV message IDs) to their corresponding event labels.
 */
const EV_LABELS: Record<number, TimeEventLabel> = {
  10: "armed",
  11: "disarmed",
  15: "auto_armed",
  17: "land_complete_maybe",
  18: "land_complete",
  28: "not_landed",
  56: "interlock_disabled",
  57: "interlock_enabled",
  62: "ekf_yaw_reset",
};

const START_LABELS: TimeEventLabel[] = [
  "armed",
  "auto_armed",
  "interlock_enabled",
  "not_landed",
];

const END_LABELS: TimeEventLabel[] = [
  "disarmed",
  "land_complete",
  "land_complete_maybe",
  "interlock_disabled",
];

export class TimeExtractor implements Extractor<"time", TimeExtraction> {
  extract(ctx: ExtractionContext): ExtractionResult<"time", TimeExtraction> | null {
    const { parsed } = ctx;

    const events = collectEvents(parsed.messages);
    const flights = buildFlightSegments(events);
    const totalFlightSeconds = flights.reduce((sum, f) => sum + f.durationSec, 0);

    const { startUs: logStartUs, endUs: logEndUs } = computeLogBounds(parsed.messages);
    const logDurationSec = logStartUs !== undefined && logEndUs !== undefined
      ? (logEndUs - logStartUs) / 1e6
      : undefined;

    const statFlightMinutes = lookupParam(parsed.messages, "STAT_FLTTIME");
    const statRuntimeMinutes = lookupParam(parsed.messages, "STAT_RUNTIME");

    const estimatedTotalFlightMinutesAfter = (statFlightMinutes !== undefined)
      ? statFlightMinutes + totalFlightSeconds / 60
      : undefined;

    const estimatedTotalRuntimeMinutesAfter = (statRuntimeMinutes !== undefined && logDurationSec !== undefined)
      ? statRuntimeMinutes + logDurationSec / 60
      : undefined;

    const hasUsefulData =
      events.length > 0 ||
      flights.length > 0 ||
      logStartUs !== undefined ||
      statFlightMinutes !== undefined ||
      statRuntimeMinutes !== undefined;

    if (!hasUsefulData) return null;

    return {
      name: "time",
      data: {
        events,
        flights,
        totalFlightSeconds,
        logStartUs,
        logEndUs,
        logDurationSec,
        statRuntimeMinutes,
        statFlightMinutes,
        estimatedTotalFlightMinutesAfter,
        estimatedTotalRuntimeMinutesAfter,
      },
    };
  }
}

function collectEvents(messages: Record<string, ParsedMessage>): TimeEvent[] {
  const events: TimeEvent[] = [];

  const ev = messages["EV"];
  if (ev) {
    const times = toArray<number>(ev["TimeUS"]);
    const ids = toArray<number>(ev["Id"]);
    if (times && ids) {
      const len = Math.min(times.length, ids.length);
      for (let i = 0; i < len; i++) {
        const label = EV_LABELS[ids[i]];
        if (!label) continue;
        events.push({
          timeUs: times[i],
          label,
          source: "EV",
          rawId: ids[i],
        });
      }
    }
  }

  const arm = messages["ARM"];
  if (arm) {
    const times = toArray<number>(arm["TimeUS"]);
    const states = toArray<number>(arm["ArmState"]);
    if (times && states) {
      const len = Math.min(times.length, states.length);
      let prev: number | undefined;
      for (let i = 0; i < len; i++) {
        const state = states[i];
        if (prev !== undefined && state === prev) continue;
        events.push({
          timeUs: times[i],
          label: state > 0 ? "armed" : "disarmed",
          source: "ARM",
          rawState: state,
        });
        prev = state;
      }
    }
  }

  return events.sort((a, b) => a.timeUs - b.timeUs);
}

function buildFlightSegments(events: TimeEvent[]): FlightSegment[] {
  if (events.length === 0) return [];

  const flights: FlightSegment[] = [];
  let active: TimeEvent | null = null;

  for (const evt of events) {
    if (isStart(evt.label)) {
      active = evt;
      continue;
    }

    if (isEnd(evt.label) && active) {
      const duration = (evt.timeUs - active.timeUs) / 1e6;
      if (duration > 0) {
        flights.push({
          startUs: active.timeUs,
          endUs: evt.timeUs,
          durationSec: duration,
          startEvent: active,
          endEvent: evt,
        });
      }
      active = null;
    }
  }

  return flights;
}

function computeLogBounds(messages: Record<string, ParsedMessage>): {
  startUs?: number;
  endUs?: number;
} {
  let minTime = Number.POSITIVE_INFINITY;
  let maxTime = Number.NEGATIVE_INFINITY;

  for (const msg of Object.values(messages)) {
    const times = toArray<number>(msg["TimeUS"]);
    if (!times || times.length === 0) continue;
    const localMin = times[0];
    const localMax = times[times.length - 1];
    if (localMin < minTime) minTime = localMin;
    if (localMax > maxTime) maxTime = localMax;
  }

  return {
    startUs: isFinite(minTime) ? minTime : undefined,
    endUs: isFinite(maxTime) ? maxTime : undefined,
  };
}

function lookupParam(messages: Record<string, ParsedMessage>, name: string): MaybeNumber {
  const parm = messages["PARM"];
  if (parm) {
    const names = toArray<string>(parm["Name"]);
    const values = toArray<number>(parm["Value"]);
    if (names && values) {
      const len = Math.min(names.length, values.length);
      for (let i = 0; i < len; i++) {
        if (names[i] === name) return values[i];
      }
    }
  }

  const paramValue = messages["PARAM_VALUE"];
  if (paramValue) {
    const names = toArray<string>(paramValue["param_id"]);
    const values = toArray<number>(paramValue["param_value"]);
    if (names && values) {
      const len = Math.min(names.length, values.length);
      for (let i = 0; i < len; i++) {
        if (names[i] === name) return values[i];
      }
    }
  }

  return undefined;
}

function isStart(label: TimeEventLabel): boolean {
  return START_LABELS.includes(label);
}

function isEnd(label: TimeEventLabel): boolean {
  return END_LABELS.includes(label);
}

function toArray<T>(field?: ParsedMessage[keyof ParsedMessage]): T[] | null {
  if (!field) return null;
  if (Array.isArray(field)) return field as T[];
  if (field instanceof Float64Array) return Array.from(field) as T[];
  return null;
}
