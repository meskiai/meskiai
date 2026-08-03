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
        customerEmail,
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

    if (!order && customerEmail) {
      order = await prisma.order.findFirst({
        where: { userId, customerEmail: { equals: customerEmail.trim(), mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!order) {
      return "\n[INFO O ZAMÓWIENIU: Nie znaleziono zamówienia w bazie ani w sklepie. Poproś klienta uprzejmie o podanie numeru zamówienia lub adresu e-mail użytego przy zakupie.]\n";
    }

    return `
========================================
INFORMACJE O ZAMÓWIENIU KLIENTA Z RĘCZNEJ BAZY DANYCH:
Numer zamówienia: #${order.orderNumber}
E-mail kupującego: ${order.customerEmail}
Status zamówienia: ${order.status.toUpperCase()}
Zakupione produkty: ${order.items}
Kwota łączna: ${order.totalPrice}
Link do śledzenia przesyłki: ${order.trackingUrl || "Brak"}
Data zamówienia: ${order.createdAt.toISOString().split("T")[0]}
========================================
Jeśli klient pyta o zwrot, poinformuj o procedurze adekwatnej do statusu.
`;
  } catch (error) {
    console.error("[Order Lookup] Błąd:", error);
    return "";
  }
}
