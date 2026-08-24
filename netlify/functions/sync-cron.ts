import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  console.log("[Netlify Cron] Zaczynam cykl pobierania maili...");
  const siteUrl = process.env.URL || process.env.NEXTAUTH_URL || 'https://meskiai.com';
  const baseUrl = siteUrl.replace(/\/$/, '');
  const cronSecret = process.env.CRON_SECRET || '';

  try {
    const res = await fetch(`${baseUrl}/api/cron/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });
    console.log("[Netlify Cron] Wynik wywołania API:", res.status);
  } catch (err: any) {
    console.error("[Netlify Cron] Błąd wywoływania API:", err?.message || err);
  }

  return new Response("OK", { status: 200 });
};

export const config: Config = {
  schedule: "*/15 * * * *"
};
