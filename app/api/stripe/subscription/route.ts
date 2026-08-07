import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2025-03-31.basil" as any,
});

// GET: fetch subscription details including payment method card info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ card: null, cancelAtPeriodEnd: false });
    }

    let card = null;
    let cancelAtPeriodEnd = false;

    // Fetch card info from Stripe
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
        limit: 1,
      });

      if (paymentMethods.data.length > 0) {
        const pm = paymentMethods.data[0];
        card = {
          brand: pm.card?.brand || "unknown",
          last4: pm.card?.last4 || "****",
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
        };
      }
    } catch (e) {
      console.error("Error fetching payment methods:", e);
    }

    // Fetch subscription cancel status
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        cancelAtPeriodEnd = subscription.cancel_at_period_end;
      } catch (e) {
        console.error("Error fetching subscription:", e);
      }
    }

    return NextResponse.json({ card, cancelAtPeriodEnd });
  } catch (error: any) {
    console.error("Subscription GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: cancel subscription at period end
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Cancel at period end (user keeps access until the paid period ends)
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: user.stripeCurrentPeriodEnd,
    });
  } catch (error: any) {
    console.error("Subscription DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
