require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.user.findMany({ include: { settings: true } });
    for (const u of users) {
      console.log(`User: ${u.email}`);
      console.log(`  SubStatus: ${u.subscriptionStatus}`);
      console.log(`  AppPassword: ${!!u.settings?.appPassword}`);
      console.log(`  AutoReply: ${u.settings?.autoReply}`);
    }

    const emails = await prisma.email.findMany({
      orderBy: { receivedAt: 'desc' },
      take: 10
    });
    console.log('\nLast 10 emails saved in DB:');
    for (const e of emails) {
      console.log(`  ${e.receivedAt.toISOString()} | ${e.from} -> ${e.subject}`);
    }

    const threads = await prisma.thread.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log('\nLast 10 threads:');
    for (const t of threads) {
      console.log(`  ${t.createdAt.toISOString()} | Status: ${t.status} | ThreadID: ${t.threadId}`);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
run();
