import Link from 'next/link';

export default function AboutPage() {
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
          O Nas: Tworzymy przyszłość.
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '40px' }}>
          Jesteśmy zespołem inżynierów i specjalistów od sprzedaży, którzy zauważyli jeden fundamentalny problem: polskie (i zagraniczne) firmy tracą tysiące godzin rocznie na odpisywanie na powtarzalne e-maile. Zamiast budować relacje, zespoły handlowe pełnią rolę żywych filtrów antyspamowych.
        </p>

        <div style={{ display: 'grid', gap: '32px' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Nasza Misja</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Naszą misją w MESKIAI jest całkowite zautomatyzowanie pierwszego kontaktu biznesowego. Chcemy, aby sprzedawcy rozmawiali tylko z osobami, które są już zainteresowane zakupem i mają gotową wycenę. AI ma przejąć całą "czarną robotę".
            </p>
          </section>
          
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Podejście Premium</h2>
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6 }}>
              Nie jesteśmy kolejnym chatbotem. Jesteśmy agentem asynchronicznym. Nasz system pisze maile tak dobrze, że odbiorcy nie są w stanie rozróżnić ich od wiadomości napisanej przez doświadczonego handlowca. Stawiamy na jakość, bezbłędność i dyskrecję.
            </p>
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
