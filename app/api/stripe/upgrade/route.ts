import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2026-06-24.dahlia" as any,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found to upgrade." }, { status: 400 });
    }

    // Retrieve the current subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    if (!subscription || !subscription.items || subscription.items.data.length === 0) {
      return NextResponse.json({ error: "Invalid subscription state." }, { status: 400 });
    }

    const subscriptionItemId = subscription.items.data[0].id;

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: priceId,
      }],
      proration_behavior: 'create_prorations',
    });

    // We can also immediately update the database here, though the webhook will also catch it
    const newPriceId = (updatedSubscription as any).items.data[0].price.id;
    const periodEndTs = (updatedSubscription as any).current_period_end || (updatedSubscription as any).items?.data?.[0]?.current_period_end;
    
    if (periodEndTs) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripePriceId: newPriceId,
          stripeCurrentPeriodEnd: new Date(periodEndTs * 1000),
          subscriptionStatus: updatedSubscription.status,
        }
      });
    }

    return NextResponse.json({ success: true, message: "Subscription upgraded successfully" });
  } catch (error: any) {
    console.error("Stripe Upgrade Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
