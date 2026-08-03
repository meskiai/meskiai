import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { lookupLiveOrder, lookupLiveProducts } from "../../../../lib/storeApi";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { storeType, storeUrl, storeApiKey, storeApiSecret } = await req.json();

    if (!storeType || !storeUrl || !storeApiKey) {
      return NextResponse.json({ error: "Uzupełnij wszystkie wymagane pola: typ sklepu, URL, klucz API" }, { status: 400 });
    }

    const settings = { storeType, storeUrl, storeApiKey, storeApiSecret };

    // Test: try to look up a product search (less intrusive than a specific order)
    const productResult = await lookupLiveProducts(settings as any, "test");

    // Also try a generic order fetch to verify authentication
    // For Shopify: fetch list of orders (limit 1)
    let testPassed = false;
    let message = "";
    let details = "";

    if (storeType === "shopify") {
      const baseUrl = storeUrl.startsWith("http") ? storeUrl.replace(/\/$/, "") : `https://${storeUrl}`;
      const res = await fetch(`${baseUrl}/admin/api/2024-01/shop.json`, {
        headers: { 
          "X-Shopify-Access-Token": storeApiKey,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        testPassed = true;
        message = `✓ Połączono z Shopify`;
        details = `Sklep: ${data.shop?.name || storeUrl} (${data.shop?.domain || ""})`;
      } else {
        message = `✗ Błąd autoryzacji Shopify (${res.status}). Sprawdź URL i Admin API Token.`;
      }
    } else if (storeType === "woocommerce") {
      const baseUrl = storeUrl.startsWith("http") ? storeUrl.replace(/\/$/, "") : `https://${storeUrl}`;
      const auth = Buffer.from(`${storeApiKey}:${storeApiSecret || ""}`).toString("base64");
      const res = await fetch(`${baseUrl}/wp-json/wc/v3/system_status`, {
        headers: { 
          Authorization: `Basic ${auth}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const data = await res.json();
        testPassed = true;
        message = `✓ Połączono z WooCommerce`;
        details = `Wersja WC: ${data.environment?.version || "?"} | WordPress: ${data.environment?.wp_version || "?"}`;
      } else {
        const errData = await res.json().catch(() => ({}));
        message = `✗ Błąd autoryzacji WooCommerce (${res.status}). Sprawdź URL, Consumer Key i Consumer Secret. ${errData?.message || ""}`;
      }
    } else if (storeType === "custom") {
      // For custom API, just try a HEAD/GET request
      const baseUrl = storeUrl.startsWith("http") ? storeUrl : `https://${storeUrl}`;
      const res = await fetch(baseUrl, {
        method: "HEAD",
        headers: {
          ...(storeApiKey ? { Authorization: `Bearer ${storeApiKey}` } : {}),
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok || res.status === 405) {
        testPassed = true;
        message = `✓ Endpoint odpowiada (${res.status})`;
        details = "Własne API jest osiągalne. Wysyłamy zapytania o zamówienia jako GET z parametrami ?order_number=XXX&email=YYY";
      } else {
        message = `✗ Endpoint zwrócił błąd ${res.status}. Sprawdź URL.`;
      }
    }

    return NextResponse.json({ success: testPassed, message, details });
  } catch (e: any) {
    console.error("[Store Test] Error:", e);
    return NextResponse.json({ success: false, message: `Błąd połączenia: ${e?.message || "Sprawdź URL i dane"}` }, { status: 200 });
  }
}
