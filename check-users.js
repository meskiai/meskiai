require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({
    include: { settings: true, accounts: true },
    take: 10
  });

  if (users.length === 0) {
    console.log('Brak użytkowników w bazie.');
    return;
  }

  for (const u of users) {
    const hasGoogle = u.accounts.some(a => a.provider === 'google');
    const s = u.settings;
    console.log('─'.repeat(60));
    console.log('Email:         ', u.email);
    console.log('autoReply:     ', s?.autoReply ?? '(brak ustawień)');
    console.log('businessCtx:   ', s?.businessContext ? s.businessContext.slice(0, 50) + '...' : '❌ PUSTE');
    console.log('onboardingDone:', s?.onboardingDone ?? '❌');
    console.log('konto Google:  ', hasGoogle ? '✅' : '❌ BRAK');
    console.log('subStatus:     ', u.subscriptionStatus ?? 'null');
    console.log('stripePriceId: ', u.stripePriceId ?? 'null');
  }
}

main().finally(() => p.$disconnect());
