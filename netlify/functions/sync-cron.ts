import { schedule } from '@netlify/functions';

export const handler = schedule('*/2 * * * *', async (event) => {
  console.log('[Netlify Cron] Budzenie endpointu /api/cron/sync...');
  
  // Pobiera główny adres strony z Netlify, e.g. "https://meskiai.com"
  const siteUrl = process.env.URL || 'https://meskiai.com';
  const cronSecret = process.env.CRON_SECRET || '';
  
  try {
    const response = await fetch(`${siteUrl}/api/cron/sync`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`
      }
    });
    
    if (!response.ok) {
      console.error(`[Netlify Cron] Błąd HTTP: ${response.status} ${response.statusText}`);
      return { statusCode: response.status };
    }
    
    console.log('[Netlify Cron] Sukces! Sprawdzono maile.');
    return { statusCode: 200 };
  } catch (error) {
    console.error('[Netlify Cron] Wyjątek podczas łączenia z API:', error);
    return { statusCode: 500 };
  }
});
