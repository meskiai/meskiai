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

    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId, userId: session.user.id }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    const businessContext = userSettings?.businessContext;

    if (!businessContext) {
      return NextResponse.json({ error: "Brak bazy wiedzy. Uzupełnij opis firmy w Ustawieniach." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !['active', 'trialing'].includes(user.subscriptionStatus || '')) {
      return NextResponse.json({ error: "Brak aktywnej subskrypcji. Zrób upgrade, aby wygenerować wiadomość." }, { status: 403 });
    }

    const { object } = await generateObject({
      model: googleAI("gemini-flash-latest"),
      system: `Jesteś ekspertem ds. sprzedaży B2B (B2B Sales Executive) reprezentującym firmę.
Twoim celem jest napisanie skutecznego, "zimnego maila" (cold email) z propozycją współpracy do potencjalnego klienta.

Baza wiedzy firmy, którą reprezentujesz:
"${businessContext}"

Ton odpowiedzi: ${userSettings?.replyTone || "Profesjonalny"}

Wymagania dotyczące maila:
1. Temat musi być chwytliwy, intrygujący i krótki.
2. Treść powinna być spersonalizowana pod klienta (odnieś się do jego profilu/branży).
3. Przedstaw konkretną wartość, jaką Twoja firma może dostarczyć.
4. Zakończ wyraźnym Call To Action (np. propozycją krótkiej rozmowy).

Dodatkowo, przeanalizuj uważnie profil klienta i wyodrębnij z niego jego adres e-mail, jeśli został podany w opisie. Jeśli nie ma adresu, zostaw pole puste.`,
      prompt: `Wygeneruj maila do klienta:\n\nNazwa: ${lead.name}\nOpis: ${lead.description}`,
      schema: z.object({
        emailAddress: z.string().describe("Wyodrębniony rzeczywisty adres e-mail klienta z opisu (np. kontakt@firma.pl). Usuń wszelkie zbędne znaki. Jeśli w opisie podano tylko URL formularza kontaktowego lub nie ma żadnego e-maila, zwróć pusty string."),
        subject: z.string().describe("Temat maila"),
        body: z.string().describe("Treść maila sprzedażowego")
      })
    });

    return NextResponse.json({ 
      emailAddress: object.emailAddress || "",
      subject: object.subject,
      body: object.body
    });
  } catch (error: any) {
    console.error("Error generating email:", error);
    return NextResponse.json({ error: `Błąd generowania wiadomości: ${error?.message || "Błąd wewnętrzny"}` }, { status: 500 });
  }
}
