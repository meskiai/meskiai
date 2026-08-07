import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2025-03-31.basil" as any,
});

import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId: rawPriceId } = await req.json();
    let priceId = rawPriceId?.trim();
    
    // Map tier strings to actual Stripe Price IDs
    if (priceId === 'basic') priceId = PRICE_BASIC;
    if (priceId === 'pro') priceId = PRICE_PRO;
    if (priceId === 'max') priceId = PRICE_MAX;

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
      if (pid === PRICE_MAX || pid === 'max') return 3;
      if (pid === PRICE_PRO || pid === 'pro') return 2;
      if (pid === PRICE_BASIC || pid === 'basic') return 1;
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

    const origin = req.headers.get("origin") || "https://meskiai.com";
    
    // Zamiast checkoutSession, tworzymy Subskrypcję bezpośrednio dla Stripe Elements
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new Error("Nie udało się zainicjować intencji płatności.");
    }

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id
    });
  } catch (error: any) {
    console.error("Stripe Subscription Creation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
