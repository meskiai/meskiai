"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?checkout=success`,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      setIsLoading(false);
    } else {
      // Success will redirect automatically to return_url
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
      <div className="bg-[#1C1C1C]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }} 
        />
      </div>
      
      {errorMessage && (
        <div className="text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Przetwarzanie...
          </>
        ) : (
          "Zapłać bezpiecznie"
        )}
      </button>
      
      <p className="text-center text-xs text-[var(--subtext)] mt-2">
        Płatności są zabezpieczone i szyfrowane przez Stripe.
      </p>
    </form>
  );
}
