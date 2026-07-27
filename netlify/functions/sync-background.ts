import { runSync } from '../../lib/cron';
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  console.log('[Background] Uruchomiono sync-background...');
  try {
    // Odpalamy dokładnie tę samą logikę, która była w /api/cron/sync
    await runSync();
    console.log('[Background] Sukces sync-background - maile pobrane!');
    return { statusCode: 200, body: 'Sync done' };
  } catch (err: any) {
    console.error('[Background] Blad podczas sync-background:', err.message);
    return { statusCode: 500, body: err.message };
  }
};
