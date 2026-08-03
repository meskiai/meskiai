import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function check() {
  try {
    // Dynamic import to bypass ES6 hoist execution order
    const { prisma } = await import("../lib/prisma");

    const settings = await prisma.userSettings.findFirst({
      include: { user: true }
    });
    console.log("=== USER SETTINGS ===");
    console.log("Email:", settings?.user.email);
    console.log("AutoReply:", settings?.autoReply);
    console.log("OnboardingDone:", settings?.onboardingDone);
    console.log("BusinessContext Length:", settings?.businessContext?.length || 0);
    console.log("CompanyWebsite:", settings?.companyWebsite);
    console.log("EmailsSentThisMonth:", settings?.emailsSentThisMonth);
  } catch (error) {
    console.error(error);
  }
}

check();
