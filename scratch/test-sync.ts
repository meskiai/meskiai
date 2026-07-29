import { runSync } from '../lib/cron';
import { prisma } from '../lib/prisma';

async function main() {
  console.log("Starting manual sync test...");
  await runSync();
  console.log("Sync finished.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
