import { NextResponse } from "next/server";
import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export const maxDuration = 60;

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
      const timeoutId = setTimeout(() => controller.abort(), 3000);
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

    // Krok 1: Głębokie badanie rynku i konkurencji za pomocą Google Search
    const researchResponse = await generateText({
      model: google("gemini-flash-latest"),
      system: `Jesteś elitarnym doradcą biznesowym, Głównym Strategiem i Analitykiem Rynku w firmie doradczej Wielkiej Czwórki (Big 4).
Twoim zadaniem jest przeprowadzenie kompleksowego badania i audytu biznesowego dla podanej domeny/firmy.
Użyj narzędzia Google Search, aby znaleźć rzeczywiste i szczegółowe informacje o tej firmie, jej usługach, pozycji rynkowej, konkurentach oraz stawkach reklamowych w jej branży.

Zrób głęboki wywiad gospodarczy pod kątem:
1. Prawdziwych konkurentów na rynku polskim (lub globalnym, zależy od skali działania).
2. Szacunków ruchu (trafficEstimate), głównych przewag konkurencji (mainAdvantage) i luk w ich ofercie (strategyGap).
3. Klasycznej analizy SWOT (Słabe strony, Mocne strony, Szanse, Zagrożenia).
4. Stawek CPC i trudności pozycjonowania (SEO Difficulty) dla powiązanych słów kluczowych.
5. Konkretnych, precyzyjnych i natychmiastowo wykonalnych kroków strategicznych (Action Plan) dla tej firmy.`,
      prompt: `Przeprowadź dokładny wywiad rynkowy i analizę strategiczną dla firmy: ${targetUrl}
Treść zeskrapowana ze strony głównej (jako punkt wyjścia):
${pageText}`,
      tools: {
        google_search: google.tools.googleSearch({}) as any,
      },
    });

    const researchReportText = researchResponse.text;

    // Krok 2: Ustrukturyzowanie raportu do formatu JSON dopasowanego do interfejsu
    const { object } = await generateObject({
      model: google("gemini-flash-latest"),
      system: "Jesteś analitykiem technicznym. Twoim zadaniem jest przełożenie szczegółowego raportu rynkowego na ustrukturyzowany format JSON.",
      prompt: `Przetwórz poniższy raport z badania rynku na format JSON zgodnie ze schematem. Zwróć wszystkie dane w języku polskim.

Raport do przetworzenia:
${researchReportText}`,
      schema: z.object({
        marketOverview: z.object({
          summary: z.string().describe("Syntetyczne podsumowanie rynku docelowego i pozycji badanej firmy"),
          mainTrend: z.string().describe("Główny trend technologiczny lub rynkowy dominujący w tej branży"),
          estimatedGrowth: z.string().describe("Szacowany roczny wzrost rynku, np. '+15% YoY'")
        }),
        swotAnalysis: z.object({
          strengths: z.array(z.string()).describe("3-4 konkretne mocne strony badanej firmy"),
          weaknesses: z.array(z.string()).describe("3-4 rzeczywiste słabe strony lub braki operacyjne"),
          opportunities: z.array(z.string()).describe("3-4 szanse rynkowe i technologiczne stojące przed firmą"),
          threats: z.array(z.string()).describe("3-4 realne zagrożenia zewnętrzne, działania konkurencji")
        }),
        keyMetrics: z.object({
          seoDifficulty: z.number().min(1).max(100).describe("Trudność pozycjonowania w wyszukiwarce (1-100)"),
          averageCpc: z.string().describe("Średni koszt kliknięcia w Google Ads dla branży (np. '4.20 PLN')"),
          marginPotential: z.string().describe("Potencjał marżowości (np. 'Wysoki', 'Średni')")
        }),
        competitors: z.array(z.object({
          name: z.string().describe("Nazwa prawdziwego konkurenta"),
          url: z.string().describe("Poprawny adres URL konkurenta"),
          trafficEstimate: z.string().describe("Szacowany ruch miesięczny, np. '50k - 100k wizyt'"),
          mainAdvantage: z.string().describe("Główna przewaga rynkowa tego konkurenta"),
          strategyGap: z.string().describe("Luka w ofercie lub marketingu tego konkurenta, którą badana firma może wykorzystać")
        })).describe("Lista 3-4 prawdziwych, bezpośrednich konkurentów"),
        actionPlan: z.array(z.string()).describe("3-4 konkretne, zaawansowane porady/kroki strategiczne (To-Do) do natychmiastowego wdrożenia")
      }),
    });

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: { competitorSearchesThisMonth: { increment: 1 } },
      create: { 
        userId: user.id, 
        competitorSearchesThisMonth: 1,
        autoReply: true,
        onboardingDone: false,
        businessContext: ""
      }
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Strategy Agent error:", error);
    return NextResponse.json({ error: error.message || "Wystąpił błąd podczas analizy" }, { status: 500 });
  }
}
