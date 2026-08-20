import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { PRICE_BASIC, PRICE_PRO, PRICE_MAX, getPlanLimits } from "@/lib/pricing";
import { sendReplySMTP } from "../../../../lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leadId, toEmail, subject, body } = await req.json();

    if (!leadId || !toEmail || !subject || !body) {
      return NextResponse.json({ error: "Wszystkie pola są wymagane" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId, userId: session.user.id }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Get user and their app password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { getTrialState, TRIAL_LIMITS } = await import('@/lib/trial');
    const trialState = getTrialState({ createdAt: user.createdAt, subscriptionStatus: user.subscriptionStatus }, user.settings || undefined);

    if (trialState.isTrialExpired) {
      return NextResponse.json({ error: "Twój 3-dniowy okres próbny wygasł. Opłać subskrypcję, aby korzystać z tej funkcji." }, { status: 403 });
    }

    const isSubscriptionActive = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
    if (!isSubscriptionActive && !trialState.isTrialActive) {
      return NextResponse.json({ error: "Brak aktywnej subskrypcji lub wygasł okres próbny. Wykup abonament, aby korzystać z tej funkcji." }, { status: 403 });
    }
    
    const userSettings = user?.settings;

    if (!userSettings?.appPassword) {
      return NextResponse.json({ 
        error: "Brak skonfigurowanego Hasła Aplikacji Google. Przejdź do panelu i wpisz hasło aplikacji." 
      }, { status: 400 });
    }

    const aiCredits = userSettings.aiCredits ?? 0;
    const expectedCost = 10;

    if (aiCredits < expectedCost) {
      return NextResponse.json({ error: `Brak wystarczającej liczby kredytów AI (Wymagane: ${expectedCost}, Posiadasz: ${aiCredits}). Zrób upgrade pakietu, aby wysłać wiadomość.` }, { status: 403 });
    }

    // Send via SMTP using Gmail App Password
    await sendReplySMTP(
      session.user.email!,
      userSettings.appPassword,
      toEmail,
      subject,
      body
    );

    // Oznacz leada jako skontaktowanego
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "CONTACTED" }
    });

    // Odejmij kredyty
    await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: { aiCredits: { decrement: expectedCost } }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: `Błąd wysyłania wiadomości: ${error?.message || "Błąd wewnętrzny"}` }, { status: 500 });
  }
}
