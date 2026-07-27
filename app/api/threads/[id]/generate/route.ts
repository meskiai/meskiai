import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";
import { generateText } from "ai";
import { google as googleAI } from "@ai-sdk/google";

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

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    const { text } = await generateText({
      model: googleAI("gemini-flash-latest"),
      system: `Jesteś profesjonalnym asystentem AI ds. komunikacji e-mail.
Twoja firma zajmuje się i kieruje się następującymi zasadami:
"${userSettings?.businessContext || "Firma dbająca o profesjonalną obsługę klienta."}"

Zadanie: Napisz profesjonalną propozycję odpowiedzi na poniższego e-maila. Bądź uprzejmy i zwięzły. Podpisz się jako profesjonalny Asystent z firmy klienta (na podstawie podanej bazy wiedzy), a nie jako zewnętrzny asystent. Odpowiedź MUSI opierać się na zasadach i profilu Twojej firmy. NIE PISZ słów takich jak "CZŁOWIEK", "BOT", ani "MESKIAI". Podaj po prostu gotowy tekst wiadomości.

ZASADY:
1. Jeśli wiadomość to absolutny spam, reklama, newsletter, bot, systemowa lub śmieciowa oferta → odpowiedz TYLKO: BOT
2. Jeśli wiadomość jest ściśle ważna, pilna, biznesowo krytyczna lub wymaga podjęcia decyzji przez właściciela → odpowiedz TYLKO: REQUIRES_ATTENTION`,
      prompt: `
Oto e-mail od: ${latestEmail.from}
Temat: ${latestEmail.subject}
Treść:
${latestEmail.body || latestEmail.snippet}`,
    });

    const aiResponse = text.trim();

    await prisma.thread.update({
      where: { id: thread.id },
      data: { draftReply: aiResponse },
    });

    return NextResponse.json({ draftReply: aiResponse });
  } catch (error: any) {
    console.error("Generate AI error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
