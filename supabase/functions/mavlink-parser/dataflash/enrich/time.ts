// GPS time helpers adapted from the legacy JsDataflashParser.

/**
 * Number of leap seconds between TAI and UTC for a given year/month.
 * Source matches the legacy table used in UAVLogViewer.
 */
export function leapSecondsTAI(year: number, month: number): number {
  const yyyymm = year * 100 + month;
  if (yyyymm >= 201701) return 37;
  if (yyyymm >= 201507) return 36;
  if (yyyymm >= 201207) return 35;
  if (yyyymm >= 200901) return 34;
  if (yyyymm >= 200601) return 33;
  if (yyyymm >= 199901) return 32;
  if (yyyymm >= 199707) return 31;
  if (yyyymm >= 199601) return 30;
  return 0;
}

/**
 * Leap seconds between GPS time and UTC.
 * GPS is always 19 seconds behind TAI.
 */
export function leapSecondsGPS(year: number, month: number): number {
  return leapSecondsTAI(year, month) - 19;
}

/**
 * Convert GPS week/ms timestamps into a JavaScript Date, given a log start time.
 *
 * @param gpsWeek - GPS week number.
 * @param gpsMs - Milliseconds within the week.
 * @param logStartOffsetUs - TimeUS value (microseconds) from log start.
 * @returns Date or undefined if inputs look invalid.
 */
export function gpsToDate(
  gpsWeek: number,
  gpsMs: number,
  logStartOffsetUs: number,
): Date | undefined {
  if (gpsWeek <= 0 || gpsMs <= 0) return undefined;
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const gpsMillis = gpsWeek * msPerWeek + gpsMs;
  const unixGpsOffsetMs = 315964800 * 1000; // GPS epoch (1980) to Unix (1970) offset.

  // Adjust for when the log started relative to first GPS fix.
  const adjustedMs = gpsMillis - logStartOffsetUs * 0.001;
  const unixMs = unixGpsOffsetMs + adjustedMs;

  // Apply leap-second correction based on resulting date.
  const d = new Date(unixMs);
  const leap = leapSecondsGPS(d.getUTCFullYear(), d.getUTCMonth() + 1);
  return new Date(d.getTime() - leap * 1000);
}
