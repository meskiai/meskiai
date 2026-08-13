import Link from 'next/link';

export default function IntegrationsPage() {
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
          Integracje, które przyspieszają Twój biznes.
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '40px' }}>
          MESKIAI zostało stworzone, aby płynnie wpasować się w Twój obecny ekosystem narzędzi. Nie musisz zmieniać przyzwyczajeń swojego zespołu, by korzystać z potęgi AI.
        </p>

        <div style={{ display: 'grid', gap: '32px' }}>
          <section style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Skrzynki E-mail (IMAP/SMTP)</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Podłącz dowolną skrzynkę pocztową obsługującą standardy IMAP/SMTP. Pełna kompatybilność z Google Workspace (Gmail), Microsoft 365 (Outlook), a także prywatnymi hostingami jak OVH, nazwa.pl czy home.pl.
            </p>
          </section>
          
          <section style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Systemy CRM (Wkrótce)</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Już niedługo udostępnimy bezpośrednie integracje z najpopularniejszymi systemami CRM (HubSpot, Salesforce, Pipedrive). MESKIAI automatycznie utworzy leady i zaktualizuje statusy negocjacji na podstawie maili.
            </p>
          </section>

          <section style={{ padding: '24px', borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>API dla Developerów</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Dla firm posiadających własne rozwiązania wewnętrzne, udostępniamy REST API, które pozwala na pełną kontrolę nad agentem AI i wysyłką wiadomości z poziomu Twojego kodu.
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
