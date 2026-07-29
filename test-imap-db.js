const { PrismaClient } = require('@prisma/client');
const { ImapFlow } = require('imapflow');

const prisma = new PrismaClient();

async function main() {
  const email = 'miloszmeski15@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { settings: true }
  });

  if (!user || !user.settings || !user.settings.appPassword) {
    console.log('No password found for', email);
    return;
  }

  console.log(`Testing password for ${email}: ${user.settings.appPassword}`);

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: email,
      pass: user.settings.appPassword
    },
    logger: true,
    tls: { rejectUnauthorized: false, family: 4 }
  });

  try {
    await client.connect();
    console.log('SUCCESSFULLY CONNECTED AND LOGGED IN!');
    await client.logout();
  } catch (err) {
    console.log('FAILED TO CONNECT/LOGIN:', err.message);
  }
  
  await prisma.$disconnect();
}

main();
