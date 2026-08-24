import { Handler } from '@netlify/functions';
import { runSync } from '../../lib/cron';

export const handler: Handler = async (event, context) => {
  console.log("[Netlify Background] Start background email sync task");
  
  const authHeader = event.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET || '';
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("[Netlify Background] Nieautoryzowane uruchomienie.");
    return;
  }

  try {
    await runSync();
    console.log("[Netlify Background] Zakończono z sukcesem.");
    return {} as any;
  } catch (err: any) {
    console.error("[Netlify Background] Błąd podczas runSync():", err?.message || err);
    return {} as any;
  }
};
