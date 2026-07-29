const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log("No user found");
  
  try {
    const dataToUpdate = { businessContext: "Test test test test test test test test test test test test test test test test test test test test test test test test" };
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: dataToUpdate,
      create: { 
        userId: user.id, 
        businessContext: dataToUpdate.businessContext,
        replyTone: "PROFESJONALNY"
      }
    });
    console.log("Success:", settings.businessContext);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
