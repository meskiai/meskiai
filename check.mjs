import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const threads = await prisma.thread.findMany({ orderBy: { updatedAt: 'desc' } });
  const statuses = threads.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  console.log('Total threads:', threads.length);
  console.log('Statuses:', statuses);
}
main().finally(() => prisma.$disconnect());
