import { schedule } from '@netlify/functions';

// Uruchom zadanie co 2 minuty
export const handler = schedule("*/2 * * * *", async (event) => {
  console.log("[Netlify Cron] Zaczynam cykl pobierania maili...");
  const siteUrl = process.env.URL || process.env.NEXTAUTH_URL || 'https://meskiai.com';
  const cronSecret = process.env.CRON_SECRET || '';

  try {
    // Odpytaj API synchronizacji, by odpaliło Background Function
    const res = await fetch(`${siteUrl}/api/cron/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });
    console.log("[Netlify Cron] Wynik wywołania API:", res.status);
  } catch (err: any) {
    console.error("[Netlify Cron] Błąd wywoływania API:", err?.message || err);
  }

  return { statusCode: 200 };
});
