import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { sendEmail } from "../../../../lib/gmail";

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

    // Wyślij e-mail przez zintegrowane konto Google
    await sendEmail(session.user.id, toEmail, subject, body);

    // Oznacz leada jako skontaktowanego
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "CONTACTED" }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: `Błąd wysyłania wiadomości: ${error?.message || "Błąd wewnętrzny"}` }, { status: 500 });
  }
}
