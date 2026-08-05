import { prisma } from "./prisma";
import { getLiveStoreContextForEmail } from "./storeApi";

/**
 * Wyciąga numery zamówień z treści wiadomości e-mail.
 * Wspiera formaty: #1234, "zamówienie nr 12345", ciągi cyfr 4-8 znaków.
 */
export function extractOrderNumbers(text: string): string[] {
  const numbers: string[] = [];

  // Pattern 1: #1234
  const hashPattern = /#([0-9A-Za-z-]{3,10})/g;
  let match;
  while ((match = hashPattern.exec(text)) !== null) {
    if (match[1]) numbers.push(match[1].trim());
  }

  // Pattern 2: "zamówienie / nr / numer / id 12345"
  const textPattern = /(?:zamówienie|zamówienia|zamowienie|zamowienia|nr|numer|id|order)\s*#?\s*([0-9A-Za-z-]{3,10})/gi;
  while ((match = textPattern.exec(text)) !== null) {
    if (match[1] && !numbers.includes(match[1].trim())) {
      numbers.push(match[1].trim());
    }
  }

  return numbers;
}

/**
 * Główna funkcja — buduje kontekst dla AI na podstawie danych o zamówieniu.
 * Priorytet: żywe API sklepu → ręczna baza danych zamówień → info o braku danych.
 */
export async function getOrderContextForEmail(
  userId: string,
  emailBody: string,
  customerEmail: string
): Promise<string> {
  try {
    // Clean raw display names from email (e.g. "John Doe <john@gmail.com>" -> "john@gmail.com")
    let cleanEmail = customerEmail.trim();
    const emailMatch = cleanEmail.match(/<([^>]+)>/);
    if (emailMatch && emailMatch[1]) {
      cleanEmail = emailMatch[1].trim();
    }

    // 1. Pobierz ustawienia użytkownika (w tym konfigurację sklepu)
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { storeType: true, storeUrl: true, storeApiKey: true, storeApiSecret: true },
    });

    // 2. Jeśli skonfigurowano żywe API sklepu — użyj go PRIORYTETOWO
    if (userSettings?.storeType && userSettings?.storeUrl && userSettings?.storeApiKey) {
      console.log(`[Order Lookup] Użytkownik ${userId} ma skonfigurowany sklep (${userSettings.storeType}) — odpytuję live API`);
      const liveContext = await getLiveStoreContextForEmail(
        userSettings,
        emailBody,
        cleanEmail,
        extractOrderNumbers
      );
      if (liveContext) return liveContext;
    }

    // 3. Fallback: ręczna baza zamówień (tabela Order)
    const extractedNumbers = extractOrderNumbers(emailBody);
    console.log(`[Order Lookup] Fallback do ręcznej bazy. Wyodrębnione numery:`, extractedNumbers);

    let order = null;

    for (const num of extractedNumbers) {
      order = await prisma.order.findFirst({
        where: { userId, orderNumber: { equals: num, mode: "insensitive" } },
      });
      if (order) break;
    }

    if (!order && cleanEmail) {
      order = await prisma.order.findFirst({
        where: { userId, customerEmail: { equals: cleanEmail, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!order) {
      return "\n[INFO O ZAMÓWIENIU: Nie znaleziono zamówienia w bazie ani w sklepie. Poproś klienta uprzejmie o podanie numeru zamówienia lub adresu e-mail użytego przy zakupie.]\n";
    }

    return `
========================================
RZECZYWISTE DANE ZAMÓWIENIA ZINTEGROWANE ZE SKLEPU (Shopify/WooCommerce):
Numer zamówienia: #${order.orderNumber}
E-mail kupującego: ${order.customerEmail}
Status zamówienia: ${order.status.toUpperCase()}
Zakupione produkty: ${order.items}
Kwota łączna: ${order.totalPrice}
Link do śledzenia przesyłki: ${order.trackingUrl || "Brak (jeszcze nie wysłano)"}
Data zamówienia: ${order.createdAt.toISOString().split("T")[0]}
========================================
Powyższe dane są w 100% prawdziwe i aktualne. Pochodzą bezpośrednio z systemu sklepowego klienta (Shopify/WooCommerce) zaimportowane przez Webhook. Odpowiedz klientowi ściśle na podstawie tych informacji.
`;
  } catch (error) {
    console.error("[Order Lookup] Błąd:", error);
    return "";
  }
}
