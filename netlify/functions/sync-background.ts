import { Handler } from '@netlify/functions';
import { runSync } from '../../lib/cron';

export const handler: Handler = async (event, context) => {
  console.log("[Netlify Background] Start background email sync task");
  
  // Opcjonalne zabezpieczenie (sprawdzanie secretu), 
  // chociaż w background functions to i tak asynchroniczny event.
  const authHeader = event.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET || '';
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("[Netlify Background] Nieautoryzowane uruchomienie.");
    return;
  }

  try {
    await runSync();
    console.log("[Netlify Background] Zakończono z sukcesem.");
    return {} as any; // Satisfy TypeScript for Handler
  } catch (err: any) {
    console.error("[Netlify Background] Wystąpił błąd podczas runSync():", err?.message || err);
    return {} as any;
  }
};
