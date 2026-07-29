import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.userSettings.findMany({ 
    select: { userId: true, appPassword: true, autoReply: true, businessContext: true } 
  });
  console.log(JSON.stringify(users.map(u => ({
    userId: u.userId.slice(0,8)+'...',
    hasAppPassword: !!u.appPassword,
    appPasswordLen: u.appPassword?.replace(/\s/g,'').length,
    autoReply: u.autoReply,
    hasBusinessContext: !!u.businessContext,
    businessContextLen: u.businessContext?.length
  })), null, 2));

  const threads = await prisma.thread.count();
  const emails = await prisma.email.count();
  console.log(`\nThreads in DB: ${threads}, Emails in DB: ${emails}`);
}

main().finally(() => prisma.$disconnect());
