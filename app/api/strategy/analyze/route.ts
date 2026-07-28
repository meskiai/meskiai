import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Brak adresu URL" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true }
    });

    if (!user) return NextResponse.json({ error: "Brak użytkownika" }, { status: 404 });

    const isBasic = user.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    const isPro = user.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
    const searchesCount = user.settings?.competitorSearchesThisMonth || 0;

    if (isBasic && searchesCount >= 10) {
      return NextResponse.json({ error: "Wykorzystałeś limit analiz (10) dla pakietu BASIC. Zrób upgrade, aby kontynuować." }, { status: 403 });
    }
    if (isPro && searchesCount >= 100) {
      return NextResponse.json({ error: "Wykorzystałeś limit analiz (100) dla pakietu PRO. Zrób upgrade do MAX, aby zyskać brak limitów." }, { status: 403 });
    }

    let pageText = "";
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const html = await res.text();
      // Proste usuwanie tagów HTML i skryptów
      pageText = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                     .replace(/<style[\s\S]*?<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim()
                     .substring(0, 30000); // limit 30k znaków
    } catch (e) {
      console.warn("Could not fetch URL natively, proceeding with URL name only", e);
      pageText = "Nie udało się pobrać treści strony. Wywnioskuj branżę, usługi i porady wyłącznie na podstawie samej nazwy domeny: " + url;
    }

    const prompt = `
Jesteś elitarnym Agentem Strategicznym AI, Głównym Analitykiem Danych w firmie doradczej wielkiej czwórki (Big 4).
Otrzymałeś zlecenie przeprowadzenia głębokiego audytu biznesowego i strategicznego dla poniższej domeny/strony.

Strona docelowa: ${targetUrl}
Zeskrapowana treść strony (może być ucięta):
${pageText}

Twoim zadaniem jest wygenerować ULTRA-PROFESJONALNY raport analityczny w formacie JSON.
Nie zgaduj "na oko" w sposób amatorski - przeprowadź rzetelną dedukcję, wyliczając realistyczne metryki na podstawie natury branży, dostępnych danych oraz rynkowych benchmarków. Zwróć dane po polsku.

Wymagane sekcje:
1. "marketOverview": Zwięzłe podsumowanie rynku docelowego dla tej firmy, główny trend oraz szacowany roczny wzrost (np. "+12.5% YoY").
2. "swotAnalysis": Klasyczna analiza SWOT (Strengths, Weaknesses, Opportunities, Threats), po 3-4 punkty na każdą kategorię.
3. "keyMetrics": Kluczowe twarde metryki rynkowe:
   - "seoDifficulty": Trudność pozycjonowania w tej branży (od 1 do 100).
   - "averageCpc": Średni koszt kliknięcia w Google Ads dla tej branży (np. "3.50 PLN").
   - "marginPotential": Potencjał marżowości ("Niski", "Średni", "Wysoki", "Bardzo Wysoki").
4. "competitors": Lista 4 konkretnych, faktycznie istniejących głównych konkurentów na rynku (polskim lub globalnym zależy od profilu), wraz z ich:
   - "name": Nazwa firmy
   - "url": Prawdziwy adres URL
   - "trafficEstimate": Szacowany miesięczny ruch (np. "150k - 200k")
   - "mainAdvantage": Ich główna przewaga konkurencyjna
   - "strategyGap": Luka w ich strategii, którą klient może wykorzystać
5. "actionPlan": 3 konkretne, zaawansowane kroki strategiczne (To-Do) do wdrożenia w celu przejęcia leadów od konkurencji.
`;

    const { object } = await generateObject({
      model: google("gemini-flash-latest"),
      schema: z.object({
        marketOverview: z.object({
          summary: z.string(),
          mainTrend: z.string(),
          estimatedGrowth: z.string()
        }),
        swotAnalysis: z.object({
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          opportunities: z.array(z.string()),
          threats: z.array(z.string())
        }),
        keyMetrics: z.object({
          seoDifficulty: z.number(),
          averageCpc: z.string(),
          marginPotential: z.string()
        }),
        competitors: z.array(z.object({
          name: z.string(),
          url: z.string(),
          trafficEstimate: z.string(),
          mainAdvantage: z.string(),
          strategyGap: z.string()
        })),
        actionPlan: z.array(z.string())
      }),
      prompt,
    });

    await prisma.userSettings.update({
      where: { userId: user.id },
      data: { competitorSearchesThisMonth: { increment: 1 } }
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Strategy Agent error:", error);
    return NextResponse.json({ error: error.message || "Wystąpił błąd podczas analizy" }, { status: 500 });
  }
}
