import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";
import { getTrialState, TRIAL_LIMITS } from "@/lib/trial";
import { PRICE_BASIC, PRICE_PRO, PRICE_MAX, getPlanLimits } from "@/lib/pricing";
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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trialState = getTrialState({ createdAt: user.createdAt, subscriptionStatus: user.subscriptionStatus }, user.settings || undefined);
    if (trialState.isTrialExpired) {
      return NextResponse.json({ error: "Twój 3-dniowy okres próbny wygasł. Opłać subskrypcję, aby korzystać z tej funkcji." }, { status: 403 });
    }

    const isSubscriptionActive = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
    if (!isSubscriptionActive && !trialState.isTrialActive) {
      return NextResponse.json({ error: "Brak aktywnej subskrypcji. Wykup abonament, aby korzystać z tej funkcji." }, { status: 403 });
    }

    const userSettings = user.settings;

    const expectedCost = 5;
    const aiCredits = userSettings?.aiCredits ?? 0;
    
    if (user?.stripePriceId !== PRICE_MAX) {
      if (aiCredits < expectedCost) {
        return NextResponse.json({ error: `Brak wystarczającej liczby kredytów AI (Wymagane: ${expectedCost}, Posiadasz: ${aiCredits}). Zrób upgrade pakietu, aby generować wiadomości.` }, { status: 403 });
      }
    }

    const resolvedParams = await params;
    const threadId = resolvedParams.id;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        emails: {
          orderBy: { receivedAt: 'asc' } // full history for AI context
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



    // Get website content if available to enrich context
    let websiteContent = "";
    if (userSettings?.companyWebsite) {
      try {
        const url = userSettings.companyWebsite;
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(fullUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MailAgent/1.0)' }
        });
        clearTimeout(timeout);
        if (res.ok) {
          const html = await res.text();
          websiteContent = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .substring(0, 4000);
        }
      } catch (e) {
        console.error("Failed to fetch company website in generate-reply endpoint:", e);
      }
    }

    // Wyszukaj powiązane zamówienie klienta w bazie danych
    const { getOrderContextForEmail } = await import("../../../../../lib/orders");
    const orderContext = await getOrderContextForEmail(
      session.user.id,
      latestEmail.body || latestEmail.snippet || "",
      latestEmail.from || ""
    );

    const tone = userSettings?.replyTone ?? 'PROFESJONALNY';
    const toneInstr =
      tone === 'LUŹNY (CASUAL)' || tone === 'CASUALOWY'
        ? 'Pisz nieformalnie, zacznij od "Cześć" lub "Witaj", używaj zwrotów bezpośrednich na "Ty" (np. "dzięki", "pozdrawiam"), nie używaj sztywnych zwrotów grzecznościowych.'
        : tone === 'KRÓTKO I NA TEMAT' || tone === 'KROTKI'
        ? 'Odpowiedź maksymalnie 2-3 zdania. Odpowiadaj samymi konkretami, bez zbędnych wstępów i uprzejmości.'
        : 'Pisz profesjonalnie i oficjalnie, używaj form grzecznościowych typu Szanowny Panie / Szanowna Pani, Z poważaniem.';

    let generatedTextResult = "";
    const generateModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.1-pro-preview"];

    for (const modelName of generateModels) {
      try {
        console.log(`[Manual Draft] Próba generowania odpowiedzi za pomocą modelu: ${modelName}`);
        const { text } = await generateText({
          model: googleAI(modelName),
          system: `Jesteś profesjonalnym pracownikiem obsługi klienta i asystentem e-mail.
Twoja firma kieruje się następującymi zasadami i informacjami:
"${userSettings?.businessContext || "Profesjonalna obsługa klienta."}"
 
${websiteContent ? `Dodatkowe informacje o ofercie, cenniku i usługach firmy pobrane z jej strony internetowej:\n"${websiteContent.substring(0, 4000)}"` : ""}
 
${orderContext}
 
Zadanie: Napisz kompletną, gotową do wysłania, profesjonalną i uprzejmą propozycję odpowiedzi na poniższego e-maila od klienta.
Ton odpowiedzi: ${tone} — ${toneInstr}.
 
ZASADY:
1. Odpowiedz bezpośrednio na poruszone kwestie w e-mailu klienta, bazując na powyższych informacjach o firmie.
2. Podpisz się jako profesjonalny pracownik/asystent firmy użytkownika.
3. NIE używaj słów kluczowych "BOT", "SPAM", "REQUIRES_ATTENTION", ani "MESKIAI".
4. Podaj tylko i wyłącznie samą treść e-maila, która jest gotowa do skopiowania i wysłania (bez żadnych komentarzy w stylu "Oto moja propozycja:").
5. KATEGORYCZNY ZAKAZ UJAWNIANIA PROCESU DECYZYJNEGO: Pod żadnym pozorem nie pisz o wewnętrznych procedurach, ścieżkach decyzyjnych, kategoriach spraw ani żadnej terminologii technicznej AI. Odpowiedź musi brzmieć całkowicie naturalnie, jak od człowieka.`,
          prompt: `HISTORIA KONWERSACJI W TYM WĄTKU (od najstarszej do najnowszej):\n${thread.emails.map(e => `[${e.isFromAgent ? 'TY/AGENT' : 'KLIENT'} - ${new Date(e.receivedAt).toLocaleString('pl-PL')}]:\n${e.body || e.snippet}`).join('\n\n')}\n\nNapisz profesjonalną odpowiedź na ostatnią wiadomość klienta.`,
        });
        generatedTextResult = text;
        break;
      } catch (err: any) {
        console.warn(`[Manual Draft] Model ${modelName} zwrócił błąd:`, err.message);
      }
    }

    if (!generatedTextResult) {
      throw new Error("Wszystkie modele generowania odpowiedzi zawiodły.");
    }

    // Save draft to database
    await prisma.thread.update({
      where: { id: threadId },
      data: { draftReply: generatedTextResult.trim() }
    });

    if (generatedTextResult && user?.stripePriceId !== PRICE_MAX) {
      await prisma.userSettings.update({
        where: { userId: session.user.id },
        data: { aiCredits: { decrement: 5 } }
      });
    }

    return NextResponse.json({ 
      reply: generatedTextResult.trim(),
      draftReply: generatedTextResult.trim()
    });
  } catch (error: any) {
    console.error("Generate AI error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
