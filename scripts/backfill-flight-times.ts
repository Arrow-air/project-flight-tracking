/**
 * Backfill flight_duration_sec and cumulative_flight_minutes for all flight legs
 * that have uploaded logs but are missing flight time data.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx tsx scripts/backfill-flight-times.ts
 *
 * Environment variables (required):
 *   SUPABASE_URL           — Project URL (e.g. https://<ref>.supabase.co)
 *   SUPABASE_SERVICE_KEY   — Service-role key (bypasses RLS)
 *
 * Optional:
 *   DRY_RUN=true           — List legs that would be processed without calling the edge function
 *   CONCURRENCY=3          — Max parallel requests (default 3)
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DRY_RUN = process.env.DRY_RUN === "true";
const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? "3", 10);

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY"
  );
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

interface FlightLegToBackfill {
  id: string;
  aircraft_id: string;
}

async function getLegsToBackfill(): Promise<FlightLegToBackfill[]> {
  // Get flight legs missing flight time data
  const url = `${SUPABASE_URL}/rest/v1/flight_legs?select=id,aircraft_id&cumulative_flight_minutes=is.null`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error("Failed to fetch flight legs:", await res.text());
    process.exit(1);
  }
  const allLegs: FlightLegToBackfill[] = await res.json();

  // Get flight legs that have logs
  const logUrl = `${SUPABASE_URL}/rest/v1/flight_leg_logs?select=flight_leg_id`;
  const logRes = await fetch(logUrl, { headers });
  if (!logRes.ok) {
    console.error("Failed to fetch flight leg logs:", await logRes.text());
    process.exit(1);
  }
  const logRows: { flight_leg_id: string }[] = await logRes.json();
  const legIdsWithLogs = new Set(logRows.map((r) => r.flight_leg_id));

  // Only backfill legs that have logs
  return allLegs.filter((leg) => legIdsWithLogs.has(leg.id));
}

async function analyzeFlightTime(
  legId: string
): Promise<{ ok: boolean; note?: string }> {
  const url = `${SUPABASE_URL}/functions/v1/mavlink-parser/logs/${legId}/time/analysis`;
  const res = await fetch(url, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, note: `HTTP ${res.status}: ${body}` };
  }

  const data = await res.json();
  const analyses = data?.timeAnalyses ?? [];
  if (analyses.length === 0) {
    return { ok: true, note: "no time data in log" };
  }

  const last = analyses[analyses.length - 1];
  if (last.estimatedTotalFlightMinutesAfter == null) {
    return { ok: true, note: "STAT_FLTTIME not found in log" };
  }

  return { ok: true };
}

async function runBatch<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>
): Promise<void> {
  let current = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (current < items.length) {
      const index = current++;
      await fn(items[index], index);
    }
  });
  await Promise.all(workers);
}

async function main() {
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log(`Concurrency: ${CONCURRENCY}\n`);

  const legs = await getLegsToBackfill();
  console.log(`Found ${legs.length} flight legs to backfill\n`);

  if (legs.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (DRY_RUN) {
    for (const leg of legs) {
      console.log(`  [dry-run] ${leg.id} (aircraft: ${leg.aircraft_id})`);
    }
    console.log(`\nRe-run without DRY_RUN=true to process.`);
    return;
  }

  let success = 0;
  let skipped = 0;
  let failed = 0;

  await runBatch(legs, CONCURRENCY, async (leg, i) => {
    const prefix = `[${i + 1}/${legs.length}]`;
    const result = await analyzeFlightTime(leg.id);

    if (!result.ok) {
      console.log(`  ${prefix} FAIL  ${leg.id} — ${result.note}`);
      failed++;
    } else if (result.note) {
      console.log(`  ${prefix} SKIP  ${leg.id} — ${result.note}`);
      skipped++;
    } else {
      console.log(`  ${prefix} OK    ${leg.id}`);
      success++;
    }
  });

  console.log(
    `\nDone: ${success} updated, ${skipped} skipped, ${failed} failed`
  );
}

main();
