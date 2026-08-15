import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2023-10-16" as any,
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

    
    const origin = req.headers.get('origin') || 'https://meskiai.com';
    
    let subscription;
    let requirePayment = true;

    if (oldSubscriptionId) {
      // Upgrade logic (Proration)
      const oldSub = await stripe.subscriptions.retrieve(oldSubscriptionId);
      const oldItemId = oldSub.items.data[0].id;
      
      subscription = await stripe.subscriptions.update(oldSubscriptionId, {
        items: [
          {
            id: oldItemId,
            price: priceId,
          }
        ],
        payment_behavior: 'pending_if_incomplete',
        proration_behavior: 'create_prorations',
        expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
        metadata
      });
    } else {
      // New subscription logic
      subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
        metadata,
      });
    }

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent as any;
    const setupIntent = subscription.pending_setup_intent as any;

    let clientSecret = null;
    
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      requirePayment = false;
    } else if (paymentIntent && paymentIntent.client_secret) {
      clientSecret = paymentIntent.client_secret;
    } else if (setupIntent && setupIntent.client_secret) {
      clientSecret = setupIntent.client_secret;
    } else if (!invoice || invoice.total === 0 || invoice.amount_due === 0) {
      // Free or prorated to 0
      requirePayment = false;
    }

    if (requirePayment && !clientSecret) {
      console.error('DEBUG: Missing client_secret.');
      throw new Error('Nie udało się zainicjować intencji płatności.');
    }

    return NextResponse.json({ 
      clientSecret,
      subscriptionId: subscription.id,
      requirePayment
    });

  } catch (error: any) {
    console.error("Stripe Subscription Creation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
