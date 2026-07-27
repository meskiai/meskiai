import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '../../../../lib/prisma';
import { validateImapCredentialsDetailed } from '../../../../lib/mail';

import { runSync } from '../../../../lib/cron';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const { appPassword } = await req.json();

    if (!appPassword || typeof appPassword !== 'string') {
      return NextResponse.json({ error: 'Hasło aplikacji jest wymagane.' }, { status: 400 });
    }
    
    // Usuń spacje (często ludzie kopiują hasła Google ze spacjami: "abcd efgh ijkl mnop")
    const cleanedPassword = appPassword.replace(/\s+/g, '');

    // Zwaliduj hasło logując się przez IMAP
    const validationResult = await validateImapCredentialsDetailed(session.user.email, cleanedPassword);

    if (!validationResult.isValid) {
      console.error("[IMAP Validation Failed]", validationResult.error);
      const isTimeout = validationResult.error?.includes('Timeout') || validationResult.error?.includes('czas oczekiwania');
      
      if (!isTimeout) {
        return NextResponse.json({ error: `Nie udało się połączyć. Upewnij się, że wpisałeś poprawne hasło oraz włączyłeś POP3 w opcjach Gmail. Szczegóły: ${validationResult.error}` }, { status: 400 });
      }
      
      // If it's a timeout, we log it but continue saving, because Google tarpits bad passwords 
      // (and sometimes good ones) for >10s on Netlify IPs. We don't want to block the UI.
      console.log("Allowing password save despite timeout due to Google tarpitting.");
    }

    // Zapisz do bazy danych (z mechanizmem retry dla Neon DB)
    let saveSuccess = false;
    let lastError = null;
    for (let i = 0; i < 3; i++) {
      try {
        await prisma.userSettings.upsert({
          where: { userId: session.user.id },
          update: { 
            appPassword: cleanedPassword,
            autoReply: true // Automatycznie włącz agenta po podłączeniu
          },
          create: {
            userId: session.user.id,
            appPassword: cleanedPassword,
            autoReply: true,
          }
        });
        saveSuccess = true;
        break;
      } catch (e: any) {
        lastError = e;
        const msg = e?.message || "";
        if (msg.includes('ECONNRESET') || msg.includes('NeonDbError') || msg.includes('fetch failed')) {
          await new Promise(r => setTimeout(r, 1500));
        } else {
          break; // nie ponawiaj jeśli to inny błąd
        }
      }
    }

    if (!saveSuccess) {
      console.error('Prisma upsert failed:', lastError);
      throw lastError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving app password:', error);
    return NextResponse.json({ error: `Wystąpił błąd serwera podczas zapisywania hasła: ${error?.message || String(error)}` }, { status: 500 });
  }
}
