import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";
import { getGmailClient, sendEmail } from "../../../lib/gmail";
import { generateText, tool } from "ai";
import { google as googleAI } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const gmail = await getGmailClient(userId);

    // Fetch user settings to check if autoReply is enabled
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    const isAutoReplyOn = userSettings?.autoReply ?? false;

    // Pobierz max 10 najnowszych nieprzeczytanych wiadomości
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: 10,
    });

    const messages = res.data.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ message: "Brak nowych wiadomości" });
    }

    let syncedCount = 0;

    for (const message of messages) {
      if (!message.id) continue;

      const existingEmail = await prisma.email.findUnique({
        where: { messageId: message.id },
      });

      const msgData = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const payload = msgData.data.payload;
      const headers = payload?.headers;

      if (!headers) continue;

      const subject = headers.find((h) => h.name && h.name.toLowerCase() === "subject")?.value || "Brak tematu";
      const from = headers.find((h) => h.name && h.name.toLowerCase() === "from")?.value || "Nieznany nadawca";
      const to = headers.find((h) => h.name && h.name.toLowerCase() === "to")?.value || "Do mnie";
      const threadId = msgData.data.threadId || message.id;

      let forceRetryAI = false;
      let dbThread = await prisma.thread.findUnique({
        where: { threadId: threadId || message.id },
      });

      if (existingEmail) {
        if (dbThread && (dbThread.status === "PENDING_APPROVAL" || dbThread.status === "IGNORED") && (!dbThread.draftReply || dbThread.draftReply.startsWith("[BŁĄD AI]") || dbThread.draftReply.trim() === "")) {
           forceRetryAI = true;
        } else {
           continue;
        }
      }

      // Szybka heurystyka: sprawdzenie, czy to ewidentny bot
      const listUnsubscribe = headers.find((h) => h.name && h.name.toLowerCase() === "list-unsubscribe");
      const precedence = headers.find((h) => h.name && h.name.toLowerCase() === "precedence");
      
      const isHeuristicBot = !!listUnsubscribe || 
                             (precedence && precedence.value && precedence.value.toLowerCase().includes("bulk")) ||
                             from.toLowerCase().includes("noreply") ||
                             from.toLowerCase().includes("daemon");

      let body = "";
      if (payload.parts && payload.parts.length > 0) {
        const textPart = payload.parts.find((part) => part.mimeType === "text/plain");
        if (textPart && textPart.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        } else if (payload.parts[0].body?.data) {
          body = Buffer.from(payload.parts[0].body.data, "base64").toString("utf-8");
        }
      } else if (payload.body?.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf-8");
      }

      if (!forceRetryAI) {
        if (!dbThread) {
          dbThread = await prisma.thread.create({
            data: {
              threadId: threadId,
              userId: userId,
              status: isHeuristicBot ? "IGNORED" : "PENDING_APPROVAL",
            },
          });
        } else {
          dbThread = await prisma.thread.update({
            where: { id: dbThread.id },
            data: {
              status: isHeuristicBot ? "IGNORED" : "PENDING_APPROVAL",
              draftReply: null
            }
          });
        }

        await prisma.email.create({
          data: {
            threadId: dbThread.id,
            messageId: message.id,
            from,
            to,
            subject,
            snippet: msgData.data.snippet || "",
            body: body || msgData.data.snippet || "",
            receivedAt: new Date(Number(msgData.data.internalDate)),
            isFromAgent: false,
          },
        });
        
        syncedCount++;
      }

      if (!dbThread) continue;

      // GENEROWANIE ODPOWIEDZI PRZEZ AI, jeśli to nie jest jawny bot z nagłówków
      if (dbThread.status === "PENDING_APPROVAL") {
        try {
          const { text } = await generateText({
            model: googleAI("gemini-flash-latest"),
            // @ts-ignore
            maxSteps: 5,
            tools: {},
            system: `Jesteś asystentem AI ds. komunikacji e-mail.
Twoja firma zajmuje się i kieruje się następującymi zasadami:
"${userSettings?.businessContext || "Firma dbająca o profesjonalną obsługę klienta."}"

BEZWZGLĘDNIE ZASTOSUJ WYBRANY TON I STYL WYPOWIEDZI: *** ${userSettings?.replyTone || "PROFESJONALNY"} ***.
To absolutny priorytet. Jeśli ton to LUŹNY (CASUAL), zabraniam używania zwrotów "Szanowny Panie", pisz tylko "Cześć". Jeśli to KRÓTKO I NA TEMAT, odpowiedź musi mieć maksymalnie 2-3 zdania bez uprzejmości. Jeśli PROFESJONALNY, pisz wysoce oficjalnie.

Zadanie 1: Oceń czy e-mail został napisany przez żywego człowieka, czy jest to automatyczny newsletter/powiadomienie. Jeśli powiadomienie, odpowiedz TYLKO słowem: "BOT".
Zadanie 2: Jeśli to wiadomość od człowieka, przeanalizuj jej wagę. Jeśli jest to bardzo ważna, nietypowa lub poważna wiadomość skierowana bezpośrednio do właściciela/zarządu, na którą nie potrafisz udzielić sensownej odpowiedzi na podstawie kontekstu, odpowiedz TYLKO słowem: "REQUIRES_ATTENTION".
Zadanie 3: Jeśli to zwykła wiadomość lub zapytanie, napisz od razu propozycję odpowiedzi w wyznaczonym tonie, w odpowiednim języku, podpisz się jako "Asystent AI". NIE pisz słowa "CZŁOWIEK" ani "BOT" w przypadku generowania odpowiedzi.
Zadanie 4: Jeśli klient wyraźnie prosi o wystawienie faktury podając dane, wywołaj narzędzie "issueInvoice" z odpowiednimi parametrami, a potem w odpowiedzi potwierdź wygenerowanie faktury.`,
            prompt: `
Oto e-mail od: ${from}
Temat: ${subject}
Treść:
${body || msgData.data.snippet}`,
          });

          const aiResponse = text.trim();
          const upperResponse = aiResponse.toUpperCase();

          if (upperResponse === "BOT" || upperResponse === '"BOT"' || upperResponse === "'BOT'" || (upperResponse.includes("BOT") && upperResponse.length < 15)) {
            await prisma.thread.update({
              where: { id: dbThread!.id },
              data: { status: "IGNORED" },
            });
          } else if (upperResponse.includes("REQUIRES_ATTENTION")) {
            await prisma.thread.update({
              where: { id: dbThread!.id },
              data: { status: "REQUIRES_ATTENTION", draftReply: null },
            });
          } else {
            // Skoro to człowiek, zapisz brudnopis
            if (isAutoReplyOn) {
              // Wysyłanie automatyczne
              const replyTo = from.replace(/.*<(.+)>.*/, '$1');
              await sendEmail(userId, replyTo, `Re: ${subject}`, aiResponse, threadId);
              
              await prisma.thread.update({
                where: { id: dbThread!.id },
                data: { status: "AUTO_REPLIED", draftReply: null },
              });
              
              await prisma.email.create({
                data: {
                  threadId: dbThread!.id,
                  messageId: `sent-${Date.now()}`,
                  from: session.user.email || 'Agent',
                  to: replyTo,
                  subject: `Re: ${subject}`,
                  snippet: aiResponse.substring(0, 100),
                  body: aiResponse,
                  receivedAt: new Date(),
                  isFromAgent: true
                }
              });
            } else {
              // Zwykły draft do akceptacji
              await prisma.thread.update({
                where: { id: dbThread!.id },
                data: { draftReply: aiResponse },
              });
            }
          }
        } catch (aiError: any) {
          console.error("Błąd AI podczas generowania odpowiedzi:", aiError);
          // Zapisz informację o błędzie API, by użytkownik wiedział co się stało
          await prisma.thread.update({
            where: { id: dbThread!.id },
            data: { draftReply: `[BŁĄD AI]: Nie udało się wygenerować odpowiedzi. Powód: ${aiError?.message || "Limit zapytań (Quota Exceeded) lub problem z kluczem API."}` },
          });
        }
      }

      /* Odznaczanie jako przeczytane opcjonalnie */
      /*
      await gmail.users.messages.modify({
        userId: "me",
        id: message.id,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });
      */
    }

    return NextResponse.json({ message: "Zsynchronizowano pomyślnie", syncedCount });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas synchronizacji", details: error.message },
      { status: 500 }
    );
  }
}
