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

    // Guard: Tylko dla aktywnych subskrypcji (bez wliczania triala)
    if (!user || user.subscriptionStatus !== 'active') {
      return NextResponse.json({ error: "Ta opcja jest dostępna tylko dla aktywnych Subskrybentów (poza pakietem darmowym)." }, { status: 403 });
    }

    const { amount, credits } = await req.json();

    // Utwórz PaymentIntent dla Customowego Koszyka (Stripe Elements)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: (amount || 20) * 100, // Kwota w groszach
      currency: "pln",
      customer: user.stripeCustomerId || undefined,
      receipt_email: user.stripeCustomerId ? undefined : user.email!,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user.id,
        type: "topup_credits",
        credits: String(credits || 100),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Stripe Topup PaymentIntent Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
