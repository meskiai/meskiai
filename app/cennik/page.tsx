"use client";

import Link from 'next/link';
import { Check, Sparkles, HelpCircle, Shield, Zap, Building2, ArrowRight } from 'lucide-react';
import styles from '../page.module.css';

export default function PricingPage() {
  const plans = [
    {
      name: "BASIC",
      price: "150",
      period: "zł / miesiąc",
      credits: "500 Kredytów AI",
      desc: "Idealny dla małych firm i freelancerów rozpoczynających automatyzację poczty.",
      badge: null,
      highlight: false,
      features: [
        "500 Kredytów AI miesięcznie",
        "1 podłączone konto e-mail (Gmail / IMAP)",
        "Autonomiczny Agent 24/7",
        "Baza wiedzy firmy (do 10 dokumentów)",
        "Wsparcie mailowe"
      ]
    },
    {
      name: "PRO",
      price: "350",
      period: "zł / miesiąc",
      credits: "2 000 Kredytów AI",
      desc: "Dla rozwijających się firm i sklepów E-commerce wymagających integracji ze sklepem.",
      badge: "NAJPOPULARNIEJSZY",
      highlight: true,
      features: [
        "2 000 Kredytów AI miesięcznie",
        "Do 3 podłączonych kont e-mail",
        "Pełne integracje E-commerce (Shopify, WooCommerce, BaseLinker)",
        "Autonomiczny Agent 24/7 z analizą zamówień",
        "Baza wiedzy firmy (Nielimitowane dokumenty)",
        "Priorytetowy czas odpowiedzi wsparcia (<2h)"
      ]
    },
    {
      name: "MAX",
      price: "700",
      period: "zł / miesiąc",
      credits: "5 000 Kredytów AI",
      desc: "Dla dużych sklepów i zespołów z masową obsługą klienta i dużą ilością zapytań.",
      badge: "MAXIMUM MOŻLIWOŚCI",
      highlight: false,
      features: [
        "5 000 Kredytów AI miesięcznie",
        "Nielimitowana liczba kont e-mail",
        "Wszystkie integracje E-commerce & Webhooki",
        "Dedykowana baza wiedzy RAG z natychmiastowym odczytem faktur",
        "Dedykowany Opiekun AI & Pomoc we wdrożeniu"
      ]
    }
  ];

  const faqs = [
    {
      q: "Czym jest Kredyt AI?",
      a: "1 Kredyt AI odpowiada wygenerowaniu jednej pełnej, precyzyjnej odpowiedzi przez Agenta AI lub przetworzeniu jednego wątku e-mail. Niewykorzystane kredyty w trialu przechodzą na kolejny okres po zakupie pakietu."
    },
    {
      q: "Jak działa 3-dniowy okres próbny?",
      a: "Po zarejestrowaniu konta otrzymujesz 3 dni darmowego dostępu oraz 50 Kredytów AI na przetestowanie systemu. Nie wymagamy podawania karty kredytowej podczas rejestracji."
    },
    {
      q: "Czy mogę w dowolnym momencie zmienić lub anulować plan?",
      a: "Tak, subskrypcją zarządzasz samodzielnie z poziomu panelu poprzez bezpieczny portal Stripe. Możesz w każdej chwili podwyższyć, obniżyć lub anulować plan bez zbędnych pytań."
    },
    {
      q: "Co się stanie, gdy skończą mi się kredyty w danym miesiącu?",
      a: "W dowolnym momencie w panelu możesz dokupić pakiet dodatkowych kredytów (Top-up) bez konieczności zmiany całego planu subskrypcji."
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

      {/* Main Content */}
      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: 700, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', background: 'rgba(99,91,255,0.08)', padding: '6px 14px', borderRadius: '20px' }}>
            PRZEJRZYSTY CENNIK &amp; SUBSKRYPCJA
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
            Proste pakiety. Zero ukrytych kosztów.
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#425466', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Zacznij od 3-dniowego darmowego okresu próbnego z 50 kredytami AI. Wybierz plan dopasowany do skali Twojej firmy.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '80px', alignItems: 'stretch' }}>
          {plans.map((p, i) => (
            <div key={i} style={{ 
              background: '#FFFFFF', 
              border: p.highlight ? '2px solid #635BFF' : '1px solid #E6EBF1', 
              borderRadius: '24px', 
              padding: '40px 32px', 
              boxShadow: p.highlight ? '0 20px 40px rgba(99, 91, 255, 0.12)' : '0 4px 20px rgba(10, 37, 64, 0.04)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between'
            }}>
              {p.badge && (
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#635BFF', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase' }}>
                  {p.badge}
                </div>
              )}
              
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A2540', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#635BFF', fontWeight: 700, marginBottom: '16px' }}>{p.credits}</div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.03em' }}>{p.price}</span>
                  <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 600 }}>{p.period}</span>
                </div>
                
                <p style={{ fontSize: '0.92rem', color: '#425466', lineHeight: 1.5, marginBottom: '28px' }}>
                  {p.desc}
                </p>

                <div style={{ height: '1px', background: '#F1F5F9', marginBottom: '28px' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {p.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.4 }}>
                      <Check size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/login" style={{ 
                display: 'block', 
                textAlign: 'center', 
                background: p.highlight ? '#635BFF' : '#0A2540', 
                color: '#FFFFFF', 
                padding: '14px 24px', 
                borderRadius: '12px', 
                fontWeight: 700, 
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}>
                Rozpocznij Trial ›
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise Banner */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '40px 36px', marginBottom: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Building2 size={24} color="#635BFF" />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>Potrzebujesz rozwiązania Enterprise?</h3>
            </div>
            <p style={{ color: '#425466', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              Dla dużych organizacji oferujemy dedykowane instancje AI, umowę SLA 99.9%, integrację z wewnętrznymi systemami ERP oraz dedykowany model z prywatną bazą wiedzy.
            </p>
          </div>
          <a href="mailto:support@meskiai.com?subject=Zapytanie Enterprise" style={{ background: '#0A2540', color: '#FFFFFF', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '0.98rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Skontaktuj się z nami <ArrowRight size={18} />
          </a>
        </div>

        {/* FAQ Section */}
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0A2540', textAlign: 'center', marginBottom: '40px' }}>
            Najczęściej zadawane pytania (FAQ)
          </h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 10px rgba(10,37,64,0.02)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2540', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={18} color="#635BFF" /> {faq.q}
                </h3>
                <p style={{ color: '#425466', fontSize: '0.96rem', lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
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
