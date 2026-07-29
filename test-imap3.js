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
    logger: false,
    tls: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected!');
    
    console.log('Getting lock...');
    let lock = await client.getMailboxLock('INBOX');
    console.log('Got lock!');
    
    console.log('Testing unseen: true');
    const uids1 = await client.search({ unseen: true }, { uid: true });
    console.log('unseen: true =>', uids1);
    
    lock.release();
  } catch (e) {
    console.error('Conn error:', e.message);
  } finally {
    await client.logout();
  }
}
main();
