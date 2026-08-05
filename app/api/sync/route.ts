import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

/**
 * POST /api/sync
 * Triggers the background sync function for all users.
 * Calls sync-background (non-blocking, returns 202 immediately).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const siteUrl = process.env.URL || process.env.NEXTAUTH_URL || 'https://meskiai.com';
    const cronSecret = process.env.CRON_SECRET || '';

    // Fire-and-forget: trigger background function (returns 202 immediately, runs for up to 15 min)
    fetch(`${siteUrl}/.netlify/functions/sync-background`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    }).catch(() => {}); // Ignore errors — it's non-critical

    return NextResponse.json({ message: "Zsynchronizowano pomyślnie" });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas synchronizacji", details: error.message },
      { status: 500 }
    );
  }
}
