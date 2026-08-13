import Link from 'next/link';

export default function RegulaminPage() {
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
          Regulamin Serwisu
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '40px' }}>
          Jasne i przejrzyste zasady korzystania z usług MESKIAI. Ostatnia aktualizacja: 24 lipca 2026.
        </p>

        <div style={{ display: 'grid', gap: '32px' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>1. Postanowienia Ogólne</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Niniejszy regulamin określa zasady korzystania z aplikacji internetowej meskiai. 
              Użytkownik zakładając konto i korzystając z usług akceptuje poniższe warunki.
            </p>
          </section>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>2. Integracje API, Usługi i Sztuczna Inteligencja</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '12px' }}>
              Aplikacja meskiai świadczy usługi automatyzacji poczty e-mail oraz generowania propozycji za pomocą 
              modeli sztucznej inteligencji. Logowanie do serwisu odbywa się za pośrednictwem bezpiecznego protokołu <strong>Google OAuth</strong>.
              Aplikacja wykorzystuje <strong>Gmail API</strong> (za wyraźną zgodą Użytkownika) do odczytu i wysyłania wiadomości oraz 
              usługę <strong>Google Gemini AI</strong> do ich przetwarzania.
            </p>
            <div style={{ padding: '16px', background: 'var(--card-bg)', borderLeft: '4px solid var(--primary)', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--foreground)' }}>
              <strong>Uwaga dotycząca AI:</strong> Zastrzegamy, że modele sztucznej inteligencji mogą czasami generować nieprzewidywalne rezultaty. Użytkownik jest odpowiedzialny za nadzór nad wysyłanymi treściami i danymi wprowadzonymi do bazy wiedzy.
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>3. Płatności i Subskrypcje</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '12px' }}>
              Płatności obsługiwane są przez operatora zewnętrznego - firmę Stripe. 
              Użytkownik może zrezygnować z subskrypcji w dowolnym momencie za pośrednictwem dedykowanego 
              Portalu Klienta Stripe w zakładce "Ustawienia" wewnątrz aplikacji. 
            </p>
            <ul style={{ color: 'var(--subtext)', lineHeight: 1.6, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Opłaty za rozpoczęty okres rozliczeniowy nie podlegają zwrotowi, chyba że obowiązujące prawo konsumenckie stanowi inaczej.</li>
              <li style={{ marginBottom: '8px' }}>Nie przechowujemy danych kart kredytowych na naszych serwerach.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>4. Pliki Cookies i Dane Osobowe</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Korzystamy z plików cookies (tzw. ciasteczek) w celu utrzymania sesji logowania (NextAuth), 
              prawidłowego funkcjonowania interfejsu oraz w celach technicznych. Dane przekazywane aplikacji 
              (w tym treść wiadomości e-mail) są przetwarzane wyłącznie w celu świadczenia usługi asystenta AI zgodnie z Polityką Prywatności.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>5. Odpowiedzialność</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Dostawca aplikacji nie ponosi odpowiedzialności za utracone korzyści ani ewentualne szkody wynikłe 
              z błędnych odpowiedzi wygenerowanych przez asystenta AI. W przypadku kont firmowych, odpowiedzialność 
              jest ograniczona do kwoty zapłaconej za ostatni miesiąc subskrypcji.
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
