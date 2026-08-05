import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import https from 'https';

export const maxDuration = 300;

function triggerBackgroundHttps(urlStr: string, cronSecret: string): Promise<{ statusCode: number }> {
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
        rejectUnauthorized: false, // Bypass SSL cert warnings on loopback
        timeout: 15000 // 15 seconds timeout
      };

      const req = https.request(options, (res) => {
        resolve({ statusCode: res.statusCode || 0 });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function triggerBackgroundSync() {
  const siteUrl = process.env.URL || 'https://meskiai.com';
  const cronSecret = process.env.CRON_SECRET || '';
  
  try {
    let res;
    try {
      res = await triggerBackgroundHttps(`${siteUrl}/.netlify/functions/sync-background`, cronSecret);
    } catch (err: any) {
      console.warn(`[Cron Route] First trigger failed: ${err.message}. Trying direct netlify.app fallback...`);
      res = await triggerBackgroundHttps(`https://meskiai.netlify.app/.netlify/functions/sync-background`, cronSecret);
    }
    console.log(`[Cron Route] Background trigger response status: ${res.statusCode}`);
  } catch (err) {
    console.error("[Cron Route] All background trigger attempts failed:", err);
  }
}

// Returns true if the request is authorized (via CRON_SECRET header, query param, or active user session)
async function isAuthorized(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // 1. Bearer Header authorization
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  // 2. Query param (?secret=...) authorization (useful for cron-job.org)
  const url = new URL(req.url);
  const secretParam = url.searchParams.get('secret');
  if (cronSecret && secretParam === cronSecret) return true;

  // 3. User session authorization
  const session = await getServerSession(authOptions);
  return !!session?.user?.id;
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('[Cron Route] GET /api/cron/sync — Triggering Netlify Background Function');
  await triggerBackgroundSync();
  return NextResponse.json({ ok: true, trigger: 'forwarded_to_background_get' });
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('[Cron Route] POST /api/cron/sync — Triggering Netlify Background Function');
  await triggerBackgroundSync();
  return NextResponse.json({ ok: true, trigger: 'forwarded_to_background_post' });
}
