"use client";

import Link from 'next/link';
import { Cookie, Shield, CheckCircle2, Lock } from 'lucide-react';
import styles from '../page.module.css';

export default function CookiesPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', color: '#0A2540', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navBrand}>
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

      {/* Main Content */}
      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          PRAWO &amp; PRYWATNOŚĆ
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px' }}>
          Polityka Plików Cookies (Ciasteczek)
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '48px' }}>
          Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: 1.7, color: '#425466' }}>
          
          <section style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cookie size={20} color="#635BFF" /> 1. Czym są pliki cookies?
            </h2>
            <p style={{ margin: 0, fontSize: '0.96rem' }}>
              Pliki cookies (tzw. "ciasteczka") to niewielkie pliki tekstowe wysyłane przez nasz serwer i zapisywane na urządzeniu końcowym Użytkownika (komputerze, telefonie lub tablecie). Służą do prawidłowego funkcjonowania serwisu MESKIAI, utrzymania sesji logowania oraz zapewnienia bezpieczeństwa.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0A2540', marginBottom: '16px' }}>
              2. Rodzaje plików cookies wykorzystywanych w serwisie
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  A. Cookies Niezbędne (Techniczne)
                </h3>
                <p style={{ fontSize: '0.92rem', margin: 0, color: '#425466' }}>
                  Są absolutnie kluczowe dla działania aplikacji. Umożliwiają utrzymanie sesji zalogowanego użytkownika (NextAuth.js), zapamiętanie wyborów dotyczących prywatności oraz bezpieczne procesowanie płatności Stripe. Bez tych ciasteczek serwis nie może działać poprawnie.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  B. Cookies Analityczne i Wydajnościowe
                </h3>
                <p style={{ fontSize: '0.92rem', margin: 0, color: '#425466' }}>
                  Pomagają nam zrozumieć, w jaki sposób użytkownicy korzystają z serwisu, które podstrony są najpopularniejsze oraz czy występują błędy wydajnościowe. Wszystkie dane są zbierane w formie zanonimizowanej.
                </p>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>
                  C. Cookies Marketingowe (Meta Pixel)
                </h3>
                <p style={{ fontSize: '0.92rem', margin: 0, color: '#425466' }}>
                  Służą do mierzenia skuteczności kampanii reklamowych (np. Meta / Facebook Pixel). Pozwalają nam dopasować treści reklamowe do Twoich zainteresowań. Zgodę na te pliki wyrażasz poprzez banner cookies.
                </p>
              </div>
            </div>
          </section>

          <section style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>
              3. Zarządzanie i wyłączanie plików cookies
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.96rem' }}>
              Użytkownik ma prawo w każdym czasie zmienić Ustawienia dotyczące plików cookies w swojej przeglądarce internetowej. Wyłączenie plików cookies niezbędnych może jednak wpłynąć na możliwość logowania się do panelu MESKIAI.
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.92rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Google Chrome:</strong> Ustawienia &gt; Prywatność i bezpieczeństwo &gt; Pliki cookie</li>
              <li><strong>Mozilla Firefox:</strong> Opcje &gt; Prywatność i bezpieczeństwo &gt; Ciasteczka</li>
              <li><strong>Safari:</strong> Preferencje &gt; Prywatność &gt; Zablokuj wszystkie witryny</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>
              4. Kontakt w sprawach prywatności
            </h2>
            <p style={{ margin: 0, fontSize: '0.96rem' }}>
              W przypadku jakichkolwiek pytań dotyczących naszej Polityki Plików Cookies prosimy o kontakt pod adresem: <a href="mailto:support@meskiai.com" style={{ color: '#635BFF', fontWeight: 700 }}>support@meskiai.com</a>.
            </p>
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className={styles.advancedFooter}>
        <div className={styles.footerBottom} style={{ margin: 0, paddingTop: 0, borderTop: 'none' }}>
          <div>&copy; {new Date().getFullYear()} MESKIAI. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/regulamin">Regulamin</Link>
            <Link href="/polityka-prywatnosci">Prywatność</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
