import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export const maxDuration = 300;

async function triggerBackgroundSync() {
  const siteUrl = process.env.URL || 'https://meskiai.com';
  const cronSecret = process.env.CRON_SECRET || '';
  
  try {
    // Await the fetch so the request is actually sent before Lambda suspends.
    // Netlify Background Functions return 202 Accepted instantly, so this will NOT time out.
    const res = await fetch(`${siteUrl}/.netlify/functions/sync-background`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cronSecret}` }
    });
    console.log(`[Cron] Background trigger response status: ${res.status}`);
  } catch (err) {
    console.error("Fetch throw:", err);
  }
}

// Returns true if the request is authorized (via CRON_SECRET header, query parameter, or valid user session)
async function isAuthorized(req: Request): Promise<boolean> {
  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get('secret');
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret) {
    if (authHeader === `Bearer ${cronSecret}`) return true;
    if (querySecret === cronSecret) return true;
  }
  
  const session = await getServerSession(authOptions);
  return !!session?.user?.id;
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('[Cron] GET /api/cron/sync — Triggering Netlify Background Function');
  await triggerBackgroundSync();
  return NextResponse.json({ ok: true, trigger: 'forwarded_to_background_get' });
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('[Cron] POST /api/cron/sync — Triggering Netlify Background Function');
  await triggerBackgroundSync();
  return NextResponse.json({ ok: true, trigger: 'forwarded_to_background_post' });
}
