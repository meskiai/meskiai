export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";
import { sendReplySMTP } from "../../../../../lib/mail";
import { decrypt } from "../../../../../lib/crypto";
import { PRICE_BASIC, PRICE_PRO, PRICE_MAX, getPlanLimits } from "@/lib/pricing";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const threadId = resolvedParams.id;
    const { replyContent } = await req.json();

    if (!replyContent) {
      return NextResponse.json({ error: "Reply content is required" }, { status: 400 });
    }

    // Verify ownership and get full thread
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        emails: {
          orderBy: { receivedAt: 'asc' }
        }
      }
    });

    if (!thread || thread.userId !== session.user.id) {
      return NextResponse.json({ error: "Thread not found or unauthorized" }, { status: 404 });
    }

    // Get user and their app password for SMTP
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { getTrialState, TRIAL_LIMITS } = await import('@/lib/trial');
    const trialState = getTrialState({ createdAt: user.createdAt, subscriptionStatus: user.subscriptionStatus }, user.settings || undefined);

    const isSubscriptionActive = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";

    if (trialState.isTrialExpired) {
      return NextResponse.json({ error: "Twój 3-dniowy okres próbny wygasł. Opłać subskrypcję, aby korzystać z tej funkcji." }, { status: 403 });
    }

    if (!isSubscriptionActive && !trialState.isTrialActive) {
      return NextResponse.json({ error: "Brak aktywnej subskrypcji lub wygasł okres próbny. Wykup abonament, aby korzystać z tej funkcji." }, { status: 403 });
    }
    
    const userSettings = user?.settings;
    const aiCredits = userSettings?.aiCredits ?? 0;
    const cost = 10;

    if (aiCredits < cost) {
      return NextResponse.json({
        error: `Brak wystarczającej liczby kredytów (Wymagane: ${cost}, Posiadasz: ${aiCredits}). Zrób upgrade pakietu, aby kontynuować.`
      }, { status: 403 });
    }

    if (!userSettings?.appPassword) {
      return NextResponse.json({ 
        error: "Brak skonfigurowanego Hasła Aplikacji Google. Przejdź do zakładki Konfiguracja i wpisz hasło aplikacji." 
      }, { status: 400 });
    }

    const appPassword = decrypt(userSettings.appPassword);
    if (!appPassword) {
      return NextResponse.json({ error: "Błąd odszyfrowywania hasła. Skonfiguruj je ponownie." }, { status: 400 });
    }

    // Get the original email to reply to
    const originalEmail = thread.emails.find(e => !e.isFromAgent) || thread.emails[0];
    if (!originalEmail) {
      return NextResponse.json({ error: "No original email found in thread" }, { status: 400 });
    }

    // Extract sender email
    let toEmail = originalEmail.isFromAgent ? originalEmail.to : originalEmail.from;
    const emailMatch = toEmail.match(/<([^>]+)>/);
    if (emailMatch && emailMatch[1]) {
      toEmail = emailMatch[1];
    }

    const replySubject = originalEmail.subject.startsWith("Re:")
      ? originalEmail.subject
      : `Re: ${originalEmail.subject}`;

    // Build references chain for proper email threading
    const incomingEmails = thread.emails.filter(e => !e.isFromAgent);
    const references = incomingEmails.map(e => e.messageId).join(' ');

    // Send via SMTP using Gmail App Password — capture real SMTP Message-ID
    const smtpInfo = await sendReplySMTP(
      session.user.email!,
      appPassword,
      toEmail,
      replySubject,
      replyContent,
      originalEmail.messageId,
      references
    );
    // Use the real SMTP Message-ID so client replies can be matched back to this thread
    const sentMsgId = (smtpInfo as any)?.messageId || `sent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Save our reply in the DB
    await prisma.email.create({
      data: {
        threadId: thread.id,
        messageId: sentMsgId,
        to: toEmail,
        subject: replySubject,
        from: session.user.email || "Agent AI",
        snippet: replyContent.substring(0, 150),
        body: replyContent,
        receivedAt: new Date(),
        isFromAgent: true
      }
    });

    // Update thread status:
    // REQUIRES_ATTENTION → stays REQUIRES_ATTENTION (human conversation ongoing)
    // Anything else → REPLIED (client can write back and it will escalate to REQUIRES_ATTENTION)
    await prisma.thread.update({
      where: { id: thread.id },
      data: {
        status: thread.status === "REQUIRES_ATTENTION" ? "REQUIRES_ATTENTION" : "REPLIED",
        draftReply: null,
        updatedAt: new Date()
      }
    });

    // Update aiCredits (MAX plan has unlimited credits — skip deduction)
    if (user.stripePriceId !== PRICE_MAX) {
      await prisma.userSettings.update({
        where: { userId: session.user.id },
        data: { aiCredits: { decrement: cost } }
      }).catch(() => {});
    }

    return NextResponse.json({ message: "Reply sent successfully" });
  } catch (error: any) {
    console.error("Send reply error:", error);

    let errorMessage = error?.message || "Nieznany błąd serwera";

    if (errorMessage.toLowerCase().includes("invalid login") || errorMessage.toLowerCase().includes("authentication")) {
      errorMessage = "Błąd uwierzytelniania SMTP. Sprawdź czy Hasło Aplikacji Google jest poprawne i czy POP3 jest włączony w Gmailu.";
    } else if (errorMessage.toLowerCase().includes("econnrefused") || errorMessage.toLowerCase().includes("timeout")) {
      errorMessage = "Nie można połączyć się z serwerem SMTP Gmail. Sprawdź połączenie internetowe.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
