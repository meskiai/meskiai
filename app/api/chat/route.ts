import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createAppleCalendarEvent } from '@/lib/caldav';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages } = await req.json();

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    }) as any;

    if (!userSettings?.appleId || !userSettings?.appleAppPassword) {
      return NextResponse.json({ error: 'Brak konfiguracji Apple ID.' }, { status: 400 });
    }

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `Jesteś Asystentem Kalendarza (AI).
Twoim zadaniem jest pomaganie użytkownikowi w zarządzaniu jego kalendarzem. 
Dziś jest: ${new Date().toLocaleString('pl-PL')}.
Zawsze staraj się dopytać o szczegóły (tytuł, data rozpoczęcia, data zakończenia), jeśli brakuje ich do stworzenia wydarzenia.
Zawsze pisz krótko i konkretnie. Jak potwierdzisz utworzenie wydarzenia, poinformuj o tym.`,
      messages,
      tools: {
        createCalendarEvent: tool({
          description: 'Tworzy nowe wydarzenie w kalendarzu iCloud użytkownika.',
          parameters: z.object({
            title: z.string().describe('Tytuł wydarzenia'),
            start: z.string().describe('Data i czas rozpoczęcia wydarzenia w formacie ISO (np. 2026-07-20T15:00:00Z)'),
            end: z.string().describe('Data i czas zakończenia wydarzenia w formacie ISO (np. 2026-07-20T16:00:00Z)'),
            description: z.string().optional().describe('Opcjonalny opis wydarzenia'),
          }),
          // @ts-ignore
          execute: async (params) => {
            const { title, start, end, description } = params;
            const result = await createAppleCalendarEvent(
              userSettings.appleId!, 
              userSettings.appleAppPassword!, 
              { title, start, end, description }
            );
            if (result.success) {
              return `Pomyślnie utworzono wydarzenie "${title}" od ${start} do ${end}.`;
            } else {
              return `Nie udało się utworzyć wydarzenia: ${result.error}`;
            }
          },
        }),
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Calendar Chat Error:", error);
    return NextResponse.json({ error: 'Failed to chat with calendar AI' }, { status: 500 });
  }
}
