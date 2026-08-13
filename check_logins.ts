import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      name: true,
      email: true,
      createdAt: true,
    }
  });

  const sessions = await prisma.session.findMany({
    orderBy: { expires: 'desc' },
    take: 5,
    include: {
      user: { select: { email: true, name: true } }
    }
  });

  console.log('--- RECENT USERS ---');
  console.log(JSON.stringify(users, null, 2));

  console.log('--- RECENT SESSIONS ---');
  console.log(JSON.stringify(sessions, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
