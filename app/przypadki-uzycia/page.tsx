"use client";

import Link from 'next/link';
import { ShoppingBag, Users, Wrench, Truck, CheckCircle2, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import styles from '../page.module.css';

export default function UseCasesPage() {
  const useCases = [
    {
      icon: ShoppingBag,
      tag: "E-COMMERCE & SKLEPY INTERNETOWE",
      title: "Automatyzacja statusów zamówień, zwrotów i faktur",
      desc: "Klienci sklepów e-commerce zadają setki powtarzalnych pytań dziennie: 'Gdzie jest moja paczka?', 'Czy mogę dostać fakturę?', 'Jak dokonać zwrotu?'.",
      benefits: [
        "Bezwzględny natychmiastowy odczyt statusu przesyłki ze sklepu Shopify / WooCommerce / BaseLinker",
        "Automatyczna wysyłka duplikatów faktur PDF i instrukcji zwrotów",
        "Redukcja czasu obsługi zgłoszenia z 15 minut do 2 sekund",
        "Brak zniecierpliwionych klientów w weekendy i święta"
      ]
    },
    {
      icon: Users,
      tag: "AGENCJE MARKETINGOWE & SPRZEDAŻ B2B",
      title: "Kwalifikacja leadów i umawianie spotkań sprzedażowych",
      desc: "Agent AI weryfikuje przychodzące zapytania ofertowe, sprawdza czy klient pasuje do profilu idealnego odbiorcy i proponuje termin rozmowy.",
      benefits: [
        "Natychmiastowa odpowiedź na zapytanie ofertowe, zanim zrobi to konkurencja",
        "Zadawanie dopytujących pytań o budżet, zakres prac i termin realizacji",
        "Automatyczne przesyłanie linku do rezerwacji w kalendarzu",
        "Eliminacja niekwalifikowanych zapytań z kalendarza handlowca"
      ]
    },
    {
      icon: Wrench,
      tag: "USŁUGI, CONSULTING & KANCELARIE",
      title: "Odpowiedzi na cenniki, procedury i bazę wiedzy",
      desc: "Agent pobiera wiedzę z regulaminów, cenników i dokumentów firmy, precyzyjnie odpowiadając na skomplikowane zapytania ofertowe.",
      benefits: [
        "Udzielanie szczegółowych odpowiedzi w oparciu o bazę wiedzy RAG",
        "Płynne naśladowanie profesjonalnego i oficjalnego tonu firmy",
        "Wyjaśnianie warunków współpracy oraz wymaganych dokumentów",
        "Przekazywanie spraw trudnych i nietypowych do opiekuna z pełnym podsumowaniem"
      ]
    },
    {
      icon: Truck,
      tag: "LOGISTYKA, TRANSPORT & WSPARCIE OPERACYJNE",
      title: "Całodobowa informacja o przesyłkach i awizacjach",
      desc: "Agent utrzymuje stały kontakt z kontrahentami i kierowcami w trybie 24/7, potwierdzając godziny dostaw i awizacji.",
      benefits: [
        "Działanie w trybie nocnym i weekendowym bez przerw",
        "Automatyczne potwierdzanie numerów listów przewozowych",
        "Zmniejszenie obciążenia infolinii i skrzynki operacyjnej o 75%",
        "Pełne raportowanie przetworzonych wiadomości w panelu"
      ]
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
      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: 700, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', background: 'rgba(99,91,255,0.08)', padding: '6px 14px', borderRadius: '20px' }}>
            PRZYPADKI UŻYCIA &amp; ZASTOSOWANIA
          </div>
          <h1 style={{ fontSize: 'clamp(2.3rem, 4.8vw, 3.4rem)', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
            Rozwiązania dopasowane do Twojej branży
          </h1>
          <p style={{ fontSize: '1.18rem', color: '#425466', lineHeight: 1.6, maxWidth: '750px', margin: '0 auto' }}>
            Zobacz, jak autonomiczni agenci MESKIAI eliminują rutynową pracę i generują dodatkowe zyski w różnych sektorach biznesu.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div style={{ display: 'grid', gap: '40px', marginBottom: '80px' }}>
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 25px rgba(10, 37, 64, 0.04)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 91, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color="#635BFF" />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#635BFF', letterSpacing: '0.05em' }}>{uc.tag}</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A2540', lineHeight: 1.25, marginBottom: '14px' }}>
                    {uc.title}
                  </h2>
                  <p style={{ color: '#425466', fontSize: '1rem', lineHeight: 1.65, margin: 0 }}>
                    {uc.desc}
                  </p>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '28px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2540', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Kluczowe Korzyści:
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {uc.benefits.map((b, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                        <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div style={{ background: 'linear-gradient(135deg, #635BFF 0%, #4B45C6 100%)', borderRadius: '24px', padding: '56px 40px', color: '#FFFFFF', textAlign: 'center', boxShadow: '0 20px 40px rgba(99, 91, 255, 0.2)' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px', color: '#FFFFFF' }}>
            Chcesz wdrożyć Agenta AI w swojej firmie?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '640px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Przetestuj bezpłatnie przez 3 dni bez konieczności podawania karty kredytowej. Skonfiguruj agenta w mniej niż 5 minut.
          </p>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', color: '#635BFF', padding: '16px 36px', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '1.05rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            Rozpocznij darmowy test <ArrowRight size={20} />
          </Link>
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
