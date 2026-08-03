/**
 * lib/storeApi.ts
 * Live integration with e-commerce stores: Shopify, WooCommerce, or custom API.
 * Called by the AI agent when a customer email mentions an order or product question.
 */

export type StoreType = "shopify" | "woocommerce" | "custom";

interface StoreSettings {
  storeType: StoreType;
  storeUrl: string;
  storeApiKey: string;
  storeApiSecret?: string | null;
}

interface StoreOrderResult {
  found: boolean;
  orderNumber?: string;
  status?: string;
  financialStatus?: string;
  customerEmail?: string;
  lineItems?: string;
  totalPrice?: string;
  currency?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  trackingCompany?: string;
  createdAt?: string;
  estimatedDelivery?: string;
  note?: string;
  error?: string;
}

interface StoreProductResult {
  found: boolean;
  products?: Array<{
    name: string;
    status: string;         // "in_stock" | "out_of_stock" | "available"
    price?: string;
    variants?: string;      // e.g. "Dostępne rozmiary: S, M, L (brak XL)"
    description?: string;
  }>;
  error?: string;
}

// ─── Normalize URLs ─────────────────────────────────────────────────────────────
function normalizeUrl(url: string): string {
  if (!url) return "";
  const stripped = url.replace(/\/$/, "");
  return stripped.startsWith("http") ? stripped : `https://${stripped}`;
}

// ─── Shopify ─────────────────────────────────────────────────────────────────────

