"use client";

import Link from 'next/link';
import { Search, BookOpen, Key, ShoppingBag, HelpCircle, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import styles from '../page.module.css';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Pierwsze Kroki & Konfiguracja Poczty",
      icon: Key,
      color: "#635BFF",
      articles: [
        { title: "Jak wygenerować Hasło Aplikacji Google dla skrzynek Gmail?", desc: "Instrukcja krok po kroku włączania 2FA i tworzenia bezpiecznego 16-literowego klucza Google." },
        { title: "Podłączanie własnej poczty IMAP / SMTP", desc: "Konfiguracja serwerów pocztowych dla własnych domen firmowych (Onet, WP, Nazwa.pl, Home.pl)." },
        { title: "Jak działa 3-dniowy darmowy okres próbny?", desc: "Informacje o 50 darmowych kredytach AI i limitach testowych." }
      ]
    },
    {
      title: "Baza Wiedzy AI & Prompty",
      icon: BookOpen,
      color: "#10B981",
      articles: [
        { title: "Jak stworzyć idealny kontekst biznesowy dla Agenta?", desc: "Dobre praktyki wpisywania cenników, regulaminów i instrukcji dla sztucznej inteligencji." },
        { title: "Ustawianie tonu odpowiedzi (Profesjonalny / Luźny / Oficjalny)", desc: "Dostosowanie stylu pisania agenta do unikalnej komunikacji Twojej marki." },
        { title: "Tryb AutoPilot 24/7 vs Zatwierdzanie Ręczne", desc: "Różnice między automatycznym wysyłaniem e-maili a generowaniem wersji roboczych (draftów)." }
      ]
    },
    {
      title: "Integracje Sklepów E-commerce",
      icon: ShoppingBag,
      color: "#A855F7",
      articles: [
        { title: "Integracja ze sklepem Shopify w 2 minuty", desc: "Podłączanie Admin API Key i automatyczny odczyt numerów przesyłek." },
        { title: "Integracja z WooCommerce & Consumer Secret", desc: "Generowanie kluczy API REST w panelu WordPress/WooCommerce." },
        { title: "Przesyłanie webhooków z BaseLinker do MESKIAI", desc: "Konfiguracja zdarzeń własnych dla wysyłki faktur i listów przewozowych." }
      ]
    },
    {
      title: "Płatności, Subskrypcje & Pomoc Techniczna",
      icon: HelpCircle,
      color: "#F59E0B",
      articles: [
        { title: "Jak dokupić dodatkowe Kredyty AI (Top-up)?", desc: "Zarządzanie kredytami bez konieczności zmiany głównego planu subskrypcji." },
        { title: "Co zrobić, gdy Agent AI nie odpowiada na maile?", desc: "Diagnozowanie błędów autoryzacji Google, wygasłych haseł i braku kredytów." },
        { title: "Jak anulować subskrypcję w portalu Stripe?", desc: "Samodzielne zarządzanie płatnościami i pobieranie faktur VAT za subskrypcję." }
      ]
    }
  ];

  const filteredCategories = categories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(art => 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.articles.length > 0);

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
        
        {/* Header with Search */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: 700, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', background: 'rgba(99,91,255,0.08)', padding: '6px 14px', borderRadius: '20px' }}>
            BAZA WIEDZY &amp; BAZA POMOCY
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '24px' }}>
            W czym możemy Ci dzisiaj pomóc?
          </h1>

          {/* Search Input */}
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <Search size={20} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Szukaj instrukcji (np. Gmail, Shopify, Kredyty, Baza wiedzy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 48px',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                fontSize: '1rem',
                color: '#0A2540',
                outline: 'none',
                boxShadow: '0 4px 20px rgba(10,37,64,0.04)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Categories & Articles Grid */}
        <div style={{ display: 'grid', gap: '40px', marginBottom: '64px' }}>
          {filteredCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={cat.color} />
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0A2540', margin: 0 }}>
                    {cat.title}
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {cat.articles.map((art, idx) => (
                    <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }} className="hover:border-indigo-300">
                      <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px', lineHeight: 1.4 }}>
                        {art.title}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                        {art.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
              <AlertCircle size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#0A2540', marginBottom: '8px' }}>Nie znaleziono instrukcji pasujących do "{searchQuery}"</h3>
              <p style={{ margin: 0 }}>Spróbuj wpisać inne słowo kluczowe lub napisz bezpośrednio do naszego wsparcia technicznego.</p>
            </div>
          )}
        </div>

        {/* Contact Support Card */}
        <div style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1E293B 100%)', borderRadius: '24px', padding: '44px 36px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>Nadal potrzebujesz pomocy?</h3>
            <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0, maxWidth: '540px', lineHeight: 1.5 }}>
              Nasz zespół wsparcia technicznego odpowiada na wiadomości e-mail w czasie krótszym niż 2 godziny.
            </p>
          </div>
          <a href="mailto:support@meskiai.com" style={{ background: '#635BFF', color: '#FFFFFF', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Napisz do Wsparcie ›
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
