import { schedule } from '@netlify/functions';
import https from 'https';

function triggerBackgroundSync(urlStr: string, cronSecret: string): Promise<{ statusCode: number; statusMessage: string }> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const options = {
        method: 'POST',
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
          'Content-Length': '0'
        },
        rejectUnauthorized: false, // Bypass SSL/TLS self-signed check for loopbacks
        timeout: 10000 // 10 seconds strict timeout to prevent scheduler hanging
      };

      const req = https.request(options, (res) => {
        resolve({
          statusCode: res.statusCode || 0,
          statusMessage: res.statusMessage || ''
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout after 10s'));
      });

      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Netlify Scheduled Function — fires every 2 minutes, 24/7.
// The schedule is also declared in netlify.toml [[functions]] block.
export const handler = schedule('*/2 * * * *', async () => {
  const siteUrl = process.env.URL || 'https://meskiai.com';
  const cronSecret = process.env.CRON_SECRET || '';

  console.log(`[Cron] Wyzwalam sync-background @ ${new Date().toISOString()}`);

  try {
    let result;
    try {
      result = await triggerBackgroundSync(`${siteUrl}/.netlify/functions/sync-background`, cronSecret);
    } catch (fetchErr: any) {
      console.warn(`[Cron] ⚠️ Pierwsza próba (siteUrl=${siteUrl}) nieudana: ${fetchErr.message}. Próbuję przez direct netlify.app...`);
      result = await triggerBackgroundSync(`https://meskiai.netlify.app/.netlify/functions/sync-background`, cronSecret);
    }

    if (result.statusCode === 202 || result.statusCode === 200) {
      console.log(`[Cron] ✅ sync-background wyzwolona pomyślnie (${result.statusCode})`);
    } else {
      console.error(`[Cron] ❌ Błąd HTTP: ${result.statusCode} ${result.statusMessage}`);
    }
  } catch (error: any) {
    console.error('[Cron] ❌ Wyjątek krytyczny w harmonogramie:', error?.message ?? error);
  }

  // Always return 200 so Netlify scheduler does not register failure on loopback network issues
  return { statusCode: 200 };
});
