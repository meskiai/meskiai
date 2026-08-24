import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Weryfikacja: tylko konkretny mail ma dostęp do API
    if (!session?.user?.email || session.user.email !== 'miloszmeskisim@gmail.com') {
      return NextResponse.json({ error: "Brak uprawnień. Dostęp tylko dla administratora." }, { status: 403 });
    }

    // Pobierz wszystkich użytkowników wraz ze szczegółami ustawień i wątkami
    const rawUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscriptionStatus: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        settings: {
          select: {
            aiCredits: true,
            onboardingDone: true,
            agentEmailsProcessed: true,
            storeType: true,
            storeUrl: true,
            autoReply: true,
            lastAgentRunAt: true,
            businessContext: true,
            companyName: true,
            appPassword: true,
          }
        },
        threads: {
          select: {
            status: true
          }
        },
        _count: {
          select: {
            invoices: true,
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Przetwarzanie i agregacja statystyk wątków na serwerze
    const users = rawUsers.map(user => {
      const threadsCount = user.threads.length;
      const threadsAutoReplied = user.threads.filter(t => t.status === 'AUTO_REPLIED').length;
      const threadsPending = user.threads.filter(t => t.status === 'PENDING_APPROVAL').length;
      const threadsRequiresAttention = user.threads.filter(t => t.status === 'REQUIRES_ATTENTION').length;
      
      const { threads, ...userWithoutThreads } = user;
      
      return {
        ...userWithoutThreads,
        hasAppPassword: !!user.settings?.appPassword,
        threadStats: {
          total: threadsCount,
          autoReplied: threadsAutoReplied,
          pending: threadsPending,
          requiresAttention: threadsRequiresAttention
        }
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin Users fetch error:", error);
    return NextResponse.json({ error: "Błąd podczas pobierania danych użytkowników" }, { status: 500 });
  }
}
