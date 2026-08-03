import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || searchParams.get("token");

    if (!userId) {
      return NextResponse.json({ error: "Brak parametru userId" }, { status: 400 });
    }

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      return NextResponse.json({ error: "Użytkownik nie istnieje" }, { status: 404 });
    }

    const body = await req.json();
    console.log(`[Webhook Order] Otrzymano zdarzenie dla użytkownika ${userId}`);

    // ─── 1. DETECT PLATFORM & PARSE PAYLOAD ───
    let orderNumber = "";
    let customerEmail = "";
    let status = "W realizacji";
    let items = "";
    let totalPrice = "";
    let trackingUrl: string | null = null;

    // Detect Shopify vs WooCommerce
    const isShopify = req.headers.get("x-shopify-topic") || body.financial_status !== undefined;

    if (isShopify) {
      console.log("[Webhook Order] Wykryto format Shopify");
      orderNumber = body.name?.replace("#", "") || body.order_number?.toString() || body.id?.toString() || "";
      customerEmail = body.email || body.customer?.email || "";
      
      // Parse items
      items = body.line_items?.map((i: any) => `${i.title} x${i.quantity}`).join(", ") || "";
      totalPrice = `${body.total_price || "0.00"} ${body.currency || "PLN"}`;
      trackingUrl = body.fulfillments?.[0]?.tracking_url || null;

      // Map status
      if (body.fulfillment_status === "fulfilled") {
        status = "Wysłane";
      } else if (body.financial_status === "paid") {
        status = "Opłacone";
      } else if (body.financial_status === "refunded") {
        status = "Zwrócono";
      } else if (body.financial_status === "voided") {
        status = "Anulowane";
      }
    } else {
      console.log("[Webhook Order] Wykryto format WooCommerce/Standard");
      orderNumber = body.number || body.id?.toString() || "";
      customerEmail = body.billing?.email || body.email || "";
      
      // Parse items
      items = body.line_items?.map((i: any) => `${i.name} x${i.quantity}`).join(", ") || "";
      totalPrice = `${body.total || "0.00"} ${body.currency || "PLN"}`;
      
      // WooCommerce tracking url can be in meta_data
      const trackingMeta = body.meta_data?.find((m: any) => m.key === "_tracking_url" || m.key === "tracking_url" || m.key === "tracking_link");
      trackingUrl = trackingMeta ? trackingMeta.value : null;

      // Map WooCommerce statuses: pending, processing, on-hold, completed, cancelled, refunded, failed
      const wooStatus = body.status;
      if (wooStatus === "completed") {
        status = "Wysłane";
      } else if (wooStatus === "processing") {
        status = "Opłacone";
      } else if (wooStatus === "cancelled" || wooStatus === "failed") {
        status = "Anulowane";
      } else if (wooStatus === "refunded") {
        status = "Zwrócono";
      } else if (wooStatus === "on-hold") {
        status = "Wstrzymane";
      }
    }

    if (!orderNumber) {
      return NextResponse.json({ error: "Brak numeru zamówienia w body" }, { status: 400 });
    }

    // ─── 2. UPSERT ORDER IN DATABASE ───
    const order = await prisma.order.upsert({
      where: {
        userId_orderNumber: {
          userId,
          orderNumber: orderNumber.trim()
        }
      },
      update: {
        customerEmail: customerEmail.trim(),
        status,
        items,
        totalPrice,
        trackingUrl: trackingUrl ? trackingUrl.trim() : null,
        updatedAt: new Date()
      },
      create: {
        userId,
        orderNumber: orderNumber.trim(),
        customerEmail: customerEmail.trim(),
        status,
        items,
        totalPrice,
        trackingUrl: trackingUrl ? trackingUrl.trim() : null
      }
    });

    console.log(`[Webhook Order] Pomyślnie zsynchronizowano zamówienie #${orderNumber} dla userId=${userId}`);
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (e: any) {
    console.error("[Webhook Order Error]:", e);
    return NextResponse.json({ error: e.message || "Błąd wewnętrzny serwera" }, { status: 500 });
  }
}
