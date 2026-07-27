import { prisma } from './prisma';
import { fetchUnreadEmailsPOP3, sendReplySMTP, FetchedEmail } from './mail';
import { generateText } from 'ai';
import { google as googleAI } from '@ai-sdk/google';

// ─── Retry helper ──
async function withRetry<T>(fn: () => Promise<T>, retries = 4, delayMs = 1500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = err?.message ?? '';
      const isRetryable = msg.includes('ECONNRESET') || msg.includes('fetch failed') || msg.includes('NeonDbError');
      if (isRetryable && i < retries - 1) {
        console.log(`[Agent AI] Baza danych się budzi — ponowna próba ${i + 1}/${retries - 1} za ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Wyczerpano próby połączenia z bazą danych.');
}

// ─── Guard ────────────────────────────────────────────────────────────────────
const g = global as any;
const POLL_INTERVAL_MS = Number(process.env.CRON_INTERVAL_MS ?? 120_000);

export function startCron() {
  if (g.__aiCronStarted) return;
  g.__aiCronStarted = true;

  console.log(`\n🤖 [Agent AI] CRON 24/7 uruchomiony (IMAP/SMTP) — interwał: ${POLL_INTERVAL_MS / 1000}s\n`);

  runSync().catch(err => console.error('[Agent AI] Błąd przy starcie:', err));

  setInterval(() => {
    runSync().catch(err => console.error('[Agent AI] Błąd cyklu:', err));
  }, POLL_INTERVAL_MS);
}

// ─── Główna synchronizacja ────────────────────────────────────────────────────
export async function runSync() {
  const now = Date.now();
  if (g.__aiRunning && (now - g.__aiRunning < 120 * 1000)) {
    console.log('[Agent AI] Poprzedni cykl jeszcze trwa w tle — pomijam.');
    return;
  }
  g.__aiRunning = now;

  try {
    const users = await withRetry(() => prisma.user.findMany({
      include: { settings: true }
    }));

    const candidates = users.filter(u => u.settings?.appPassword && u.email);

    if (candidates.length === 0) {
      console.log('[Agent AI] Brak użytkowników ze skonfigurowanym Hasłem Aplikacji (POP3) — pomijam.');
      return;
    }

    const active = candidates.filter(u => u.settings?.autoReply === true);
    console.log(`[Agent AI] Sprawdzam ${candidates.length} użytkownika(ów) łącznie, w tym ${active.length} z włączonym auto-reply (autoReply=ON)`);

    for (const user of candidates) {
      await processUser(user).catch(err =>
        console.error(`[Agent AI] Błąd dla ${user.email}:`, err)
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

  const isAutoReplyOn: boolean = settings?.autoReply === true;

  if (!settings?.appPassword) {
    console.log(`[Agent AI] ${user.email}: brak hasła aplikacji — pomijam.`);
    return;
  }

  let messages: FetchedEmail[] = [];
  try {
    const existingEmails = await prisma.email.findMany({
      where: { thread: { userId }, pop3Uid: { not: null } },
    });
    const knownUids = existingEmails.map(e => e.pop3Uid as string);
    messages = await fetchUnreadEmailsPOP3(user.email!, settings.appPassword!, knownUids);
  } catch (err: any) {
    console.warn(`[Agent AI] ${user.email}: brak dostępu POP3 (Błędne hasło) — ${err.message}`);
    return;
  }

  // Zapisz czas ost. sprawdzenia
  await prisma.userSettings.update({
    where: { userId },
    data: { lastAgentRunAt: new Date() }
  }).catch(() => {});

  if (messages.length === 0) {
    console.log(`[Agent AI] ${user.email}: brak nowych wiadomości (POP3).`);
    return;
  }

  console.log(`[Agent AI] ${user.email}: ${messages.length} nieprzeczytanych. autoReply=${isAutoReplyOn}`);

  let processed = 0;
  for (const msg of messages) {
    await processMessage({ userId, user, settings, isAutoReplyOn, msg })
      .catch(err => console.error(`[Agent AI] Błąd wiadomości ${msg.messageId}:`, err));
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
  userId, user, settings, isAutoReplyOn, msg
}: {
  userId: string;
  user: any;
  settings: any;
  isAutoReplyOn: boolean;
  msg: FetchedEmail;
}) {
  const messageId = msg.messageId;

  // Sprawdź duplikat
  const existing = await prisma.email.findUnique({ where: { messageId } });

  if (existing) {
    const thread = await prisma.thread.findUnique({ where: { id: existing.threadId } });
    const needsRetry =
      thread &&
      thread.status === 'PENDING_APPROVAL' &&
      thread.draftReply &&
      thread.draftReply.startsWith('[BŁĄD AI]');
    if (!needsRetry) return;
  }

  // Heurystyki antyspamowe
  const isBot = /noreply|no-reply|daemon|mailer-daemon/i.test(msg.from);

  // Znalezienie właściwego wątku
  // Szukamy maila o In-Reply-To, żeby dopiąć do tego samego wątku
  let dbThreadId: string | undefined;
  
  if (msg.inReplyTo) {
    const parentEmail = await prisma.email.findUnique({ where: { messageId: msg.inReplyTo }});
    if (parentEmail) {
      dbThreadId = parentEmail.threadId;
    }
  }
  
  if (!dbThreadId && msg.references && msg.references.length > 0) {
    // Szukamy jakiegokolwiek maila z references
    const refEmails = await prisma.email.findMany({ 
      where: { messageId: { in: msg.references } }
    });
    if (refEmails.length > 0) {
      dbThreadId = refEmails[0].threadId;
    }
  }

  let dbThread: any;
  if (!existing) {
    if (!dbThreadId) {
      // Sprawdzamy czy wątek o takim threadId nie został już utworzony (np. w innej równoległej transakcji)
      let existingThread = await prisma.thread.findUnique({ where: { threadId: messageId } });
      
      if (existingThread) {
        dbThread = await prisma.thread.update({
          where: { id: existingThread.id },
          data: { status: isBot ? 'IGNORED' : 'PENDING_APPROVAL', draftReply: null }
        });
      } else {
        // Nowy wątek z zabezpieczeniem przed wyścigiem (Race Condition)
        try {
          dbThread = await prisma.thread.create({
            data: { threadId: messageId, userId, status: isBot ? 'IGNORED' : 'PENDING_APPROVAL' }
          });
        } catch (err: any) {
          if (err.code === 'P2002' || err.code === '23505') {
            const recoveredThread = await prisma.thread.findUnique({ where: { threadId: messageId } });
            if (recoveredThread) {
              dbThread = await prisma.thread.update({
                where: { id: recoveredThread.id },
                data: { status: isBot ? 'IGNORED' : 'PENDING_APPROVAL', draftReply: null }
              });
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      }
    } else {
      // Istniejący wątek
      dbThread = await prisma.thread.update({
        where: { id: dbThreadId },
        data: { status: isBot ? 'IGNORED' : 'PENDING_APPROVAL', draftReply: null }
      });
    }

    try {
      await prisma.email.create({
        data: {
          threadId:   dbThread.id,
          messageId,
          pop3Uid:    msg.pop3Uid,
          from:       msg.from, 
          to:         msg.to, 
          subject:    msg.subject,
          snippet:    msg.text.substring(0, 100),
          body:       msg.text,
          receivedAt: msg.date,
          isFromAgent: false
        }
      });
    } catch (err: any) {
      if (err.code === 'P2002' || err.code === '23505') {
        console.warn(`[Agent AI] Wiadomość o ID ${messageId} już istnieje (wyścig równoległych procesów). Pomijam duplikat.`);
        return; // Przerywamy przetwarzanie tej wiadomości
      }
      throw err;
    }
  } else {
    dbThread = await prisma.thread.findUnique({ where: { id: existing.threadId } });
    if (!existing.pop3Uid && msg.pop3Uid) {
      await prisma.email.update({
        where: { messageId: existing.messageId },
        data: { pop3Uid: msg.pop3Uid }
      }).catch(() => {});
    }
  }

  if (!dbThread) return;

  if (isBot) {
    if (dbThread.status !== 'IGNORED') {
      await prisma.thread.update({ where: { id: dbThread.id }, data: { status: 'IGNORED' } });
    }
    return;
  }

  if (dbThread.status === 'AUTO_REPLIED' || dbThread.status === 'REQUIRES_ATTENTION') return;

  // ── Generuj odpowiedź AI ──────────────────────────────────────────────────
  console.log(`[Agent AI] Generuję odpowiedź AI dla wątku ${dbThread.threadId} (from: ${msg.from})`);

  try {
    const { text } = await generateText({
      model: googleAI('gemini-flash-latest'),
      system: buildSystemPrompt(settings),
      prompt: `Od: ${msg.from}\nTemat: ${msg.subject}\nData: ${msg.date}\n\nTreść:\n${msg.text}`
    });

    const aiText  = text.trim();
    const upper   = aiText.toUpperCase().slice(0, 50);

    if (upper.includes('BOT') || upper.includes('SPAM') || upper.includes('IGNORE')) {
      await prisma.thread.update({ where: { id: dbThread.id }, data: { status: 'IGNORED' } });
      console.log(`[Agent AI] Wykryto bota/spam → IGNORED`);
      return;
    }

    if (upper.includes('REQUIRES_ATTENTION')) {
      await prisma.thread.update({
        where: { id: dbThread.id },
        data: { status: 'REQUIRES_ATTENTION', draftReply: null }
      });
      console.log(`[Agent AI] Wymaga uwagi → REQUIRES_ATTENTION`);
      return;
    }

    const emailsSent   = settings?.emailsSentThisMonth ?? 0;
    const priceId      = user.stripePriceId;
    const PRICE_BASIC  = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    const PRICE_PRO    = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
    
    // Użytkownik musi mieć aktywną subskrypcję, żeby agent odpowiadał
    const hasActiveSub = priceId === PRICE_BASIC || priceId === PRICE_PRO;
    
    const limitExceeded =
      !hasActiveSub || // Jeśli nie ma aktywnej subskrypcji, traktujemy jako przekroczony limit
      (priceId === PRICE_BASIC && emailsSent >= 50) ||
      (priceId === PRICE_PRO   && emailsSent >= 1000);

    // ZABEZPIECZENIE: Jeśli mail jest starszy niż 48 godzin (użytkownik pobrał złą opcją całą historię)
    // AI nie wyśle na niego auto-odpowiedzi. Zostanie stworzony jedynie szkic.
    const messageAgeHours = (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
    const isTooOld = messageAgeHours > 48;

    if (isAutoReplyOn && !limitExceeded && !isTooOld) {
      // ── AUTO-WYŚLIJ ──
      const replyTo = msg.from.replace(/.*<(.+)>.*/, '$1').trim() || msg.from;
      
      const referencesStr = (msg.references ? msg.references.join(' ') + ' ' : '') + messageId;

      await sendReplySMTP(user.email!, settings.appPassword!, replyTo, `Re: ${msg.subject}`, aiText, messageId, referencesStr);

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
          subject:    `Re: ${msg.subject}`,
          snippet:    aiText.substring(0, 150),
          body:       aiText,
          receivedAt: new Date(),
          isFromAgent: true
        }
      });

      console.log(`[Agent AI] ✅ Auto-odpowiedź wysłana → ${replyTo}`);
    } else {
      // ── ZAPISZ SZKIC ──
      let notice = '';
      if (!hasActiveSub) {
        notice = '\n\n[LIMIT]: Brak aktywnej subskrypcji. Szkic zapisany.';
      } else if (limitExceeded) {
        notice = '\n\n[LIMIT]: Miesięczny limit auto-odpowiedzi wyczerpany. Szkic zapisany.';
      } else if (isTooOld) {
        notice = '\n\n[BEZPIECZEŃSTWO]: Wiadomość jest starsza niż 48h. Ze względów bezpieczeństwa utworzono tylko szkic (uniknięcie spamu do starych wątków).';
      }

      await prisma.thread.update({
        where: { id: dbThread.id },
        data:  { draftReply: aiText + notice }
      });

      const why = isTooOld ? 'zbyt stary e-mail' : (!isAutoReplyOn ? 'autoReply=OFF' : 'limit wyczerpany');
      console.log(`[Agent AI] 📝 Szkic zapisany (${why})`);
    }
  } catch (aiErr: any) {
    console.error(`[Agent AI] ❌ Błąd AI:`, aiErr.message ?? aiErr);
    await prisma.thread.update({
      where: { id: dbThread.id },
      data:  { draftReply: `[BŁĄD AI]: ${aiErr.message ?? 'Nieznany błąd'}. Ponowna próba za chwilę.` }
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildSystemPrompt(settings: any): string {
  const tone = settings?.replyTone ?? 'PROFESJONALNY';
  const ctx  = settings?.businessContext ?? 'Firma dbająca o profesjonalną obsługę klienta.';

  const toneInstr =
    tone === 'CASUALOWY'
      ? 'Pisz nieformalnie, mów "Cześć", nie używaj "Szanowny Panie".'
      : tone === 'KROTKI'
      ? 'Odpowiedź maksymalnie 2-3 zdania. Żadnych długich uprzejmości.'
      : 'Pisz profesjonalnie i oficjalnie.';

  return `Jesteś zaawansowanym asystentem AI ds. e-maili pracującym 24/7.
Firma: "${ctx}"
Ton: ${tone} — ${toneInstr}

ZASADY:
1. BARDZO WAŻNE (SPAM): Jeśli wiadomość to jakikolwiek newsletter, reklama, zimny mail (cold mailing), oferta marketingowa, powiadomienie z portalu społecznościowego, automatyczne powiadomienie o logowaniu lub śmieciowa oferta → odpowiedz TYLKO JEDNYM SŁOWEM: SPAM
2. BARDZO WAŻNE (KRYTYCZNE): Jeśli wiadomość jest ściśle ważna, pilna, biznesowo krytyczna, wymaga zwrotu pieniędzy, dotyczy spraw prawnych, jest groźbą, wymaga podjęcia ludzkiej decyzji przez właściciela lub negocjacji kontraktu → odpowiedz TYLKO: REQUIRES_ATTENTION  
3. Dla normalnych, codziennych pytań od klientów lub partnerów biznesowych: napisz odpowiedź w odpowiednim tonie i języku. Podpisz się jako profesjonalny asystent z firmy klienta (na podstawie podanej bazy wiedzy), a nie jako "asystent AI".
4. Nie wymyślaj cenników, jeśli nie masz ich podanych. W przypadku pytań o coś, czego nie wiesz, odpowiedz REQUIRES_ATTENTION.
5. Nie pisz żadnych meta-komentarzy, przywitań typu "Oto odpowiedź". Generuj wyłącznie czystą treść maila do wysłania.`;
}
