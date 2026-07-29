const { ImapFlow } = require('imapflow');

async function main() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: 'miloszmeskisim@gmail.com',
      pass: 'vxfwiwfagjupmzlw'
    },
    logger: false,
    tls: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    let lock = await client.getMailboxLock('INBOX');
    try {
      console.log('Testing unseen: true');
      const uids1 = await client.search({ unseen: true }, { uid: true });
      console.log('unseen: true =>', uids1);
    } catch(e) { console.error('unseen error:', e.message); }
    
    try {
      console.log('Testing seen: false');
      const uids2 = await client.search({ seen: false }, { uid: true });
      console.log('seen: false =>', uids2);
    } catch(e) { console.error('seen: false error:', e.message); }
    lock.release();
  } catch (e) {
    console.error('Conn error', e.message);
  } finally {
    await client.logout();
  }
}
main();
