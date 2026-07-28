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
      const isRetryable = msg.includes('ECONNRESET') || msg.includes('fetch failed') || msg.includes('NeonDbError');
      if (isRetryable && i < retries - 1) {
        console.log(`[Agent AI] Baza danych — ponowna próba ${i + 1}/${retries - 1} za ${delayMs * (i + 1)}ms...`);
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Wyczerpano próby połączenia z bazą danych.');
}

// ─── Guard ─────────────────────────────────────────────────────────────────────
const g = global as any;

export async function runSync() {
  const now = Date.now();
  // Jeśli poprzedni cykl jeszcze trwa (mniej niż 14 minut temu), pomijamy
  if (g.__aiRunning && (now - g.__aiRunning < 14 * 60 * 1000)) {
    console.log('[Agent AI] Poprzedni cykl jeszcze trwa — pomijam.');
    return;
  }
  g.__aiRunning = now;

  try {
    // Pobierz TYLKO użytkowników którzy mają:
    // 1. Email
    // 2. Aktywną subskrypcję
    // 3. Hasło aplikacji
    // 4. Włączone auto-reply
    const users = await withRetry(() => prisma.user.findMany({
      where: {
        email: { not: null },
        subscriptionStatus: { in: ['active', 'trialing'] },
        settings: {
          appPassword: { not: null },
          autoReply: true
        }
      },
      include: { settings: true }
    }));

    if (users.length === 0) {
      console.log('[Agent AI] Brak aktywnych użytkowników do obsługi.');
      return;
    }

    // Reset miesięcznego licznika jeśli mamy nowy miesiąc
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    for (const user of users) {
      const s = user.settings;
      if (!s) continue;
      const lastReset = s.lastMonthlyReset ? new Date(s.lastMonthlyReset) : null;
      const needsReset = !lastReset || 
        lastReset.getMonth() !== currentMonth || 
        lastReset.getFullYear() !== currentYear;
      if (needsReset && (s.emailsSentThisMonth ?? 0) > 0) {
        await prisma.userSettings.update({
          where: { userId: user.id },
          data: { emailsSentThisMonth: 0, lastMonthlyReset: new Date() }
        }).catch(() => {});
        user.settings!.emailsSentThisMonth = 0;
        console.log(`[Agent AI] Reset licznika miesięcznego dla ${user.email}`);
      }
    }

    // Losowe tasowanie żeby wszyscy mieli równą szansę na obsługę
    users.sort(() => Math.random() - 0.5);

    console.log(`[Agent AI] Sprawdzam ${users.length} aktywnych użytkowników...`);

    // Przetwarzaj po 3 naraz
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

// ─── Przetwarzanie jednego użytkownika ─────────────────────────────────────────
async function processUser(user: any) {
  const userId = user.id;
  const settings = user.settings;

  if (!settings?.appPassword) {
    console.log(`[Agent AI] ${user.email}: brak hasła aplikacji — pomijam.`);
    return;
  }

  // Sprawdź limit miesięczny
  const priceId = user.stripePriceId;
  const PRICE_MAX = process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX;
  const PRICE_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  const emailsSent = settings.emailsSentThisMonth ?? 0;

  let monthlyLimit = 50; // Basic (default)
  if (priceId === PRICE_MAX) monthlyLimit = 5000;
  else if (priceId === PRICE_PRO) monthlyLimit = 1000;

  if (emailsSent >= monthlyLimit) {
    console.log(`[Agent AI] ${user.email}: limit miesięczny ${emailsSent}/${monthlyLimit} wyczerpany — pomijam.`);
    return;
  }

  // Pobierz znane UID z bazy (żeby nie pobierać tych samych maili ponownie)
  let knownUids: string[] = [];
  try {
    const existingEmails = await prisma.email.findMany({
      where: { thread: { userId }, pop3Uid: { not: null } },
      select: { pop3Uid: true }
    });
    knownUids = existingEmails.map(e => e.pop3Uid as string);
  } catch (err: any) {
    console.error(`[Agent AI] ${user.email}: błąd pobierania znanych UID:`, err?.message);
  }

  // Pobierz nowe maile przez POP3
  let messages: FetchedEmail[] = [];
  try {
    messages = await fetchUnreadEmailsPOP3(user.email!, settings.appPassword!, knownUids);
  } catch (err: any) {
    console.warn(`[Agent AI] ${user.email}: błąd POP3 — ${err.message}`);
    return;
  }

  // Zaktualizuj czas ostatniego sprawdzenia
  await prisma.userSettings.update({
    where: { userId },
    data: { lastAgentRunAt: new Date() }
  }).catch(() => {});

  if (messages.length === 0) {
    console.log(`[Agent AI] ${user.email}: brak nowych wiadomości.`);
    return;
  }

  console.log(`[Agent AI] ${user.email}: ${messages.length} nowych wiadomości.`);

  let processed = 0;
  for (const msg of messages) {
    // Sprawdź czy nie przekroczono limitu w trakcie przetwarzania
    const freshSettings = await prisma.userSettings.findUnique({ where: { userId } }).catch(() => null);
    const currentSent = freshSettings?.emailsSentThisMonth ?? emailsSent + processed;
    if (currentSent >= monthlyLimit) {
      console.log(`[Agent AI] ${user.email}: osiągnięto limit w trakcie przetwarzania — zatrzymuję.`);
      break;
    }

    await processMessage({ userId, user, settings, msg })
      .catch(err => console.error(`[Agent AI] Błąd wiadomości ${msg.messageId}:`, err?.message ?? err));
    processed++;
  }

  if (processed > 0) {
    await prisma.userSettings.update({
      where: { userId },
      data: { agentEmailsProcessed: { increment: processed } }
    }).catch(() => {});
  }
}

// ─── Przetwarzanie jednej wiadomości ──────────────────────────────────────────
async function processMessage({
  userId, user, settings, msg
}: {
  userId: string;
  user: any;
  settings: any;
  msg: FetchedEmail;
}) {
  const messageId = msg.messageId;

  // Stare maile (>48h) → zapisz do bazy żeby zapamiętać UID, ale nie odpowiadaj
  const messageAgeHours = (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
  const isTooOld = messageAgeHours > 48;

  // Sprawdź duplikat
  const existing = await prisma.email.findUnique({ where: { messageId } });
  if (existing) {
    const thread = await prisma.thread.findUnique({ where: { id: existing.threadId } });
    // Ponów tylko jeśli poprzednia próba AI zakończyła się błędem
    const needsRetry = thread?.status === 'PENDING_APPROVAL' && 
                       thread?.draftReply?.startsWith('[BŁĄD AI]');
    if (!needsRetry) {
      // Zaktualizuj UID jeśli brakowało
      if (!existing.pop3Uid && msg.pop3Uid) {
        await prisma.email.update({
          where: { messageId },
          data: { pop3Uid: msg.pop3Uid }
        }).catch(() => {});
      }
      return;
    }
  }

  // Heurystyki antyspamowe
  const fromLower = msg.from.toLowerCase();
  const isBot = /noreply|no-reply|daemon|mailer-daemon|@bounce|@notifications|@noreply/i.test(fromLower);

  // Znajdź lub utwórz wątek
  let dbThread: any;

  if (isTooOld) {
    // Stare maile → jeden zbiorczy wątek HISTORY (nie zajmuje miejsca w panelu)
    let historyThread = await prisma.thread.findUnique({
      where: { threadId: `HISTORY_${userId}` }
    });
    if (!historyThread) {
      historyThread = await prisma.thread.create({
        data: { threadId: `HISTORY_${userId}`, userId, status: 'IGNORED' }
      }).catch(async () =>
        await prisma.thread.findUnique({ where: { threadId: `HISTORY_${userId}` } }) as any
      );
    }
    if (!historyThread) return;
    dbThread = historyThread;
  } else {
    // Nowe maile → znajdź istniejący wątek lub utwórz nowy
    let dbThreadId: string | undefined;

    // Szukaj po In-Reply-To
    if (msg.inReplyTo) {
      const parent = await prisma.email.findUnique({ where: { messageId: msg.inReplyTo } });
      if (parent) dbThreadId = parent.threadId;
    }

    // Szukaj po References
    if (!dbThreadId && msg.references?.length) {
      const refs = await prisma.email.findMany({
        where: { messageId: { in: msg.references } },
        select: { threadId: true }
      });
      if (refs.length > 0) dbThreadId = refs[0].threadId;
    }

    if (dbThreadId) {
      dbThread = await prisma.thread.update({
        where: { id: dbThreadId },
        data: { status: isBot ? 'IGNORED' : 'PENDING_APPROVAL', draftReply: null }
      });
    } else {
      // Nowy wątek
      try {
        dbThread = await prisma.thread.create({
          data: {
            threadId: messageId,
            userId,
            status: isBot ? 'IGNORED' : 'PENDING_APPROVAL'
          }
        });
      } catch (err: any) {
        if (err.code === 'P2002' || err.code === '23505') {
          const recovered = await prisma.thread.findUnique({ where: { threadId: messageId } });
          if (!recovered) return;
          dbThread = await prisma.thread.update({
            where: { id: recovered.id },
            data: { status: isBot ? 'IGNORED' : 'PENDING_APPROVAL', draftReply: null }
          });
        } else throw err;
      }
    }
  }

  if (!dbThread) return;

  // Zapisz email w bazie
  if (!existing) {
    try {
      await prisma.email.create({
        data: {
          threadId:    dbThread.id,
          messageId,
          pop3Uid:     msg.pop3Uid,
          from:        msg.from,
          to:          msg.to,
          subject:     msg.subject,
          snippet:     msg.text.substring(0, 100),
          body:        msg.text,
          receivedAt:  msg.date,
          isFromAgent: false
        }
      });
    } catch (err: any) {
      if (err.code === 'P2002' || err.code === '23505') {
        console.warn(`[Agent AI] Duplikat wiadomości ${messageId} — pomijam.`);
        return;
      }
      throw err;
    }
  }

  // Stare maile i boty → koniec (UID zapisany, nie będziemy ich pobierać ponownie)
  if (isTooOld || isBot) {
    if (dbThread.status !== 'IGNORED') {
      await prisma.thread.update({ where: { id: dbThread.id }, data: { status: 'IGNORED' } });
    }
    return;
  }

  // Wątek już obsłużony → pomijamy
  if (dbThread.status === 'AUTO_REPLIED' || dbThread.status === 'REQUIRES_ATTENTION') return;

  // ── Generuj odpowiedź AI ────────────────────────────────────────────────────
  console.log(`[Agent AI] Generuję odpowiedź AI dla: ${msg.subject} (od: ${msg.from})`);

  try {
    const { text } = await generateText({
      model: googleAI('gemini-flash-latest'),
      system: buildSystemPrompt(settings),
      prompt: `Od: ${msg.from}\nTemat: ${msg.subject}\nData: ${msg.date}\n\nTreść:\n${msg.text.substring(0, 3000)}`
    });

    const aiText = text.trim();
    const upper = aiText.toUpperCase().slice(0, 60);

    // AI zdecydowała że to spam lub bot
    if (upper.includes('SPAM') || upper.includes('BOT') || upper.includes('IGNORE')) {
      await prisma.thread.update({ where: { id: dbThread.id }, data: { status: 'IGNORED' } });
      console.log(`[Agent AI] 🗑️ AI: spam/bot → IGNORED`);
      return;
    }

    // AI zdecydowała że wymaga ludzkiej uwagi
    if (upper.includes('REQUIRES_ATTENTION')) {
      await prisma.thread.update({
        where: { id: dbThread.id },
        data: { status: 'REQUIRES_ATTENTION', draftReply: null }
      });
      console.log(`[Agent AI] ⚠️ AI: wymaga uwagi → REQUIRES_ATTENTION`);
      return;
    }

    // ── Wyślij auto-odpowiedź ──────────────────────────────────────────────────
    const replyTo = msg.from.replace(/.*<(.+)>.*/, '$1').trim() || msg.from;
    const referencesStr = (msg.references ? msg.references.join(' ') + ' ' : '') + messageId;

    await sendReplySMTP(
      user.email!,
      settings.appPassword!,
      replyTo,
      `Re: ${msg.subject}`,
      aiText,
      messageId,
      referencesStr
    );

    // Zaktualizuj wątek i licznik
    await prisma.thread.update({
      where: { id: dbThread.id },
      data: { status: 'AUTO_REPLIED', draftReply: null }
    });

    await prisma.userSettings.update({
      where: { userId },
      data: { emailsSentThisMonth: { increment: 1 } }
    });

    // Zapisz wysłaną odpowiedź
    await prisma.email.create({
      data: {
        threadId:    dbThread.id,
        messageId:   `sent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        from:        user.email ?? 'Agent AI',
        to:          replyTo,
        subject:     `Re: ${msg.subject}`,
        snippet:     aiText.substring(0, 150),
        body:        aiText,
        receivedAt:  new Date(),
        isFromAgent: true
      }
    });

    console.log(`[Agent AI] ✅ Wysłano odpowiedź → ${replyTo} (temat: ${msg.subject})`);

  } catch (aiErr: any) {
    console.error(`[Agent AI] ❌ Błąd AI/SMTP:`, aiErr?.message ?? aiErr);
    await prisma.thread.update({
      where: { id: dbThread.id },
      data: { draftReply: `[BŁĄD AI]: ${aiErr?.message ?? 'Nieznany błąd'}. Ponowna próba za chwilę.` }
    }).catch(() => {});
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

ZASADY (przestrzegaj ściśle):
1. SPAM: Jeśli wiadomość to newsletter, reklama, cold mailing, oferta marketingowa, powiadomienie z portalu, automatyczne powiadomienie systemowe → odpowiedz TYLKO jednym słowem: SPAM
2. KRYTYCZNE: Jeśli wiadomość jest pilna biznesowo, dotyczy zwrotów pieniędzy, spraw prawnych, gróźb, wymaga decyzji właściciela, negocjacji kontraktu → odpowiedz TYLKO: REQUIRES_ATTENTION
3. Normalne zapytania od klientów/partnerów: napisz pełną odpowiedź w odpowiednim języku i tonie. Podpisz się jako asystent firmy (bez słowa "AI"). 
4. Nie wymyślaj cenników, dat, faktów — jeśli nie wiesz, napisz REQUIRES_ATTENTION.
5. Generuj WYŁĄCZNIE czystą treść maila. Zero meta-komentarzy, zero "Oto odpowiedź:".`;
}
