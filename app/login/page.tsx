"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      color: '#0A2540',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Stripe Navbar Header */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navBrand} onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}>
            <img src="/logo.png" alt="MESKIAI" className={styles.navBrandImg} />
            MESKIAI
          </a>
          <div className={styles.navActions} style={{ marginLeft: 'auto' }}>
            <Link href="/" className={styles.navLink}>
              ‹ Wróć na stronę główną
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 60px',
        width: '100%'
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E6EBF1',
          borderRadius: '16px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '440px',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(10, 37, 64, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <img 
            src="/logo.png" 
            alt="MESKIAI" 
            style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '20px' }} 
          />
          
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 700, 
            color: '#0A2540', 
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            Zaloguj się do MESKIAI
          </h1>
          
          <p style={{ 
            color: '#425466', 
            marginBottom: '32px',
            fontSize: '0.95rem',
            lineHeight: 1.55
          }}>
            Dostęp do Twojego panelu klienta i wirtualnego asystenta AI.
          </p>

          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px 24px',
              background: '#635BFF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isLoggingIn ? 'wait' : 'pointer',
              opacity: isLoggingIn ? 0.7 : 1,
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(99, 91, 255, 0.35)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#4F48E2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#635BFF';
            }}
          >
            {/* Google G icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            {isLoggingIn ? 'Łączenie...' : 'Zaloguj przez Google'}
          </button>

          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '24px', margin: 0, lineHeight: 1.5 }}>
            Logując się, akceptujesz nasz <Link href="/regulamin" style={{ color: '#635BFF', textDecoration: 'none' }}>Regulamin</Link> oraz <Link href="/polityka-prywatnosci" style={{ color: '#635BFF', textDecoration: 'none' }}>Politykę Prywatności</Link>.
          </p>
        </div>
      </div>

      {/* Stripe White Footer */}
      <footer className={styles.advancedFooter}>
        <div className={styles.footerBottom} style={{ margin: 0, paddingTop: 0, borderTop: 'none' }}>
          <div>&copy; {new Date().getFullYear()} MESKIAI. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/o-nas">O nas</Link>
            <Link href="/regulamin">Regulamin</Link>
            <Link href="/polityka-prywatnosci">Prywatność</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: '#0A2540' }}>
        Ładowanie...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
