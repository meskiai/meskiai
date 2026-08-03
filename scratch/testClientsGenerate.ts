import { generateText, generateObject } from "ai";
import { google as googleAI } from "@ai-sdk/google";
import { z } from "zod";

async function test() {
  console.log("Starting lead generation test...");
  const businessContext = "Firma zajmuje się budową stron internetowych i automatyzacjami AI dla małych firm w Polsce.";

  try {
    console.log("Calling generateText with Google Search grounding...");
    const searchResponse = await generateText({
      model: googleAI("gemini-flash-latest"),
      system: `Jesteś zaawansowanym ekspertem ds. wywiadu gospodarczego i generowania leadów (Lead Generation).
Twoim zadaniem jest znalezienie 5 potencjalnych, wysoce trafnych i przede wszystkim REALNYCH klientów na polskim rynku (lub globalnym, jeśli profil wskazuje na eksport) na podstawie bazy wiedzy firmy użytkownika.
Użyj narzędzia Google Search, aby znaleźć prawdziwe, istniejące firmy i sprawdzić ich autentyczne dane kontaktowe.

ZASADY POZYSKIWANIA DANYCH KONTAKTOWYCH (KRYTYCZNE):
1. Podaj wyłącznie PRAWDZIWY, publicznie opublikowany na stronie firmy lub w rejestrach adres e-mail.
2. Jeśli bezpośredni e-mail do decydenta nie jest podany publicznie, podaj OFICJALNY OGÓLNY E-MAIL KONTAKTOWY firmy (np. biuro@firma.pl, kontakt@firma.pl, office@firma.pl, info@firma.pl).
3. POD ŻADNYM POZOREM NIE ZMYŚLAJ, NIE ZGADUJ ani NIE GENERUJ fikcyjnych adresów e-mail (np. nie twórz adresów typu dyrektor@firma.pl, prezes@firma.pl lub imie.nazwisko@firma.pl na podstawie domniemanych danych, jeśli nie masz 100% potwierdzenia z wyszukiwarki, że taki adres istnieje).
4. Jeżeli firma posiada jedynie formularz kontaktowy na stronie i brak jest jakiegokolwiek adresu e-mail, podaj adres URL do formularza kontaktowego jako alternatywę (np. https://firma.pl/kontakt).

Baza wiedzy firmy, dla której szukasz klientów:
"${businessContext}"`,
      prompt: "Wygeneruj listę 5 realnych firm odpowiadających profilowi wraz z ich autentycznymi danymi kontaktowymi (e-mail, telefon, decydent, uzasadnienie).",
      tools: {
        google_search: googleAI.tools.googleSearch({}) as any,
      },
    });

    const searchResultText = searchResponse.text;
    console.log("generateText response text:", searchResultText);

    console.log("Calling generateObject...");
    const { object } = await generateObject({
      model: googleAI("gemini-flash-latest"),
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

    console.log("SUCCESS:", JSON.stringify(object, null, 2));
  } catch (error) {
    console.error("ERROR:", error);
  }
}

test();
