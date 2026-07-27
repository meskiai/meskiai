import { startCron } from "./lib/cron";

export async function register() {
  // W środowiskach serverless (Next.js, Vercel, Netlify) uruchamianie setInterval w instrumentation
  // jest anti-patternem, ponieważ włącza się dla każdego workera osobno (np. 3 razy naraz).
  // Spamuje to serwery Google 3x równolegle i powoduje blokadę "Account exceeded command limits".
  // Zamiast tego, należy polegać na zewnętrznym cronie wywołującym `/api/cron/sync` co kilka minut.

  // console.log('[instrumentation] register() wywołany — startCron()');
  // startCron();
}
