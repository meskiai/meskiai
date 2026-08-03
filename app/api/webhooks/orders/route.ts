import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

// Database query retry helper to handle transient Neon DB connection resets
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = err?.message ?? "";
      const isRetryable =
        msg.includes("ECONNRESET") ||
        msg.includes("fetch failed") ||
        msg.includes("NeonDbError") ||
        msg.includes("connection");
      if (isRetryable && i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Database query failed after retries");
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || searchParams.get("token");

    if (!userId) {
      return NextResponse.json({ error: "Brak parametru userId" }, { status: 400 });
    }

    // Verify user exists using retry wrapper
    const userExists = await withRetry(() =>
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })
    );

    if (!userExists) {
      return NextResponse.json({ error: "Uzytkownik nie istnieje" }, { status: 404 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.warn("[Webhook Order] Invalid JSON payload received");
      return NextResponse.json({ error: "Niepoprawny format JSON" }, { status: 400 });
    }

    console.log(`[Webhook Order] Otrzymano zdarzenie dla uzytkownika ${userId}`);

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
      // Sanitize order number (strip '#' and whitespace)
      const rawName = body.name || body.order_number || body.id;
      orderNumber = rawName ? rawName.toString().replace(/#/g, "").trim() : "";
      
      // Fallback email checks
      customerEmail = body.email || body.customer?.email || body.billing_address?.email || "";
      
      // Parse items
      items = body.line_items?.map((i: any) => `${i.title} x${i.quantity}`).join(", ") || "";
      totalPrice = `${body.total_price || "0.00"} ${body.currency || "PLN"}`;
      
      // Fulfillments check for tracking info
      if (body.fulfillments && body.fulfillments.length > 0) {
        trackingUrl = body.fulfillments[0]?.tracking_url || null;
      }
      
      // Map status
      if (body.fulfillment_status === "fulfilled") {
        status = "Wyslane";
      } else if (body.financial_status === "paid") {
        status = "Oplacone";
      } else if (body.financial_status === "refunded") {
        status = "Zwrocono";
      } else if (body.financial_status === "voided") {
        status = "Anulowane";
      }
    } else {
      console.log("[Webhook Order] Wykryto format WooCommerce/Standard");
      const rawName = body.number || body.id;
      orderNumber = rawName ? rawName.toString().replace(/#/g, "").trim() : "";
      customerEmail = body.billing?.email || body.email || "";
      
      // Parse items
      items = body.line_items?.map((i: any) => `${i.name} x${i.quantity}`).join(", ") || "";
      totalPrice = `${body.total || "0.00"} ${body.currency || "PLN"}`;
      
      // WooCommerce tracking url check
      if (body.shipment_trackings && body.shipment_trackings.length > 0) {
        trackingUrl = body.shipment_trackings[0]?.tracking_link || null;
      }
      if (!trackingUrl && body.meta_data) {
        const trackingMeta = body.meta_data.find((m: any) => 
          m.key === "_tracking_url" || 
          m.key === "tracking_url" || 
          m.key === "tracking_link" ||
          m.key === "tracking_number"
        );
        trackingUrl = trackingMeta ? trackingMeta.value : null;
      }

      // Map WooCommerce statuses: pending, processing, on-hold, completed, cancelled, refunded, failed
      const wooStatus = body.status;
      if (wooStatus === "completed") {
        status = "Wyslane";
      } else if (wooStatus === "processing") {
        status = "Oplacone";
      } else if (wooStatus === "cancelled" || wooStatus === "failed") {
        status = "Anulowane";
      } else if (wooStatus === "refunded") {
        status = "Zwrocono";
      } else if (wooStatus === "on-hold") {
        status = "Wstrzymane";
      }
    }

    if (!orderNumber) {
      return NextResponse.json({ error: "Brak numeru zamowienia w body" }, { status: 400 });
    }

    // ─── 2. UPSERT ORDER IN DATABASE WITH RETRY ───
    const order = await withRetry(() =>
      prisma.order.upsert({
        where: {
          userId_orderNumber: {
            userId,
            orderNumber: orderNumber.trim(),
          },
        },
        update: {
          customerEmail: customerEmail.trim(),
          status,
          items,
          totalPrice,
          trackingUrl: trackingUrl ? trackingUrl.trim() : null,
          updatedAt: new Date(),
        },
        create: {
          userId,
          orderNumber: orderNumber.trim(),
          customerEmail: customerEmail.trim(),
          status,
          items,
          totalPrice,
          trackingUrl: trackingUrl ? trackingUrl.trim() : null,
        },
      })
    );

    console.log(`[Webhook Order] Pomyslnie zsynchronizowano zamowienie #${orderNumber} dla userId=${userId}`);
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (e: any) {
    console.error("[Webhook Order Error]:", e);
    return NextResponse.json({ error: e.message || "Blad wewnetrzny serwera" }, { status: 500 });
  }
}
