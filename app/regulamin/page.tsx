"use client";

import Link from 'next/link';
import styles from '../page.module.css';

export default function RegulaminPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', color: '#0A2540', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      
      {/* Stripe Navbar */}
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

      {/* Content */}
      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          DOKUMENTY PRAWNE
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px' }}>
          Regulamin Serwisu
        </h1>
        
        <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6, marginBottom: '44px' }}>
          Jasne i przejrzyste zasady korzystania z usług MESKIAI. Ostatnia aktualizacja: 24 lipca 2026.
        </p>

        <div style={{ display: 'grid', gap: '28px' }}>
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>1. Postanowienia Ogólne</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>
              Niniejszy regulamin określa zasady korzystania z aplikacji internetowej meskiai. Użytkownik zakładając konto i korzystając z usług akceptuje poniższe warunki.
            </p>
          </section>
          
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>2. Integracje API, Usługi i Sztuczna Inteligencja</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '16px' }}>
              Aplikacja meskiai świadczy usługi automatyzacji poczty e-mail oraz generowania propozycji za pomocą modeli sztucznej inteligencji. Logowanie do serwisu odbywa się za pośrednictwem bezpiecznego protokołu <strong>Google OAuth</strong>. Aplikacja wykorzystuje <strong>Gmail API</strong> do odczytu i wysyłania wiadomości oraz usługę <strong>Google Gemini AI</strong> do ich przetwarzania.
            </p>
            <div style={{ padding: '16px 20px', background: '#F5F3FF', borderLeft: '4px solid #635BFF', borderRadius: '6px', fontSize: '0.92rem', color: '#0A2540' }}>
              <strong>Uwaga dotycząca AI:</strong> Zastrzegamy, że modele sztucznej inteligencji mogą czasami generować nieprzewidywalne rezultaty. Użytkownik jest odpowiedzialny za nadzór nad wysyłanymi treściami i danymi wprowadzonymi do bazy wiedzy.
            </div>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>3. Płatności i Subskrypcje</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '12px' }}>
              Płatności obsługiwane są przez operatora zewnętrznego - firmę Stripe. Użytkownik może zrezygnować z subskrypcji w dowolnym momencie za pośrednictwem dedykowanego Portalu Klienta Stripe w zakładce "Ustawienia" wewnątrz aplikacji.
            </p>
            <ul style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '6px' }}>Opłaty za rozpoczęty okres rozliczeniowy nie podlegają zwrotowi.</li>
              <li>Nie przechowujemy danych kart kredytowych na naszych serwerach.</li>
            </ul>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>4. Pliki Cookies i Dane Osobowe</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>
              Korzystamy z plików cookies w celu utrzymania sesji logowania (NextAuth), prawidłowego funkcjonowania interfejsu oraz w celach technicznych. Dane przekazywane aplikacji są przetwarzane wyłącznie w celu świadczenia usługi asystenta AI zgodnie z Polityką Prywatności.
            </p>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>5. Odpowiedzialność</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>
              Dostawca aplikacji nie ponosi odpowiedzialności za utracone korzyści ani ewentualne szkody wynikłe z błędnych odpowiedzi wygenerowanych przez asystenta AI. W przypadku kont firmowych, odpowiedzialność jest ograniczona do kwoty zapłaconej za ostatni miesiąc subskrypcji.
            </p>
          </section>
        </div>
      </main>
      
      {/* Stripe White Footer */}
      <footer className={styles.advancedFooter}>
        <div className={styles.footerBottom} style={{ margin: 0, paddingTop: 0, borderTop: 'none' }}>
          <div>&copy; {new Date().getFullYear()} MESKIAI. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/polityka-prywatnosci">Prywatność</Link>
            <Link href="/o-nas">O nas</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
