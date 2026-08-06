import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2023-10-16" as any,
});

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

    const oldSubscriptionId =
      user.stripeSubscriptionId && isCurrentActive ? user.stripeSubscriptionId : null;

    const metadata: Record<string, string> = { userId: user.id };
    if (oldSubscriptionId) {
      metadata.oldSubscriptionId = oldSubscriptionId;
    }

    // Create the subscription with default_incomplete
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card']
      },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
      metadata,
    });

    // Safely extract client_secret
    let clientSecret: string | null | undefined = null;

    if (subscription.latest_invoice) {
      let invoice = subscription.latest_invoice;
      // If invoice is just an ID (string), fetch it
      if (typeof invoice === 'string') {
        invoice = await stripe.invoices.retrieve(invoice, { expand: ['payment_intent'] });
      }

      if (typeof invoice !== 'string' && invoice.payment_intent) {
        let paymentIntent = invoice.payment_intent;
        // If paymentIntent is just an ID (string), fetch it
        if (typeof paymentIntent === 'string') {
          paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent);
        }
        if (typeof paymentIntent !== 'string') {
          clientSecret = paymentIntent.client_secret;
        }
      }
    }

    if (!clientSecret && subscription.pending_setup_intent) {
      let setupIntent = subscription.pending_setup_intent;
      if (typeof setupIntent === 'string') {
        setupIntent = await stripe.setupIntents.retrieve(setupIntent);
      }
      if (typeof setupIntent !== 'string') {
        clientSecret = setupIntent.client_secret;
      }
    }

    if (!clientSecret) {
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        return NextResponse.json({ 
          subscriptionId: subscription.id,
          clientSecret: null,
          isActive: true
        });
      }
      
      let debugInfo = `Status: ${subscription.status}. `;
      if (subscription.latest_invoice) {
         let inv = subscription.latest_invoice as any;
         debugInfo += `Invoice status: ${inv.status || 'unknown'}. `;
         if (inv.payment_intent) {
           debugInfo += `PI status: ${(inv.payment_intent as any).status || 'unknown'}. `;
         } else {
           debugInfo += `No PI on invoice. `;
         }
      } else {
         debugInfo += `No invoice. `;
      }
      
      if (subscription.pending_setup_intent) {
         debugInfo += `Has SetupIntent. `;
      }
      
      throw new Error(`Nie można wygenerować sesji płatności. ${debugInfo}`);
    }

    return NextResponse.json({ 
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
    });
  } catch (error: any) {
    console.error("Stripe Create Subscription Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
