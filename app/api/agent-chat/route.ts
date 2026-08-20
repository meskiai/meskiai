import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getTrialState } from '@/lib/trial';
import { PRICE_MAX } from "@/lib/pricing";
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { messages } = await req.json();

    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      include: { settings: true } 
    });
    
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    const trialState = getTrialState({ 
      createdAt: user.createdAt, 
      subscriptionStatus: user.subscriptionStatus || null 
    }, user.settings || undefined);
    
    if (trialState.isTrialExpired) {
      return new Response('Twój 3-dniowy okres próbny wygasł. Opłać subskrypcję, aby korzystać z tej funkcji.', { status: 403 });
    }

    const isSubscriptionActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    if (!isSubscriptionActive && !trialState.isTrialActive) {
      return new Response('Brak aktywnej subskrypcji. Wykup abonament, aby korzystać z tej funkcji.', { status: 403 });
    }

    const userSettings = user.settings;
    const expectedCost = 20; // 20 AI credits per message
    const aiCredits = userSettings?.aiCredits ?? 0;
    
    if (user.stripePriceId !== PRICE_MAX) {
      if (aiCredits < expectedCost) {
        return new Response(`Brak wystarczającej liczby kredytów AI (Wymagane: ${expectedCost}, Posiadasz: ${aiCredits}). Odnów pakiet, aby rozmawiać z agentem.`, { status: 403 });
      }

      await prisma.userSettings.update({
        where: { userId: session.user.id },
        data: { aiCredits: { decrement: expectedCost } }
      });
    }

    // Fetch the context: Last 30 emails for this user to give the AI memory
    const recentEmails = await prisma.email.findMany({
      where: {
        thread: {
          userId: user.id
        }
      },
      orderBy: {
        receivedAt: 'desc'
      },
      take: 30,
      include: {
        thread: true
      }
    });

    const contextStr = recentEmails.map(e => `
ID Wątku: ${e.thread.threadId}
Data: ${e.receivedAt.toLocaleString('pl-PL')}
Od: ${e.from}
Do: ${e.to}
Temat: ${e.subject}
Status Wątku: ${e.thread.status}
Wysłane przez Agenta: ${e.isFromAgent ? 'TAK' : 'NIE'}
Treść: ${e.body?.substring(0, 500) || e.snippet}
---`).join('\n');

    // Get stats
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const emailsProcessedToday = await prisma.email.count({
      where: {
        thread: { userId: user.id },
        isFromAgent: true,
        receivedAt: { gte: startOfDay }
      }
    });

    const totalEmailsProcessed = userSettings?.agentEmailsProcessed ?? 0;
    const timeSavedMinutes = totalEmailsProcessed * 5; // Assume 5 mins per email
    const timeSavedHours = Math.floor(timeSavedMinutes / 60);
    const timeSavedRemainingMinutes = timeSavedMinutes % 60;
    const timeSavedStr = timeSavedHours > 0 
      ? `${timeSavedHours} godzin i ${timeSavedRemainingMinutes} minut`
      : `${timeSavedMinutes} minut`;

    const result = streamText({
      model: google('gemini-1.5-flash'), // Flash is extremely fast and cheap
      system: `Jesteś "Agentem AI", który pracuje dla użytkownika (szefa). Użytkownik właśnie pisze do Ciebie na wewnętrznym czacie firmowym.
Twoim głównym i JEDYNYM zadaniem jest odpowiadać na pytania dotyczące wiadomości e-mail, które obsłużyłeś, klientów z którymi pisałeś, spotkań wynikających z e-maili, oraz Twoich własnych ustawień i wydajności w tym systemie.

BIEŻĄCY STATUS:
- Auto-Odpowiadanie (Działanie Agenta): ${userSettings?.autoReply ? 'WŁĄCZONE (Aktywne)' : 'WYŁĄCZONE (Pauza)'}
- Maile obsłużone (wysłane przez Ciebie) dzisiaj: ${emailsProcessedToday}
- Łącznie obsłużonych w historii: ${totalEmailsProcessed}
- Zaoszczędzony czas (przy założeniu 5 min na maila): ${timeSavedStr}

Oto lista Twoich ostatnich interakcji (najnowsze na górze):
${contextStr ? contextStr : "Brak wiadomości w bazie danych."}

ZASADY BEZPIECZEŃSTWA (KATEGORYCZNE):
1. ODMAWIAJ ODPOWIEDZI na wszelkie pytania niezwiązane z Twoją pracą jako asystent e-mail, panelem użytkownika lub systemem (np. jeśli ktoś pyta o przepis na ciasto, o historię świata, programowanie, czy ogólną wiedzę - przeproś i powiedz, że jesteś stworzony tylko do obsługi maili i ustawień agenta).
2. Pisz krótko, konkretnie i z szacunkiem do szefa.
3. Jeśli użytkownik prosi o włączenie lub wyłączenie Ciebie (agenta/autorespondera), UŻYJ NARZĘDZIA 'toggleAgentStatus', a potem krótko potwierdź wykonanie akcji (np. "Jasne szefie, wyłączyłem się.").
4. Jeśli użytkownik zapyta "Co dzisiaj zrobiłeś?", podsumuj najnowsze maile na podstawie kontekstu i podaj statystyki dzienne.
5. Jeśli użytkownik pyta "Ile czasu mi zaoszczędziłeś?", użyj statystyki "Zaoszczędzony czas" podanej wyżej.
6. Jeśli użytkownik pyta o "najczęściej zadawane pytania" (FAQ) przez klientów, przeanalizuj listę ostatnich interakcji podaną wyżej i wyłap powtarzające się wzorce (np. pytania o cennik, status zamówienia itp.).`,
      messages,
      tools: {
        toggleAgentStatus: tool({
          description: 'Włącza lub wyłącza funkcję auto-odpowiadania (działania Agenta AI).',
          parameters: z.object({
            turnOn: z.boolean().describe('true aby włączyć agenta, false aby go wyłączyć (zastopować)')
          }),
          // @ts-ignore
          execute: async ({ turnOn }) => {
            await prisma.userSettings.update({
              where: { userId: session.user.id },
              data: { autoReply: turnOn }
            });
            return `Agent został pomyślnie ${turnOn ? 'WŁĄCZONY' : 'WYŁĄCZONY'}.`;
          }
        })
      },
      maxSteps: 3,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Agent Chat Error:", error);
    return new Response('Wystąpił błąd komunikacji. Spróbuj ponownie.', { status: 500 });
  }
}
