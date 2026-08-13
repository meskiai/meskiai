"use client";

import { ThemeToggle } from "../components/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegulaminPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => router.push('/')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--subtext)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={18} /> Wróć do strony głównej
          </button>
          <ThemeToggle />
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.03em' }}>Regulamin Serwisu</h1>
        <p style={{ color: 'var(--subtext)', marginBottom: '40px', lineHeight: 1.6 }}>Ostatnia aktualizacja: 24 lipca 2026</p>

        <div style={{ lineHeight: 1.8, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>1. Postanowienia Ogólne</h2>
            <p>
              Niniejszy regulamin określa zasady korzystania z aplikacji internetowej meskiai. 
              Użytkownik zakładając konto i korzystając z usług akceptuje poniższe warunki.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>2. Integracje API, Usługi i Sztuczna Inteligencja</h2>
            <p>
              Aplikacja meskiai świadczy usługi automatyzacji poczty e-mail oraz generowania propozycji B2B za pomocą 
              modeli sztucznej inteligencji. Logowanie do serwisu odbywa się za pośrednictwem bezpiecznego protokołu <strong>Google OAuth</strong>.
              Aplikacja wykorzystuje <strong>Gmail API</strong> (za wyraźną zgodą Użytkownika) do odczytu i wysyłania wiadomości oraz 
              usługę <strong>Google Gemini AI</strong> do ich przetwarzania. Cała infrastruktura serwerowa hostowana jest na niezawodnych platformach 
              <strong>Netlify</strong> oraz <strong>Vercel</strong>, a zaszyfrowane dane przetrzymywane są w bazie <strong>Neon (PostgreSQL)</strong>.
            </p>
            <p style={{ marginTop: '12px' }}>
              Zastrzegamy, że modele AI mogą czasami generować nieprzewidywalne rezultaty. 
              Użytkownik jest odpowiedzialny za nadzór nad wysyłanymi treściami i danymi wprowadzanymi do bazy wiedzy.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>3. Płatności i Subskrypcje</h2>
            <p>
              Płatności obsługiwane są przez operatora zewnętrznego - firmę Stripe. 
              Użytkownik może zrezygnować z subskrypcji w dowolnym momencie za pośrednictwem dedykowanego 
              Portalu Klienta Stripe w zakładce "Ustawienia" wewnątrz aplikacji. 
              Opłaty za rozpoczęty okres rozliczeniowy nie podlegają zwrotowi, chyba że obowiązujące prawo konsumenckie stanowi inaczej.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>4. Pliki Cookies i Dane Osobowe</h2>
            <p>
              Korzystamy z plików cookies (tzw. ciasteczek) w celu utrzymania sesji logowania (NextAuth), 
              prawidłowego funkcjonowania interfejsu oraz w celach analitycznych. Dane przekazywane aplikacji 
              (w tym treść wiadomości e-mail) są przetwarzane wyłącznie w celu świadczenia usługi asystenta AI.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>5. Odpowiedzialność</h2>
            <p>
              Dostawca aplikacji nie ponosi odpowiedzialności za utracone korzyści ani ewentualne szkody wynikłe 
              z błędnych odpowiedzi wygenerowanych przez asystenta AI. W przypadku kont B2B, odpowiedzialność 
              jest ograniczona do kwoty zapłaconej za ostatni miesiąc subskrypcji.
            </p>
          </section>

        </div>
        
      </div>
    </div>
  );
}
