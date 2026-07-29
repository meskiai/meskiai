import { prisma } from '../lib/prisma';

async function check() {
  console.log("--- Users ---");
  const users = await prisma.user.findMany({
    include: { settings: true }
  });
  
  for (const u of users) {
    console.log(`User: ${u.email}`);
    console.log(`  SubStatus: ${u.subscriptionStatus}`);
    console.log(`  PriceId: ${u.stripePriceId}`);
    console.log(`  Settings: autoReply=${u.settings?.autoReply}, appPwd=${!!u.settings?.appPassword}, sent=${u.settings?.emailsSentThisMonth}`);
  }

  console.log("\n--- Latest 10 Threads ---");
  const threads = await prisma.thread.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: {
      user: { select: { email: true } },
      emails: { select: { messageId: true, subject: true, isFromAgent: true, receivedAt: true } }
    }
  });

  for (const t of threads) {
    console.log(`Thread ID: ${t.id} | Status: ${t.status} | User: ${t.user?.email}`);
    console.log(`  Draft: ${t.draftReply ? t.draftReply.substring(0, 50) + '...' : 'None'}`);
    for (const e of t.emails) {
      console.log(`  - Email: ${e.subject} | FromAgent: ${e.isFromAgent} | Date: ${e.receivedAt}`);
    }
  }
}

check().catch(console.error).finally(() => process.exit(0));
