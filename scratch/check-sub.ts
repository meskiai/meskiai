import { prisma } from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, stripePriceId: true, stripeSubscriptionId: true }
  });
  console.log(users);
}

main().finally(() => prisma.$disconnect());
