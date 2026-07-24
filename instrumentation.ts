import { startCron } from "./lib/cron";

export async function register() {
  // Uruchamiamy tylko w runtime Node.js (nie Edge)
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  console.log('[instrumentation] register() wywołany — startCron()');
  startCron();
}
