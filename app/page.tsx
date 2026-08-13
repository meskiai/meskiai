"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Zap, FileText, Settings, ArrowRight, CheckCircle, Sparkles, Shield, Clock, Users, BookOpen, LogOut, Home as HomeIcon, Globe, Inbox, Sliders, BarChart2, ChevronDown, Target, ShoppingBag } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";
import styles from "./page.module.css";

const TypingEmail = () => {
  const [text, setText] = useState('');
  const fullText = "Dzień dobry, na czym właściwie polega MESKIAI i jak może pomóc mojej firmie?";
  const aiText = "Dzień dobry. MESKIAI to Twój nowy pracownik AI. Przejmujemy obsługę zapytań klientów w trybie 24/7 oraz automatyzujemy pozyskiwanie kontaktów biznesowych. Wszystko odbywa się bezobsługowo, uwalniając Twój czas.";
  const [showAi, setShowAi] = useState(false);
  const [aiTyped, setAiTyped] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowAi(true), 500);
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showAi) {
      let i = 0;
      const interval = setInterval(() => {
        setAiTyped(aiText.slice(0, i));
        i++;
        if (i > aiText.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    }
  }, [showAi]);

  return (
    <div className={styles.mockMailApp} style={{ flexDirection: 'column', padding: '0', height: 'auto', minHeight: '300px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--mac-shadow)', backdropFilter: 'blur(20px)' }}>
      {/* Window Header */}
      <div style={{ padding: '12px 20px', display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--subtext)', opacity: 0.5 }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--subtext)', opacity: 0.5 }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--subtext)', opacity: 0.5 }}></div>
        </div>
      </div>
      
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--subtext)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span>Klient</span>
            <span style={{ opacity: 0.5 }}>[INBOUND]</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', lineHeight: 1.6 }}>
            {text}{!showAi && <span className={styles.typingCursor} style={{ background: 'var(--foreground)' }}>|</span>}
          </div>
        </div>
        
        {showAi && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', marginTop: '12px', borderLeft: '2px solid var(--accent)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Sparkles size={12} /> MESKIAI <span style={{ opacity: 0.5, color: 'var(--subtext)', fontWeight: 400 }}>[GENERATING]</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
              {aiTyped}{aiTyped.length < aiText.length ? <span className={styles.typingCursor} style={{ background: 'var(--accent)' }}>|</span> : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPriceId, setCurrentPriceId] = useState<string | null>(null);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCheckout = async (priceId: string) => {
    setLoadingPriceId(priceId);
    // Przekierowanie na customową stronę płatności Stripe Elements
    router.push(`/checkout?priceId=${priceId}`);
  };

  const handlePlanSelection = async (priceId: string) => {
    if (status === "authenticated") {
      await handleCheckout(priceId);
    } else {
      localStorage.setItem('selectedPlan', JSON.stringify({ id: priceId, time: Date.now() }));
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };
  const [activeFeature, setActiveFeature] = useState('agent');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 4 ? prev + 1 : 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);


  useEffect(() => {
    const features = ['agent', 'cold', 'swot', 'security'];
    const interval = setInterval(() => {
      setActiveFeature((prev) => {
        const nextIndex = (features.indexOf(prev) + 1) % features.length;
        return features[nextIndex];
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/settings").then(res => res.json()).then(data => {
        if (data.subscriptionData && ['active', 'trialing', 'incomplete'].includes(data.subscriptionData.subscriptionStatus)) {
          setCurrentPriceId(data.subscriptionData.stripePriceId);
        }
      }).catch(console.error);
    }
  }, [status]);

  const getTier = (priceId: string | null) => {
    if (!priceId) return 0;
    if (priceId === PRICE_MAX) return 3;
    if (priceId === PRICE_PRO) return 2;
    if (priceId === PRICE_BASIC) return 1;
    return 0;
  };

  const userTier = getTier(currentPriceId);

  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.ambientBackground}></div>
      
      {/* Navigation - Apple Style */}
      <nav className={`${styles.nav} animate-fade-in`}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <img
              src="/logo.png"
              alt="MESKIAI logo"
              style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'var(--logo-filter)', mixBlendMode: 'var(--logo-blend-mode)' as any }}
            />
            <span>MESKIAI</span>
          </div>
          
          <div className={styles.navActions}>

            {status === "authenticated" ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className={styles.avatarBtn}
                  style={{ outline: showUserMenu ? '2px solid var(--primary)' : 'none', outlineOffset: '2px' }}
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                        {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div
                    className="animate-fade-in"
                    style={{
                      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                      background: 'var(--card-bg)', backdropFilter: 'saturate(200%) blur(40px)',
                      WebkitBackdropFilter: 'saturate(200%) blur(40px)',
                      border: '1px solid var(--glass-border)', borderRadius: '20px',
                      padding: '8px', width: '240px',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                      zIndex: 100
                    }}
                  >
                    {/* User info */}
                    <div style={{ padding: '12px 16px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)', marginBottom: '2px' }}>
                        {session?.user?.name || session?.user?.email?.split('@')[0]}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--subtext)', wordBreak: 'break-all' }}>
                        {session?.user?.email}
                      </div>
                    </div>

                    {/* Menu items */}
                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', borderRadius: '12px', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', transition: 'background 0.15s', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HomeIcon size={16} style={{ color: 'var(--subtext)' }} /> Panel
                    </Link>
                    <Link
                      href="/dashboard?tab=account"
                      onClick={() => setShowUserMenu(false)}
                      style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', borderRadius: '12px', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', transition: 'background 0.15s', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Settings size={16} style={{ color: 'var(--subtext)' }} /> Ustawienia Konta
                    </Link>

                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', borderRadius: '12px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> Wyloguj się
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className={styles.ctaBtnSecondary}
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Zaloguj się
                </button>
                <button
                  className={styles.loginBtn}
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Załóż darmowe konto
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>

        <h1 className={`${styles.heroTitle} animate-fade-in animate-delay-1`}>
          Zatrudnij AI. <br />Uwolnij swój czas.
        </h1>
        
        <h2 className={`${styles.heroSubtitle} animate-fade-in animate-delay-2`}>
          Pierwszy w pełni autonomiczny asystent e-mail. System zdejmuje z Ciebie ciężar rutynowej komunikacji, gwarantując błyskawiczne i bezpieczne odpowiedzi 24/7.
        </h2>
        
        <div className={`${styles.ctaWrapper} animate-fade-in animate-delay-3`}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{textDecoration: 'none'}}>
              Przejdź do Panelu <ArrowRight size={18} />
            </Link>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button className={styles.ctaBtnPrimary} onClick={() => signIn("google", { callbackUrl: "/dashboard" })} style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
                  Rozpocznij 7-dniowy okres próbny
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Live AI Demo Section */}
      <section style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>Zaprojektowany, by działać w tle.</h2>
            <p style={{ color: 'var(--subtext)', marginTop: '12px', fontSize: '1.05rem' }}>Zobacz, jak system samodzielnie obsługuje zapytania Twoich klientów.</p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }}></div>
            <TypingEmail />
          </div>
        </div>
      </section>

      {/* Active Tasks Animation Panel */}
      <section style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
            Pracuje dla Ciebie. Zawsze.
          </h2>
          <p style={{ color: 'var(--subtext)', fontSize: '1.1rem', marginTop: '12px' }}>
            System automatycznie analizuje zapytania, tworzy szkice i zarządza kontaktami.
          </p>
        </div>

        <div className={styles.animatedPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelDots}>
              <span style={{background: '#ff5f56'}}></span>
              <span style={{background: '#ffbd2e'}}></span>
              <span style={{background: '#27c93f'}}></span>
            </div>
            <div className={styles.panelTitle}>Terminal MESKIAI</div>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.taskSidebar}>
              <div className={`${styles.taskItem} ${activeFeature === 'agent' ? styles.activeTask : ''}`}>
                <Mail size={16} /> Analiza skrzynki
              </div>
              <div className={`${styles.taskItem} ${activeFeature === 'cold' ? styles.activeTask : ''}`}>
                <Target size={16} /> Pozyskiwanie leadów
              </div>
              <div className={`${styles.taskItem} ${activeFeature === 'security' ? styles.activeTask : ''}`}>
                <Shield size={16} /> Ochrona spamu
              </div>
            </div>
            <div className={styles.taskContent}>
              {activeFeature === 'agent' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'monospace' }}>
                  <div className={styles.logLine}><span className={styles.logTime}>10:42:01</span> <span className={styles.logInfo}>[INBOX]</span> Nowe zapytanie ofertowe od biuro@klient.pl</div>
                  <div className={styles.logLine} style={{ animationDelay: '1s' }}><span className={styles.logTime}>10:42:02</span> <span className={styles.logAction}>[AI]</span> Kategoryzacja intencji: <span style={{color: '#10b981'}}>Zainteresowanie usługą</span></div>
                  <div className={styles.logLine} style={{ animationDelay: '2s' }}><span className={styles.logTime}>10:42:03</span> <span className={styles.logAction}>[AI]</span> Generowanie spersonalizowanej odpowiedzi...</div>
                  <div className={styles.logLine} style={{ animationDelay: '3s' }}><span className={styles.logTime}>10:42:05</span> <span className={styles.logSuccess}>[SUCCESS]</span> Szkic zapisany w zakładce "Gotowe do wysyłki".</div>
                </div>
              )}
              {activeFeature === 'cold' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'monospace' }}>
                  <div className={styles.logLine}><span className={styles.logTime}>11:15:00</span> <span className={styles.logAction}>[SCRAPER]</span> Rozpoczęto wyszukiwanie: "Agencje marketingowe, Warszawa"</div>
                  <div className={styles.logLine} style={{ animationDelay: '1s' }}><span className={styles.logTime}>11:15:04</span> <span className={styles.logInfo}>[DATA]</span> Znaleziono 42 potencjalnych klientów.</div>
                  <div className={styles.logLine} style={{ animationDelay: '2s' }}><span className={styles.logTime}>11:15:07</span> <span className={styles.logAction}>[AI]</span> Personalizacja treści dla CEO (Jan Kowalski)...</div>
                  <div className={styles.logLine} style={{ animationDelay: '3s' }}><span className={styles.logTime}>11:15:10</span> <span className={styles.logSuccess}>[SUCCESS]</span> Kampania gotowa do uruchomienia.</div>
                </div>
              )}
              {activeFeature === 'swot' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'monospace' }}>
                  <div className={styles.logLine}><span className={styles.logTime}>13:30:12</span> <span className={styles.logAction}>[SYNC]</span> Pobieranie danych z bazy wiedzy...</div>
                  <div className={styles.logLine} style={{ animationDelay: '1s' }}><span className={styles.logTime}>13:30:15</span> <span className={styles.logInfo}>[AI]</span> Optymalizacja modelu odpowiedzi.</div>
                  <div className={styles.logLine} style={{ animationDelay: '2s' }}><span className={styles.logTime}>13:30:17</span> <span className={styles.logSuccess}>[SUCCESS]</span> Baza wiedzy zaktualizowana i gotowa do użycia.</div>
                </div>
              )}
              {activeFeature === 'security' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'monospace' }}>
                  <div className={styles.logLine}><span className={styles.logTime}>12:01:22</span> <span className={styles.logInfo}>[FIREWALL]</span> Wykryto podejrzaną wiadomość e-mail.</div>
                  <div className={styles.logLine} style={{ animationDelay: '1s' }}><span className={styles.logTime}>12:01:23</span> <span className={styles.logAction}>[AI]</span> Analiza nadawcy i linków (Phishing Score: 98%)</div>
                  <div className={styles.logLine} style={{ animationDelay: '2s' }}><span className={styles.logTime}>12:01:24</span> <span className={styles.logSuccess}>[BLOCKED]</span> Wiadomość przeniesiona do kwarantanny. Skrzynka bezpieczna.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Section */}
      <section style={{ padding: '20px 20px 100px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }} id="how-it-works">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
            Jeden system. Wiele możliwości.
          </h2>
          <p style={{ color: 'var(--subtext)', fontSize: '1.1rem', marginTop: '12px' }}>
            Poznaj potężne narzędzia ukryte pod maską MESKIAI.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Feature 1 */}
          <div style={{ padding: 'clamp(24px, 5vw, 40px)', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
            <div style={{ marginBottom: '24px', background: 'var(--foreground)', color: 'var(--background)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '12px' }}>Inteligentna skrzynka odbiorcza</h3>
            <p style={{ color: 'var(--subtext)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
              Asystent AI automatycznie odczytuje wiadomości, przygotowuje wersje robocze odpowiedzi i kategoryzuje wątki, przenosząc kluczowe sprawy do zakładki „Ważne”.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: 'var(--accent)' }}/> Podłącz własne skrzynki POP3/SMTP</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: 'var(--accent)' }}/> Automatyczne katalogowanie wątków</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: 'var(--accent)' }}/> Błyskawiczne szkice odpowiedzi</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div style={{ padding: 'clamp(24px, 5vw, 40px)', borderRadius: '24px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
            <div style={{ marginBottom: '24px', background: 'var(--foreground)', color: 'var(--background)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '12px' }}>Pozyskiwanie nowych klientów</h3>
            <p style={{ color: 'var(--subtext)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>
              Wyszukaj firmy z dowolnej branży w wybranym mieście, utwórz bazę zweryfikowanych kontaktów i uruchom spersonalizowane kampanie cold-mailowe.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: 'var(--accent)' }}/> Wyszukiwarka firm i decydentów</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: 'var(--accent)' }}/> Nielimitowane bazy kontaktów</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: 'var(--accent)' }}/> Personalizacja ofert przez AI</li>
            </ul>
          </div>

        </div>
      </section>



      {/* Pricing Section (Apple Style) */}
      <section className={styles.pricingSection} id="cennik">
        <div className={styles.pricingHeader}>
          <h2 className="animate-fade-in-up">Moc obliczeniowa.<br/>Zamiast listy płac.</h2>
          <p className="animate-fade-in-up animate-delay-1">Wybierz pakiet idealnie dopasowany do skali Twojej firmy.</p>
        </div>
        

        <div className={styles.pricingGrid}>
          {/* Pakiet 1 */}
          <div className={`${styles.pricingCard} animate-fade-in-up animate-delay-2`}>
            <div className={styles.pricingName}>MESKIAI</div>
            <div className={styles.pricingDesc}>Podstawowa moc automatyzacji dla freelancerów i małych firm.</div>
            <div className={styles.pricingPrice}>299 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={18} /> Osobisty Agent AI do poczty</li>
              <li><CheckCircle size={18} /> Do 50 automatycznych e-maili miesięcznie</li>
              <li><CheckCircle size={18} /> Do 10 wyszukań konkurencji miesięcznie</li>
              <li><CheckCircle size={18} /> Podstawowe podpowiedzi biznesowe</li>
              <li><CheckCircle size={18} /> Propozycje klientów (limit 10)</li>
              <li><CheckCircle size={18} /> Zintegrowana baza wiedzy</li>
            </ul>
            
            <button 
              className={styles.pricingBtn} 
              disabled={userTier >= 1 || loadingPriceId !== null}
              style={{ opacity: (userTier >= 1 || loadingPriceId !== null) ? 0.5 : 1, cursor: (userTier >= 1 || loadingPriceId !== null) ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (userTier >= 1) return;
                const priceId = PRICE_BASIC;
                handlePlanSelection(priceId);
              }}
            >
              {loadingPriceId === PRICE_BASIC ? "Przekierowywanie..." : (userTier >= 1 ? (userTier === 1 ? "Twój obecny plan" : "Niedostępne (Downgrade)") : "Wybieram ten pakiet")}
            </button>
          </div>
 
          {/* Pakiet 2 (PRO) - Rekomendowany */}
          <div className={`${styles.pricingCard} ${styles.pro} animate-fade-in-up animate-delay-3`}>
            <div>
              <div className={styles.proBadge}><Sparkles size={14}/> Rekomendowany</div>
              <div className={styles.pricingName}>MESKIAI PRO</div>
              <div className={styles.pricingDesc}>Zbudowany dla skalujących się biznesów. Prawdziwy pracownik w chmurze.</div>
              <div className={styles.pricingPrice}>699 <span>zł / mies.</span></div>
            </div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={18} /> Osobisty Agent AI do poczty</li>
              <li><CheckCircle size={18} /> Do 1000 automatycznych e-maili miesięcznie</li>
              <li><CheckCircle size={18} /> Do 100 wyszukań konkurencji miesięcznie</li>
              <li><CheckCircle size={18} /> Zaawansowane podpowiedzi biznesowe</li>
              <li><CheckCircle size={18} /> Propozycje klientów (limit 200)</li>
              <li><CheckCircle size={18} /> Cold Email (Generowanie AI)</li>
              <li><CheckCircle size={18} /> Zmiana tonu i stylu pisania Agenta</li>
            </ul>
            
            <button 
              className={styles.pricingBtn} 
              disabled={userTier >= 2 || loadingPriceId !== null}
              style={{ opacity: (userTier >= 2 || loadingPriceId !== null) ? 0.5 : 1, cursor: (userTier >= 2 || loadingPriceId !== null) ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (userTier >= 2) return;
                const priceId = PRICE_PRO;
                handlePlanSelection(priceId);
              }}
            >
              {loadingPriceId === PRICE_PRO ? "Przekierowywanie..." : (userTier >= 2 ? (userTier === 2 ? "Twój obecny plan" : "Niedostępne (Downgrade)") : "Zaczynamy z PRO")}
            </button>
          </div>
 
          {/* Pakiet 3 (MAX) */}
          <div className={`${styles.pricingCard} animate-fade-in-up animate-delay-4`}>
            <div className={styles.pricingName}>MESKIAI MAX</div>
            <div className={styles.pricingDesc}>Bez limitów. Dla przedsiębiorstw pragnących absolutnej dominacji operacyjnej.</div>
            <div className={styles.pricingPrice}>899 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={18} /> Pełny dostęp do Agenta AI</li>
              <li><CheckCircle size={18} /> Nielimitowane e-maile</li>
              <li><CheckCircle size={18} /> Nielimitowane wyszukiwania konkurencji</li>
              <li><CheckCircle size={18} /> Nielimitowane propozycje klientów</li>
              <li><CheckCircle size={18} /> Nielimitowany Cold Email</li>
              <li><CheckCircle size={18} /> Zmiana tonu i stylu pisania Agenta</li>
              <li><CheckCircle size={18} /> Dedykowany Account Manager</li>
            </ul>
            
            <button 
              className={styles.pricingBtn} 
              disabled={userTier >= 3 || loadingPriceId !== null}
              style={{ opacity: (userTier >= 3 || loadingPriceId !== null) ? 0.5 : 1, cursor: (userTier >= 3 || loadingPriceId !== null) ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (userTier >= 3) return;
                const priceId = PRICE_MAX;
                handlePlanSelection(priceId);
              }}
            >
              {loadingPriceId === PRICE_MAX ? "Przekierowywanie..." : (userTier >= 3 ? "Twój obecny plan" : "Kupuję Pakiet Max")}
            </button>
          </div>
        </div>
      </section>

      <footer className={styles.advancedFooter}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <div className={styles.footerLogo}>
              <img src="/logo.png" alt="MESKIAI" style={{ width: '24px', height: '24px', filter: 'var(--logo-filter)', mixBlendMode: 'var(--logo-blend-mode)' as any }} />
              MESKIAI
            </div>
            <p className={styles.footerDesc}>
              Zautomatyzuj swój biznes w 5 minut. Uwolnij czas swojego zespołu i przyspiesz wzrost dzięki potędze sztucznej inteligencji.
            </p>
          </div>
          <div className={styles.footerCol}>
            <div className={styles.footerHeading}>Produkt</div>
            <ul className={styles.footerLinks}>
              <li><a href="#how-it-works">Jak to działa</a></li>
              <li><a href="#cennik">Cennik</a></li>
              <li><Link href="/bezpieczenstwo">Bezpieczeństwo</Link></li>
              <li><Link href="/integracje">Integracje</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <div className={styles.footerHeading}>Firma</div>
            <ul className={styles.footerLinks}>
              <li><Link href="/o-nas">O nas</Link></li>
              <li><Link href="/kontakt">Kontakt</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <div className={styles.footerHeading}>Legal</div>
            <ul className={styles.footerLinks}>
              <li><Link href="/regulamin">Regulamin</Link></li>
              <li><Link href="/polityka-prywatnosci">Polityka Prywatności</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div>&copy; {new Date().getFullYear()} MESKIAI. Zaprojektowano w Polsce.</div>
        </div>
      </footer>
    </main>
  );
}
