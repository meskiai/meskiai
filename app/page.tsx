"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Zap, FileText, CheckCircle, Sparkles, Shield, Clock, Users, ArrowRight, Brain, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";

import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";
import styles from "./page.module.css";

const InteractiveHeroMockup = () => {
  const [text, setText] = useState('');
  const fullText = "Jak możemy usprawnić nasze procesy, by zyskać więcej czasu?";
  const aiText = "Przejmuję rutynową komunikację. Analizuję maile, odpowiadam w 0.5s i automatycznie dodaję leady do bazy. Twój zespół może skupić się na strategii.";
  const [showAi, setShowAi] = useState(false);
  const [aiTyped, setAiTyped] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowAi(true), 600);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showAi) {
      let i = 0;
      const interval = setInterval(() => {
        setAiTyped(aiText.slice(0, i));
        i++;
        if (i > aiText.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [showAi]);

  return (
    <div className={styles.heroAppMockup}>
      <div style={{ padding: '16px 24px', display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
        </div>
      </div>
      
      <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '300px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--subtext)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Wiadomość Inbound
          </div>
          <div style={{ fontSize: '1.2rem', color: 'var(--foreground)', lineHeight: 1.6, fontWeight: 500 }}>
            {text}{!showAi && <span className={styles.typingCursor} style={{ background: 'var(--foreground)' }}>|</span>}
          </div>
        </div>
        
        {showAi && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', borderLeft: '3px solid var(--accent)', paddingLeft: '24px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Sparkles size={14} /> Działanie AI w tle
            </div>
            <div style={{ fontSize: '1.1rem', color: 'var(--subtext)', lineHeight: 1.6 }}>
              {aiTyped}{aiTyped.length < aiText.length ? <span className={styles.typingCursor} style={{ background: 'var(--accent)' }}>|</span> : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InteractiveFeatures = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      title: "Natychmiastowe Odpowiedzi",
      desc: "Zamiast tracić cenne godziny, Agent AI odpisuje w ułamku sekundy. Twój klient nigdy nie czeka, a Ty śpisz spokojnie wiedząc, że obsługa działa 24/7.",
      icon: <Zap size={24} color="var(--accent)" />
    },
    {
      title: "Kontekstowa Świadomość",
      desc: "Wgraj regulaminy, opisy produktów i dokumentację. MESKIAI inteligentnie łączy te informacje, odpowiadając niczym Twój najbardziej doświadczony pracownik.",
      icon: <Brain size={24} color="#10B981" />
    },
    {
      title: "Zwiększanie Sprzedaży",
      desc: "Automatycznie zbiera e-maile, kategoryzuje zapytania i przekazuje gorące leady do Twojego zespołu sprzedażowego, zanim potencjalny klient ucieknie do konkurencji.",
      icon: <Briefcase size={24} color="#F59E0B" />
    }
  ];

  // Auto-rotate tabs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tabs.length]);

  return (
    <div className={styles.interactiveGrid}>
      <div className={styles.interactiveTabs}>
        {tabs.map((tab, idx) => (
          <div 
            key={idx}
            className={`${styles.interactiveTab} ${activeTab === idx ? styles.active : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {tab.icon}
              <h3 className={styles.tabTitle}>{tab.title}</h3>
            </div>
            <p className={styles.tabDesc}>{tab.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.interactiveVisual}>
        {activeTab === 0 && (
          <div key="tab0" className={`${styles.animItem} ${styles.animFadeIn}`} style={{ width: '80%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div style={{ fontWeight: 600 }}>Klient: Pytanie o cennik</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--subtext)' }}>14:00:00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 600 }}>
                <Sparkles size={16} /> MESKIAI odpowiada
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>14:00:01</span>
            </div>
            <div className={styles.pulseOrb} style={{ top: '-40px', right: '-40px', background: 'radial-gradient(circle, #3B82F6, transparent)' }}></div>
          </div>
        )}

        {activeTab === 1 && (
          <div key="tab1" className={`${styles.animItem} ${styles.animFadeIn}`} style={{ width: '80%', alignItems: 'center' }}>
            <Brain size={64} color="#10B981" />
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '99px', fontSize: '0.85rem' }}>Regulamin.pdf</div>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '99px', fontSize: '0.85rem' }}>Cennik_2026.csv</div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--subtext)', textAlign: 'center' }}>
              Przetwarzanie 2,000+ stron dokumentacji...
            </div>
            <div className={styles.pulseOrb} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, #10B981, transparent)' }}></div>
          </div>
        )}

        {activeTab === 2 && (
          <div key="tab2" className={`${styles.animItem} ${styles.animFadeIn}`} style={{ width: '80%' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Nowy Gorący Lead 🔥</div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontWeight: 600, color: '#F59E0B' }}>Zainteresowany pakietem Enterprise</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', marginTop: '4px' }}>kontakt@duza-firma.pl</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: 'var(--subtext)', fontSize: '0.9rem' }}>
              <CheckCircle size={16} color="#10B981" /> Dodano do CRM
            </div>
            <div className={styles.pulseOrb} style={{ bottom: '-40px', left: '-40px', background: 'radial-gradient(circle, #F59E0B, transparent)' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handlePlanSelection = (priceId: string) => {
    if (status === "authenticated") {
      router.push(`/checkout?priceId=${priceId}`);
    } else {
      localStorage.setItem('selectedPlan', JSON.stringify({ id: priceId, time: Date.now() }));
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  return (
    <main className={styles.main}>
      {/* Dynamic Background */}
      <div className={styles.ambientBackground}></div>
      <div className={styles.ambientNoise}></div>
      
      {/* Smooth Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            <img src="/logo.png" alt="MESKIAI logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            MESKIAI
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {status === "authenticated" ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link href="/dashboard" className={styles.loginBtn}>
                   Moje konto
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className={styles.navLinkBtn}>
                  Zaloguj się
                </button>
                <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className={styles.loginBtn}>
                  Zacznij za darmo
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroBadge}>
          <Bot size={16} /> Witamy w przyszłości obsługi klienta
        </div>
        <h1 className={styles.heroTitle}>
          Pracownik, <span className={styles.textGradient}>który nigdy nie śpi.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          MESKIAI to inteligentny asystent, który łączy się z Twoimi narzędziami, uczy się o Twojej firmie i załatwia rzeczywistą pracę za cały zespół.
        </p>
        <div className={styles.heroCTA}>
          <button onClick={() => handlePlanSelection(PRICE_PRO)} className={styles.btnPrimary}>
            Zacznij za darmo <ArrowRight size={20} />
          </button>
        </div>

        <div className={styles.heroVisualContainer}>
          <InteractiveHeroMockup />
        </div>
      </section>

      {/* Marquee Integrations */}
      <section className={styles.marqueeSection}>
        <div className={styles.marqueeTitle}>Płynnie łączy się z Twoim stosem technologicznym</div>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><Mail size={20}/></div> Gmail</div>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><Zap size={20}/></div> Zapier</div>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><Users size={20}/></div> Slack</div>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><FileText size={20}/></div> Notion</div>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><Bot size={20}/></div> OpenAI</div>
          </div>
          <div className={styles.marqueeTrack}>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><Mail size={20}/></div> Gmail</div>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><Zap size={20}/></div> Zapier</div>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><Users size={20}/></div> Slack</div>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><FileText size={20}/></div> Notion</div>
            <div className={styles.marqueeItem}><div className={styles.marqueeIcon}><Bot size={20}/></div> OpenAI</div>
          </div>
        </div>
      </section>

      {/* NEW INTERACTIVE FEATURE SHOWCASE */}
      <section className={styles.featureSection}>
        <div className={styles.featureHeader}>
          <h2>Zrób więcej, <span className={styles.textGradient}>szybciej.</span></h2>
          <p>MESKIAI nie jest zwykłym chatbotem. To autonomiczny agent, który rozumie kontekst, podejmuje decyzje i generuje realne zyski dla Twojej firmy.</p>
        </div>

        <InteractiveFeatures />
      </section>

      {/* Pricing Section */}
      <section id="cennik" className={styles.pricingSection}>
        <div className={styles.featureHeader}>
          <h2>Czyste i przejrzyste plany.</h2>
          <p>Wybierz model dopasowany do skali Twojej działalności. Brak ukrytych opłat.</p>
        </div>

        <div className={styles.pricingGrid}>
          {/* Basic */}
          <div className={styles.pricingCard}>
            <div className={styles.planName}>Basic</div>
            <div className={styles.planPrice}>299<span>zł / m-c</span></div>
            <p className={styles.planDesc}>Idealne na start, by zautomatyzować najczęstsze pytania.</p>
            <ul className={styles.planFeatures}>
              <li><CheckCircle size={20} /> 50 auto-odpowiedzi</li>
              <li><CheckCircle size={20} /> Podstawowa pamięć bazy wiedzy</li>
              <li><CheckCircle size={20} /> 10 wyszukań konkurencji</li>
            </ul>
            <button onClick={() => handlePlanSelection(PRICE_BASIC)} className={styles.planBtn}>Zacznij za darmo</button>
          </div>

          {/* Pro */}
          <div className={`${styles.pricingCard} ${styles.pricingPopular}`}>
            <div className={styles.popularBadge}>Najczęściej wybierany</div>
            <div className={styles.planName}>Pro</div>
            <div className={styles.planPrice}>699<span>zł / m-c</span></div>
            <p className={styles.planDesc}>Dla rozwijających się firm potrzebujących silnego asystenta.</p>
            <ul className={styles.planFeatures}>
              <li><CheckCircle size={20} /> 1000 auto-odpowiedzi</li>
              <li><CheckCircle size={20} /> Zaawansowana pamięć AI</li>
              <li><CheckCircle size={20} /> 100 wyszukań konkurencji</li>
              <li><CheckCircle size={20} /> Zmiana tonu wypowiedzi</li>
            </ul>
            <button onClick={() => handlePlanSelection(PRICE_PRO)} className={styles.planBtn}>Zacznij za darmo</button>
          </div>

          {/* Max */}
          <div className={styles.pricingCard}>
            <div className={styles.planName}>Max</div>
            <div className={styles.planPrice}>899<span>zł / m-c</span></div>
            <p className={styles.planDesc}>Brak limitów dla przedsiębiorstw dominujących rynek.</p>
            <ul className={styles.planFeatures}>
              <li><CheckCircle size={20} /> Nielimitowane auto-odpowiedzi</li>
              <li><CheckCircle size={20} /> Nielimitowane propozycje klientów</li>
              <li><CheckCircle size={20} /> Nielimitowany Cold Email</li>
              <li><CheckCircle size={20} /> Dedykowany Account Manager</li>
            </ul>
            <button onClick={() => handlePlanSelection(PRICE_MAX)} className={styles.planBtn}>Zacznij za darmo</button>
          </div>
        </div>
      </section>

      {/* Mega Footer (Professional Company Style) */}
      <footer className={styles.megaFooter}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="MESKIAI logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              MESKIAI
            </div>
            <p>Automatyzacja komunikacji, która naprawdę rozumie Twój biznes. Skup się na rozwoju, my zajmiemy się resztą.</p>
          </div>
          
          <div className={styles.footerCol}>
            <h4>Produkt</h4>
            <Link href="/#cennik">Cennik</Link>
            <Link href="/integracje">Integracje</Link>
            <Link href="/funkcje">Funkcje AI</Link>
            <Link href="/bezpieczenstwo">Bezpieczeństwo</Link>
          </div>
          
          <div className={styles.footerCol}>
            <h4>Firma</h4>
            <Link href="/o-nas">O nas</Link>
            <Link href="/kariera">Kariera</Link>
            <Link href="/blog">Blog i Aktualności</Link>
            <Link href="/partnerzy">Program Partnerski</Link>
          </div>
          
          <div className={styles.footerCol}>
            <h4>Wsparcie</h4>
            <Link href="/kontakt">Kontakt z nami</Link>
            <Link href="/pomoc">Centrum Pomocy</Link>
            <Link href="/faq">Częste pytania (FAQ)</Link>
          </div>
          
          <div className={styles.footerCol}>
            <h4>Prawne</h4>
            <Link href="/regulamin">Regulamin serwisu</Link>
            <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
            <Link href="/rodo">RODO</Link>
            <Link href="/cookies">Polityka Cookies</Link>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div>© {new Date().getFullYear()} MESKIAI. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
             Tworzone z ❤️ w Polsce.
          </div>
        </div>
      </footer>
    </main>
  );
}
