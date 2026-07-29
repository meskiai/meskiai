import Pop3Command from 'node-pop3';
import "dotenv/config";

async function main() {
  console.log("Starting POP3 test...");
  
  const pop3 = new Pop3Command({
    user: 'milekkontaktbiznes@gmail.com',
    password: 'dummy-password', // doesn't matter, we just want to see if it connects
    host: 'pop.gmail.com',
    port: 995,
    tls: true
  });

  try {
    const list = await pop3.UIDL();
    console.log("Connected successfully! UIDL:", list);
  } catch (err: any) {
    console.error("Connection failed:", err.message);
  } finally {
    try { await pop3.QUIT(); } catch(e) {}
  }
}

main().catch(console.error);
