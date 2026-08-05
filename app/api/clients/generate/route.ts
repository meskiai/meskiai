import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { generateObject, generateText } from "ai";
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

    // Krok 1: Wyszukanie rzeczywistych firm za pomocą wyszukiwarki Google i Gemini
    let searchResultText = "";
    const searchModels = ["gemini-3.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    
    for (const modelName of searchModels) {
      try {
        console.log(`[Clients] Próba wyszukiwania leadów za pomocą modelu: ${modelName}`);
        const searchResponse = await generateText({
          model: googleAI(modelName),
          system: `Jesteś zaawansowanym ekspertem ds. wywiadu gospodarczego i generowania leadów (Lead Generation).
Twoim zadaniem jest znalezienie 3 potencjalnych, wysoce trafnych i przede wszystkim REALNYCH klientów na polskim rynku (lub globalnym, jeśli profil wskazuje na eksport) na podstawie bazy wiedzy firmy użytkownika.
Użyj narzędzia Google Search, aby znaleźć prawdziwe, istniejące firmy i sprawdzić ich autentyczne dane kontaktowe.
 
ZASADY POZYSKIWANIA DANYCH KONTAKTOWYCH (KRYTYCZNE):
1. Podaj wyłącznie PRAWDZIWY, publicznie opublikowany na stronie firmy lub w rejestrach adres e-mail.
2. Jeśli bezpośredni e-mail do decydenta nie jest podany publicznie, podaj OFICJALNY OGÓLNY E-MAIL KONTAKTOWY firmy (np. biuro@firma.pl, kontakt@firma.pl, office@firma.pl, info@firma.pl).
3. POD ŻADNYM POZOREM NIE ZMYŚLAJ, NIE ZGADUJ ani NIE GENERUJ fikcyjnych adresów e-mail (np. nie twórz adresów typu dyrektor@firma.pl, prezes@firma.pl lub imie.nazwisko@firma.pl na podstawie domniemanych danych, jeśli nie masz 100% potwierdzenia z wyszukiwarki, że taki adres istnieje).
4. Jeżeli firma posiada jedynie formularz kontaktowy na stronie i brak jest jakiegokolwiek adresu e-mail, podaj adres URL do formularza kontaktowego jako alternatywę (np. https://firma.pl/kontakt).
 
Baza wiedzy firmy, dla której szukasz klientów:
"${businessContext}"`,
          prompt: "Wygeneruj listę 3 realnych firm odpowiadających profilowi wraz z ich autentycznymi danymi kontaktowymi (e-mail, telefon, decydent, uzasadnienie). Pisz niezwykle zwięźle, w punktach, bez wstępów.",
          tools: {
            google_search: googleAI.tools.googleSearch({}) as any,
          },
        });
        searchResultText = searchResponse.text;
        break;
      } catch (err: any) {
        console.warn(`[Clients] Model wyszukiwania ${modelName} zwrócił błąd:`, err.message);
      }
    }

    if (!searchResultText) {
      throw new Error("Wszystkie modele wyszukiwania leadów zawiodły.");
    }

    // Krok 2: Przetworzenie tekstu na ustrukturyzowany format JSON z fallbackami
    let parsedLeads: any = null;
    for (const modelName of searchModels) {
      try {
        console.log(`[Clients] Próba parsowania leadów za pomocą modelu: ${modelName}`);
        const { object } = await generateObject({
          model: googleAI(modelName),
          system: "Jesteś parserem danych. Przekształć tekst z raportu o leadach na ustrukturyzowany format JSON.",
          prompt: `Przetwórz poniższy tekst na JSON. W opisie (description) każdego leada zawrzyj precyzyjnie:
- Imię i nazwisko osoby decyzyjnej
- Uzasadnienie dopasowania
- RZECZYWISTY ADRES E-MAIL (zawsze z prefiksem "E-mail: ") lub URL formularza kontaktowego.
- Telefon i profil LinkedIn (jeśli są dostępne).
 
Tekst do przetworzenia:
${searchResultText}`,
          schema: z.object({
            leads: z.array(z.object({
              name: z.string().describe("Prawdziwa nazwa firmy"),
              description: z.string().describe("Uzasadnienie potrzeby usług oraz prawdziwe dane kontaktowe: E-mail (wyraźnie oznaczony), telefon, LinkedIn, osoba decyzyjna."),
              source: z.string().describe("Źródło pozyskania (np. Google Search)"),
              probability: z.number().min(50).max(99).describe("Prawdopodobieństwo zainteresowania w %")
            }))
          })
        });
        parsedLeads = object.leads;
        break;
      } catch (err: any) {
        console.warn(`[Clients] Model parsowania ${modelName} zwrócił błąd:`, err.message);
      }
    }

    if (!parsedLeads) {
      throw new Error("Wszystkie modele parsowania leadów zawiodły.");
    }

    const generatedLeads = parsedLeads;

    const savedLeads = [];
    for (const lead of generatedLeads) {
      const saved = await prisma.lead.create({
        data: {
          userId: session.user.id,
          name: lead.name,
          description: lead.description,
          source: lead.source,
          probability: lead.probability <= 1 ? Math.floor(lead.probability * 100) : Math.floor(lead.probability),
          status: "NEW"
        }
      });
      savedLeads.push(saved);
    }

    return NextResponse.json({ leads: savedLeads });
  } catch (error: any) {
    console.error("Error generating leads:", error);
    return NextResponse.json({ error: `Wystąpił błąd podczas generowania klientów: ${error?.message || "Błąd wewnętrzny"}` }, { status: 500 });
  }
}
