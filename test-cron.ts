import { runSync } from './lib/cron';

async function test() {
  console.log("Starting test sync...");
  await runSync();
  console.log("Test sync finished.");
}

test().catch(console.error);
