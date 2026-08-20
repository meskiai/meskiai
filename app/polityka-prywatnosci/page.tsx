"use client";

import Link from 'next/link';
import styles from '../page.module.css';

export default function PrivacyPolicyPage() {
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
          Polityka Prywatności
        </h1>
        
        <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6, marginBottom: '44px' }}>
          Przejrzyste zasady przetwarzania danych osobowych i plików cookies w aplikacji MESKIAI. Zbudowane na fundamencie absolutnego bezpieczeństwa.
        </p>

        <div style={{ display: 'grid', gap: '28px' }}>
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>1. Jakie dane zbieramy?</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '12px' }}>
              W ramach świadczenia naszych usług gromadzimy wyłącznie to, co jest niezbędne do poprawnego działania platformy:
            </p>
            <ul style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '6px' }}><strong>Dane logowania (OAuth):</strong> Adres e-mail, nazwa użytkownika oraz unikalny identyfikator udostępniony przez Google w trakcie uwierzytelniania.</li>
              <li><strong>Dane biznesowe:</strong> W ramach automatyzacji przetwarzamy zawartość wskazanych przez Ciebie wiadomości e-mail oraz dane firmowe do faktur.</li>
            </ul>
          </section>
          
          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>2. Dlaczego używamy Twoich danych?</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '12px' }}>
              Dane są używane ściśle w celu realizacji świadczonych przez nas usług premium, w szczególności do:
            </p>
            <ul style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '6px' }}>Bezpiecznego uwierzytelnienia i utrzymania ciągłości Twojej sesji (NextAuth).</li>
              <li>Świadczenia usługi wyższej konieczności: generowania trafnych odpowiedzi AI na wiadomości e-mail oraz automatycznego tworzenia plików PDF z fakturami.</li>
            </ul>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>3. Zero-Training Policy (Modele AI)</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '16px' }}>
              Korzystamy z najnowocześniejszych rozwiązań AI dostarczanych m.in. przez Google LLC (Gemini AI). Gwarantujemy jednak żelazną zasadę prywatności:
            </p>
            <div style={{ padding: '16px 20px', background: '#F5F3FF', borderLeft: '4px solid #635BFF', borderRadius: '6px', fontSize: '0.92rem', color: '#0A2540' }}>
              <strong>Żadne dane</strong> przesyłane przez Ciebie lub Twoich klientów do naszych modułów AI nie są wykorzystywane do trenowania publicznych modeli sztucznej inteligencji. Twój biznes pozostaje wyłącznie Twój.
            </div>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>4. Zgodność z Google API (Limited Use)</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '12px' }}>
              Aplikacja meskiai korzysta z dostępu do konta Gmail w celu odczytywania wiadomości i generowania automatycznych odpowiedzi zgodnie z wymogami Google API Services User Data Policy.
            </p>
            <ul style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '6px' }}><strong>Prywatność absolutna:</strong> Twoje e-maile są przetwarzane wyłącznie przez zautomatyzowane moduły AI. Żaden człowiek nie ma do nich dostępu.</li>
              <li><strong>Brak reklam:</strong> Dane pochodzące z przestrzeni roboczej Google nigdy nie są wykorzystywane do kierowania reklam ani sprzedawane podmiotom trzecim.</li>
            </ul>
          </section>

          <section style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', marginBottom: '12px' }}>5. Dostawcy zewnętrzni i Płatności</h2>
            <p style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '12px' }}>
              Korzystamy ze światowej klasy dostawców, aby zapewnić najwyższe bezpieczeństwo i niezawodność usług:
            </p>
            <ul style={{ color: '#425466', lineHeight: 1.7, fontSize: '0.95rem', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '6px' }}><strong>Stripe:</strong> Obsługa bezpiecznych płatności i subskrypcji. meskiai nigdy nie przechowuje danych Twoich kart płatniczych.</li>
              <li><strong>Hosting i Baza Danych:</strong> Szyfrowane serwery zlokalizowane na terenie Unii Europejskiej.</li>
            </ul>
          </section>
        </div>
      </main>
      
      {/* Stripe White Footer */}
      <footer className={styles.advancedFooter}>
        <div className={styles.footerBottom} style={{ margin: 0, paddingTop: 0, borderTop: 'none' }}>
          <div>&copy; {new Date().getFullYear()} MESKIAI. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/regulamin">Regulamin</Link>
            <Link href="/o-nas">O nas</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
