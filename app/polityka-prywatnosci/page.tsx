import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          Polityka Prywatności
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '40px' }}>
          Przejrzyste zasady przetwarzania danych osobowych i plików cookies w aplikacji MESKIAI. Zbudowane na fundamencie absolutnego bezpieczeństwa.
        </p>

        <div style={{ display: 'grid', gap: '32px' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>1. Jakie dane zbieramy?</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '12px' }}>W ramach świadczenia naszych usług gromadzimy wyłącznie to, co jest niezbędne do poprawnego działania platformy:</p>
            <ul style={{ color: 'var(--subtext)', lineHeight: 1.6, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Dane logowania (OAuth):</strong> Adres e-mail, nazwa użytkownika oraz unikalny identyfikator udostępniony przez Google w trakcie uwierzytelniania.</li>
              <li style={{ marginBottom: '8px' }}><strong>Dane biznesowe:</strong> W ramach automatyzacji przetwarzamy zawartość wskazanych przez Ciebie wiadomości e-mail oraz dane firmowe do faktur.</li>
            </ul>
          </section>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>2. Dlaczego używamy Twoich danych?</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '12px' }}>Dane są używane ściśle w celu realizacji świadczonych przez nas usług premium, w szczególności do:</p>
            <ul style={{ color: 'var(--subtext)', lineHeight: 1.6, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Bezpiecznego uwierzytelnienia i utrzymania ciągłości Twojej sesji (NextAuth).</li>
              <li style={{ marginBottom: '8px' }}>Świadczenia usługi wyższej konieczności: generowania trafnych odpowiedzi AI na wiadomości e-mail oraz automatycznego tworzenia plików PDF z fakturami.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>3. Zero-Training Policy (Modele AI)</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '12px' }}>Korzystamy z najnowocześniejszych rozwiązań AI dostarczanych m.in. przez Google LLC (Gemini AI). Gwarantujemy jednak żelazną zasadę prywatności:</p>
            <div style={{ padding: '16px', background: 'var(--card-bg)', borderLeft: '4px solid var(--primary)', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--foreground)' }}>
              <strong>Żadne dane</strong> przesyłane przez Ciebie lub Twoich klientów do naszych modułów AI nie są wykorzystywane do trenowania publicznych modeli sztucznej inteligencji. Twój biznes pozostaje wyłącznie Twój.
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>4. Zgodność z Google API (Limited Use)</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '12px' }}>
              Aplikacja meskiai korzysta z dostępu do konta Gmail w celu odczytywania wiadomości i generowania automatycznych odpowiedzi. 
              Wykorzystanie i przekazywanie do jakiejkolwiek innej aplikacji informacji otrzymanych z interfejsów API Google będzie ściśle 
              przestrzegać <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline', color: 'var(--primary, #3b82f6)'}}>Zasad dotyczących danych użytkowników usług API Google</a> (Google API Services User Data Policy), w tym wymogów dotyczących ograniczonego użycia (Limited Use requirements).
            </p>
            <ul style={{ color: 'var(--subtext)', lineHeight: 1.6, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Prywatność absolutna:</strong> Twoje e-maile są przetwarzane wyłącznie przez zautomatyzowane moduły AI w celu wygenerowania odpowiedzi. Żaden człowiek nie ma do nich dostępu.</li>
              <li style={{ marginBottom: '8px' }}><strong>Brak reklam:</strong> Dane pochodzące z przestrzeni roboczej Google (w tym e-maile) nigdy nie są wykorzystywane do kierowania reklam ani sprzedawane brokerom danych.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>5. Dostawcy zewnętrzni i Płatności</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '12px' }}>Korzystamy ze światowej klasy dostawców, aby zapewnić najwyższe bezpieczeństwo i niezawodność usług:</p>
            <ul style={{ color: 'var(--subtext)', lineHeight: 1.6, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Stripe:</strong> Obsługa bezpiecznych płatności i subskrypcji. meskiai nigdy nie przechowuje danych Twoich kart płatniczych.</li>
              <li style={{ marginBottom: '8px' }}><strong>Vercel / Netlify / Neon:</strong> Hosting aplikacji, utrzymanie systemów w trybie 24/7 oraz szyfrowana baza danych na terenie Unii Europejskiej.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>6. Czyste Pliki Cookies</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Nasz system używa plików cookies wyłącznie w celach technicznych i utrzymania bezpieczeństwa (tzw. <em>Strictly Necessary Cookies</em>). Służą one do zachowania Twojej sesji logowania. 
              <strong> Nie stosujemy</strong> inwazyjnych skryptów śledzących, nie handlujemy danymi analitycznymi i nie sprzedajemy profilu użytkownika podmiotom trzecim.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>7. Pełnia Twoich Praw (RODO)</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '12px' }}>Zgodnie z ogólnym rozporządzeniem o ochronie danych (RODO) przysługuje Ci absolutne prawo do kontroli nad swoimi informacjami. Masz prawo do:</p>
            <ul style={{ color: 'var(--subtext)', lineHeight: 1.6, paddingLeft: '20px', marginBottom: '12px' }}>
              <li style={{ marginBottom: '8px' }}>Dostępu do swoich danych oraz otrzymania ich czytelnej kopii.</li>
              <li style={{ marginBottom: '8px' }}>Natychmiastowego sprostowania oraz ograniczenia przetwarzania.</li>
              <li style={{ marginBottom: '8px' }}>Bezwzględnego usunięcia danych z naszych serwerów (Prawo do bycia zapomnianym) oraz cofnięcia uprawnień Google w dowolnym momencie.</li>
            </ul>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>Aby zrealizować swoje prawa, wystarczy skontaktować się z nami z poziomu panelu klienta.</p>
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
