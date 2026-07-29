import { PrismaClient } from '@prisma/client';
import { ImapFlow } from 'imapflow';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { settings: true } });
  
  for (const user of users) {
    if (user.settings?.appPassword) {
      console.log(`Testing IMAP for ${user.email}...`);
      
      const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
          user: user.email,
          pass: user.settings.appPassword
        },
        logger: false,
        tls: { rejectUnauthorized: false }
      });
      
      try {
        await client.connect();
        console.log(`✅ SUCCESS: Connected to IMAP for ${user.email}`);
        
        const lock = await client.getMailboxLock('INBOX');
        try {
          const status = await client.status('INBOX', { messages: true, unseen: true });
          console.log(`INBOX for ${user.email}: Total ${status.messages}, Unseen ${status.unseen}`);
        } finally {
          lock.release();
        }
        
        client.close();
      } catch (err) {
        console.error(`❌ FAILED: IMAP Error for ${user.email}:`, err.message);
      }
    } else {
      console.log(`No app password for ${user.email}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
