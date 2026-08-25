"use client";

import Link from 'next/link';
import { Briefcase, Rocket, Globe, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from '../page.module.css';

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior AI Systems Engineer",
      dept: "Engineering",
      location: "Zdalnie / Hybrid (Poznań)",
      type: "Pełen etat (B2B / UoP)",
      desc: "Rozwój silnika autonomicznych agentów e-mail w oparciu o modele LLM (Gemini, Claude, GPT-4), integracja RAG i optymalizacja czasu odpowiedzi poniżej 2s."
    },
    {
      title: "Fullstack Next.js / TypeScript Engineer",
      dept: "Engineering",
      location: "Zdalnie (Polska)",
      type: "Pełen etat (B2B / UoP)",
      desc: "Rozbudowa aplikacji internetowej MESKIAI, paneli analitycznych dla klientów E-commerce, integracji ze Stripe, Shopify i WooCommerce."
    },
    {
      title: "Customer Success & Onboarding Specialist",
      dept: "Operations",
      location: "Zdalnie (Polska)",
      type: "Pełen etat",
      desc: "Pomoc nowym klientom w konfiguracji baz wiedzy AI, integracji skrzynek pocztowych oraz optymalizacji skuteczności automatycznych odpowiedzi."
    },
    {
      title: "Prompt Engineer & Knowledge Base Architect",
      dept: "AI Research",
      location: "Zdalnie",
      type: "Pełen etat / Część etatu",
      desc: "Projektowanie i testowanie promptów systemowych dla agentów branżowych, dbanie o bezpieczeństwo odpowiedzi AI oraz eliminację halucynacji."
    }
  ];

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

      {/* Content */}
      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          KARIERA &amp; ZESPÓŁ MESKIAI
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
          Dołącz do zespołu, który zmienia sposób w jaki firmy rozmawiają z klientami.
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: '#425466', lineHeight: 1.65, marginBottom: '48px', maxWidth: '820px' }}>
          Budujemy najnowocześniejszą platformę autonomicznych agentów sztucznej inteligencji dla biznesu. Szukamy pasjonatów technologii, którzy chcą tworzyć produkty realnie oszczędzające tysiące godzin pracy.
        </p>

        {/* Benefits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '64px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px' }}>
            <Globe size={24} color="#635BFF" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>Praca 100% Zdalna</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Pracuj z dowolnego miejsca w Polsce lub z naszego biura. Dajemy pełną elastyczność czasu pracy.
            </p>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px' }}>
            <Rocket size={24} color="#635BFF" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>Najnowszy Stack AI</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Pracujemy na najnowszych modelach LLM, Next.js 14+, Prisma, PostgreSQL i nowoczesnej chmurze.
            </p>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px' }}>
            <Zap size={24} color="#635BFF" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '8px' }}>Brak Korpo-Procedur</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Stawiamy na autonomiczną pracę, szybkie wdrażanie pomysłów na produkcję i brak zbędnych spotkań.
            </p>
          </div>
        </div>

        {/* Job Positions List */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0A2540', marginBottom: '24px' }}>
          Otwarte stanowiska ({openPositions.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '64px' }}>
          {openPositions.map((pos, i) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#635BFF', background: 'rgba(99,91,255,0.08)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', marginRight: '8px' }}>
                    {pos.dept}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0A2540', display: 'inline-block', margin: '4px 0 0 0' }}>
                    {pos.title}
                  </h3>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748B', background: '#F1F5F9', padding: '6px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  {pos.location} • {pos.type}
                </span>
              </div>
              <p style={{ color: '#425466', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                {pos.desc}
              </p>
              <div style={{ paddingTop: '8px' }}>
                <a href={`mailto:kariera@meskiai.com?subject=Aplikacja: ${encodeURIComponent(pos.title)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#635BFF', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                  Aplikuj na to stanowisko <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Open Application CTA */}
        <div style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1E293B 100%)', borderRadius: '24px', padding: '48px 36px', color: '#FFFFFF', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px', color: '#FFFFFF' }}>Nie znalazłeś stanowiska dla siebie?</h2>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Napisz do nas bezpośrednio. Zawsze chętnie poznamy utalentowanych programistów, promptrów oraz specjalistów od obsługi klienta.
          </p>
          <a href="mailto:kariera@meskiai.com?subject=Aplikacja Spontaniczna" style={{ display: 'inline-block', background: '#635BFF', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
            Wyślij CV na kariera@meskiai.com
          </a>
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
