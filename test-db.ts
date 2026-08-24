import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function get() {
  const user = await prisma.user.findFirst();
  console.log(user?.id);
  prisma.$disconnect();
}
get();
