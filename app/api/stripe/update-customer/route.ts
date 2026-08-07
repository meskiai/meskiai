import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
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

    const { nip, companyName, companyAddress } = await req.json();
    if (!nip && !companyName && !companyAddress) {
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const metadata: any = {};
    if (nip) metadata.nip = nip;
    if (companyName) metadata.companyName = companyName;
    if (companyAddress) metadata.companyAddress = companyAddress;

    // Dodaj NIP (Tax ID) do profilu klienta w Stripe
    // Zakładamy typ 'eu_vat' dla Polski, ale w razie błędu ignorujemy, żeby nie zablokować płatności
    try {
      if (nip) {
        await stripe.customers.createTaxId(user.stripeCustomerId, {
          type: 'eu_vat',
          value: nip,
        });
      }
    } catch (e: any) {
      console.warn("Failed to add NIP to Stripe customer:", e.message);
    }
    
    // Zawsze updatujemy metadane, niezależnie od tego czy dodanie TaxId się powiodło
    await stripe.customers.update(user.stripeCustomerId, {
      metadata
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Stripe Update Customer Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
