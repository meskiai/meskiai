import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

// Only accessible by the owner account (miloszmeski@icloud.com or by CRON_SECRET header)
export async function GET(req: Request) {
  // Allow access via CRON_SECRET (for internal monitoring)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isInternalAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isInternalAuth) {
    // Fall back to session auth — only the owner should see this
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Only the owner email can access this status page
    const ownerEmail = process.env.OWNER_EMAIL || 'miloszmeski@icloud.com';
    if (session.user.email !== ownerEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    const users = await prisma.user.findMany({
      include: { settings: true },
      take: 50
    });

    const report = users.map(u => ({
      email: u.email,
      autoReply: u.settings?.autoReply ?? null,
      hasBusinessContext: !!(u.settings?.businessContext),
      onboardingDone: u.settings?.onboardingDone ?? null,
      subscriptionStatus: u.subscriptionStatus,
      stripePriceId: u.stripePriceId ?? null,
      lastAgentRunAt: u.settings?.lastAgentRunAt ?? null,
      emailsSentThisMonth: u.settings?.emailsSentThisMonth ?? 0,
    }));

    return NextResponse.json({
      userCount: users.length,
      activeAgents: report.filter(r => r.autoReply).length,
      users: report
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
