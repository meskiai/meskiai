"use client";

import { useState } from "react";
import { PaymentElement, AddressElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import styles from "./CheckoutForm.module.css";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nip, setNip] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    // Opcjonalnie zapisz NIP w backendzie przed potwierdzeniem płatności
    if (nip.trim().length > 0) {
      try {
        await fetch("/api/stripe/update-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nip: nip.trim() })
        });
      } catch (err) {
        console.warn("Failed to save NIP:", err);
      }
    }

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
        <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>Dane firmy i adres rozliczeniowy</h4>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '8px' }}>NIP (Opcjonalnie)</label>
          <input 
            type="text" 
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="np. 1234567890"
            className={styles.nipInput}
          />
        </div>

        <AddressElement 
          options={{
            mode: 'billing',
            fields: {
              phone: 'always',
            },
            validation: {
              phone: { required: 'never' }
            }
          }} 
        />
      </div>

      <div className={styles.paymentWrapper}>
        <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>Karta płatnicza</h4>
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
