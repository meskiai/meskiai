import Pop3Command from 'node-pop3';
import { simpleParser } from 'mailparser';
import "dotenv/config";

async function main() {
  const pop3 = new Pop3Command({
    user: 'milekkontaktbiznes@gmail.com',
    password: process.env.TEST_APP_PASSWORD || 'dummy',
    host: 'pop.gmail.com',
    port: 995,
    tls: true
  });

  try {
    const list = await pop3.UIDL();
    if (list.length > 0) {
      const msgNum = list[0][0];
      // Try using TOP command instead of RETR
      // If node-pop3 exposes TOP, it will exist.
      const rawMsg = await (pop3 as any).TOP(msgNum, 100);
      console.log("TOP command success!");
    }
  } catch (err: any) {
    console.error("Test failed:", err.message);
  } finally {
    try { await pop3.QUIT(); } catch(e) {}
  }
}

main().catch(console.error);
