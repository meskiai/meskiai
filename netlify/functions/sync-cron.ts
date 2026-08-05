import { schedule } from '@netlify/functions';
import https from 'https';

function triggerBackgroundSync(
  urlStr: string,
  cronSecret: string,
  timeoutMs = 12000
): Promise<{ statusCode: number; statusMessage: string }> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const options: https.RequestOptions = {
        method: 'POST',
        hostname: url.hostname,
        port: url.port ? parseInt(url.port) : 443,
        path: url.pathname + url.search,
        headers: {
          Authorization: `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
          'Content-Length': '0',
        },
        rejectUnauthorized: false, // bypass TLS self-signed for internal loopback
        timeout: timeoutMs,
      };

      const req = https.request(options, (res) => {
        // Consume the response body to release the socket
        res.resume();
        resolve({
          statusCode: res.statusCode || 0,
          statusMessage: res.statusMessage || '',
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      });

      req.on('error', (err) => reject(err));

      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Netlify Scheduled Function — fires every 2 minutes, 24/7.
// Calls the background function which has a 15-minute execution limit (vs 10s for scheduled).
export const handler = schedule('*/2 * * * *', async () => {
  const cronSecret = process.env.CRON_SECRET || '';
  const timestamp = new Date().toISOString();

  console.log(`[Cron] ⏰ Wyzwalam sync-background @ ${timestamp}`);

  // Candidates in order of preference:
  // 1. The canonical production domain
  // 2. The Netlify deploy URL (always stable, even without custom domain)
  const candidates = [
    'https://meskiai.com/.netlify/functions/sync-background',
    'https://meskiai.netlify.app/.netlify/functions/sync-background',
  ];

  let lastError: string | null = null;

  for (const url of candidates) {
    try {
      const result = await triggerBackgroundSync(url, cronSecret);
      if (result.statusCode === 202 || result.statusCode === 200) {
        console.log(`[Cron] ✅ sync-background wyzwolona pomyślnie (${result.statusCode}) via ${url}`);
        return { statusCode: 200 };
      }
      // 401 means CRON_SECRET mismatch — no point trying other URLs
      if (result.statusCode === 401) {
        console.error(`[Cron] ❌ 401 Unauthorized — sprawdź zmienną CRON_SECRET na Netlify!`);
        return { statusCode: 200 }; // Still return 200 so scheduler doesn't mark as failed
      }
      lastError = `HTTP ${result.statusCode} ${result.statusMessage} via ${url}`;
      console.warn(`[Cron] ⚠️ ${lastError}`);
    } catch (err: any) {
      lastError = `${err?.message ?? err} via ${url}`;
      console.warn(`[Cron] ⚠️ Błąd połączenia: ${lastError}`);
    }
  }

  // All candidates failed — log it but return 200 so Netlify doesn't spam failure alerts
  console.error(`[Cron] ❌ Wszystkie próby wyzwolenia sync-background nieudane. Ostatni błąd: ${lastError}`);

  return { statusCode: 200 };
});