async function shopifyLookupOrder(settings: StoreSettings, orderNumber: string): Promise<StoreOrderResult> {
  try {
    const baseUrl = normalizeUrl(settings.storeUrl);
    // Shopify order names include # prefix, e.g. #1024
    const name = orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`;
    const url = `${baseUrl}/admin/api/2024-01/orders.json?name=${encodeURIComponent(name)}&status=any`;

    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": settings.storeApiKey,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return { found: false, error: `Shopify API error: ${res.status} ${res.statusText}` };
    }

    const data = await res.json();
    const orders = data.orders;
    if (!orders || orders.length === 0) return { found: false };

    const order = orders[0];
    const lineItems = order.line_items?.map((i: any) => `${i.name} x${i.quantity}`).join(", ") || "";
    
    // Get tracking info
    const fulfillment = order.fulfillments?.[0];
    const trackingNumber = fulfillment?.tracking_number;
    const trackingUrl = fulfillment?.tracking_url;
    const trackingCompany = fulfillment?.tracking_company;

    return {
      found: true,
      orderNumber: order.name,
      status: translateShopifyStatus(order.fulfillment_status, order.financial_status),
      financialStatus: order.financial_status,
      customerEmail: order.email,
      lineItems,
      totalPrice: order.total_price,
      currency: order.currency,
      trackingNumber: trackingNumber || undefined,
      trackingUrl: trackingUrl || undefined,
      trackingCompany: trackingCompany || undefined,
      createdAt: order.created_at?.split("T")[0],
    };
  } catch (e: any) {
    console.error("[StoreAPI Shopify Order]", e?.message);
    return { found: false, error: `Błąd połączenia z Shopify: ${e?.message}` };
  }
}

async function shopifyLookupProducts(settings: StoreSettings, query: string): Promise<StoreProductResult> {
  try {
    const baseUrl = normalizeUrl(settings.storeUrl);
    const url = `${baseUrl}/admin/api/2024-01/products.json?title=${encodeURIComponent(query)}&limit=5`;

    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": settings.storeApiKey,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return { found: false, error: `Shopify API error: ${res.status}` };

    const data = await res.json();
    const products = data.products;
    if (!products || products.length === 0) return { found: false };

    return {
      found: true,
      products: products.map((p: any) => {
        const variants = p.variants || [];
        const inStock = variants.filter((v: any) => v.inventory_quantity > 0);
        const variantDesc = variants.length > 1
          ? `Warianty: ${inStock.map((v: any) => v.title).join(", ")} (dostępne)`
          : "";

        return {
          name: p.title,
          status: inStock.length > 0 ? "in_stock" : "out_of_stock",
          price: variants[0]?.price ? `${variants[0].price} ${p.currency || ""}`.trim() : undefined,
          variants: variantDesc || undefined,
          description: p.body_html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 200),
        };
      }),
    };
  } catch (e: any) {
    console.error("[StoreAPI Shopify Products]", e?.message);
    return { found: false, error: e?.message };
  }
}

function translateShopifyStatus(fulfillmentStatus: string | null, financialStatus: string): string {
  if (fulfillmentStatus === "fulfilled") return "Wysłane / Zrealizowane";
  if (fulfillmentStatus === "partial") return "Częściowo wysłane";
  if (fulfillmentStatus === "unfulfilled" || !fulfillmentStatus) {
    if (financialStatus === "paid") return "Opłacone – w trakcie przygotowania";
    if (financialStatus === "pending") return "Oczekuje na płatność";
    if (financialStatus === "refunded") return "Zwrócono środki";
    if (financialStatus === "voided") return "Anulowane";
    return "W realizacji";
  }
  return fulfillmentStatus;
}

// ─── WooCommerce ─────────────────────────────────────────────────────────────────

async function woocommerceLookupOrder(settings: StoreSettings, orderNumber: string): Promise<StoreOrderResult> {
  try {
    const baseUrl = normalizeUrl(settings.storeUrl);
    const auth = Buffer.from(`${settings.storeApiKey}:${settings.storeApiSecret || ""}`).toString("base64");

    let res = await fetch(url, {
      headers: { 
        Authorization: `Basic ${auth}`, 
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    // If not found by ID, search by number
    if (!res.ok) {
      const searchUrl = `${baseUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(orderNumber)}&per_page=5`;
      res = await fetch(searchUrl, {
        headers: { 
          Authorization: `Basic ${auth}`, 
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) return { found: false, error: `WooCommerce API error: ${res.status}` };

      const orders = await res.json();
      if (!Array.isArray(orders) || orders.length === 0) return { found: false };
      return parseWooOrder(orders[0]);
    }

    const order = await res.json();
    if (!order?.id) return { found: false };
    return parseWooOrder(order);
  } catch (e: any) {
    console.error("[StoreAPI WooCommerce Order]", e?.message);
    return { found: false, error: `Błąd połączenia z WooCommerce: ${e?.message}` };
  }
}

function parseWooOrder(order: any): StoreOrderResult {
  const lineItems = order.line_items?.map((i: any) => `${i.name} x${i.quantity}`).join(", ") || "";
  const shipments = order.shipment_trackings || [];
  const tracking = shipments[0];

  return {
    found: true,
    orderNumber: `#${order.number || order.id}`,
    status: translateWooStatus(order.status),
    customerEmail: order.billing?.email,
    lineItems,
    totalPrice: `${order.total} ${order.currency}`,
    currency: order.currency,
    trackingNumber: tracking?.tracking_number || order.meta_data?.find((m: any) => m.key === "_tracking_number")?.value,
    trackingUrl: tracking?.tracking_link || order.meta_data?.find((m: any) => m.key === "_tracking_url")?.value,
    createdAt: order.date_created?.split("T")[0],
    note: order.customer_note || undefined,
  };
}

async function woocommerceLookupProducts(settings: StoreSettings, query: string): Promise<StoreProductResult> {
  try {
    const baseUrl = normalizeUrl(settings.storeUrl);
    const auth = Buffer.from(`${settings.storeApiKey}:${settings.storeApiSecret || ""}`).toString("base64");
    const url = `${baseUrl}/wp-json/wc/v3/products?search=${encodeURIComponent(query)}&per_page=5`;

    const res = await fetch(url, {
      headers: { 
        Authorization: `Basic ${auth}`, 
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return { found: false, error: `WooCommerce API error: ${res.status}` };

    const products = await res.json();
    if (!Array.isArray(products) || products.length === 0) return { found: false };

    return {
      found: true,
      products: products.map((p: any) => ({
        name: p.name,
        status: p.stock_status === "instock" ? "in_stock" : "out_of_stock",
        price: p.price ? `${p.price} ${p.currency || ""}`.trim() : undefined,
        variants: p.attributes?.map((a: any) => `${a.name}: ${a.options?.join(", ")}`).join(" | ") || undefined,
        description: p.short_description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 200),
      })),
    };
  } catch (e: any) {
    console.error("[StoreAPI WooCommerce Products]", e?.message);
    return { found: false, error: e?.message };
  }
}

function translateWooStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "Oczekuje na płatność",
    processing: "W trakcie realizacji",
    "on-hold": "Wstrzymane",
    completed: "Zrealizowane / Wysłane",
    cancelled: "Anulowane",
    refunded: "Zwrócono środki",
    failed: "Płatność nieudana",
    trash: "Usunięte",
  };
  return map[status] || status;
}

