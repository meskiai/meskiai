import Link from 'next/link';

export default function SecurityPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      
      {/* Navbar (Minimal) */}
      <nav style={{ width: '100%', height: '64px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Link href="/" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          &larr; Wróć na stronę główną
        </Link>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: '80px 24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          Bezpieczeństwo Twoich danych to nasz priorytet.
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '40px' }}>
          Jako firma dostarczająca zaawansowane rozwiązania doskonale wiemy, że dane to najważniejszy zasób. MESKIAI zostało zaprojektowane od podstaw z myślą o najwyższych standardach bezpieczeństwa i prywatności.
        </p>

        <div style={{ display: 'grid', gap: '32px' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>1. Szyfrowanie end-to-end</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Wszystkie dane przesyłane pomiędzy Twoją infrastrukturą a naszymi serwerami są chronione przy użyciu najnowocześniejszych protokołów TLS 1.3. Dane w spoczynku są szyfrowane za pomocą AES-256.
            </p>
          </section>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>2. Architektura Zero-Trust</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Nasz system przetwarza e-maile tylko w pamięci weryfikowanej i przechowuje wyłącznie niezbędne logi operacyjne. Nie sprzedajemy, nie udostępniamy i nie wykorzystujemy Twoich maili do trenowania publicznych modeli AI.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>3. Zgodność z RODO / GDPR</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Nasza infrastruktura znajduje się na terenie Unii Europejskiej. W pełni spełniamy wymogi RODO, zapewniając Ci kontrolę nad retencją i usuwaniem danych z systemu (Right to be Forgotten).
            </p>
          </section>
        </div>
      </main>
      
      {/* Footer (Minimal) */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px', textAlign: 'center', color: 'var(--subtext)', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} MESKIAI.
      </footer>
    </div>
  );
}
