import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

async function main() {
  await client.connect();

  console.log('--- RECENT USERS ---');
  const res = await client.query('SELECT name, email, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 5');
  console.log(JSON.stringify(res.rows, null, 2));

  console.log('--- RECENT SESSIONS ---');
  const res2 = await client.query('SELECT "userId", expires, "sessionToken" FROM "Session" ORDER BY expires DESC LIMIT 5');
  console.log(JSON.stringify(res2.rows, null, 2));

  await client.end();
}

main().catch(console.error);
