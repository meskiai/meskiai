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
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-2xl p-8 backdrop-blur-xl flex flex-col items-center">
            <p className="text-[var(--foreground)] mb-4 text-lg">Nieprawidłowy plan.</p>
            <Link href="/#cennik" className="text-[var(--primary)] hover:underline font-medium">
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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-32 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 animate-fade-in-up">
          
          {/* Kolumna lewa: Podsumowanie w glassmorphismie */}
          <div className="w-full lg:w-[45%] flex flex-col bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-[32px] p-8 lg:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            
            <Link href="/#cennik" className="inline-flex items-center text-sm text-[var(--subtext)] hover:text-[var(--foreground)] transition-colors mb-10 w-max z-10">
              <ArrowLeft size={16} className="mr-2" />
              Wróć do cennika
            </Link>
            
            <div className="z-10 flex-grow">
              <h2 className="text-xs font-bold text-[var(--primary)] tracking-widest uppercase mb-3">
                Podsumowanie zamówienia
              </h2>
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 text-[var(--foreground)]">
                {plan.name}
              </h1>
              <div className="text-2xl font-light mb-8 text-[var(--foreground)]">
                {plan.price} <span className="text-sm text-[var(--subtext)]">/ miesięcznie</span>
              </div>
              
              <p className="text-[var(--subtext)] mb-8 leading-relaxed text-sm lg:text-base">
                {plan.desc}
              </p>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-[var(--foreground)] opacity-90">
                    <CheckCircle size={18} className="text-[var(--primary)] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto flex items-start gap-4 p-5 rounded-2xl bg-[var(--background)] border border-[var(--glass-border)] z-10">
              <Shield size={20} className="text-[var(--primary)] shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--subtext)] leading-relaxed">
                <span className="text-[var(--foreground)] font-semibold block mb-1">Gwarancja bezpieczeństwa</span>
                Dane Twojej karty są zaszyfrowane. Przetwarzaniem płatności zajmuje się Stripe – światowy lider.
              </div>
            </div>
          </div>

          {/* Kolumna prawa: Formularz płatności w glassmorphismie */}
          <div className="w-full lg:w-[55%] flex items-center justify-center">
            <div className="w-full bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-[32px] p-8 lg:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
              
              {status === "loading" || (!clientSecret && !error) ? (
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin opacity-80" />
                  <p className="text-[var(--subtext)] font-medium tracking-wide animate-pulse">
                    Łączenie z operatorem Stripe...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center flex flex-col items-center">
                  <div className="text-red-400 text-lg font-medium mb-6">{error}</div>
                  <Link href="/#cennik" className="inline-block bg-[var(--background)] border border-[var(--glass-border)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] px-6 py-3 rounded-xl transition-all duration-300 font-medium">
                    Wróć i wybierz inny plan
                  </Link>
                </div>
              ) : clientSecret ? (
                <div className="animate-fade-in-up w-full">
                  <h3 className="text-xl font-bold mb-8 text-[var(--foreground)] flex items-center">
                    Dane płatności <Shield size={16} className="ml-2 text-[var(--subtext)]" />
                  </h3>
                  <div className="stripe-container">
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
