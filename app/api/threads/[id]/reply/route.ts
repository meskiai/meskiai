import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";
import { sendReplySMTP } from "../../../../../lib/mail";

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

    // Get user's app password for SMTP
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    if (!userSettings?.appPassword) {
      return NextResponse.json({ 
        error: "Brak skonfigurowanego Hasła Aplikacji Google. Przejdź do zakładki Konfiguracja i wpisz hasło aplikacji." 
      }, { status: 400 });
    }

    // Get the original email to reply to
    const originalEmail = thread.emails.find(e => !e.isFromAgent);
    if (!originalEmail) {
      return NextResponse.json({ error: "No original email found in thread" }, { status: 400 });
    }

    // Extract sender email
    let toEmail = originalEmail.from;
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

    // Send via SMTP using Gmail App Password
    await sendReplySMTP(
      session.user.email!,
      userSettings.appPassword,
      toEmail,
      replySubject,
      replyContent,
      originalEmail.messageId,
      references
    );

    // Save our reply in the DB
    await prisma.email.create({
      data: {
        threadId: thread.id,
        messageId: `sent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        to: toEmail,
        subject: replySubject,
        from: session.user.email || "Agent AI",
        snippet: replyContent.substring(0, 150),
        body: replyContent,
        receivedAt: new Date(),
        isFromAgent: true
      }
    });

    // Update thread status
    await prisma.thread.update({
      where: { id: thread.id },
      data: {
        status: "REPLIED",
        draftReply: null,
        updatedAt: new Date()
      }
    });

    // Update email sent counter
    await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: { emailsSentThisMonth: { increment: 1 } }
    }).catch(() => {});

    return NextResponse.json({ message: "Reply sent successfully" });
  } catch (error: any) {
    console.error("Send reply error:", error);

    let errorMessage = error?.message || "Nieznany błąd serwera";

    if (errorMessage.toLowerCase().includes("invalid login") || errorMessage.toLowerCase().includes("authentication")) {
      errorMessage = "Błąd uwierzytelniania SMTP. Sprawdź czy Hasło Aplikacji Google jest poprawne i czy IMAP jest włączony w Gmailu.";
    } else if (errorMessage.toLowerCase().includes("econnrefused") || errorMessage.toLowerCase().includes("timeout")) {
      errorMessage = "Nie można połączyć się z serwerem SMTP Gmail. Sprawdź połączenie internetowe.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
