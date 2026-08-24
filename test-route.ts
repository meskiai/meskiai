import { POST } from './app/api/chat/route';

async function test() {
  const req = new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
  });

  try {
    const res = await POST(req);
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Crash:', err);
  }
}

test();
