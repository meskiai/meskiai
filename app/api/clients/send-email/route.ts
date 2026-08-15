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
    const trialState = getTrialState({ createdAt: user.createdAt, subscriptionStatus: user.subscriptionStatus });

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

    const limits = getPlanLimits(user?.stripePriceId);
    const emailsCount = userSettings.emailsSentThisMonth || 0;

    if (trialState.isTrialActive) {
      if (emailsCount >= TRIAL_LIMITS.emails) {
        return NextResponse.json({ error: `Wykorzystałeś limit trialu (${TRIAL_LIMITS.emails} wysłanych e-maili). Zrób upgrade pakietu, aby kontynuować.` }, { status: 403 });
      }
    } else {
      const emailsMonthlyLimit = limits.emails;
      if (emailsCount >= emailsMonthlyLimit) {
        return NextResponse.json({ error: `Wykorzystałeś miesięczny limit wysłanych e-maili (${emailsMonthlyLimit}). Zrób upgrade pakietu, aby kontynuować.` }, { status: 403 });
      }
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

    // Inkrementuj licznik e-maili
    await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: { emailsSentThisMonth: { increment: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: `Błąd wysyłania wiadomości: ${error?.message || "Błąd wewnętrzny"}` }, { status: 500 });
  }
}
