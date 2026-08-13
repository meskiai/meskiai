"use client";

import React, { useState, useCallback } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import styles from "./checkout.module.css";
import { Shield } from "lucide-react";
import { useTheme } from "next-themes";

const PAYMENT_ELEMENT_OPTIONS: StripePaymentElementOptions = { 
  layout: "tabs" 
};

export function CheckoutForm({ planName, clientSecret }: { planName: string, clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
    } else {
      // Przy sukcesie user jest przekierowany przez Stripe do return_url
    }

    setIsProcessing(false);
  };

  const handleReady = useCallback(() => setIsReady(true), []);
  const handleError = useCallback((e: any) => {
    console.error("Stripe Load Error:", e);
    setLoadError(e.error?.message || "Nieznany błąd ładowania Stripe.");
  }, []);

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
    background: isDark ? "rgba(20, 20, 20, 0.5)" : "rgba(0, 0, 0, 0.02)",
    color: "var(--foreground)",
    outline: "none",
    fontSize: "1rem"
  };

  const labelStyle = { 
    display: "block", 
    fontSize: "0.875rem", 
    fontWeight: 500, 
    color: "var(--foreground)", 
    marginBottom: "8px" 
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={labelStyle}>E-mail do faktury (Opcjonalnie)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. ksiegowosc@firma.pl"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={labelStyle}>Numer telefonu (Opcjonalnie)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="np. +48 123 456 789"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>NIP (Opcjonalnie)</label>
          <input
            type="text"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="Podaj NIP do faktury"
            style={inputStyle}
          />
          <p style={{ fontSize: "0.75rem", color: "var(--subtext)", marginTop: "6px" }}>
            Jeśli zostawisz puste, wygenerujemy zwykły rachunek.
          </p>
        </div>
      </div>

      <div style={{ position: "relative", padding: "20px", borderRadius: "12px", background: isDark ? "rgba(20, 20, 20, 0.3)" : "rgba(0, 0, 0, 0.02)", border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)", minHeight: "200px" }}>
        {!isReady && !loadError && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
            <div className={styles.spinner} style={{ width: "32px", height: "32px", borderWidth: "3px" }} />
          </div>
        )}
        {loadError && (
          <div style={{ color: "#ff6b6b", fontSize: "0.875rem", padding: "12px", background: "rgba(255, 107, 107, 0.1)", borderRadius: "8px", textAlign: "center" }}>
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
        <div style={{ color: "#ff6b6b", fontSize: "0.875rem", padding: "12px", background: "rgba(255, 107, 107, 0.1)", borderRadius: "8px" }}>
          {message}
        </div>
      )}

      <button
        disabled={isProcessing || !stripe || !elements}
        className={styles.btnPrimary}
        style={{ width: "100%", padding: "16px", marginTop: "8px", fontSize: "1.125rem", position: "relative" }}
      >
        {isProcessing ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <div className={styles.spinner} style={{ width: "20px", height: "20px", borderWidth: "2px" }} />
            Przetwarzanie...
          </span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            Zapłać i odblokuj {planName}
          </span>
        )}
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--subtext)", fontSize: "0.75rem", marginTop: "-8px" }}>
        <Shield size={14} />
        Bezpieczna, szyfrowana płatność
      </div>
    </form>
  );
}
