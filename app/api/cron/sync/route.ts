import { NextResponse } from 'next/server';

export const maxDuration = 300;

async function triggerBackgroundSync() {
  const siteUrl = process.env.URL || 'https://meskiai.com';
  const cronSecret = process.env.CRON_SECRET || '';
  
  try {
    // Non-blocking trigger to background function
    fetch(`${siteUrl}/.netlify/functions/sync-background`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cronSecret}` }
    }).catch((e) => console.error("Background trigger failed:", e));
  } catch (err) {
    console.error("Fetch throw:", err);
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] GET /api/cron/sync — Triggering Netlify Background Function');
  await triggerBackgroundSync();
  return NextResponse.json({ ok: true, trigger: 'forwarded_to_background_get' });
}

export async function POST(req: Request) {
  console.log('[Cron] POST /api/cron/sync — Triggering Netlify Background Function');
  await triggerBackgroundSync();
  return NextResponse.json({ ok: true, trigger: 'forwarded_to_background_post' });
}
