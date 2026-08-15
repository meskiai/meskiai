import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import { getTrialState, TRIAL_LIMITS } from '@/lib/trial';
import { PRICE_PRO, PRICE_MAX, getPlanLimits } from "@/lib/pricing";

export async function POST(req: Request) {
  // Require authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { settings: true } });
    const trialState = getTrialState({ createdAt: user?.createdAt || new Date(), subscriptionStatus: user?.subscriptionStatus || null }, user?.settings || undefined);
    if (trialState.isTrialExpired) {
      return NextResponse.json({ error: 'Twój 3-dniowy okres próbny wygasł. Opłać subskrypcję, aby korzystać z tej funkcji.' }, { status: 403 });
    }

    const isSubscriptionActive = user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing';
    if (!isSubscriptionActive && !trialState.isTrialActive) {
      return NextResponse.json({ error: 'Brak aktywnej subskrypcji. Wykup abonament, aby korzystać z tej funkcji.' }, { status: 403 });
    }

    const aiGensCount = user?.settings?.aiGenerationsThisMonth || 0;
    const limits = getPlanLimits(user?.stripePriceId);
    const monthlyLimit = limits.aiGenerations;

    if (trialState.isTrialActive) {
      if (aiGensCount >= TRIAL_LIMITS.aiGenerations) {
        return NextResponse.json({ error: `Wykorzystałeś limit trialu dla AI (${TRIAL_LIMITS.aiGenerations} zapytań). Zrób upgrade, aby kontynuować.` }, { status: 403 });
      }
    } else {
      if (aiGensCount >= monthlyLimit) {
        return NextResponse.json({ error: `Wykorzystałeś miesięczny limit zapytań AI (${monthlyLimit}). Zrób upgrade, aby kontynuować.` }, { status: 403 });
      }
    }

    // Increment usage
    await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: { aiGenerationsThisMonth: { increment: 1 } }
    });

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Email content is required" }, { status: 400 });
    }

    const systemPrompt = `Jesteś profesjonalnym asystentem AI ds. obsługi klienta. 
Twoim zadaniem jest wygenerowanie profesjonalnej, uprzejmej i gotowej do wysłania odpowiedzi na otrzymany e-mail od klienta. 
Zachowaj oficjalny, lecz przyjazny ton (w języku polskim). 
Jeśli e-mail jest skargą, bądź empatyczny. Jeśli to zapytanie, udziel wyczerpującej (lub wymijającej, z obietnicą kontaktu) odpowiedzi. 
Odpowiadaj bezpośrednio treścią e-maila, bez żadnych wstępów w stylu "Oto moja propozycja".`;

    const result = await streamText({
      model: google('gemini-3.5-flash'),
      system: systemPrompt,
      prompt: `Oto treść wiadomości e-mail od klienta:\n\n"${prompt}"\n\nNapisz na nią odpowiedź:`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
