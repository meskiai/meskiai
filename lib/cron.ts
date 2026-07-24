import { prisma } from './prisma';
import { getGmailClient, sendEmail } from './gmail';
import { generateText } from 'ai';
import { google as googleAI } from '@ai-sdk/google';

// ─── Guard ────────────────────────────────────────────────────────────────────
const g = global as any;
const POLL_INTERVAL_MS = Number(process.env.CRON_INTERVAL_MS ?? 120_000);

export function startCron() {
  if (g.__aiCronStarted) return;
  g.__aiCronStarted = true;

  console.log(`\n🤖 [Agent AI] CRON 24/7 uruchomiony — interwał: ${POLL_INTERVAL_MS / 1000}s`);
  console.log(`   Działa niezależnie od sesji użytkownika i stanu przeglądarki.\n`);

  // Uruchom natychmiast przy starcie
  runSync().catch(err => console.error('[Agent AI] Błąd przy starcie:', err));

  setInterval(() => {
    runSync().catch(err => console.error('[Agent AI] Błąd cyklu:', err));
  }, POLL_INTERVAL_MS);
}

// ─── Główna synchronizacja ────────────────────────────────────────────────────
export async function runSync() {
  if (g.__aiRunning) {
    console.log('[Agent AI] Poprzedni cykl jeszcze trwa — pomijam.');
    return;
  }
  g.__aiRunning = true;

  try {
    // Pobierz wszystkich użytkowników z kontem Google i ustawieniami
    const users = await prisma.user.findMany({
      include: { settings: true, accounts: true }
    });

    // Przetwarzaj tylko tych którzy mają konto Google OAuth
    const candidates = users.filter(u =>
      u.accounts.some((a: any) => a.provider === 'google')
    );

    if (candidates.length === 0) {
      console.log('[Agent AI] Brak użytkowników z kontem Google — pomijam.');
      return;
    }

    // Sprawdź ilu ma autoReply=true
    const active = candidates.filter(u => u.settings?.autoReply === true);
    console.log(`[Agent AI] Sprawdzam ${candidates.length} użytkownika(ów), ${active.length} z autoReply=ON`);

    for (const user of candidates) {
      await processUser(user).catch(err =>
        console.error(`[Agent AI] Błąd dla ${user.email ?? user.id}:`, err)
      );
    }

    console.log('[Agent AI] Cykl zakończony.');
  } catch (err) {
    console.error('[Agent AI] Krytyczny błąd:', err);
  } finally {
    g.__aiRunning = false;
  }
}

// ─── Przetwarzanie jednego użytkownika ────────────────────────────────────────
async function processUser(user: any) {
  const userId = user.id;
  const settings = user.settings;

  // Czy auto-odpowiedź jest włączona dla tego użytkownika
  const isAutoReplyOn: boolean = settings?.autoReply === true;

  // Nawet jeśli autoReply=false, importujemy i klasyfikujemy maile (zapisujemy szkice)
  // Pomijamy tylko użytkowników bez żadnych ustawień (nowi, nie skonfigurowani)
  if (!settings) {
    console.log(`[Agent AI] ${user.email ?? userId}: brak ustawień — pomijam.`);
    return;
  }

  if (!settings.businessContext) {
    console.log(`[Agent AI] ${user.email ?? userId}: brak opisu firmy — pomijam (nie skonfigurowano).`);
    return;
  }

  // Pobierz klienta Gmail (odświeża token automatycznie)
  let gmail: any;
  try {
    gmail = await getGmailClient(userId);
  } catch (err: any) {
    console.warn(`[Agent AI] ${user.email ?? userId}: brak dostępu Gmail — ${err.message}`);
    return;
  }

  // Pobierz nieprzeczytane wiadomości
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults: 20
  });

  const messages: any[] = res.data.messages ?? [];

  // Zawsze zapisuj czas ostatniego sprawdzenia skrzynki
  await prisma.userSettings.update({
    where: { userId },
    data: { lastAgentRunAt: new Date() }
  }).catch(() => {}); // Nie blokuj jeśli update się nie uda

  if (messages.length === 0) {
    console.log(`[Agent AI] ${user.email ?? userId}: brak nowych wiadomości.`);
    return;
  }

  console.log(`[Agent AI] ${user.email ?? userId}: ${messages.length} nieprzeczytanych. autoReply=${isAutoReplyOn}`);

  let processed = 0;
  for (const msg of messages) {
    if (!msg.id) continue;
    await processMessage({ userId, user, settings, isAutoReplyOn, gmail, messageId: msg.id })
      .catch(err => console.error(`[Agent AI] Błąd wiadomości ${msg.id}:`, err));
    processed++;
  }

  if (processed > 0) {
    await prisma.userSettings.update({
      where: { userId },
      data: { agentEmailsProcessed: { increment: processed } }
    }).catch(() => {});
  }
}

