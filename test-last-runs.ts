import { prisma } from './lib/prisma';

async function main() {
  const settings = await prisma.userSettings.findMany({
    include: { user: true }
  });

  console.log("User Settings runs:");
  for (const s of settings) {
    console.log(`User: ${s.user.email}`);
    console.log(`- autoReply: ${s.autoReply}`);
    console.log(`- lastAgentRunAt: ${s.lastAgentRunAt ? s.lastAgentRunAt.toISOString() : 'NEVER'}`);
    console.log(`- agentEmailsProcessed: ${s.agentEmailsProcessed}`);
    console.log(`- emailsSentThisMonth: ${s.emailsSentThisMonth}`);
  }
}

main().finally(() => prisma.$disconnect());
