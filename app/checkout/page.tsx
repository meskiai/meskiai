"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Shield, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import styles from "../page.module.css";
import checkoutStyles from "./checkout.module.css";

import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error("BRAK KLUCZA STRIPE! Upewnij się, że NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY jest ustawione w .env.local oraz w Netlify.");
}
const cleanStripeKey = stripeKey ? stripeKey.replace(/[^a-zA-Z0-9_]/g, '') : "";
const stripePromise = cleanStripeKey ? loadStripe(cleanStripeKey) : null;

const PLAN_DETAILS: Record<string, any> = {
  [PRICE_BASIC]: {
    name: "MESKIAI Starter",
    price: "119 zł",
    desc: "Zacznij automatyzować proste procesy e-mail i generować zapytania ofertowe bez kiwnięcia palcem.",
    features: [
      "Osobisty Agent AI do poczty",
      "500 Kredytów / miesięcznie",
      "Podstawowe podpowiedzi biznesowe"
    ]
  },
  [PRICE_PRO]: {
    name: "MESKIAI Pro",
    price: "199 zł",
    desc: "Zbudowany dla skalujących się biznesów. Prawdziwy pracownik w chmurze.",
    features: [
      "Osobisty Agent AI do poczty",
      "5000 Kredytów / miesięcznie",
      "Integracja API (Shopify, WooCommerce, BaseLinker)",
      "Cold Email (Generowanie AI)",
      "Zmiana tonu i stylu pisania Agenta"
    ]
  },
  [PRICE_MAX]: {
    name: "MESKIAI Max",
    price: "299 zł",
    desc: "Bez limitów. Dla przedsiębiorstw pragnących absolutnej dominacji operacyjnej.",
    features: [
      "Pełny dostęp do Agenta AI",
      "Nielimitowane Kredyty",
      "Nielimitowany Cold Email",
      "Zmiana tonu i stylu pisania Agenta",
      "Dedykowany Account Manager"
    ]
  }
};

import { CheckoutForm } from "./CheckoutForm";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const priceId = searchParams?.get("priceId") || "";
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.setItem('selectedPlan', JSON.stringify({ id: priceId, time: Date.now() }));
      router.push("/api/auth/signin?callbackUrl=/dashboard");
      return;
    }

    if (status === "authenticated" && priceId && stripePromise) {
      fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else if (data.clientSecret || data.requirePayment === false) {
            if (data.requirePayment === false) { 
              window.location.href = '/dashboard?checkout=success'; 
              return; 
            }
            setClientSecret(data.clientSecret);
          }
        })
        .catch(() => setError("Wystąpił błąd podczas połączenia z serwerem."));
    }
  }, [priceId, status, router]);

  const plan = PLAN_DETAILS[priceId];

  if (!plan) {
    return (
      <main className={checkoutStyles.checkoutMain}>
        <div className={checkoutStyles.checkoutContainer}>
          <div className={checkoutStyles.errorBox}>
            <p style={{ color: '#0A2540', marginBottom: '16px', fontSize: '1.125rem', fontWeight: 600 }}>Nieprawidłowy plan.</p>
            <Link href="/#cennik" className={checkoutStyles.btnPrimary}>
              Wróć do cennika
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#635BFF',
      colorBackground: '#FFFFFF',
      colorText: '#0A2540',
      colorDanger: '#EF4444',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      borderRadius: '8px',
      spacingUnit: '4px',
    },
    rules: {
      '.Input': {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: 'none',
      },
      '.Label': {
        color: '#0A2540',
        fontWeight: '600',
      },
      '.Tab': {
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
      },
      '.Tab--selected': {
        borderColor: '#635BFF',
        boxShadow: '0 0 0 2px #635BFF',
      },
    }
  };

  return (
    <main className={checkoutStyles.checkoutMain}>
      {/* Stripe Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navBrand} onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}>
            <img src="/logo.png" alt="MESKIAI" className={styles.navBrandImg} />
            MESKIAI
          </a>
          <div className={styles.navActions} style={{ marginLeft: 'auto' }}>
            <Link href="/#cennik" className={styles.navLink}>
              Plany i cennik
            </Link>
          </div>
        </div>
      </nav>

      <div className={checkoutStyles.checkoutContainer}>
        <div className={checkoutStyles.checkoutLayout}>
          
          {/* Kolumna lewa: Podsumowanie w stylu Stripe 1:1 */}
          <div className={`${checkoutStyles.stripeCard} ${checkoutStyles.leftColumn}`}>
            
            <Link href="/#cennik" className={checkoutStyles.backLink}>
              <ArrowLeft size={16} />
              Wróć do cennika
            </Link>
            
            <div style={{ flexGrow: 1 }}>
              <div className={checkoutStyles.planBadge}>
                PODSUMOWANIE ZAMÓWIENIA
              </div>
              <h1 className={checkoutStyles.planTitle}>
                {plan.name}
              </h1>
              <div className={checkoutStyles.planPrice}>
                {plan.price} <span className={checkoutStyles.planPricePeriod}>/ miesięcznie</span>
              </div>
              
              <p className={checkoutStyles.planDesc}>
                {plan.desc}
              </p>

              <div className={checkoutStyles.featureList}>
                {plan.features.map((feature: string, idx: number) => (
                  <div key={idx} className={checkoutStyles.featureItem}>
                    <CheckCircle size={18} color="#635BFF" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={checkoutStyles.securityBox}>
              <Shield size={20} color="#635BFF" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span className={checkoutStyles.securityTitle}>Gwarancja bezpieczeństwa Stripe</span>
                <span className={checkoutStyles.securityText}>
                  Dane Twojej karty są w pełni zaszyfrowane. Przetwarzaniem płatności zajmuje się Stripe – światowy lider.
                </span>
              </div>
            </div>
          </div>

          {/* Kolumna prawa: Formularz płatności w stylu Stripe 1:1 */}
          <div className={checkoutStyles.rightColumn}>
            <div className={checkoutStyles.stripeCard} style={{ justifyContent: 'center' }}>
              
              <div className={checkoutStyles.noticeBox}>
                <Mail size={18} color="#635BFF" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 className={checkoutStyles.noticeTitle}>Konto docelowe w MESKIAI</h4>
                  <p className={checkoutStyles.noticeText}>
                    Abonament zostanie przypisany do konta: <strong style={{ color: '#0A2540' }}>{session?.user?.email}</strong>.
                  </p>
                </div>
              </div>

              {status === "loading" || (!error && !clientSecret) ? (
                <div className={checkoutStyles.loaderContainer}>
                  <div className={checkoutStyles.spinner} />
                  <p style={{ color: '#64748B', fontWeight: 500, fontSize: '0.9rem' }}>
                    Łączenie z operatorem Stripe...
                  </p>
                </div>
              ) : error ? (
                <div className={checkoutStyles.errorBox}>
                  <div style={{ color: '#EF4444', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>{error}</div>
                  <Link href="/#cennik" className={checkoutStyles.btnPrimary}>
                    Wróć i wybierz inny plan
                  </Link>
                </div>
              ) : (
                <div id="checkout" style={{ width: '100%' }}>
                  <Elements stripe={stripePromise} options={{ clientSecret: clientSecret as string, appearance }}>
                    <CheckoutForm planName={plan.name} clientSecret={clientSecret as string} />
                  </Elements>
                </div>
              )}
              
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: '#0A2540' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E6EBF1', borderTopColor: '#635BFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </main>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
