import { schedule } from '@netlify/functions';

// Netlify Scheduled Function — fires every 2 minutes, 24/7, without any user being logged in.
// This is the ONLY entry point that wakes up the AI agent.
// The schedule is also declared in netlify.toml [[functions]] block (required for Netlify to recognise it).
export const handler = schedule('*/2 * * * *', async () => {
  const siteUrl = process.env.URL || 'https://meskiai.com';
  const cronSecret = process.env.CRON_SECRET || '';

  console.log(`[Cron] Wyzwalam sync-background @ ${new Date().toISOString()}`);

  try {
    // Call sync-background directly (background function — returns 202 immediately,
    // then continues running in the background for up to 15 minutes)
    const response = await fetch(`${siteUrl}/.netlify/functions/sync-background`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    // Background functions return 202 Accepted — that is the success response
    if (response.status === 202 || response.ok) {
      console.log(`[Cron] ✅ sync-background wyzwolona (${response.status})`);
      return { statusCode: 200 };
    } else {
      console.error(`[Cron] ❌ Błąd HTTP: ${response.status} ${response.statusText}`);
      return { statusCode: response.status };
    }
  } catch (error: any) {
    console.error('[Cron] ❌ Wyjątek:', error?.message ?? error);
    return { statusCode: 500 };
  }
});
