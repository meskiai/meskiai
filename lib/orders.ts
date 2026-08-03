import { prisma } from "./prisma";

/**
 * Szuka i wyciąga numer zamówienia z treści wiadomości e-mail.
 * Wspiera formaty typu #1234, "zamówienie 12345", czy same ciągi cyfr 4-8 znaków.
 */
export function extractOrderNumbers(text: string): string[] {
  const numbers: string[] = [];
  
  // Pattern 1: Szukaj #1234 lub #12345
  const hashPattern = /#([0-9A-Za-z-]{3,10})/g;
  let match;
  while ((match = hashPattern.exec(text)) !== null) {
    if (match[1]) numbers.push(match[1].trim());
  }

  // Pattern 2: Szukaj "zamówien* 12345" lub "nr 12345"
  const textPattern = /(?:zamówienie|zamówienia|zamowienie|zamowienia|nr|numer|id)\s*#?\s*([0-9A-Za-z-]{3,10})/gi;
  while ((match = textPattern.exec(text)) !== null) {
    if (match[1] && !numbers.includes(match[1].trim())) {
      numbers.push(match[1].trim());
    }
  }

  return numbers;
}

/**
 * Szuka informacji o zamówieniu w bazie danych i zwraca sformatowany tekst dla AI.
 */
export async function getOrderContextForEmail(
  userId: string,
  emailBody: string,
  customerEmail: string
): Promise<string> {
  try {
    const extractedNumbers = extractOrderNumbers(emailBody);
    console.log(`[Order Lookup] Wyodrębnione numery z maila:`, extractedNumbers);

    let order = null;

    // 1. Spróbuj dopasować po wyciągniętym numerze zamówienia
    for (const num of extractedNumbers) {
      order = await prisma.order.findFirst({
        where: {
          userId,
          orderNumber: {
            equals: num,
            mode: "insensitive"
          }
        }
      });
      if (order) {
        console.log(`[Order Lookup] Znaleziono zamówienie po numerze: ${num}`);
        break;
      }
    }

    // 2. Jeśli nie znaleziono po numerze, spróbuj dopasować po e-mailu klienta
    if (!order && customerEmail) {
      order = await prisma.order.findFirst({
        where: {
          userId,
          customerEmail: {
            equals: customerEmail.trim(),
            mode: "insensitive"
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      if (order) {
        console.log(`[Order Lookup] Znaleziono zamówienie po e-mailu nadawcy: ${customerEmail}`);
      }
    }

    if (!order) {
      return "\n[INFO O ZAMÓWIENIU: Nie znaleziono żadnego zamówienia powiązanego z tym e-mailem ani podanym numerem w bazie danych. Jeśli klient pyta o zamówienie, poproś go uprzejmie o podanie numeru zamówienia lub poprawnego adresu e-mail, na który zostało złożone.]\n";
    }

    return `
========================================
INFORMACJE O ZAMÓWIENIU KLIENTA Z BAZY DANYCH:
Numer zamówienia: #${order.orderNumber}
E-mail kupującego: ${order.customerEmail}
Status zamówienia: ${order.status.toUpperCase()}
Zakupione produkty: ${order.items}
Kwota łączna: ${order.totalPrice}
Link do śledzenia przesyłki: ${order.trackingUrl || "Brak (zamówienie cyfrowe lub nie wysłane jeszcze)"}
Data zamówienia: ${order.createdAt.toISOString().split('T')[0]}
========================================
Wykorzystaj te dane, aby udzielić precyzyjnej informacji klientowi. Jeśli pyta o zwrot, poinformuj o procedurze zależnie od statusu (np. jeśli wysłane - musi najpierw odebrać i odesłać; jeśli w realizacji - możemy anulować).
`;
  } catch (error) {
    console.error("[Order Lookup] Błąd podczas wyszukiwania zamówienia:", error);
    return "";
  }
}
