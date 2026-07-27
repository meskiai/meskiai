import { NextResponse } from 'next/server';
import { runSync } from '../../../../lib/cron';

/**
 * GET — called by Vercel Cron (vercel.json) every 2 minutes.
 *       Also works as a manual trigger.
 *
 * POST — called by Gmail Pub/Sub Push when a new email arrives.
 *        Google sends: { message: { data: base64(JSON), messageId, publishTime }, subscription }
 *        This gives near-instant 24/7 response WITHOUT waiting for the polling interval.
 *
 * Both paths funnel into runSync() which processes all active users.
 */

export const maxDuration = 300; // Vercel: allow up to 5 min for full sync

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');

  // Vercel Cron sends its own CRON_SECRET in the Authorization header
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] GET /api/cron/sync — triggered by Vercel Cron or manual call');
  
  // Wrap in a 25-second timeout to prevent cron-job.org from failing with 30s timeout.
  // The runSync() promise will continue executing in the background up to maxDuration (300s)
  // even after we return the HTTP 200 response to cron-job.org.
  await Promise.race([
    runSync(),
    new Promise(resolve => setTimeout(resolve, 25000))
  ]);

  return NextResponse.json({ ok: true, trigger: 'cron' });
}

export async function POST(req: Request) {
  let trigger = 'manual';

  try {
    const body = await req.json().catch(() => null);

    // Gmail Pub/Sub push notification
    if (body?.message?.data) {
      trigger = 'gmail-pubsub';
      // Decode the Pub/Sub message to log which user/history changed
      try {
        const decoded = JSON.parse(Buffer.from(body.message.data, 'base64').toString('utf-8'));
        console.log('[Cron] Gmail Pub/Sub push received:', JSON.stringify(decoded));
      } catch {
        // Ignore decode errors — we'll run sync regardless
      }
    }
  } catch {
    // No body or not JSON — treat as manual trigger
  }

  console.log(`[Cron] POST /api/cron/sync — trigger: ${trigger}`);
  
  await Promise.race([
    runSync(),
    new Promise(resolve => setTimeout(resolve, 25000))
  ]);

  return NextResponse.json({ ok: true, trigger });
}
