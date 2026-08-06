import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2026-06-24.dahlia" as any,
});

import { prisma } from "../../../../lib/prisma";

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    function getTier(pid: string | null) {
      if (pid === process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX) return 3;
      if (pid === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return 2;
      if (pid === process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC) return 1;
      return 0;
    }

    const currentPriceId = user.stripePriceId;
    const currentStatus = user.subscriptionStatus;
    const isCurrentActive = ["active", "trialing"].includes(currentStatus || "");

    if (isCurrentActive && currentPriceId) {
      const currentTier = getTier(currentPriceId);
      const targetTier = getTier(priceId);

      if (currentTier === targetTier) {
        return NextResponse.json(
          { error: "Masz już ten plan. Wybierz wyższy pakiet, aby dokonać ulepszenia." },
          { status: 400 }
        );
      }

      if (targetTier < currentTier) {
        return NextResponse.json(
          { error: "Przejście na niższy pakiet (downgrade) nie jest dostępne bezpośrednio. Zarządzaj swoimi płatnościami w portalu Stripe." },
          { status: 400 }
        );
      }
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // If user already has an active subscription, we'll cancel it after the new checkout completes
    const oldSubscriptionId =
      user.stripeSubscriptionId &&
      ["active", "trialing"].includes(user.subscriptionStatus || "")
        ? user.stripeSubscriptionId
        : null;

    const metadata: Record<string, string> = { userId: user.id };
    if (oldSubscriptionId) {
      metadata.oldSubscriptionId = oldSubscriptionId;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/#cennik`,
      metadata,
      // Prevent duplicate subscriptions from Stripe's side
      subscription_data: {
        metadata,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
