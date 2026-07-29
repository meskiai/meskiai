const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'miloszmeski15@gmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { settings: true }
  });

  if (!user) {
    console.log('No user');
    return;
  }
  
  console.log(`Last sync at: ${user.settings?.lastSyncAt}`);
  
  const emails = await prisma.email.count({
    where: { userId: user.id }
  });
  console.log(`Total emails in DB: ${emails}`);

  await prisma.$disconnect();
}
main();
