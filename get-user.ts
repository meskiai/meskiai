import { prisma } from './lib/prisma';
import { POST } from './app/api/chat/route';

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found');
    return;
  }
  
  // mock session temporarily in POST? No, we need to modify route.ts
  console.log('USER_ID:', user.id);
}
test();
