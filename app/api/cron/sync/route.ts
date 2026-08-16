import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export const maxDuration = 300;

import { runSync } from '../../../../lib/cron';

async function triggerBackgroundSync() {
  console.log('[Cron] Rozpoczynam synchronizację bezpośrednio...');
  try {
    await runSync();
    console.log('[Cron] Synchronizacja zakończona.');
  } catch (err) {
    console.error('[Cron] Błąd synchronizacji:', err);
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
