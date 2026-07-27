import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
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

    // Get user's app password
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    if (!userSettings?.appPassword) {
      return NextResponse.json({ 
        error: "Brak skonfigurowanego Hasła Aplikacji Google. Przejdź do panelu i wpisz hasło aplikacji." 
      }, { status: 400 });
    }

    const isBasic = userSettings.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    const isPro = userSettings.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
    const emailsCount = userSettings.emailsSentThisMonth || 0;

    if (isBasic && emailsCount >= 50) {
      return NextResponse.json({ error: "Wykorzystałeś miesięczny limit wysłanych e-maili (50) dla pakietu BASIC. Zrób upgrade, aby kontynuować." }, { status: 403 });
    }
    if (isPro && emailsCount >= 1000) {
      return NextResponse.json({ error: "Wykorzystałeś miesięczny limit wysłanych e-maili (1000) dla pakietu PRO. Zrób upgrade do MAX, aby zyskać brak limitów." }, { status: 403 });
    }

    // Send via SMTP using Gmail App Password
    await sendReplySMTP(
      session.user.email!,
      userSettings.appPassword,
      toEmail,
      subject,
      body
    );

    // Oznacz leada jako skontaktowanego i inkrementuj licznik e-maili
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: { status: "CONTACTED" }
      }),
      prisma.userSettings.update({
        where: { userId: session.user.id },
        data: { emailsSentThisMonth: { increment: 1 } }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: `Błąd wysyłania wiadomości: ${error?.message || "Błąd wewnętrzny"}` }, { status: 500 });
  }
}