// ─── Przetwarzanie jednej wiadomości ─────────────────────────────────────────
async function processMessage({
  userId, user, settings, isAutoReplyOn, gmail, messageId
}: {
  userId: string;
  user: any;
  settings: any;
  isAutoReplyOn: boolean;
  gmail: any;
  messageId: string;
}) {
  // Sprawdź duplikat w bazie
  const existing = await prisma.email.findUnique({ where: { messageId } });

  if (existing) {
    // Ponów tylko jeśli poprzedni draft się nie udał
    const thread = await prisma.thread.findUnique({ where: { id: existing.threadId } });
    const needsRetry =
      thread &&
      thread.status === 'PENDING_APPROVAL' &&
      thread.draftReply &&
      thread.draftReply.startsWith('[BŁĄD AI]');
    if (!needsRetry) return;
  }

  // Pobierz pełną wiadomość
  const msgData = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full'
  });

  const payload = msgData.data.payload;
  const headers: any[] = payload?.headers ?? [];
  const threadId = msgData.data.threadId || messageId;

  const subject = headers.find((h: any) => h.name?.toLowerCase() === 'subject')?.value ?? '(brak tematu)';
  const from    = headers.find((h: any) => h.name?.toLowerCase() === 'from')?.value    ?? 'nieznany';
  const to      = headers.find((h: any) => h.name?.toLowerCase() === 'to')?.value      ?? '';

  // Heurystyka: bot/newsletter?
  const listUnsub  = headers.find((h: any) => h.name?.toLowerCase() === 'list-unsubscribe');
  const precedence = headers.find((h: any) => h.name?.toLowerCase() === 'precedence');
  const isBot =
    !!listUnsub ||
    (precedence?.value?.toLowerCase().includes('bulk')) ||
    /noreply|no-reply|daemon|mailer-daemon/i.test(from);

  const body = extractBody(payload);

  // Upsert wątku
  let dbThread = await prisma.thread.findUnique({ where: { threadId } });

  if (!existing) {
    if (!dbThread) {
      dbThread = await prisma.thread.create({
        data: { threadId, userId, status: isBot ? 'IGNORED' : 'PENDING_APPROVAL' }
      });
    } else {
      dbThread = await prisma.thread.update({
        where: { id: dbThread.id },
        data: { status: isBot ? 'IGNORED' : 'PENDING_APPROVAL', draftReply: null }
      });
    }

    await prisma.email.create({
      data: {
        threadId:   dbThread.id,
        messageId,
        from, to, subject,
        snippet:    msgData.data.snippet ?? '',
        body:       body || (msgData.data.snippet ?? ''),
        receivedAt: msgData.data.internalDate
          ? new Date(Number(msgData.data.internalDate))
          : new Date(),
        isFromAgent: false
      }
    });
  } else {
    dbThread = await prisma.thread.findUnique({ where: { id: existing.threadId } });
  }

  if (!dbThread) return;

  // Boty — oznacz i pomiń
  if (isBot) {
    if (dbThread.status !== 'IGNORED') {
      await prisma.thread.update({ where: { id: dbThread.id }, data: { status: 'IGNORED' } });
    }
    return;
  }

  // Już obsłużone
  if (dbThread.status === 'AUTO_REPLIED' || dbThread.status === 'REQUIRES_ATTENTION') return;

  // ── Generuj odpowiedź AI ──────────────────────────────────────────────────
  console.log(`[Agent AI] Generuję odpowiedź AI dla wątku ${threadId} (from: ${from})`);

  try {
    const { text } = await generateText({
      model: googleAI('gemini-2.0-flash'),
      system: buildSystemPrompt(settings),
      prompt: `Od: ${from}\nTemat: ${subject}\n\nTreść:\n${body || msgData.data.snippet}`
    });

    const aiText  = text.trim();
    const upper   = aiText.toUpperCase().slice(0, 30);

    if (upper.startsWith('BOT')) {
      await prisma.thread.update({ where: { id: dbThread.id }, data: { status: 'IGNORED' } });
      console.log(`[Agent AI] Wykryto bota → IGNORED (${threadId})`);
      return;
    }

    if (upper.includes('REQUIRES_ATTENTION')) {
      await prisma.thread.update({
        where: { id: dbThread.id },
        data: { status: 'REQUIRES_ATTENTION', draftReply: null }
      });
      console.log(`[Agent AI] Wymaga uwagi → REQUIRES_ATTENTION (${threadId})`);
      return;
    }

    // Sprawdź limit wysyłania
    const emailsSent   = settings?.emailsSentThisMonth ?? 0;
    const priceId      = user.stripePriceId;
    const PRICE_BASIC  = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    const PRICE_PRO    = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
    const limitExceeded =
      (priceId === PRICE_BASIC && emailsSent >= 100) ||
      (priceId === PRICE_PRO   && emailsSent >= 1000);

    if (isAutoReplyOn && !limitExceeded) {
      // ── AUTO-WYŚLIJ ──
      const replyTo = from.replace(/.*<(.+)>.*/, '$1').trim() || from;
      await sendEmail(userId, replyTo, `Re: ${subject}`, aiText, threadId);

      await prisma.thread.update({
        where: { id: dbThread.id },
        data:  { status: 'AUTO_REPLIED', draftReply: null }
      });

      await prisma.userSettings.update({
        where: { userId },
        data:  { emailsSentThisMonth: { increment: 1 } }
      });

      await prisma.email.create({
        data: {
          threadId:   dbThread.id,
          messageId:  `sent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          from:       user.email ?? 'Agent AI MESKIAI',
          to:         replyTo,
          subject:    `Re: ${subject}`,
          snippet:    aiText.substring(0, 150),
          body:       aiText,
          receivedAt: new Date(),
          isFromAgent: true
        }
      });

      console.log(`[Agent AI] ✅ Auto-odpowiedź wysłana → ${replyTo} (${threadId})`);
    } else {
      // ── ZAPISZ SZKIC ──
      const notice = isAutoReplyOn && limitExceeded
        ? '\n\n[LIMIT]: Miesięczny limit auto-odpowiedzi wyczerpany. Szkic zapisany.'
        : '';

      await prisma.thread.update({
        where: { id: dbThread.id },
        data:  { draftReply: aiText + notice }
      });

      const why = !isAutoReplyOn ? 'autoReply=OFF' : 'limit wyczerpany';
      console.log(`[Agent AI] 📝 Szkic zapisany (${why}) → ${threadId}`);
    }
  } catch (aiErr: any) {
    console.error(`[Agent AI] ❌ Błąd AI dla ${threadId}:`, aiErr.message ?? aiErr);
    await prisma.thread.update({
      where: { id: dbThread.id },
      data:  { draftReply: `[BŁĄD AI]: ${aiErr.message ?? 'Nieznany błąd'}. Ponowna próba za chwilę.` }
    });
  }
}

// ─── Odnowienie Gmail Watch (Pub/Sub) ─────────────────────────────────────────
export async function renewGmailWatches() {
  if (!process.env.GMAIL_PUBSUB_TOPIC) return;
  try {
    const users = await prisma.user.findMany({ include: { accounts: true } });
    for (const user of users.filter(u => u.accounts.length > 0)) {
      try {
        const gmail = await getGmailClient(user.id);
        await gmail.users.watch({
          userId: 'me',
          requestBody: { topicName: process.env.GMAIL_PUBSUB_TOPIC, labelIds: ['INBOX'] }
        });
        console.log(`[Agent AI] Gmail watch odnowiony dla ${user.email}`);
      } catch (e: any) {
        console.warn(`[Agent AI] Watch error ${user.email}: ${e.message}`);
      }
    }
  } catch (e) {
    console.error('[Agent AI] renewGmailWatches error:', e);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractBody(payload: any): string {
  if (!payload) return '';
  if (payload.parts?.length) {
    // Preferuj text/plain
    const plain = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plain?.body?.data) return Buffer.from(plain.body.data, 'base64').toString('utf-8');
    // Rekurencja przez multipart
    for (const part of payload.parts) {
      const r = extractBody(part);
      if (r) return r;
    }
  }
  if (payload.body?.data) return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  return '';
}

function buildSystemPrompt(settings: any): string {
  const tone = settings?.replyTone ?? 'PROFESJONALNY';
  const ctx  = settings?.businessContext ?? 'Firma dbająca o profesjonalną obsługę klienta.';

  const toneInstr =
    tone === 'CASUALOWY'
      ? 'Pisz nieformalnie, mów "Cześć", nie używaj "Szanowny Panie".'
      : tone === 'KROTKI'
      ? 'Odpowiedź maksymalnie 2-3 zdania. Żadnych długich uprzejmości.'
      : 'Pisz profesjonalnie i oficjalnie.';

  return `Jesteś asystentem AI ds. e-maili pracującym 24/7.
Firma: "${ctx}"
Ton: ${tone} — ${toneInstr}

ZASADY:
1. Jeśli wiadomość to newsletter/bot/system → odpowiedz TYLKO: BOT
2. Jeśli wiadomość jest pilna i wymaga decyzji właściciela → odpowiedz TYLKO: REQUIRES_ATTENTION  
3. Dla zwykłych wiadomości: napisz odpowiedź w odpowiednim tonie i języku. Podpisz się jako "Asystent AI | MESKIAI".
4. Nie pisz żadnych meta-komentarzy. Odpowiadaj bezpośrednio treścią maila.`;
}
