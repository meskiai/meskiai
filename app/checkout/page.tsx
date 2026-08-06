"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import { CheckCircle, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Reuse main page styles and components
import styles from "../page.module.css";
import checkoutStyles from "./checkout.module.css";
import { ThemeToggle } from "../components/ThemeToggle";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLAN_DETAILS: Record<string, any> = {
  basic: {
    name: "MESKIAI BASIC",
    price: "499 zł",
    desc: "Zacznij automatyzować proste procesy e-mail i generować zapytania ofertowe bez kiwnięcia palcem.",
    features: [
      "Osobisty Agent AI do poczty",
      "Do 50 automatycznych e-maili miesięcznie",
      "Do 10 wyszukań konkurencji miesięcznie",
      "Podstawowe podpowiedzi biznesowe",
      "Propozycje klientów (limit 20 B2B)",
    ]
  },
  pro: {
    name: "MESKIAI PRO",
    price: "699 zł",
    desc: "Zbudowany dla skalujących się biznesów. Prawdziwy pracownik w chmurze.",
    features: [
      "Osobisty Agent AI do poczty",
      "Do 1000 automatycznych e-maili miesięcznie",
      "Do 100 wyszukań konkurencji miesięcznie",
      "Zaawansowane podpowiedzi biznesowe",
      "Propozycje klientów (limit 200 B2B)",
      "Cold Email (Generowanie AI)",
      "Zmiana tonu i stylu pisania Agenta"
    ]
  },
  max: {
    name: "MESKIAI MAX",
    price: "899 zł",
    desc: "Bez limitów. Dla przedsiębiorstw pragnących absolutnej dominacji operacyjnej.",
    features: [
      "Pełny dostęp do Agenta AI",
      "Nielimitowane e-maile",
      "Nielimitowane wyszukiwania konkurencji",
      "Nielimitowane propozycje klientów",
      "Nielimitowany Cold Email",
      "Zmiana tonu i stylu pisania Agenta",
      "Dedykowany Account Manager"
    ]
  }
};

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const priceId = searchParams?.get("priceId") || "";
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      // Zapisz priceId i przekieruj do logowania
      localStorage.setItem('selectedPlan', JSON.stringify({ id: priceId, time: Date.now() }));
      router.push("/api/auth/signin?callbackUrl=/dashboard");
      return;
    }

    if (status === "authenticated" && priceId) {
      // Inicjalizuj płatność
      fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else if (data.isActive) {
            router.push("/dashboard?upgrade=success");
          } else {
            setClientSecret(data.clientSecret);
          }
        })
        .catch(() => setError("Wystąpił błąd podczas połączenia z serwerem."));
    }
  }, [priceId, status, router]);

  const plan = PLAN_DETAILS[priceId];

  if (!plan) {
    return (
      <main className={styles.main}>
        <div className={styles.ambientBackground}>
          <div className={styles.ambientBlob}></div>
        </div>
        <div className={checkoutStyles.checkoutContainer}>
          <div className={checkoutStyles.errorBox}>
            <p style={{ color: 'var(--foreground)', marginBottom: '16px', fontSize: '1.125rem' }}>Nieprawidłowy plan.</p>
            <Link href="/#cennik" className={checkoutStyles.btnPrimary}>
              Wróć do cennika
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: 'transparent',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '12px',
    },
    rules: {
      '.Input': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'none',
        color: '#fff',
      },
      '.Input:focus': {
        border: '1px solid #3b82f6',
        boxShadow: '0 0 0 1px #3b82f6',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      },
      '.Label': {
        color: '#a1a1aa',
      }
    }
  };

  return (
    <main className={styles.main}>
      {/* Tło aurora (zgodne z main) */}
      <div className={styles.ambientBackground}>
        <div className={styles.ambientBlob}></div>
      </div>
      
      {/* Nawigacja (zgodna z main) */}
      <nav className={`${styles.nav} animate-fade-in`}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <img
              src="/logo.png"
              alt="MESKIAI logo"
              style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'var(--logo-filter)', mixBlendMode: 'var(--logo-blend-mode)' as any }}
            />
            <span style={{ color: 'var(--foreground)' }}>MESKIAI</span>
          </div>
          
          <div className={styles.navActions}>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className={checkoutStyles.checkoutContainer}>
        <div className={checkoutStyles.checkoutLayout}>
          
          {/* Kolumna lewa: Podsumowanie w glassmorphismie */}
          <div className={`${checkoutStyles.glassCard} ${checkoutStyles.leftColumn}`}>
            <div className={checkoutStyles.glowBlob}></div>
            
            <Link href="/#cennik" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--subtext)', textDecoration: 'none', marginBottom: '40px', width: 'max-content', zIndex: 10 }}>
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Wróć do cennika
            </Link>
            
            <div style={{ zIndex: 10, flexGrow: 1 }}>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Podsumowanie zamówienia
              </h2>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--foreground)' }}>
                {plan.name}
              </h1>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '32px', color: 'var(--foreground)' }}>
                {plan.price} <span style={{ fontSize: '0.875rem', color: 'var(--subtext)' }}>/ miesięcznie</span>
              </div>
              
              <p style={{ color: 'var(--subtext)', marginBottom: '32px', lineHeight: 1.6, fontSize: '1rem' }}>
                {plan.desc}
              </p>

              <div style={{ marginBottom: '32px' }}>
                {plan.features.map((feature: string, idx: number) => (
                  <div key={idx} className={checkoutStyles.featureItem}>
                    <CheckCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={checkoutStyles.securityBox}>
              <Shield size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--subtext)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--foreground)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Gwarancja bezpieczeństwa</span>
                Dane Twojej karty są zaszyfrowane. Przetwarzaniem płatności zajmuje się Stripe – światowy lider.
              </div>
            </div>
          </div>

          {/* Kolumna prawa: Formularz płatności w glassmorphismie */}
          <div className={checkoutStyles.rightColumn}>
            <div className={checkoutStyles.glassCard}>
              
              {status === "loading" || (!clientSecret && !error) ? (
                <div className={checkoutStyles.loaderContainer}>
                  <div className={checkoutStyles.spinner} />
                  <p style={{ color: 'var(--subtext)', fontWeight: 500, letterSpacing: '0.025em', animation: 'fadeIn 1s infinite alternate' }}>
                    Łączenie z operatorem Stripe...
                  </p>
                </div>
              ) : error ? (
                <div className={checkoutStyles.errorBox}>
                  <div style={{ color: '#ff6b6b', fontSize: '1.125rem', fontWeight: 500, marginBottom: '24px' }}>{error}</div>
                  <Link href="/#cennik" className={checkoutStyles.btnPrimary}>
                    Wróć i wybierz inny plan
                  </Link>
                </div>
              ) : clientSecret ? (
                <div style={{ width: '100%', animation: 'fadeIn 0.5s ease-out forwards' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '32px', color: 'var(--foreground)', display: 'flex', alignItems: 'center' }}>
                    Dane płatności <Shield size={16} style={{ marginLeft: '8px', color: 'var(--subtext)' }} />
                  </h3>
                  <div>
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                      <CheckoutForm />
                    </Elements>
                  </div>
                </div>
              ) : null}
              
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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C0C0E', color: 'white' }}>
        Wczytywanie...
      </main>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
