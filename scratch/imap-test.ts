import { ImapFlow } from 'imapflow';
import "dotenv/config";

async function main() {
  console.log("Starting IMAP test...");
  
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: 'milekkontaktbiznes@gmail.com',
      // Get password from DB or ENV, actually we don't have it, we'll just try to connect. 
      // If the IP is blocked, it won't even reach authentication, it will hang at socket connection.
      pass: 'dummy-password' 
    },
    logger: true, // ENABLE LOGGING TO SEE TCP SOCKET ACTIVITY
    tls: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully!");
  } catch (err: any) {
    console.error("Connection failed:", err.message);
  } finally {
    try { client.close(); } catch(e) {}
  }
}

main().catch(console.error);
