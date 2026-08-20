/**
 * worker.ts — Standalone 24/7 AI Agent worker
 *
 * Użycie (lokalne / VPS):
 *   npx ts-node worker.ts
 *   -- lub --
 *   node worker.js   (po skompilowaniu)
 *
 * Na Vercel ten plik nie jest potrzebny — Vercel Cron wywołuje /api/cron/sync automatycznie.
 */

import { startCron } from './lib/cron';

const WATCH_RENEWAL_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000; // 6 days

console.log('🤖 [Agent AI Worker] Uruchamianie standalone workera...');
console.log('   Emails będą sprawdzane co 2 minuty 24/7.');
console.log('   Naciśnij Ctrl+C aby zatrzymać.\n');

// Start the polling loop (uses the same logic as instrumentation.ts)
startCron();

// Keep process alive
setInterval(() => {}, 1_000 * 60 * 60);
