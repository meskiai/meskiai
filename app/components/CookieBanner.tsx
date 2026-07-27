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
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '92%',
      maxWidth: '640px',
      background: 'var(--card-bg)',
      backdropFilter: 'saturate(200%) blur(40px)',
      WebkitBackdropFilter: 'saturate(200%) blur(40px)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      zIndex: 9999,
      boxShadow: 'var(--mac-shadow)',
      color: 'var(--foreground)'
    }} className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.3px' }}>Polityka Prywatności i Pliki Cookies</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--subtext)', lineHeight: 1.6 }}>
            Strona wykorzystuje pliki cookies w celu zapewnienia niezbędnych funkcji uwierzytelniania, optymalizacji wydajności oraz celów analitycznych. Dalsze korzystanie z serwisu oznacza pełną akceptację zasad prywatności. 
            Szczegółowe informacje znajdują się w <a href="/regulamin" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Regulaminie</a>.
          </p>
        </div>
        <button 
          onClick={() => setShowBanner(false)}
          style={{ background: 'transparent', border: 'none', color: 'var(--subtext)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
        >
          <X size={18} />
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button 
          onClick={() => setShowBanner(false)}
          style={{
            background: 'transparent',
            color: 'var(--subtext)',
            border: 'none',
            padding: '8px 16px',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Tylko niezbędne
        </button>
        <button 
          onClick={acceptCookies}
          style={{
            background: 'var(--foreground)',
            color: 'var(--background)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          Zgadzam się
        </button>
      </div>
    </div>
  );
}
