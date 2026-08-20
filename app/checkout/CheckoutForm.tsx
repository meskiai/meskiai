"use client";

import React, { useState, useCallback } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import styles from "./checkout.module.css";

const PAYMENT_ELEMENT_OPTIONS: StripePaymentElementOptions = { 
  layout: "tabs" 
};

export function CheckoutForm({ planName, clientSecret }: { planName: string, clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    // 1. Zapisz NIP w Stripe Customer jeśli został podany
    if (nip.trim() !== "") {
      try {
        const nipRes = await fetch("/api/stripe/update-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nip }),
        });
        const nipData = await nipRes.json();
        if (nipData.error) {
          console.error("Błąd zapisu NIP:", nipData.error);
        }
      } catch (err) {
        console.error("Błąd sieci przy zapisie NIP:", err);
      }
    }

    // 2. Potwierdź płatność lub ustawienie
    const isSetupIntent = clientSecret.startsWith('seti_');
    
    let error;
    
    const billingDetails: any = {};
    if (email.trim()) billingDetails.email = email.trim();
    if (phone.trim()) billingDetails.phone = phone.trim();

    const confirmParams: any = {
      return_url: `${window.location.origin}/dashboard?checkout=success`,
    };

    if (Object.keys(billingDetails).length > 0) {
      confirmParams.payment_method_data = {
        billing_details: billingDetails
      };
    }

    if (isSetupIntent) {
      const result = await stripe.confirmSetup({
        elements,
        confirmParams,
      });
      error = result.error;
    } else {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams,
      });
      error = result.error;
    }

    if (error) {
      setMessage(error.message || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    }

    setIsProcessing(false);
  };

  const handleReady = useCallback(() => setIsReady(true), []);
  const handleError = useCallback((e: any) => {
    console.error("Stripe Load Error:", e);
    setLoadError(e.error?.message || "Nieznany błąd ładowania Stripe.");
  }, []);

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      <div className={styles.formGroup}>
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.formLabel}>E-mail do faktury (Opcjonalnie)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. ksiegowosc@firma.pl"
              className={styles.formInput}
            />
          </div>
          <div className={styles.formCol}>
            <label className={styles.formLabel}>Numer telefonu (Opcjonalnie)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="np. +48 123 456 789"
              className={styles.formInput}
            />
          </div>
        </div>

        <div>
          <label className={styles.formLabel}>NIP (Opcjonalnie)</label>
          <input
            type="text"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="Podaj NIP do faktury"
            className={styles.formInput}
          />
          <p className={styles.formInputHelp}>
            Jeśli zostawisz puste, wygenerujemy zwykły rachunek.
          </p>
        </div>
      </div>

      <div className={styles.stripeFormCard}>
        {!isReady && !loadError && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
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
      >
        {isProcessing ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <div className={styles.spinner} style={{ width: "18px", height: "18px", borderWidth: "2px" }} />
            Przetwarzanie...
          </span>
        ) : (
          `Zapłać i aktywuj ${planName} ›`
        )}
      </button>
    </form>
  );
}
