import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2025-03-31.basil" as any,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: "User or customer not found" }, { status: 404 });
    }

    // Fetch subscriptions for this customer directly from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 10,
    });

    if (subscriptions.data.length > 0) {
      // Find the first active, trialing, or incomplete subscription
      let activeSub = subscriptions.data.find(s => ['active', 'trialing', 'incomplete'].includes(s.status));
      if (!activeSub) activeSub = subscriptions.data[0];

      const priceId = (activeSub as any).items.data[0].price.id;

      const periodEndTs = (activeSub as any).current_period_end || (activeSub as any).items?.data?.[0]?.current_period_end || (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: activeSub.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(periodEndTs * 1000),
          subscriptionStatus: activeSub.status,
        },
      });

      return NextResponse.json({ success: true, status: activeSub.status });
    }

    return NextResponse.json({ success: false, status: "inactive" });
  } catch (error: any) {
    console.error("Stripe Verify Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