// ─── Custom API ───────────────────────────────────────────────────────────────────

async function customLookupOrder(settings: StoreSettings, orderNumber: string, customerEmail: string): Promise<StoreOrderResult> {
  try {
    const baseUrl = normalizeUrl(settings.storeUrl);
    const params = new URLSearchParams({ order_number: orderNumber, email: customerEmail });
    const url = `${baseUrl}?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        ...(settings.storeApiKey ? { Authorization: `Bearer ${settings.storeApiKey}` } : {}),
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return { found: false, error: `Custom API error: ${res.status}` };

    const data = await res.json();
    if (!data || data.found === false) return { found: false };

    return {
      found: true,
      orderNumber: data.order_number || data.orderNumber || orderNumber,
      status: data.status || data.fulfillment_status,
      customerEmail: data.email || customerEmail,
      lineItems: data.items || data.line_items || data.products,
      totalPrice: data.total || data.total_price,
      currency: data.currency,
      trackingNumber: data.tracking_number || data.trackingNumber,
      trackingUrl: data.tracking_url || data.trackingUrl,
      note: data.note,
    };
  } catch (e: any) {
    console.error("[StoreAPI Custom Order]", e?.message);
    return { found: false, error: `Błąd połączenia z własnym API: ${e?.message}` };
  }
}

// ─── Main Public Functions ─────────────────────────────────────────────────────

/**
 * Look up a real-time order from the configured store.
 */
export async function lookupLiveOrder(
  settings: StoreSettings,
  orderNumber: string,
  customerEmail: string
): Promise<StoreOrderResult> {
  console.log(`[StoreAPI] Looking up order ${orderNumber} via ${settings.storeType}`);

  if (settings.storeType === "shopify") return shopifyLookupOrder(settings, orderNumber);
  if (settings.storeType === "woocommerce") return woocommerceLookupOrder(settings, orderNumber);
  if (settings.storeType === "custom") return customLookupOrder(settings, orderNumber, customerEmail);

  return { found: false, error: "Nieznany typ sklepu" };
}

/**
 * Look up product availability from the configured store.
 */
export async function lookupLiveProducts(
  settings: StoreSettings,
  query: string
): Promise<StoreProductResult> {
  console.log(`[StoreAPI] Looking up products: "${query}" via ${settings.storeType}`);

  if (settings.storeType === "shopify") return shopifyLookupProducts(settings, query);
  if (settings.storeType === "woocommerce") return woocommerceLookupProducts(settings, query);

  return { found: false };
}

/**
 * Build a context string for the AI based on live store data.
 * This is injected into the system prompt.
 */
export async function getLiveStoreContextForEmail(
  storeSettings: { storeType?: string | null; storeUrl?: string | null; storeApiKey?: string | null; storeApiSecret?: string | null } | null,
  emailBody: string,
  customerEmail: string,
  extractOrderNumbers: (text: string) => string[]
): Promise<string> {
  if (!storeSettings?.storeType || !storeSettings?.storeUrl || !storeSettings?.storeApiKey) {
    return ""; // No store configured — fall through to manual DB or website context
  }

  const settings: StoreSettings = {
    storeType: storeSettings.storeType as StoreType,
    storeUrl: storeSettings.storeUrl,
    storeApiKey: storeSettings.storeApiKey,
    storeApiSecret: storeSettings.storeApiSecret,
  };

  const parts: string[] = [];

  // 1. Try to look up orders
  const orderNumbers = extractOrderNumbers(emailBody);
  let orderFound = false;

  for (const num of orderNumbers) {
    const result = await lookupLiveOrder(settings, num, customerEmail);
    if (result.found) {
      orderFound = true;
      parts.push(`
========================================
DANE ZAMÓWIENIA POBRANE NA ŻYWO ZE SKLEPU (${storeSettings.storeType?.toUpperCase()}):
Numer zamówienia: ${result.orderNumber}
Status: ${result.status}
Zakupione produkty: ${result.lineItems}
Kwota: ${result.totalPrice} ${result.currency || ""}
E-mail kupującego: ${result.customerEmail || customerEmail}
${result.trackingNumber ? `Numer śledzenia: ${result.trackingNumber}` : ""}
${result.trackingCompany ? `Firma kurierska: ${result.trackingCompany}` : ""}
${result.trackingUrl ? `Link do śledzenia: ${result.trackingUrl}` : ""}
${result.createdAt ? `Data zamówienia: ${result.createdAt}` : ""}
${result.note ? `Uwagi do zamówienia: ${result.note}` : ""}
========================================
Użyj tych danych do udzielenia PRECYZYJNEJ odpowiedzi. Jeśli klient pyta o zwrot, poinformuj o procedurze adekwatnej do statusu (jeśli "Wysłane" — musi odebrać i odesłać; jeśli "W realizacji" — możliwa anulacja przed wysyłką).
`);
      break;
    }
  }

  // 2. If no order found by number, try by email
  if (!orderFound && customerEmail) {
    // For WooCommerce only — search by billing email
    if (settings.storeType === "woocommerce") {
      try {
        const baseUrl = settings.storeUrl.startsWith("http") ? settings.storeUrl.replace(/\/$/, "") : `https://${settings.storeUrl}`;
        const auth = Buffer.from(`${settings.storeApiKey}:${settings.storeApiSecret || ""}`).toString("base64");
        const url = `${baseUrl}/wp-json/wc/v3/orders?billing_email=${encodeURIComponent(customerEmail)}&per_page=1&orderby=date&order=desc`;
        const res = await fetch(url, {
          headers: { 
            Authorization: `Basic ${auth}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const orders = await res.json();
          if (Array.isArray(orders) && orders.length > 0) {
            const parsed = parseWooOrder(orders[0]);
            if (parsed.found) {
              parts.push(`
========================================
OSTATNIE ZAMÓWIENIE KLIENTA (wg e-maila) POBRANE ZE SKLEPU:
Numer zamówienia: ${parsed.orderNumber}
Status: ${parsed.status}
Zakupione produkty: ${parsed.lineItems}
Kwota: ${parsed.totalPrice}
${parsed.trackingNumber ? `Numer śledzenia: ${parsed.trackingNumber}` : ""}
${parsed.trackingUrl ? `Link do śledzenia: ${parsed.trackingUrl}` : ""}
Data zamówienia: ${parsed.createdAt}
========================================
`);
              orderFound = true;
            }
          }
        }
      } catch (e) { /* ignore */ }
    }
  }

  // 3. Detect product questions and look up inventory
  const productKeywords = /dostępn|masz|czy macie|cena|stock|w magazyn|produkt|model|rozmiar|kolor|wariant/i;
  if (productKeywords.test(emailBody)) {
    // Extract potential product query from the email (rough heuristic: take longest noun phrase)
    const wordsInQuotes = emailBody.match(/"([^"]+)"/);
    const boldWords = emailBody.match(/\*([^*]+)\*/);
    const productQuery = (wordsInQuotes?.[1] || boldWords?.[1] || "").trim();

    if (productQuery) {
      const productResult = await lookupLiveProducts(settings, productQuery);
      if (productResult.found && productResult.products?.length) {
        const productLines = productResult.products.map(p =>
          `• ${p.name}: ${p.status === "in_stock" ? "✓ DOSTĘPNY" : "✗ BRAK W MAGAZYNIE"}${p.price ? ` — cena: ${p.price}` : ""}${p.variants ? ` (${p.variants})` : ""}`
        ).join("\n");

        parts.push(`
========================================
DOSTĘPNOŚĆ PRODUKTÓW POBRANA NA ŻYWO ZE SKLEPU:
${productLines}
========================================
`);
      }
    }
  }

  // 4. If no data found at all from the store, add a directive
  if (parts.length === 0 && (orderNumbers.length > 0 || productKeywords.test(emailBody))) {
    parts.push(`
[INFORMACJA DLA AGENTA: Pobrano żywe dane ze sklepu (${storeSettings.storeType}), ale nie znaleziono zamówienia ani produktów pasujących do zapytania klienta. NIE zmyślaj statusu. Poproś uprzejmie klienta o poprawny numer zamówienia lub adres e-mail użyty przy zamówieniu.]
`);
  }

  return parts.join("\n");
}
