import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import { PRICE_PRO, PRICE_MAX } from '@/lib/pricing';
import { getTrialState } from '@/lib/trial';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const isProOrMax = user?.stripePriceId === PRICE_PRO || user?.stripePriceId === PRICE_MAX;

    const { autoReply, onboardingDone, businessContext, companyName, companyNip, companyAddress, companyBankAccount, companyWebsite, defaultVatRate, replyTone, storeType, storeUrl, storeApiKey, storeApiSecret } = await req.json();

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
    // Store integration
    if (storeType !== undefined) dataToUpdate.storeType = storeType || null;
    if (storeUrl !== undefined) dataToUpdate.storeUrl = storeUrl || null;
    if (storeApiKey !== undefined) dataToUpdate.storeApiKey = storeApiKey || null;
    if (storeApiSecret !== undefined) dataToUpdate.storeApiSecret = storeApiSecret || null;
    
    // Tylko PRO i MAX mogą zmieniać ton
    if (replyTone !== undefined && isProOrMax) {
      dataToUpdate.replyTone = replyTone;
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: Object.keys(dataToUpdate).length > 0 ? dataToUpdate : {},
      create: { 
        userId: session.user.id, 
        autoReply: autoReply ?? false, // Safe default — user must explicitly enable auto-reply
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
  } catch (error: any) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: `Failed to update settings: ${error?.message || "Unknown error"}` }, { status: 500 });
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

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const trialState = getTrialState({
      createdAt: user?.createdAt || new Date(),
      subscriptionStatus: user?.subscriptionStatus
    }, user?.settings || undefined);



    // Fallback: If UserSettings doesn't exist (e.g. legacy user), create it
    let finalSettings = user?.settings;
    if (!finalSettings) {
      finalSettings = await prisma.userSettings.upsert({
        where: { userId: session.user.id },
        update: {},
        create: {
          userId: session.user.id,
          aiCredits: 50,
          autoReply: false,
        }
      });
    }

    const settings = {
      ...finalSettings,
      hasAppPassword: !!finalSettings?.appPassword,
      // Mask API secret — return boolean only for security
      storeApiSecret: finalSettings?.storeApiSecret ? "__SET__" : null,
    };

    const subscriptionData = {
      subscriptionStatus: user?.subscriptionStatus || "inactive",
      stripePriceId: user?.stripePriceId || null,
      stripeCurrentPeriodEnd: user?.stripeCurrentPeriodEnd || null,
      createdAt: user?.createdAt || null,
      trialState,
      feedbackSubmitted: user?.feedbackSubmitted ?? false,
      // Usage counters for limits display
      aiCredits: finalSettings?.aiCredits ?? 50,
      // Agent 24/7 status
      lastAgentRunAt: finalSettings?.lastAgentRunAt ?? null,
      agentEmailsProcessed: finalSettings?.agentEmailsProcessed ?? 0,
    };

    return NextResponse.json({ settings, subscriptionData });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}
