import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import { sendReplySMTP } from '../../../lib/mail';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { threadId, replyBody } = await req.json();

    const thread = await prisma.thread.findUnique({
      where: { id: threadId, userId: session.user.id },
      include: { emails: { orderBy: { receivedAt: 'asc' } } }
    });

    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    if (thread.emails.length === 0) return NextResponse.json({ error: 'No emails in thread' }, { status: 400 });

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    if (!userSettings?.appPassword) {
      return NextResponse.json({ error: 'Brak hasła aplikacji Google. Skonfiguruj je w panelu.' }, { status: 400 });
    }

    const originalEmail = thread.emails.find(e => !e.isFromAgent) || thread.emails[0];
    const replyTo = originalEmail.from.replace(/.*<(.+)>.*/, '$1').trim() || originalEmail.from;
    const references = thread.emails.filter(e => !e.isFromAgent).map(e => e.messageId).join(' ');

    const smtpInfo = await sendReplySMTP(
      session.user.email!,
      userSettings.appPassword,
      replyTo,
      `Re: ${originalEmail.subject}`,
      replyBody,
      originalEmail.messageId,
      references
    );
    // Use the real SMTP Message-ID for proper threading
    const sentMsgId = (smtpInfo as any)?.messageId || `sent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await prisma.thread.update({
      where: { id: thread.id },
      data: { status: 'REPLIED', draftReply: null }
    });

    await prisma.email.create({
      data: {
        threadId: thread.id,
        messageId: sentMsgId,
        from: session.user.email || 'Agent',
        to: replyTo,
        subject: `Re: ${originalEmail.subject}`,
        snippet: replyBody.substring(0, 150),
        body: replyBody,
        receivedAt: new Date(),
        isFromAgent: true
      }
    });

    // Increment email sent counter
    await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: { emailsSentThisMonth: { increment: 1 } }
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send reply: ' + (error?.message || '') }, { status: 500 });
  }
}
