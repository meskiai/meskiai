import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Weryfikacja: tylko konkretny mail ma dostęp do API
    if (!session?.user?.email || session.user.email !== 'miloszmeskisim@gmail.com') {
      return NextResponse.json({ error: "Brak uprawnień. Dostęp tylko dla administratora." }, { status: 403 });
    }

    // Pobierz wszystkich użytkowników wraz ze szczegółami ustawień i wątkami
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscriptionStatus: true,
        stripePriceId: true,
        settings: {
          select: {
            aiCredits: true,
            onboardingDone: true,
            agentEmailsProcessed: true,
            storeType: true
          }
        },
        _count: {
          select: {
            threads: true,
            invoices: true,
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin Users fetch error:", error);
    return NextResponse.json({ error: "Błąd podczas pobierania danych użytkowników" }, { status: 500 });
  }
}
