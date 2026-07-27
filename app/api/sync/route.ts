import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { runSync } from "../../../lib/cron";

export const dynamic = 'force-dynamic';

/**
 * POST /api/sync
 * Triggers a full IMAP sync for the current user's account.
 * Previously used Gmail API — now delegates to cron.ts (IMAP/SMTP).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // runSync() processes ALL users with appPassword set.
    // It reads from IMAP and saves threads/emails to DB.
    await runSync();
    return NextResponse.json({ message: "Zsynchronizowano pomyślnie" });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas synchronizacji", details: error.message },
      { status: 500 }
    );
  }
}
