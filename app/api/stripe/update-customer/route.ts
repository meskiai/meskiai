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

    const { nip } = await req.json();

    if (!nip || nip.trim() === "") {
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: "User not found or no Stripe Customer ID" }, { status: 404 });
    }

    const customerId = user.stripeCustomerId;

    // Pobierz obecne tax_ids i usuń stare jeśli istnieją
    const taxIds = await stripe.customers.listTaxIds(customerId);
    for (const taxId of taxIds.data) {
      await stripe.customers.deleteTaxId(customerId, taxId.id);
    }

    // Wyczyść PL z początku jeśli użytkownik podał, bo Stripe często oczekuje formatu bez lub z - zależnie od wpisu
    // Stripe dla eu_vat oczekuje kodu kraju na początku. 
    let formattedNip = nip.trim().toUpperCase().replace(/\s+/g, '').replace(/-/g, '');
    if (!formattedNip.startsWith("PL") && formattedNip.length === 10) {
        formattedNip = "PL" + formattedNip;
    }

    // Dodaj nowy NIP jako eu_vat (dla Polski) lub odpowiedni
    await stripe.customers.createTaxId(customerId, {
      type: 'eu_vat',
      value: formattedNip,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Stripe Update Customer Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
