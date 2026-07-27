import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { autoReply, onboardingDone, businessContext, companyName, companyNip, companyAddress, companyBankAccount, companyWebsite, defaultVatRate, replyTone } = await req.json();

    const dataToUpdate: any = {};
    if (autoReply !== undefined) dataToUpdate.autoReply = autoReply;
    if (onboardingDone !== undefined) dataToUpdate.onboardingDone = onboardingDone;
    if (businessContext !== undefined) dataToUpdate.businessContext = businessContext;
    if (companyName !== undefined) dataToUpdate.companyName = companyName;
    if (companyNip !== undefined) dataToUpdate.companyNip = companyNip;
    if (companyAddress !== undefined) dataToUpdate.companyAddress = companyAddress;
    if (companyBankAccount !== undefined) dataToUpdate.companyBankAccount = companyBankAccount;
    if (companyWebsite !== undefined) dataToUpdate.companyWebsite = companyWebsite;
    if (defaultVatRate !== undefined) dataToUpdate.defaultVatRate = defaultVatRate;
    if (replyTone !== undefined) dataToUpdate.replyTone = replyTone;

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: dataToUpdate,
      create: { 
        userId: session.user.id, 
        autoReply: autoReply ?? true,
        onboardingDone: onboardingDone ?? false,
        businessContext: businessContext ?? "",
        companyName: companyName ?? null,
        companyNip: companyNip ?? null,
        companyAddress: companyAddress ?? null,
        companyBankAccount: companyBankAccount ?? null,
        companyWebsite: companyWebsite ?? null,
        defaultVatRate: defaultVatRate ?? "23%",
        replyTone: replyTone ?? "PROFESJONALNY"
      }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    });

    const settings = {
      ...(user?.settings || { autoReply: false }),
      hasAppPassword: !!user?.settings?.appPassword
    };
    const subscriptionData = {
      subscriptionStatus: user?.subscriptionStatus || "inactive",
      stripePriceId: user?.stripePriceId || null,
      stripeCurrentPeriodEnd: user?.stripeCurrentPeriodEnd || null,
      // Usage counters for limits display
      emailsSentThisMonth: user?.settings?.emailsSentThisMonth ?? 0,
      competitorSearchesThisMonth: user?.settings?.competitorSearchesThisMonth ?? 0,
      // Agent 24/7 status
      lastAgentRunAt: user?.settings?.lastAgentRunAt ?? null,
      agentEmailsProcessed: user?.settings?.agentEmailsProcessed ?? 0,
    };

    return NextResponse.json({ settings, subscriptionData });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}
