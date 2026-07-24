import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { settings: true, accounts: true },
      take: 10
    });

    const report = users.map(u => ({
      email: u.email,
      autoReply: u.settings?.autoReply ?? null,
      hasBusinessContext: !!(u.settings?.businessContext),
      onboardingDone: u.settings?.onboardingDone ?? null,
      hasGoogleAccount: u.accounts.some((a: any) => a.provider === 'google'),
      subscriptionStatus: u.subscriptionStatus,
      stripePriceId: u.stripePriceId ?? null,
      willProcess:
        u.accounts.some((a: any) => a.provider === 'google') &&
        !!u.settings &&
        !!(u.settings.businessContext),
    }));

    return NextResponse.json({
      userCount: users.length,
      activeAgents: report.filter(r => r.autoReply && r.willProcess).length,
      users: report
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
