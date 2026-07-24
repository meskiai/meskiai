import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function generateEmailReply(contextEmails: string[], newEmail: string, businessContext: string = "") {
  const systemPrompt = `Jesteś zaawansowanym asystentem AI ds. obsługi klienta.
Przeanalizuj poniższą historię konwersacji (od najstarszych do najnowszych) oraz najnowszą wiadomość.
Twoim celem jest wygenerowanie spersonalizowanej, profesjonalnej i pomocnej odpowiedzi na najnowszą wiadomość, uwzględniając kontekst całej rozmowy.
Jeśli to pierwsze zapytanie klienta, po prostu na nie odpowiedz.

BAZA WIEDZY O FIRMIE:
${businessContext}

Opieraj swoje odpowiedzi w 100% na "Bazie wiedzy o firmie". Jeśli nie ma tam informacji, bądź uprzejmy i poinformuj, że sprawdzisz to i odpowiesz później.
Nie dodawaj żadnych dopisków od siebie, zwróć samą treść e-maila gotową do wysłania.`;

  let prompt = "";
  if (contextEmails.length > 0) {
    prompt += "HISTORIA KONWERSACJI:\n";
    contextEmails.forEach((email, index) => {
      prompt += `[Wiadomość ${index + 1}]:\n${email}\n\n`;
    });
  }
  prompt += `NAJNOWSZA WIADOMOŚĆ OD KLIENTA:\n${newEmail}\n\nTWOJA ODPOWIEDŹ:`;

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    prompt,
  });

  return text;
}

export async function analyzeCV(emailBody: string, businessContext: string) {
  const systemPrompt = `Jesteś ekspertem HR (Rekruterem AI). Twoim zadaniem jest analiza profilu kandydata na podstawie podesłanej aplikacji (treści maila/CV).
Firma, do której aplikuje kandydat kieruje się zasadami:
${businessContext}

Oceń kandydata i zwróć wynik JEDYNIE w formacie JSON (bez bloków kodu i dodatkowych słów):
{
  "name": "Imię i nazwisko kandydata (lub 'Nieznane')",
  "isTopCandidate": true/false (true jeśli profil bardzo pasuje do profilu firmy i jej celów, false jeśli słabo),
  "analysis": "Krótkie, profesjonalne podsumowanie (max 3-4 zdania) z uzasadnieniem oceny pod kątem zgodności z firmą."
}`;

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    prompt: emailBody,
  });

  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("AI parse error", e);
    return { name: "Nieznane", isTopCandidate: false, analysis: "Błąd parsowania analizy AI." };
  }
}
