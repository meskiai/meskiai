"use client";

import React, { useState, useCallback } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import styles from "../checkout/checkout.module.css";

const PAYMENT_ELEMENT_OPTIONS: StripePaymentElementOptions = { 
  layout: "tabs" 
};

export function TopUpCheckoutForm({ amountText }: { amountText: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?topup=success`,
      },
    });

    if (result.error) {
      setMessage(result.error.message || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    }

    setIsProcessing(false);
  };

  const handleReady = useCallback(() => setIsReady(true), []);
  const handleError = useCallback((e: any) => {
    setLoadError(e.error?.message || "Nieznany błąd ładowania Stripe.");
  }, []);

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
      <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>{amountText}</h3>
      <p style={{ margin: "-12px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
        Rozliczenia obsługuje bezpieczna bramka Stripe. Podaj dane karty lub wybierz BLIK.
      </p>

      <div className={styles.stripeFormCard} style={{ margin: 0, padding: 0, border: "none", boxShadow: "none" }}>
        {!isReady && !loadError && (
          <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
            <div className={styles.spinner} />
          </div>
        )}
        {loadError && (
          <div style={{ color: "#EF4444", fontSize: "0.88rem", padding: "12px", background: "#FEF2F2", borderRadius: "8px", textAlign: "center" }}>
            Błąd ładowania formularza Stripe: {loadError}
          </div>
        )}
        <div style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s ease" }}>
          <PaymentElement 
            options={PAYMENT_ELEMENT_OPTIONS} 
            onReady={handleReady} 
            onLoadError={handleError}
          />
        </div>
      </div>

      {message && (
        <div style={{ color: "#EF4444", fontSize: "0.88rem", padding: "12px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px" }}>
          {message}
        </div>
      )}

      <button
        disabled={isProcessing || !stripe || !elements}
        className={styles.btnSubmit}
        style={{ padding: "14px", borderRadius: "8px", background: "#635BFF", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        {isProcessing ? "Przetwarzanie..." : `Zapłać 20,00 zł`}
      </button>
    </form>
  );
}
