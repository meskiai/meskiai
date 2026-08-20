"use client";

import Link from 'next/link';
import { Mail, Clock, ShieldCheck } from 'lucide-react';
import styles from '../page.module.css';

export default function ContactPage() {
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
          KONTAKT &amp; WSPARCIE
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
          Jesteśmy do Twojej dyspozycji.
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: '#425466', lineHeight: 1.65, marginBottom: '48px', maxWidth: '780px' }}>
          Masz pytania dotyczące wdrożenia MESKIAI w Twojej firmie? Potrzebujesz niestandardowej integracji lub pomocy technicznej? Napisz do nas.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', marginBottom: '48px' }}>
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, border: '1.5px solid #E0E7FF', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Mail size={20} color="#635BFF" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>Support &amp; Sprzedaż</h2>
            <p style={{ color: '#425466', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
              Odpowiadamy na zapytania e-mailowe w godzinach 9:00 - 17:00 (CET).
            </p>
            <a href="mailto:support@meskiai.com" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#635BFF', textDecoration: 'none' }}>
              support@meskiai.com ›
            </a>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, border: '1.5px solid #E0E7FF', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Clock size={20} color="#635BFF" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>Czas Odpowiedzi</h2>
            <p style={{ color: '#425466', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
              Średni czas odpowiedzi zespołu wsparcia dla zapytań e-mail wynosi poniżej 2 godzin.
            </p>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0A2540' }}>
              Szybka obsługa klienta
            </div>
          </section>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <ShieldCheck size={24} color="#635BFF" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px' }}>Dedykowane wdrożenia enterprise</h3>
            <p style={{ color: '#425466', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Dla dużych firm oferujemy dedykowane złącza API, wdrożenie z opiekunem klienta oraz podpisanie umowy NDA. Skontaktuj się z nami mailowo, aby omówić szczegóły.
            </p>
          </div>
        </div>
      </main>
      
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
