import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Email content is required" }, { status: 400 });
    }

    const systemPrompt = `Jesteś profesjonalnym asystentem AI ds. obsługi klienta. 
Twoim zadaniem jest wygenerowanie profesjonalnej, uprzejmej i gotowej do wysłania odpowiedzi na otrzymany e-mail od klienta. 
Zachowaj oficjalny, lecz przyjazny ton (w języku polskim). 
Jeśli e-mail jest skargą, bądź empatyczny. Jeśli to zapytanie, udziel wyczerpującej (lub wymijającej, z obietnicą kontaktu) odpowiedzi. 
Odpowiadaj bezpośrednio treścią e-maila, bez żadnych wstępów w stylu "Oto moja propozycja".`;

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      prompt: `Oto treść wiadomości e-mail od klienta:\n\n"${prompt}"\n\nNapisz na nią odpowiedź:`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
