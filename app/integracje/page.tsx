"use client";

import Link from 'next/link';
import styles from '../page.module.css';

export default function IntegrationsPage() {
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
          INTEGRACJE &amp; API
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
          Integracje, które przyspieszają Twój biznes.
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: '#425466', lineHeight: 1.65, marginBottom: '48px', maxWidth: '780px' }}>
          MESKIAI zostało stworzone, aby płynnie wpasować się w Twój obecny ekosystem narzędzi e-commerce i pocztowych. Nie musisz zmieniać przyzwyczajeń zespołu, by korzystać z potęgi AI.
        </p>

        <div style={{ display: 'grid', gap: '28px' }}>
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>Skrzynki E-mail (Gmail / Outlook / IMAP)</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.98rem' }}>
              Podłącz dowolną skrzynkę pocztową obsługującą protokoły OAuth lub IMAP/SMTP. Pełna kompatybilność z Google Workspace (Gmail), Microsoft 365 (Outlook), a także prywatnymi serwerami firmowymi.
            </p>
          </section>
          
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>Platformy E-commerce (Shopify, WooCommerce, BaseLinker)</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.98rem' }}>
              MESKIAI odczytuje dane o zamówieniach, statusach paczek oraz fakturach bezpośrednio z Twojego sklepu online i odpowiada na pytania klientów w czasie rzeczywistym.
            </p>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>Dedykowane API dla Developerów</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, margin: 0, fontSize: '0.98rem' }}>
              Dla firm posiadających własne dedykowane systemy ERP lub CRM udostępniamy REST API, które pozwala na pełną kontrolę nad agentem AI z poziomu Twojego własnego kodu.
            </p>
          </section>
        </div>
      </main>
      
      {/* Stripe White Footer */}
      <footer className={styles.advancedFooter}>
        <div className={styles.footerBottom} style={{ margin: 0, paddingTop: 0, borderTop: 'none' }}>
          <div>&copy; {new Date().getFullYear()} MESKIAI. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/o-nas">O nas</Link>
            <Link href="/regulamin">Regulamin</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
