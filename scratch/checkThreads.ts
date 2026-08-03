import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkThreads() {
  try {
    const { prisma } = await import("../lib/prisma");

    const threads = await prisma.thread.findMany({
      include: {
        emails: {
          orderBy: { receivedAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    console.log("=== THREADS AND EMAILS ===");
    for (const t of threads) {
      console.log(`Thread ID: ${t.id} | Status: ${t.status}`);
      console.log(`Draft Reply: ${t.draftReply ? t.draftReply.substring(0, 100) + "..." : "none"}`);
      for (const e of t.emails) {
        console.log(`  - From: ${e.from} | To: ${e.to} | Subject: ${e.subject} | Date: ${e.receivedAt.toISOString()} | IsFromAgent: ${e.isFromAgent}`);
      }
      console.log("-----------------------------------------");
    }
  } catch (error) {
    console.error(error);
  }
}

checkThreads();
