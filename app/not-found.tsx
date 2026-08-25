"use client";

import Link from 'next/link';
import { Home, HelpCircle, ArrowLeft, Search, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import styles from './page.module.css';

export default function NotFound() {
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
      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        
        {/* 404 Glowing Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', background: 'rgba(99, 91, 255, 0.08)', border: '1px solid rgba(99, 91, 255, 0.15)', padding: '6px 16px', borderRadius: '20px' }}>
          <ShieldAlert size={16} color="#635BFF" /> BŁĄD 404 • STRONA NIE ZNALEZIONA
        </div>

        {/* Big 404 Typography */}
        <h1 style={{ fontSize: 'clamp(5rem, 15vw, 9rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.9, marginBottom: '24px', background: 'linear-gradient(180deg, #0A2540 0%, #635BFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </h1>

        <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.02em', marginBottom: '16px', maxWidth: '640px' }}>
          Ups! Strona, której szukasz, odpłynęła w cyfrową przestrzeń.
        </h2>

        <p style={{ fontSize: '1.1rem', color: '#425466', lineHeight: 1.6, maxWidth: '580px', marginBottom: '40px' }}>
          Adres podstrony mógł zostać zmieniony, usunięty lub wpisałeś niepoprawny adres URL. Nasz Agent AI czuwa jednak nad resztą serwisu!
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '64px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#635BFF', color: '#FFFFFF', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem', boxShadow: '0 10px 25px rgba(99, 91, 255, 0.25)', transition: 'transform 0.2s' }}>
            <Home size={18} /> Strona Główna
          </Link>

          <Link href="/centrum-pomocy" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0A2540', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem', transition: 'all 0.2s' }}>
            <HelpCircle size={18} color="#635BFF" /> Centrum Pomocy
          </Link>
        </div>

        {/* Quick Links Suggestions */}
        <div style={{ width: '100%', maxWidth: '800px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '36px 32px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A2540', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#635BFF" /> Przydatne Podstrony:
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Link href="/cennik" style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '14px', padding: '16px', textDecoration: 'none', color: '#0A2540', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Cennik &amp; Pakiety ›</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Plan Basic, Pro i Max</div>
            </Link>

            <Link href="/integracje" style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '14px', padding: '16px', textDecoration: 'none', color: '#0A2540', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Integracje ›</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Shopify, Gmail, BaseLinker</div>
            </Link>

            <Link href="/dokumentacja" style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '14px', padding: '16px', textDecoration: 'none', color: '#0A2540', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>API &amp; Dokumentacja ›</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>REST API dla deweloperów</div>
            </Link>

            <Link href="/kontakt" style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '14px', padding: '16px', textDecoration: 'none', color: '#0A2540', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Kontakt ›</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Napisz do naszego wsparcia</div>
            </Link>
          </div>
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
