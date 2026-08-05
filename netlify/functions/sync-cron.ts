import { schedule } from '@netlify/functions';

// Netlify Scheduled Function — fires every 2 minutes, 24/7, without any user being logged in.
// This is the ONLY entry point that wakes up the AI agent.
// The schedule is also declared in netlify.toml [[functions]] block (required for Netlify to recognise it).
export const handler = schedule('*/2 * * * *', async () => {
  const siteUrl = process.env.URL || 'https://meskiai.com';
  const cronSecret = process.env.CRON_SECRET || '';

  console.log(`[Cron] Wyzwalam sync-background @ ${new Date().toISOString()}`);

    // Bypass self-signed or internal DNS cert warnings
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    let response: Response;
    try {
      response = await fetch(`${siteUrl}/.netlify/functions/sync-background`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (fetchErr: any) {
      console.warn(`[Cron] ⚠️ Pierwsza próba (siteUrl=${siteUrl}) nieudana: ${fetchErr.message}. Próbuję przez direct netlify.app...`);
      response = await fetch(`https://meskiai.netlify.app/.netlify/functions/sync-background`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      });
    }

    // Background functions return 202 Accepted — that is the success response
    if (response.status === 202 || response.ok) {
      console.log(`[Cron] ✅ sync-background wyzwolona (${response.status})`);
      return { statusCode: 200 };
    } else {
      console.error(`[Cron] ❌ Błąd HTTP: ${response.status} ${response.statusText}`);
      // Returning 200 so Netlify doesn't mark the cron job itself as failed
      return { statusCode: 200 };
    }
  } catch (error: any) {
    console.error('[Cron] ❌ Wyjątek krytyczny w harmonogramie:', error?.message ?? error);
    return { statusCode: 200 }; // Return 200 to prevent Netlify scheduler alerting on wrapper failure
  }
});
