"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import styles from "./CheckoutForm.module.css";

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
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.paymentWrapper}>
        <PaymentElement 
          options={{
            layout: 'tabs',
          }} 
        />
      </div>
      
      {errorMessage && (
        <div className={styles.errorBox}>
          {errorMessage}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        className={styles.submitBtn}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" style={{ animation: "spin 1s linear infinite" }} size={20} />
            Przetwarzanie...
          </>
        ) : (
          "Zapłać bezpiecznie"
        )}
      </button>
      
      <p className={styles.secureText}>
        Płatności są zabezpieczone i szyfrowane przez Stripe.
      </p>
    </form>
  );
}
