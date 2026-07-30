import { runSync } from '../../lib/cron';
import type { Handler, HandlerContext, HandlerEvent } from '@netlify/functions';

// Netlify Background Function — gets up to 15 minutes to complete.
// Regular functions are killed after 10 seconds which is not enough for POP3 + AI.
// The "background" suffix in the function name is recognised by Netlify automatically,
// but we also set isBackground here for explicitness.
export const config = { isBackground: true };

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Auth guard: only allow calls from our own cron or admin
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = event.headers?.authorization || event.headers?.Authorization || '';
    if (auth !== `Bearer ${cronSecret}`) {
      console.warn('[Background] Nieautoryzowane żądanie — pomijam.');
      return { statusCode: 401, body: 'Unauthorized' };
    }
  }

  console.log('[Background] Uruchomiono sync-background — start runSync()...');
  try {
    await runSync();
    console.log('[Background] runSync() zakończony pomyślnie.');
    return { statusCode: 200, body: 'Sync done' };
  } catch (err: any) {
    console.error('[Background] Błąd podczas runSync():', err?.message ?? err);
    return { statusCode: 500, body: err?.message ?? 'Internal error' };
  }
};

export { handler };
