"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '600px',
      background: 'rgba(10, 10, 10, 0.98)',
      backdropFilter: 'saturate(200%) blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 9999,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      color: 'var(--foreground, #fff)'
    }} className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600 }}>Pliki Cookies 🍪</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--subtext, #a1a1aa)', lineHeight: 1.5 }}>
            Używamy plików cookies w celach uwierzytelniania, prawidłowego działania aplikacji oraz analityki. 
            Korzystając z serwisu, wyrażasz na to zgodę. Więcej informacji znajdziesz w naszym <a href="/regulamin" style={{ color: 'var(--primary, #3b82f6)', textDecoration: 'underline' }}>Regulaminie</a>.
          </p>
        </div>
        <button 
          onClick={() => setShowBanner(false)}
          style={{ background: 'transparent', border: 'none', color: 'var(--subtext)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={acceptCookies}
          style={{
            background: 'var(--foreground, #fff)',
            color: 'var(--background, #000)',
            border: 'none',
            borderRadius: '99px',
            padding: '8px 24px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Rozumiem i Akceptuję
        </button>
      </div>
    </div>
  );
}
