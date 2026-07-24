import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
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

    if (isBasic && searchesCount >= 20) {
      return NextResponse.json({ error: "Wykorzystałeś limit wyszukiwań dla pakietu BASIC (20)." }, { status: 403 });
    }
    if (isPro && searchesCount >= 100) {
      return NextResponse.json({ error: "Wykorzystałeś limit wyszukiwań dla pakietu PRO (100)." }, { status: 403 });
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
      pageText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim()
                     .substring(0, 30000); // limit 30k znaków
    } catch (e) {
      console.warn("Could not fetch URL natively, proceeding with URL name only", e);
      pageText = "Nie udało się pobrać treści strony. Wywnioskuj branżę, usługi i porady wyłącznie na podstawie samej nazwy domeny: " + url;
    }

    const prompt = `
Jesteś elitarnym Agentem Strategicznym AI, doradcą biznesowym klasy Premium.
Poniżej znajduje się tekst pobrany ze strony internetowej klienta (lub z instrukcji analizy na podstawie URL).
Strona: ${targetUrl}
Treść strony:
${pageText}

Przeanalizuj tę stronę lub branżę i wygeneruj odpowiedź JSON:
1. "products" - wylistuj max 5 głównych usług lub produktów firmy.
2. "additions" - 5 genialnych dodatków podnoszących konwersję (np. kalkulator AI).
3. "competitors" - 4-6 głównych konkurentów rynkowych, ich oferta i zagrożenie (Wysokie/Średnie/Niskie), oraz "url" (prawdziwy adres strony www konkurenta).
4. "salesSuggestions" - 5-6 ultra-praktycznych wskazówek sprzedażowych B2B/B2C.
5. "estimatedStats" - szacunkowe statystyki miesięczne wygenerowane "na oko":
   - "theirClients" (number) - szacunkowa liczba klientów konkurencji (np. 1500)
   - "ourPotentialClients" (number) - szacunkowa liczba klientów, którą firma mogłaby zdobyć przy lepszym marketingu (np. 3500)
6. "websiteStats" - 3 obiekty ze sztucznymi statystykami strony, np. {"label": "Miesięczny Ruch", "value": "12.5k"}, {"label": "Wsp. Odrzuceń", "value": "45%"}
`;

    const { object } = await generateObject({
      model: google("gemini-flash-latest"),
      schema: z.object({
        products: z.array(z.string()),
        additions: z.array(z.string()),
        competitors: z.array(z.object({
          name: z.string(),
          url: z.string(),
          offer: z.string(),
          interest: z.string(),
          howToStandOut: z.string()
        })),
        salesSuggestions: z.array(z.string()),
        estimatedStats: z.object({
          theirClients: z.number(),
          ourPotentialClients: z.number()
        }),
        websiteStats: z.array(z.object({
          label: z.string(),
          value: z.string()
        }))
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
