export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";
import { getTrialState } from "@/lib/trial";

// GET: Pobierz wszystkie zamówienia użytkownika
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Błąd serwera podczas pobierania zamówień" }, { status: 500 });
  }
}

// POST: Dodaj nowe zamówienie
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trialState = getTrialState({ createdAt: user.createdAt, subscriptionStatus: user.subscriptionStatus }, user.settings || undefined);
    
    if (trialState.isTrialExpired) {
      return NextResponse.json({ error: "Twój 3-dniowy okres próbny wygasł. Opłać subskrypcję, aby korzystać z tej funkcji." }, { status: 403 });
    }

    const isSubscriptionActive = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
    if (!isSubscriptionActive && !trialState.isTrialActive) {
      return NextResponse.json({ error: "Brak aktywnej subskrypcji. Wykup abonament, aby korzystać z tej funkcji." }, { status: 403 });
    }

    const { orderNumber, customerEmail, status, items, totalPrice, trackingUrl } = await req.json();

    if (!orderNumber || !customerEmail || !status || !items || !totalPrice) {
      return NextResponse.json({ error: "Wszystkie wymagane pola muszą być uzupełnione" }, { status: 400 });
    }

    // Sprawdź czy numer zamówienia już istnieje dla tego użytkownika
    const existing = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        orderNumber: orderNumber.trim()
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Zamówienie o takim numerze już istnieje w bazie" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber: orderNumber.trim(),
        customerEmail: customerEmail.trim(),
        status: status.trim(),
        items: items.trim(),
        totalPrice: totalPrice.trim(),
        trackingUrl: trackingUrl ? trackingUrl.trim() : null
      }
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("POST order error:", error);
    return NextResponse.json({ error: `Błąd dodawania zamówienia: ${error?.message || "Błąd serwera"}` }, { status: 500 });
  }
}

// DELETE: Usuń zamówienie
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trialState = getTrialState({ createdAt: user.createdAt, subscriptionStatus: user.subscriptionStatus }, user.settings || undefined);
    
    if (trialState.isTrialExpired) {
      return NextResponse.json({ error: "Twój 3-dniowy okres próbny wygasł. Opłać subskrypcję, aby korzystać z tej funkcji." }, { status: 403 });
    }

    const isSubscriptionActive = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
    if (!isSubscriptionActive && !trialState.isTrialActive) {
      return NextResponse.json({ error: "Brak aktywnej subskrypcji. Wykup abonament, aby korzystać z tej funkcji." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Brak identyfikatora zamówienia" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Nie odnaleziono zamówienia lub brak uprawnień" }, { status: 404 });
    }

    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE order error:", error);
    return NextResponse.json({ error: "Błąd serwera podczas usuwania zamówienia" }, { status: 500 });
  }
}
