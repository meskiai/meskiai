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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawMessages = body.messages ?? [];

    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      include: { settings: true } 
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const trialState = getTrialState({ 
      createdAt: user.createdAt, 
      subscriptionStatus: user.subscriptionStatus || null 
    }, user.settings || undefined);
    
    if (trialState.isTrialExpired) {
      return NextResponse.json({ error: 'Twój 3-dniowy okres próbny wygasł. Opłać subskrypcję, aby korzystać z tej funkcji.' }, { status: 403 });
    }

    const isSubscriptionActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    if (!isSubscriptionActive && !trialState.isTrialActive) {
      return NextResponse.json({ error: 'Brak aktywnej subskrypcji. Wykup abonament, aby korzystać z tej funkcji.' }, { status: 403 });
    }

    const userSettings = user.settings;
    const expectedCost = 20;
    const aiCredits = userSettings?.aiCredits ?? 0;
    
    if (user.stripePriceId !== PRICE_MAX) {
      if (aiCredits < expectedCost) {
        return NextResponse.json({ error: `Brak wystarczającej liczby kredytów (Wymagane: ${expectedCost}, Posiadasz: ${aiCredits}). Odnów pakiet.` }, { status: 403 });
      }
      await prisma.userSettings.update({
        where: { userId: session.user.id },
        data: { aiCredits: { decrement: expectedCost } }
      });
    }

    // Normalize messages to CoreMessage format
    const coreMessages = rawMessages.map((m: any) => {
      if (typeof m.role === 'string' && typeof m.content === 'string') return { role: m.role, content: m.content };
      if (m.role && Array.isArray(m.parts)) {
        const text = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
        return { role: m.role, content: text };
      }
      if (m.role && typeof m.text === 'string') return { role: m.role, content: m.text };
      return { role: m.role ?? 'user', content: String(m.content ?? m.text ?? '') };
    });

    // ─── Fetch all context in parallel ───────────────────────────────────────
    const [recentEmails, recentLeads, recentInvoices, recentOrders, startOfDayCount, totalProcessed] = await Promise.all([
      // Last 60 emails with full body
      prisma.email.findMany({
        where: { thread: { userId: user.id } },
        orderBy: { receivedAt: 'desc' },
        take: 60,
        include: { thread: true }
      }),
      // Leads (potential clients)
      prisma.lead.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Recent invoices
      prisma.invoice.findMany({
        where: { userId: user.id },
        orderBy: { issueDate: 'desc' },
        take: 10,
        include: { items: true }
      }),
      // Recent orders from store
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Emails sent today by agent
      prisma.email.count({
        where: {
          thread: { userId: user.id },
          isFromAgent: true,
          receivedAt: { gte: (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })() }
        }
      }),
      // Total processed
      Promise.resolve(userSettings?.agentEmailsProcessed ?? 0),
    ]);

    // ─── Build context strings ─────────────────────────────────────────────────

    // Group emails by sender to build client profiles
    const clientMap: Record<string, { emails: typeof recentEmails; agentReplies: number; topics: string[] }> = {};
    for (const e of recentEmails) {
      const clientEmail = e.isFromAgent ? e.to : e.from;
      if (!clientMap[clientEmail]) clientMap[clientEmail] = { emails: [], agentReplies: 0, topics: [] };
      clientMap[clientEmail].emails.push(e);
      if (e.isFromAgent) clientMap[clientEmail].agentReplies++;
      if (e.subject && !clientMap[clientEmail].topics.includes(e.subject)) {
        clientMap[clientEmail].topics.push(e.subject);
      }
    }

    const emailsContext = recentEmails.map(e => 
      `[${e.receivedAt.toLocaleDateString('pl-PL')} ${e.receivedAt.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}] ${e.isFromAgent ? '📤 ODPOWIEDŹ AGENTA' : '📥 MAIL OD KLIENTA'}
Od: ${e.from} → Do: ${e.to}
Temat: ${e.subject}
Status wątku: ${e.thread.status}
Treść: ${e.body?.substring(0, 800) || e.snippet}
---`
    ).join('\n');

    const clientsContext = Object.entries(clientMap).map(([email, data]) => {
      const name = data.emails.find(e => !e.isFromAgent)?.from || email;
      return `Klient: ${name}
  - Liczba maili: ${data.emails.length} (Agent odpowiedział: ${data.agentReplies} razy)
  - Tematy: ${data.topics.slice(0, 5).join(', ')}`;
    }).join('\n');

    // Detect meetings mentioned in emails
    const meetingKeywords = ['spotkanie', 'meeting', 'call', 'rozmowa', 'termin', 'umówmy', 'zapraszam', 'calendar', 'teams', 'zoom', 'google meet', 'wideokonferencja'];
    const meetingEmails = recentEmails.filter(e => {
      const text = (e.body || e.snippet || '').toLowerCase();
      return meetingKeywords.some(k => text.includes(k));
    });
    const meetingsContext = meetingEmails.length > 0
      ? meetingEmails.map(e => 
          `- [${e.receivedAt.toLocaleDateString('pl-PL')}] Od: ${e.from} | Temat: "${e.subject}" | Fragment: "${(e.body || e.snippet || '').substring(0, 200)}"`
        ).join('\n')
      : 'Brak wykrytych spotkań w emailach.';

    const leadsContext = recentLeads.length > 0
      ? recentLeads.map(l => `- ${l.name} | Status: ${l.status} | Szansa: ${l.probability}% | Źródło: ${l.source} | Opis: ${l.description.substring(0, 200)}`).join('\n')
      : 'Brak leadów.';

    const invoicesContext = recentInvoices.length > 0
      ? recentInvoices.map(inv => `- FV ${inv.invoiceNumber} | Klient: ${inv.clientName} | Kwota: ${inv.totalAmount} PLN | Status: ${inv.status} | Data: ${inv.issueDate.toLocaleDateString('pl-PL')}`).join('\n')
      : 'Brak faktur.';

    const ordersContext = recentOrders.length > 0
      ? recentOrders.map(o => `- Zamówienie ${o.orderNumber} | Email: ${o.customerEmail} | Status: ${o.status} | Produkty: ${o.items} | Kwota: ${o.totalPrice}`).join('\n')
      : 'Brak zamówień.';

    const timeSavedMinutes = totalProcessed * 5;
    const timeSavedStr = timeSavedMinutes >= 60
      ? `${Math.floor(timeSavedMinutes / 60)} godz. ${timeSavedMinutes % 60} min`
      : `${timeSavedMinutes} min`;

    // ─── System prompt ─────────────────────────────────────────────────────────
    const systemPrompt = `Jesteś "Agentem AI MESKIAI" - inteligentnym asystentem biznesowym zalogowanego użytkownika. Masz pełny dostęp do wszystkich danych jego firmy i systemu.

═══════════════════════════════════════
📊 STATUS KONTA I AGENTA
═══════════════════════════════════════
- Firma: ${userSettings?.companyName || user.name || user.email}
- Email konta: ${user.email}
- Auto-Odpowiadanie: ${userSettings?.autoReply ? '✅ WŁĄCZONE' : '⛔ WYŁĄCZONE'}
- Maile obsłużone dzisiaj przez agenta: ${startOfDayCount}
- Łącznie obsłużonych maili: ${totalProcessed}
- Zaoszczędzony czas: ${timeSavedStr}
- Ton odpowiedzi agenta: ${userSettings?.replyTone || 'PROFESJONALNY'}
- Sklep: ${userSettings?.storeType ? `${userSettings.storeType} (${userSettings.storeUrl})` : 'Nie podłączono'}
- Kredyty: ${aiCredits}

═══════════════════════════════════════
📧 HISTORIA MAILI (ostatnie 60)
═══════════════════════════════════════
${emailsContext || 'Brak maili w bazie.'}

═══════════════════════════════════════
👥 PROFILE KLIENTÓW (wykryte z maili)
═══════════════════════════════════════
${clientsContext || 'Brak danych o klientach.'}

═══════════════════════════════════════
📅 WYKRYTE SPOTKANIA (z treści maili)
═══════════════════════════════════════
${meetingsContext}

═══════════════════════════════════════
🎯 LEADY / POTENCJALNI KLIENCI
═══════════════════════════════════════
${leadsContext}

═══════════════════════════════════════
🧾 FAKTURY
═══════════════════════════════════════
${invoicesContext}

═══════════════════════════════════════
📦 ZAMÓWIENIA ZE SKLEPU
═══════════════════════════════════════
${ordersContext}

═══════════════════════════════════════
📖 INSTRUKCJA PANELU MESKIAI (Twoja wiedza)
═══════════════════════════════════════
Panel MESKIAI składa się z zakładek:

1. 🏠 DASHBOARD - Główna strona ze statystykami: liczba maili, zaoszczędzony czas, status agenta, wykresy aktywności.

2. 📧 SKRZYNKA (Inbox) - Lista wszystkich odebranych maili. Użytkownik może ręcznie zatwierdzić lub odrzucić odpowiedź agenta. Statusy wątków: PENDING_APPROVAL (czeka na zatwierdzenie), REPLIED (odpowiedziano), AUTO_REPLIED (agent sam odpowiedział), IGNORED (zignorowano), REQUIRES_ATTENTION (wymaga uwagi).

3. 🤖 AGENT CHAT (ta zakładka) - Czat z Tobą (Agentem AI). Tu użytkownik może pytać o maile, klientów, spotkania.

4. ⚙️ USTAWIENIA - Konfiguracja agenta:
   - Podłączenie Gmail: Wymagane jest hasło aplikacji Google (nie zwykłe hasło). Kroki: Konto Google → Bezpieczeństwo → Weryfikacja dwuetapowa (włącz) → Hasła aplikacji → Wygeneruj → Wpisz w panelu MESKIAI w polu "Hasło aplikacji".
   - Kontekst biznesowy: Opis firmy, który AI używa do pisania odpowiedzi.
   - Ton odpowiedzi: PROFESJONALNY / PRZYJAZNY / FORMALNY
   - Auto-odpowiadanie: Włącz/Wyłącz automatyczne odpowiedzi bez zatwierdzania.

5. 🛍️ SKLEP - Integracja z e-commerce:
   - Shopify: Potrzebne: URL sklepu (np. moj-sklep.myshopify.com) + Admin API Access Token. Gdzie znaleźć: Panel Shopify → Apps → Develop apps → Create app → API credentials → Admin API access token.
   - WooCommerce: Potrzebne: URL sklepu + Consumer Key + Consumer Secret. Gdzie znaleźć: WordPress → WooCommerce → Ustawienia → Zaawansowane → REST API → Dodaj klucz.
   - Po podłączeniu: Agent automatycznie odpowiada na pytania o zamówienia, statusy, produkty.

6. 📊 LEADY - CRM do zarządzania potencjalnymi klientami. Dodaj lead ręcznie lub agent automatycznie wykrywa zapytania ofertowe.

7. 🧾 FAKTURY - Generator faktur. Utwórz fakturę → Wpisz dane klienta i pozycje → Pobierz PDF.

8. 📦 ZAMÓWIENIA - Lista zamówień ze sklepu (synchronizowanych automatycznie co kilka minut).

═══════════════════════════════════════
🚫 ZASADY — BEZWZGLĘDNE
═══════════════════════════════════════
ODPOWIADASZ **TYLKO** na pytania z tych kategorii:
  ✅ Maile — historia, treść, kto pisał, co pisał, kiedy
  ✅ Klienci — kto co wspominał, ile maili, jakie tematy
  ✅ Spotkania — terminy wykryte w mailach, umówione rozmowy
  ✅ Panel MESKIAI — jak coś działa, jak podłączyć Gmail/Shopify/WooCommerce (krok po kroku)
  ✅ Status agenta — statystyki, kredyty, ustawienia autoReply
  ✅ Leady, faktury, zamówienia ze sklepu

NA WSZYSTKO INNE odpowiadasz WYŁĄCZNIE tym zdaniem (nic więcej):
"To pytanie wykracza poza moje kompetencje. Jestem asystentem do obsługi maili i panelu MESKIAI."

ABSOLUTNIE ZAKAZANE jest odpowiadanie na:
  ❌ Ogólna wiedza, nauka, historia, geografia, matematyka
  ❌ Programowanie i kod niezwiązany z panelem MESKIAI
  ❌ Przepisy kulinarne, porady zdrowotne, lifestyle
  ❌ Żarty, rozmowy towarzyskie, small talk
  ❌ Polityka, sport, rozrywka
  ❌ Cokolwiek spoza listy dozwolonych tematów powyżej

Jeśli użytkownik prosi o włączenie/wyłączenie agenta → UŻYJ NARZĘDZIA toggleAgentStatus.
Pisz krótko i konkretnie. Mów do szefa z szacunkiem.`;

    const result = await streamText({
      model: google("models/gemini-3.5-flash-lite"),
      system: systemPrompt,
      messages: coreMessages,
      tools: {
        toggleAgentStatus: tool({
          description: 'Włącza lub wyłącza funkcję auto-odpowiadania (działania Agenta AI).',
          parameters: z.object({
            turnOn: z.boolean().describe('true aby włączyć agenta, false aby wyłączyć')
          }),
          // @ts-ignore
          execute: async ({ turnOn }) => {
            await prisma.userSettings.update({
              where: { userId: session.user.id },
              data: { autoReply: turnOn }
            });
            return `Agent został pomyślnie ${turnOn ? 'WŁĄCZONY ✅' : 'WYŁĄCZONY ⛔'}.`;
          }
        })
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.' }, { status: 500 });
  }
}
