/**
 * ! Executing this script will delete all data in your database and seed it with 10 buckets_vectors.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 *
 * Actual URL: https://snaplet-seed.netlify.app/seed/getting-started/overview
 */
import { createSeedClient } from "@snaplet/seed";

const main = async () => {
  const seed = await createSeedClient({
    dryRun: true,
  });

  // Truncate all tables in the database
  await seed.$resetDatabase();

  await seed.flight_legs((x) => x(3));
  // await seed.flight_legs([
  //   {
  //     pilot_id: '123',
  //     aircraft_id: '456',
  //     location: 'New York',
  //     altitude_m: 100,
  //     temp_C: 20,
  //     title: 'Flight 1',
  //     description: 'Flight 1 description',
  //     flight_leg_logs: (x) => x(3),
  //   },
  // ]);
  // await seed.flight_leg_logs((x) => x(10));
  // await seed.flight_legs((x) => x(10));
  // await seed.tags((x) => x(10));
  // await seed.flight_notes((x) => x(10));
  // await seed.flight_leg_tags((x) => x(10));

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes
  // console.log("Database seeded successfully!");

  process.exit();
};

main();
