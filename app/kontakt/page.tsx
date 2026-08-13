import Link from 'next/link';

export default function ContactPage() {
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
          Kontakt
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '40px' }}>
          Masz pytania dotyczące wdrożenia MESKIAI w Twojej firmie? Potrzebujesz niestandardowego limitu e-maili? Jesteśmy do Twojej dyspozycji.
        </p>

        <div style={{ display: 'grid', gap: '32px' }}>
          <section style={{ padding: '32px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Support & Sprzedaż</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '16px' }}>
              Odpowiadamy w godzinach 9:00 - 17:00 (CET). Średni czas odpowiedzi dla zapytań e-mail wynosi 2 godziny.
            </p>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              <a href="mailto:support@meskiai.com" style={{ color: 'var(--foreground)', textDecoration: 'none' }}>support@meskiai.com</a>
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer (Minimal) */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px', textAlign: 'center', color: 'var(--subtext)', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} MESKIAI. Zaprojektowano w Polsce.
      </footer>
    </div>
  );
}
