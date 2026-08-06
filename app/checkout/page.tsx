"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import { CheckCircle, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function CheckoutPage() {
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
      <div className="min-h-screen flex items-center justify-center bg-[#0C0C0E] text-white">
        <p>Nieprawidłowy plan. <Link href="/#cennik" className="text-blue-500 underline">Wróć do cennika</Link></p>
      </div>
    );
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#1c1c1c',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '12px',
    },
    rules: {
      '.Input': {
        backgroundColor: '#2a2a2a',
        border: '1px solid #333',
        boxShadow: 'none',
      },
      '.Input:focus': {
        border: '1px solid #3b82f6',
        boxShadow: '0 0 0 1px #3b82f6',
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white flex flex-col md:flex-row relative selection:bg-blue-500/30">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Kolumna lewa: Podsumowanie (widoczna też na mobilkach na górze) */}
      <div className="w-full md:w-[45%] lg:w-[40%] p-8 md:p-12 lg:p-20 flex flex-col z-10 border-b md:border-b-0 md:border-r border-white/10 bg-[#0C0C0E]/50 backdrop-blur-md">
        <Link href="/#cennik" className="inline-flex items-center text-sm text-[var(--subtext)] hover:text-white transition-colors mb-12 w-max">
          <ArrowLeft size={16} className="mr-2" />
          Wróć do cennika
        </Link>
        
        <h2 className="text-sm font-semibold text-blue-500 tracking-wider uppercase mb-2">Podsumowanie zamówienia</h2>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {plan.name}
        </h1>
        <div className="text-3xl font-light mb-8 text-white">{plan.price} <span className="text-base text-[var(--subtext)]">/ miesięcznie</span></div>
        
        <p className="text-[var(--subtext)] mb-10 leading-relaxed text-lg">
          {plan.desc}
        </p>

        <div className="space-y-4 mb-auto">
          {plan.features.map((feature: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 text-sm md:text-base text-gray-300">
              <CheckCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <Shield size={24} className="text-blue-400" />
          <div className="text-sm text-gray-400">
            <span className="text-white font-medium block">Gwarancja bezpiecznej płatności</span>
            Dane Twojej karty są szyfrowane i przetwarzane bezpośrednio przez Stripe.
          </div>
        </div>
      </div>

      {/* Kolumna prawa: Formularz płatności */}
      <div className="w-full md:w-[55%] lg:w-[60%] p-8 md:p-12 lg:p-20 flex items-center justify-center z-10">
        <div className="w-full max-w-md">
          {status === "loading" || (!clientSecret && !error) ? (
            <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <p>Inicjalizacja bezpiecznej płatności...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center">
              <div className="text-red-400 text-lg font-medium mb-4">{error}</div>
              <Link href="/#cennik" className="inline-block bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition-colors">
                Wróć i wybierz inny plan
              </Link>
            </div>
          ) : clientSecret ? (
            <div className="animate-fade-in-up">
              <h3 className="text-2xl font-bold mb-8 text-center">Dane płatności</h3>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                <CheckoutForm />
              </Elements>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
