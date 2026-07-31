import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { generateObject } from "ai";
import { google as googleAI } from "@ai-sdk/google";
import { z } from "zod";

export const maxDuration = 60; // Allow more time for generation

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    });

    const businessContext = user?.settings?.businessContext;

    if (!businessContext) {
      return NextResponse.json({ error: "No business context found. Please fill your company knowledge base first." }, { status: 400 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const leadsCount = await prisma.lead.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfMonth }
      }
    });

    const isBasic = user.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    const isPro = user.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;

    if (isBasic && leadsCount >= 20) {
      return NextResponse.json({ error: "Wykorzystałeś miesięczny limit generowania leadów dla pakietu BASIC (20). Zrób upgrade pakietu, aby kontynuować." }, { status: 403 });
    }
    if (isPro && leadsCount >= 200) {
      return NextResponse.json({ error: "Wykorzystałeś miesięczny limit generowania leadów dla pakietu PRO (200). Zrób upgrade do MAX, aby zyskać brak limitów." }, { status: 403 });
    }

    // Generate 5 leads using Gemini
    const { object } = await generateObject({
      model: googleAI("gemini-flash-latest"),
      system: `Jesteś zaawansowanym ekspertem ds. wywiadu gospodarczego i generowania leadów (Lead Generation).
Twoim zadaniem jest znalezienie 5 potencjalnych, wysoce trafnych klientów na podstawie profilu działalności użytkownika.
Zwracaj KONKRETNE i PRAWDZIWE (lub wysoce prawdopodobne) firmy działające na rynku.
Dla każdego leada musisz podać DOKŁADNE DANE: kto jest osobą decyzyjną (np. imię i nazwisko CEO/Dyrektora), jak się z nimi skontaktować (konkretny e-mail, telefon, link do LinkedIn lub strony www).
Opisz szczegółowo dlaczego jest to idealny klient. Przypisz też procentowe prawdopodobieństwo konwersji (od 50 do 99).
Zwróć uwagę na polski rynek, chyba że profil firmy wskazuje na globalny.

Baza wiedzy firmy, dla której szukasz klientów:
"${businessContext}"`,
      prompt: "Wygeneruj 5 bardzo konkretnych leadów sprzedażowych z dokładnymi danymi kontaktowymi (maile, telefony, osoby, firmy).",
      schema: z.object({
        leads: z.array(z.object({
          name: z.string().describe("Dokładna nazwa firmy lub imię i nazwisko konkretnej osoby docelowej"),
          description: z.string().describe("Opis dlaczego potrzebują usług ORAZ dokładne dane kontaktowe: E-mail, Telefon, Profil LinkedIn, Osoba Decyzyjna."),
          source: z.string().describe("Źródło pozyskania (np. Instagram, LinkedIn, Google Maps, Grupy na FB)"),
          probability: z.number().min(50).max(99).describe("Prawdopodobieństwo zainteresowania w %")
        }))
      })
    });

    const generatedLeads = object.leads;

    const savedLeads = await Promise.all(
      generatedLeads.map(lead => 
        prisma.lead.create({
          data: {
            userId: session.user.id,
            name: lead.name,
            description: lead.description,
            source: lead.source,
            probability: lead.probability <= 1 ? Math.floor(lead.probability * 100) : Math.floor(lead.probability),
            status: "NEW"
          }
        })
      )
    );

    return NextResponse.json({ leads: savedLeads });
  } catch (error: any) {
    console.error("Error generating leads:", error);
    return NextResponse.json({ error: `Wystąpił błąd podczas generowania klientów: ${error?.message || "Błąd wewnętrzny"}` }, { status: 500 });
  }
}
