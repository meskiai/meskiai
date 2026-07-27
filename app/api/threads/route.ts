import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const threads = await prisma.thread.findMany({
      where: { userId: session.user.id },
      take: 500, // Zwiększony limit z 50 do 500, aby zakładki Wysłane i Spam nie znikały
      include: {
        emails: {
          orderBy: { receivedAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
  }
}
