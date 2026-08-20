import { prisma } from './lib/prisma';

async function clearLocks() {
  const result = await prisma.userSettings.updateMany({
    where: { runLockedUntil: { not: null } },
    data: { runLockedUntil: null }
  });
  console.log(`Unlocked ${result.count} users.`);
}

clearLocks().catch(console.error);
