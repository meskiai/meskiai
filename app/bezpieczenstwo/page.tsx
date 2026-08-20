"use client";

import Link from 'next/link';
import styles from '../page.module.css';

export default function SecurityPage() {
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
          BEZPIECZEŃSTWO &amp; PRYWATNOŚĆ
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
          Bezpieczeństwo Twoich danych to nasz priorytet.
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: '#425466', lineHeight: 1.65, marginBottom: '48px', maxWidth: '780px' }}>
          Jako platforma dostarczająca zaawansowane rozwiązania automatyzacji e-commerce doskonale wiemy, że dane to najważniejszy zasób Twojej firmy. MESKIAI zostało zaprojektowane od podstaw według najwyższych standardów bezpieczeństwa.
        </p>

        <div style={{ display: 'grid', gap: '28px' }}>
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>1. Szyfrowanie end-to-end</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.98rem' }}>
              Wszystkie dane przesyłane pomiędzy Twoją infrastrukturą a naszymi serwerami są chronione przy użyciu najnowocześniejszych protokołów TLS 1.3. Dane w spoczynku są zaszyfrowane kluczem AES-256.
            </p>
          </section>
          
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>2. Architektura Zero-Training AI</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.98rem' }}>
              Nasz system przetwarza e-maile tylko w celu wygenerowania odpowiedzi. Żadne dane Twoje ani Twoich klientów nie są wykorzystywane do trenowania publicznych modeli sztucznej inteligencji.
            </p>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>3. Zgodność z RODO / GDPR</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.98rem' }}>
              Nasza infrastruktura serwerowa znajduje się w Unii Europejskiej. W pełni spełniamy wymogi RODO, zapewniając Ci absolutną kontrolę nad retencją i usuwaniem danych z systemu.
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
            <Link href="/regulamin">Regulamin</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
