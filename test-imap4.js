const { ImapFlow } = require('imapflow');

async function main() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: 'miloszmeski15@gmail.com',
      pass: 'vxfwiwfagjupmzlw'
    },
    logger: {
      debug: console.log,
      info: console.log,
      warn: console.warn,
      error: console.error
    },
    tls: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected!');
  } catch (e) {
    console.error('Conn error:', e.message);
  } finally {
    await client.logout();
  }
}
main();
