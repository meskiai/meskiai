import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Now import prisma after environment variables are loaded
import { prisma } from "../lib/prisma";
import { generateText } from "ai";
import { google as googleAI } from "@ai-sdk/google";

async function test() {
  try {
    // Find the latest thread
    const thread = await prisma.thread.findFirst({
      include: {
        emails: {
          orderBy: { receivedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!thread) {
      console.log("No thread found in database.");
      return;
    }

    console.log("Found thread ID:", thread.id);
    const latestEmail = thread.emails[0];
    if (!latestEmail) {
      console.log("No email found in thread.");
      return;
    }

    console.log("Latest email:", latestEmail.subject, latestEmail.from);

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: thread.userId },
    });

    console.log("Using API key:", process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10) + "...");

    console.log("Calling Gemini 1.5 Pro...");
    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro"),
      system: `Jesteś profesjonalnym asystentem AI ds. komunikacji e-mail.
Twoja firma zajmuje się i kieruje się następującymi zasadami:
"${userSettings?.businessContext || "Firma dbająca o profesjonalną obsługę klienta."}"

Zadanie: Napisz profesjonalną propozycję odpowiedzi na poniższego e-maila. Bądź uprzejmy i zwięzły. Podpisz się jako profesjonalny Asystent z firmy klienta, a nie jako zewnętrzny asystent.

ZASADY:
1. Jeśli wiadomość to absolutny spam, reklama, newsletter, bot, systemowa lub śmieciowa oferta → odpowiedz TYLKO: BOT
2. Jeśli wiadomość jest ściśle ważna, pilna, biznesowo krytyczna lub wymaga podjęcia decyzji przez właściciela → odpowiedz TYLKO: REQUIRES_ATTENTION`,
      prompt: `
Oto e-mail od: ${latestEmail.from}
Temat: ${latestEmail.subject}
Treść:
${latestEmail.body || latestEmail.snippet}`,
    });

    console.log("SUCCESS! Result:", text);
  } catch (error: any) {
    console.error("TEST FAILED WITH ERROR:", error);
  }
}

test().then(() => prisma.$disconnect());
