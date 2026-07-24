import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";
import { sendEmail, getGmailClient } from "../../../../../lib/gmail";

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

    // Verify ownership
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        emails: {
          orderBy: { receivedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!thread || thread.userId !== session.user.id) {
      return NextResponse.json({ error: "Thread not found or unauthorized" }, { status: 404 });
    }

    const latestEmail = thread.emails[0];
    if (!latestEmail) {
      return NextResponse.json({ error: "No email found in thread" }, { status: 400 });
    }

    // Extract original sender email from "Name <email@domain.com>" or just "email@domain.com"
    let toEmail = latestEmail.from;
    const emailMatch = toEmail.match(/<([^>]+)>/);
    if (emailMatch && emailMatch[1]) {
      toEmail = emailMatch[1];
    }

    const replySubject = latestEmail.subject.startsWith("Re:") 
      ? latestEmail.subject 
      : `Re: ${latestEmail.subject}`;


    const gmail = await getGmailClient(session.user.id);
    let rfcMessageId: string | undefined;
    
    try {
      const msgData = await gmail.users.messages.get({
        userId: "me",
        id: latestEmail.messageId,
        format: "metadata",
        metadataHeaders: ["Message-ID"]
      });
      const headers = msgData.data.payload?.headers || [];
      const messageIdHeader = headers.find(h => h.name && h.name.toLowerCase() === 'message-id');
      rfcMessageId = messageIdHeader ? (messageIdHeader.value || undefined) : undefined;
    } catch (e) {
      console.warn("Could not fetch Message-ID for thread", e);
    }

    // Send via Gmail
    await sendEmail(
      session.user.id,
      toEmail,
      replySubject,
      replyContent,
      rfcMessageId ? thread.threadId : undefined,
      rfcMessageId
    );

    // Save our reply in the DB
    await prisma.email.create({
      data: {
        threadId: thread.id,
        messageId: `sent-${Date.now()}`,
        to: toEmail,
        subject: replySubject,
        from: session.user.email || "me",
        snippet: replyContent.substring(0, 100),
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
        draftReply: replyContent,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ message: "Reply sent successfully" });
  } catch (error: any) {
    console.error("Send reply error:", error);
    
    let errorMessage = error?.message || "Nieznany błąd serwera";
    
    // Tłumaczenie typowych błędów Google na polski, by użytkownik wiedział co ma zrobić
    if (errorMessage.toLowerCase().includes("insufficient permission") || errorMessage.toLowerCase().includes("scope")) {
      errorMessage = "Brak uprawnień do wysyłania e-maili! Musisz się wylogować z aplikacji i zalogować ponownie przez Google, aby zaakceptować nowe uprawnienie wysyłania wiadomości.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
