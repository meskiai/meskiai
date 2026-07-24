import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';
import { sendEmail } from '../../../lib/gmail';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { threadId, replyBody } = await req.json();

    const thread = await prisma.thread.findUnique({
      where: { id: threadId, userId: session.user.id },
      include: { emails: { orderBy: { receivedAt: 'desc' }, take: 1 } }
    });

    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    if (thread.emails.length === 0) return NextResponse.json({ error: 'No emails in thread' }, { status: 400 });

    const latestEmail = thread.emails[0];
    const replyTo = latestEmail.from.replace(/.*<(.+)>.*/, '$1');

    await sendEmail(session.user.id, replyTo, `Re: ${latestEmail.subject}`, replyBody, thread.threadId);

    // Mark as replied
    await prisma.thread.update({
      where: { id: thread.id },
      data: { status: 'REPLIED', draftReply: null }
    });

    // Record the sent email
    await prisma.email.create({
      data: {
        threadId: thread.id,
        messageId: `sent-${Date.now()}`,
        from: session.user.email || 'Agent',
        to: replyTo,
        subject: `Re: ${latestEmail.subject}`,
        snippet: replyBody.substring(0, 100),
        body: replyBody,
        receivedAt: new Date(),
        isFromAgent: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
