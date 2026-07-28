import { prisma } from './prisma';
import { fetchUnreadEmailsPOP3, sendReplySMTP, FetchedEmail } from './mail';
import { generateText } from 'ai';
import { google as googleAI } from '@ai-sdk/google';

// ─── Retry helper ──────────────────────────────────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, retries = 4, delayMs = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = err?.message ?? '';
      const isRetryable =
        msg.includes('ECONNRESET') ||
        msg.includes('fetch failed') ||
        msg.includes('NeonDbError') ||
        msg.includes('connection');
      if (isRetryable && i < retries - 1) {
        const wait = delayMs * (i + 1);
        console.log(`[Agent AI] Baza danych — ponowna próba ${i + 1}/${retries - 1} za ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Wyczerpano próby połączenia z bazą danych.');
}

// ─── Price limits ──────────────────────────────────────────────────────────────
function getMonthlyLimit(stripePriceId: string | null): number {
  const PRICE_MAX = process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX;
  const PRICE_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  if (stripePriceId === PRICE_MAX) return 5000;
  if (stripePriceId === PRICE_PRO) return 1000;
  return 50; // Basic (default for any active subscription)
}

// ─── Fetch & strip company website content (for AI context) ────────────────────
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    if (!url) return '';
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(fullUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MailAgent/1.0)' }
    });
    clearTimeout(timeout);
    if (!res.ok) return '';
    const html = await res.text();
    // Strip tags and collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s{2,}/g, ' ')
      .trim();
    // Return first 4000 chars — enough context, not too expensive for AI
    return text.substring(0, 4000);
  } catch {
    return '';
  }
}

// ─── Global guard (prevents overlapping runs in same container) ─────────────────
const g = global as any;

// ─── Main entry point (called by Netlify background function every 2 min) ───────
export async function runSync() {
  const now = Date.now();
  if (g.__aiRunning && now - g.__aiRunning < 13 * 60 * 1000) {
    console.log('[Agent AI] Poprzedni cykl jeszcze trwa — pomijam.');
    return;
  }
  g.__aiRunning = now;

  try {
    // Fetch ONLY users that are eligible:
    //  - active/trialing subscription
    //  - has an app password
    //  - has autoReply enabled
    const users = await withRetry(() =>
      prisma.user.findMany({
        where: {
          email: { not: null },
          subscriptionStatus: { in: ['active', 'trialing'] },
          settings: {
            appPassword: { not: null },
            autoReply: true,
          },
        },
        include: { settings: true },
      })
    );

    if (users.length === 0) {
      console.log('[Agent AI] Brak aktywnych użytkowników do obsługi.');
      return;
    }

    // ── Monthly limit auto-reset ────────────────────────────────────────────────
    // Stripe webhook also resets on invoice.payment_succeeded, this is a safety net
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    for (const user of users) {
      const s = user.settings;
      if (!s) continue;
      const lastReset = s.lastMonthlyReset ? new Date(s.lastMonthlyReset) : null;
      const needsReset =
        !lastReset ||
        lastReset.getMonth() !== currentMonth ||
        lastReset.getFullYear() !== currentYear;
      if (needsReset) {
        await prisma.userSettings
          .update({
            where: { userId: user.id },
            data: { emailsSentThisMonth: 0, lastMonthlyReset: new Date() },
          })
          .catch(() => {});
        user.settings!.emailsSentThisMonth = 0;
        console.log(`[Agent AI] ↺ Reset licznika miesięcznego dla ${user.email}`);
      }
    }

    // Shuffle for fair round-robin (avoids starvation when time is limited)
    users.sort(() => Math.random() - 0.5);

    console.log(`[Agent AI] Sprawdzam ${users.length} aktywnych użytkowników...`);

    // Process in batches of 3 concurrently
    const chunkSize = 3;
    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      await Promise.allSettled(
        chunk.map(user =>
          processUser(user).catch(err =>
            console.error(`[Agent AI] Błąd dla ${user.email}:`, err?.message ?? err)
          )
        )
      );
    }

    console.log('[Agent AI] ✅ Cykl zakończony.');
  } catch (err: any) {
    console.error('[Agent AI] Krytyczny błąd runSync:', err?.message ?? err);
  } finally {
    g.__aiRunning = false;
  }
}

// ─── Process a single user ─────────────────────────────────────────────────────
async function processUser(user: any) {
  const userId   = user.id;
  const settings = user.settings;

  // Guard: app password required
  if (!settings?.appPassword) {
    console.log(`[Agent AI] ${user.email}: brak hasła aplikacji — pomijam.`);
    return;
  }

  // Guard: subscription must be active (double-check in case DB was stale)
  if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
    console.log(`[Agent AI] ${user.email}: brak aktywnej subskrypcji (${user.subscriptionStatus}) — pomijam.`);
    return;
  }

  // Guard: monthly limit
  const monthlyLimit = getMonthlyLimit(user.stripePriceId);
  const emailsSent   = settings.emailsSentThisMonth ?? 0;
  if (emailsSent >= monthlyLimit) {
    console.log(`[Agent AI] ${user.email}: limit ${emailsSent}/${monthlyLimit} wyczerpany — pomijam.`);
    return;
  }

  // Fetch known UIDs so POP3 can skip already-processed emails
  let knownUids: string[] = [];
  try {
    const existing = await prisma.email.findMany({
      where: { thread: { userId }, pop3Uid: { not: null } },
      select: { pop3Uid: true },
    });
    knownUids = existing.map(e => e.pop3Uid as string);
  } catch (err: any) {
    console.error(`[Agent AI] ${user.email}: błąd pobierania znanych UID:`, err?.message);
    // Non-fatal: continue with empty knownUids (may re-process, but won't break)
  }

  // Fetch new emails via POP3
  let messages: FetchedEmail[] = [];
  try {
    messages = await fetchUnreadEmailsPOP3(user.email!, settings.appPassword!, knownUids);
  } catch (err: any) {
    console.warn(`[Agent AI] ${user.email}: błąd POP3 — ${err.message}`);
    return;
  }

  // Fetch company website content once per cycle (used by AI for context)
  let websiteContent = '';
  if (settings.companyWebsite) {
    websiteContent = await fetchWebsiteContent(settings.companyWebsite);
    if (websiteContent) {
      console.log(`[Agent AI] ${user.email}: pobrano treść strony (${websiteContent.length} znaków).`);
    }
  }

  // Record last-run timestamp
  await prisma.userSettings
    .update({ where: { userId }, data: { lastAgentRunAt: new Date() } })
    .catch(() => {});

  if (messages.length === 0) {
    console.log(`[Agent AI] ${user.email}: brak nowych wiadomości.`);
    return;
  }

  console.log(`[Agent AI] ${user.email}: ${messages.length} nowych wiadomości do przetworzenia.`);

  let replied = 0;
  for (const msg of messages) {
    // Re-check limit before each message (it may have been incremented by another parallel user)
    const fresh = await prisma.userSettings
      .findUnique({ where: { userId }, select: { emailsSentThisMonth: true } })
      .catch(() => null);
    const currentSent = fresh?.emailsSentThisMonth ?? emailsSent + replied;
    if (currentSent >= monthlyLimit) {
      console.log(`[Agent AI] ${user.email}: limit osiągnięty w trakcie — zatrzymuję.`);
      break;
    }

    const wasReplied = await processMessage({ userId, user, settings, msg, websiteContent }).catch(err => {
      console.error(`[Agent AI] Błąd wiadomości ${msg.messageId}:`, err?.message ?? err);
      return false;
    });

    if (wasReplied) replied++;
  }

  if (replied > 0) {
    await prisma.userSettings
      .update({ where: { userId }, data: { agentEmailsProcessed: { increment: replied } } })
      .catch(() => {});
  }
}

// ─── Process a single message. Returns true if an email was actually sent. ──────
async function processMessage({
  userId,
  user,
  settings,
  msg,
  websiteContent = '',
}: {
  userId: string;
  user: any;
  settings: any;
  msg: FetchedEmail;
  websiteContent?: string;
}): Promise<boolean> {
  const messageId = msg.messageId;

  // Classify the message
  const messageAgeHours = (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
  const isTooOld = messageAgeHours > 48;
  const isSelf   = (msg as any)._isSelf === true; // sent by the agent itself
  const isBot    = isSelf ||
    /noreply|no-reply|daemon|mailer-daemon|@bounce|@noreply/i.test(msg.from.toLowerCase());

  // ── Duplicate check ──────────────────────────────────────────────────────────
  const existing = await prisma.email.findUnique({ where: { messageId } });
  if (existing) {
    // Patch missing UID
    if (!existing.pop3Uid && msg.pop3Uid) {
      await prisma.email
        .update({ where: { messageId }, data: { pop3Uid: msg.pop3Uid } })
        .catch(() => {});
    }
    // Only retry if previous AI attempt errored
    const thread = await prisma.thread
      .findUnique({ where: { id: existing.threadId } })
      .catch(() => null);
    const needsRetry =
      thread?.status === 'PENDING_APPROVAL' &&
      thread?.draftReply?.startsWith('[BŁĄD AI]');
    if (!needsRetry) return false;
  }

  // ── Find or create the DB thread ─────────────────────────────────────────────
  let dbThread: any;

  if (isTooOld || isBot) {
    // All old / bot emails go into one silent "HISTORY" thread per user
    let historyThread = await prisma.thread
      .findUnique({ where: { threadId: `HISTORY_${userId}` } })
      .catch(() => null);
    if (!historyThread) {
      historyThread = await prisma.thread
        .create({ data: { threadId: `HISTORY_${userId}`, userId, status: 'IGNORED' } })
        .catch(async () =>
          prisma.thread.findUnique({ where: { threadId: `HISTORY_${userId}` } })
        );
    }
    if (!historyThread) return false;
    dbThread = historyThread;
  } else {
    // Try to attach to an existing thread via In-Reply-To / References
    let dbThreadId: string | undefined;

    if (msg.inReplyTo) {
      const parent = await prisma.email
        .findUnique({ where: { messageId: msg.inReplyTo }, select: { threadId: true } })
        .catch(() => null);
      if (parent) dbThreadId = parent.threadId;
    }

    if (!dbThreadId && msg.references?.length) {
      const refs = await prisma.email
        .findMany({
          where: { messageId: { in: msg.references } },
          select: { threadId: true },
          take: 1,
        })
        .catch(() => []);
      if (refs.length) dbThreadId = refs[0].threadId;
    }

    if (dbThreadId) {
      // Existing thread — reset AUTO_REPLIED so we can respond again to a continued conversation
      const existingThread = await prisma.thread
        .findUnique({ where: { id: dbThreadId } })
        .catch(() => null);
      const newStatus =
        existingThread?.status === 'REQUIRES_ATTENTION'
          ? 'REQUIRES_ATTENTION' // keep — human must handle
          : 'PENDING_APPROVAL';
      dbThread = await prisma.thread.update({
        where: { id: dbThreadId },
        data: { status: newStatus, draftReply: null },
      });
    } else {
      // Brand-new thread
      dbThread = await prisma.thread
        .create({ data: { threadId: messageId, userId, status: 'PENDING_APPROVAL' } })
        .catch(async (err: any) => {
          if (err.code === 'P2002' || err.code === '23505') {
            const recovered = await prisma.thread.findUnique({ where: { threadId: messageId } });
            if (!recovered) return null;
            return prisma.thread.update({
              where: { id: recovered.id },
              data: { status: 'PENDING_APPROVAL', draftReply: null },
            });
          }
          throw err;
        });
    }
  }

  if (!dbThread) return false;

  // ── Save email to DB (so its UID is permanently remembered) ─────────────────
  if (!existing) {
    await prisma.email
      .create({
        data: {
          threadId:    dbThread.id,
          messageId,
          pop3Uid:     msg.pop3Uid,
          from:        msg.from,
          to:          msg.to,
          subject:     msg.subject,
          snippet:     (msg.text || '').substring(0, 100),
          body:        msg.text || '',
          receivedAt:  msg.date,
          isFromAgent: false,
        },
      })
      .catch(async (err: any) => {
        if (err.code === 'P2002' || err.code === '23505') {
          console.warn(`[Agent AI] Duplikat wiadomości ${messageId} — pomijam.`);
          return null;
        }
        throw err;
      });
  }

  // Old / bot / self emails — UID saved, no AI needed
  if (isTooOld || isBot) {
    if (dbThread.status !== 'IGNORED') {
      await prisma.thread
        .update({ where: { id: dbThread.id }, data: { status: 'IGNORED' } })
        .catch(() => {});
    }
    return false;
  }

  // Thread already requires human attention — don't overwrite
  if (dbThread.status === 'REQUIRES_ATTENTION') return false;

  // ── Generate AI reply ────────────────────────────────────────────────────────
  console.log(`[Agent AI] 🤖 Generuję odpowiedź: "${msg.subject}" od ${msg.from}`);

  try {
    const { text } = await generateText({
      model:  googleAI('gemini-1.5-pro-latest'),
      system: buildSystemPrompt(settings, websiteContent),
      prompt: `Od: ${msg.from}\nTemat: ${msg.subject}\nData: ${msg.date}\n\nTreść wiadomości:\n${(msg.text || '').substring(0, 3000)}`,
    });

    const aiText = text.trim();
    const upper  = aiText.toUpperCase().slice(0, 80);

    // ── SPAM / BOT ───────────────────────────────────────────────────────────
    if (upper.startsWith('SPAM') || upper.startsWith('BOT') || upper.startsWith('IGNORE')) {
      await prisma.thread
        .update({ where: { id: dbThread.id }, data: { status: 'IGNORED' } })
        .catch(() => {});
      console.log(`[Agent AI] 🗑️ Spam/bot wykryty przez AI → IGNORED`);
      return false;
    }

    // ── WAŻNA SPRAWA — wyślij potwierdzenie do klienta, pokaż w zakładce Ważne ──
    if (upper.startsWith('REQUIRES_ATTENTION')) {
      // Format: "REQUIRES_ATTENTION\n---\n[Analiza dla właściciela]\n---\n[Treść potwierdzenia dla klienta]"
      const parts = aiText.split(/\n---\n/s);
      let analysisText = '';
      let ackText = '';
      
      if (parts.length >= 3) {
        analysisText = parts[1]?.trim();
        ackText = parts[2]?.trim();
      } else {
        // Fallback for older format
        ackText = parts[1]?.trim() || '';
      }

      // Jeśli AI wygenerowała tekst potwierdzenia → wyślij go do klienta
      if (ackText && ackText.length > 10) {
        const replyTo = extractEmail(msg.from);
        const referencesStr = [...(msg.references ?? []), messageId].join(' ');
        try {
          await sendReplySMTP(
            user.email!,
            settings.appPassword!,
            replyTo,
            msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
            ackText,
            messageId,
            referencesStr
          );
          // Zapisz wysłane potwierdzenie w bazie
          await prisma.email.create({
            data: {
              threadId:    dbThread.id,
              messageId:   `ack-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              from:        user.email ?? 'Agent AI',
              to:          replyTo,
              subject:     msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
              snippet:     ackText.substring(0, 150),
              body:        ackText,
              receivedAt:  new Date(),
              isFromAgent: true
            }
          }).catch(() => {});
          console.log(`[Agent AI] ✉️ Wysłano potwierdzenie do klienta → ${replyTo}`);
        } catch (smtpErr: any) {
          console.error(`[Agent AI] Błąd SMTP przy wysyłaniu potwierdzenia:`, smtpErr?.message);
        }
      }

      // Wątek idzie do zakładki Ważne (admin musi podjąć decyzję).
      // Zapisujemy analizę i treść potwierdzenia w draftReply żeby właściciel to przeczytał
      const draftContent = analysisText 
        ? `[ANALIZA AGENTA]:\n${analysisText}\n\n[WYSŁANE POTWIERDZENIE]:\n${ackText || '(brak)'}`
        : ackText || null;

      await prisma.thread
        .update({ where: { id: dbThread.id }, data: { status: 'REQUIRES_ATTENTION', draftReply: draftContent } })
        .catch(() => {});
      console.log(`[Agent AI] ⚠️ Ważna sprawa → REQUIRES_ATTENTION (potwierdzenie wysłane: ${!!ackText})`);
      return false;
    }

    // ── Send the reply via SMTP ──────────────────────────────────────────────
    const replyTo      = extractEmail(msg.from);
    const referencesStr = [...(msg.references ?? []), messageId].join(' ');

    await sendReplySMTP(
      user.email!,
      settings.appPassword!,
      replyTo,
      msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
      aiText,
      messageId,
      referencesStr
    );

    // Mark thread as auto-replied and increment counter
    await Promise.all([
      prisma.thread.update({
        where: { id: dbThread.id },
        data: { status: 'AUTO_REPLIED', draftReply: null },
      }),
      prisma.userSettings.update({
        where: { userId },
        data: { emailsSentThisMonth: { increment: 1 } },
      }),
      // Save sent email record
      prisma.email.create({
        data: {
          threadId:    dbThread.id,
          messageId:   `sent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          from:        user.email ?? 'Agent AI',
          to:          replyTo,
          subject:     msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
          snippet:     aiText.substring(0, 150),
          body:        aiText,
          receivedAt:  new Date(),
          isFromAgent: true,
        },
      }),
    ]);

    console.log(`[Agent AI] ✅ Wysłano → ${replyTo} | "${msg.subject}"`);
    return true;
  } catch (aiErr: any) {
    const errMsg = aiErr?.message ?? 'Nieznany błąd';
    console.error(`[Agent AI] ❌ Błąd AI/SMTP: ${errMsg}`);
    await prisma.thread
      .update({
        where: { id: dbThread.id },
        data: { draftReply: `[BŁĄD AI]: ${errMsg}. Ponowna próba za chwilę.` },
      })
      .catch(() => {});
    return false;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function extractEmail(raw: string): string {
  const match = raw.match(/<(.+?)>/);
  return match ? match[1].trim() : raw.trim();
}

function buildSystemPrompt(settings: any, websiteContent = ''): string {
  const tone = settings?.replyTone ?? 'PROFESJONALNY';
  const ctx  = settings?.businessContext ?? 'Firma dbająca o profesjonalną obsługę klienta.';

  const toneInstr =
    tone === 'CASUALOWY'
      ? 'Pisz nieformalnie, zacznij od "Cześć", nie używaj "Szanowny Panie".'
      : tone === 'KROTKI'
      ? 'Odpowiedź maksymalnie 2-3 zdania. Zero zbędnych uprzejmości.'
      : 'Pisz profesjonalnie i oficjalnie.';

  const websiteSection = websiteContent
    ? `\n\n─── TREŚĆ STRONY FIRMOWEJ (źródło prawdy o ofercie, cenach, godzinach itp.) ───\n${websiteContent}\n────────────────────────────────────────────────────────────────────────────────`
    : '';

  return `Jesteś zaawansowanym asystentem AI ds. e-maili pracującym 24/7 jak doświadczony pracownik biurowy.
Kontekst firmy: "${ctx}"${websiteSection}
Ton komunikacji: ${tone} — ${toneInstr}

ANALIZUJ każdy e-mail i wybierz JEDNĄ z trzech ścieżek:

═══ ŚCIEŻKA 1 — SPAM (odrzuć bez śladu) ═══
Kiedy: newsletter, reklama, cold mailing, oferta handlowa, automatyczne powiadomienie systemowe, promocja, niepożądana oferta.
Format odpowiedzi: napisz TYLKO jedno słowo: SPAM

═══ ŚCIEŻKA 2 — WAŻNA SPRAWA / DOKUMENTY (poinformuj klienta + przeanalizuj dla właściciela) ═══
Kiedy: wiadomość zawiera ZAŁĄCZNIK PDF (umowa, faktura, CV), jest to reklamacja wymagająca decyzji zarządu, sprawa prawna, prośba o zwrot/rekompensatę, negocjacja kontraktu, groźba, POWAŻNA skarga, zamówienie niestandardowe.
UWAGA: jeśli w wiadomości jest załącznik PDF (wskazuje na to tekst "--- ZAŁĄCZNIK PDF: ... ---"), ZAWSZE użyj tej ścieżki i przeanalizuj dokument!
Format odpowiedzi — napisz DOKŁADNIE w tym układzie (zachowaj podwójny separator ---):
REQUIRES_ATTENTION
---
[ANALIZA: krótko i zwięźle napisz do właściciela firmy o co chodzi. Przeanalizuj treść maila oraz treść załącznika PDF (jeśli jest). Wypisz najważniejsze punkty dokumentu, kwoty, daty, strony umowy.]
---
[POTWIERDZENIE DLA KLIENTA: uprzejme potwierdzenie dla klienta, że wiadomość wraz z dokumentacją została przyjęta i przekazana do właściciela/zarządu, że wrócimy tak szybko jak to możliwe. Ton: ${tone}. Podpis: Asystent firmy.]

═══ ŚCIEŻKA 3 — SAMODZIELNA ODPOWIEDŹ ═══
Kiedy: pytanie o produkt/usługę/cennik/godziny/lokalizację/ofertę którą możesz znaleźć na stronie lub w kontekście, ogólne zapytanie, standardowe pytanie klienta.
PRZED podjęciem decyzji o eskalacji: SPRAWDŹ czy odpowiedź nie znajduje się w treści strony firmowej powyżej.
Format odpowiedzi: napisz kompletną treść e-maila.
ZASADY: Podpisz się jako "Asystent [nazwa firmy]". NIE używaj słów "AI", "bot", "sztuczna inteligencja". Odpowiadaj w tym samym języku co nadawca. WYŁĄCZNIE czysta treść maila — zero meta-komentarzy, zero "Oto odpowiedź:". Jeśli czegoś naprawdę nie wiesz i nie ma tego na stronie → użyj Ścieżki 2.`;
}
