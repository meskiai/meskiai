"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, CheckCircle, BrainCircuit, Shield, Zap, Target, Bot, Activity, ArrowUpRight, TrendingUp, Users, Cpu, FileText, Lock, Globe, MessageSquare, Play, Settings, Clock, Calendar, Video, BarChart, Sparkles, Home as HomeIcon, LogOut, Database, ChevronDown, Check, Layers, Inbox } from 'lucide-react';
import { useEffect, useState, useRef } from "react";

import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";
import styles from "./page.module.css";

const TypingEmail = () => {
  const [text, setText] = useState('');
  const fullText = "Dzień dobry, czy MESKIAI potrafi sam odpowiadać na powtarzalne pytania moich klientów?";
  const aiText = "Dzień dobry. Tak! MESKIAI uczy się bazy wiedzy Twojej firmy, analizuje intencje klienta i w kilka sekund tworzy profesjonalną, bezbłędną odpowiedź.";
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
    <div className={styles.mockMailApp}>
      <div style={{ padding: '14px 20px', display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#CBD5E1' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#CBD5E1' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#CBD5E1' }}></div>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bot size={14} color="#2563EB" /> MESKIAI Live Agent Console
        </div>
        <div style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#16A34A', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
          ONLINE
        </div>
      </div>
      
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span>Zapytanie Klienta</span>
            <span style={{ color: '#2563EB' }}>[INBOUND E-MAIL]</span>
          </div>
          <div style={{ fontSize: '0.92rem', color: '#0F172A', lineHeight: 1.6, fontWeight: 450 }}>
            {text}{!showAi && <span className={styles.typingCursor} style={{ background: '#0F172A' }}>|</span>}
          </div>
        </div>
        
        {showAi && (
          <div className="animate-slide-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', borderLeft: '3px solid #2563EB', background: '#EFF6FF', padding: '14px 18px', borderRadius: '0 12px 12px 0' }}>
            <div style={{ fontSize: '0.72rem', color: '#1D4ED8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Sparkles size={14} /> MESKIAI AI AGENT <span style={{ opacity: 0.6, color: '#64748B', fontWeight: 500 }}>[WYGENEROWANO W 0.3s]</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#1E3A8A', lineHeight: 1.6, fontWeight: 450 }}>
              {aiTyped}{aiTyped.length < aiText.length ? <span className={styles.typingCursor} style={{ background: '#2563EB' }}>|</span> : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FadeInWhenVisible = ({ children, delay = 0, className, style, id, scale = false, tilt = false }: { children: React.ReactNode, delay?: number, className?: string, style?: React.CSSProperties, id?: string, scale?: boolean, tilt?: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);
  
  const getTransform = () => {
    if (!isVisible) {
      if (tilt) return 'perspective(1200px) rotateX(10deg) translateY(40px) scale(0.96)';
      if (scale) return 'translateY(30px) scale(0.96)';
      return 'translateY(30px)';
    }
    if (tilt) return 'perspective(1200px) rotateX(0deg) translateY(0) scale(1)';
    return 'translateY(0) scale(1)';
  };
  
  return (
    <section 
      id={id}
      ref={domRef} 
      className={className}
      style={{ 
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </section>
  );
};

const FaqAccordionItem = ({ question, answer }: { question: string, answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '22px 0', fontSize: '1.08rem', fontWeight: 600, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-heading) !important' }}
      >
        {question}
        <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease', color: '#2563EB' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease-out, opacity 0.3s ease-out', opacity: isOpen ? 1 : 0 }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingBottom: '22px', fontSize: '0.98rem', lineHeight: 1.65, color: '#475569' }}>
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrustBadges = () => (
  <section style={{ padding: '0 24px 50px', maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '36px', opacity: 0.85 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
      <Shield size={16} color="#16A34A" /> 100% Zgodność z RODO
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
      <Lock size={16} color="#2563EB" /> Szyfrowanie SSL/TLS
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
      <BrainCircuit size={16} color="#D97706" /> Powered by OpenAI
    </div>
  </section>
);

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPriceId, setCurrentPriceId] = useState<string | null>(null);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleCheckout = async (priceId: string) => {
    setLoadingPriceId(priceId);
    router.push(`/checkout?priceId=${priceId}`);
  };

  const handlePlanSelection = async (priceId: string) => {
    if (status === "authenticated") {
      await handleCheckout(priceId);
    } else {
      localStorage.setItem('selectedPlan', JSON.stringify({ id: priceId, time: Date.now() }));
      await handleLogin();
    }
  };

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
      
      {/* Floating Bento Pill Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Bot size={20} />
            </div>
            <span className={styles.logoText}>MESKIAI</span>
          </Link>

          <ul className={styles.navLinks}>
            <li><a href="#filary" className={styles.navLink}>Filary Systemu</a></li>
            <li><a href="#demo" className={styles.navLink}>Konsola AI</a></li>
            <li><a href="#cennik" className={styles.navLink}>Cennik</a></li>
            <li><a href="#faq" className={styles.navLink}>FAQ</a></li>
          </ul>
          
          <div className={styles.navActions}>
            {status === "authenticated" ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className={styles.avatarBtn}
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                        {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0', borderRadius: '18px',
                      padding: '8px', width: '240px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>
                        {session?.user?.name || session?.user?.email?.split('@')[0]}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', wordBreak: 'break-all' }}>
                        {session?.user?.email}
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', textDecoration: 'none' }}
                    >
                      <HomeIcon size={16} color="#64748B" /> Panel
                    </Link>
                    <Link
                      href="/dashboard?tab=account"
                      onClick={() => setShowUserMenu(false)}
                      style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', color: '#0F172A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', textDecoration: 'none' }}
                    >
                      <Settings size={16} color="#64748B" /> Ustawienia Konta
                    </Link>

                    <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', borderRadius: '12px', color: '#EF4444', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem' }}
                    >
                      <LogOut size={16} /> Wyloguj się
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={styles.navLoginBtn}
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? '...' : 'Zaloguj się'}
                </button>
                <button
                  className={styles.navTryBtn}
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? '...' : 'Wypróbuj'}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Bento Layout */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          {/* Left Column: Hero Text */}
          <div>
            <div className={styles.newBadge}>
              <Sparkles size={14} /> AUTONOMICZNA PLATFORMA AI 2026
            </div>

            <h1 className={styles.bentoTitle}>
              Twój osobisty <br/>
              <span className={styles.blueGradientText}>Dyrektor E-mail.</span>
            </h1>

            <p className={styles.bentoSubtitle}>
              MESKIAI automatycznie przejmuje 95% powtarzalnej korespondencji firmowej, kwalifikuje klientów i organizuje Twój dzień.
            </p>

            <div>
              {status === "authenticated" ? (
                <Link href="/dashboard" className={styles.ctaBtnBento} style={{ textDecoration: 'none' }}>
                  Przejdź do Panelu <ArrowRight size={18} />
                </Link>
              ) : (
                <button
                  className={styles.ctaBtnBento}
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Zacznij 3-dniowy Test <ArrowRight size={18} />
                </button>
              )}
            </div>

            <div style={{ marginTop: '14px', color: '#64748B', fontSize: '0.86rem', fontWeight: 500 }}>
              ✓ Aktywacja w 2 minuty • Bez podawania karty na start
            </div>
          </div>

          {/* Right Column: Live Interactive Bento Dashboard Widget */}
          <div className={styles.bentoWidgetCard}>
            <div className={styles.bentoWidgetHeader}>
              <div className={styles.bentoWidgetTitle}>
                <Activity size={18} color="#2563EB" /> MESKIAI Control Center
              </div>
              <div className={styles.bentoStatusBadge}>
                ● AUTOPILOT ON
              </div>
            </div>

            <div className={styles.bentoStatRow}>
              <div className={styles.bentoMiniStat}>
                <div className={styles.bentoMiniVal} style={{ color: '#2563EB' }}>142</div>
                <div className={styles.bentoMiniLbl}>E-maile dzisiaj</div>
              </div>
              <div className={styles.bentoMiniStat}>
                <div className={styles.bentoMiniVal} style={{ color: '#16A34A' }}>4.8h</div>
                <div className={styles.bentoMiniLbl}>Zaoszczędzone</div>
              </div>
              <div className={styles.bentoMiniStat}>
                <div className={styles.bentoMiniVal} style={{ color: '#D97706' }}>99.4%</div>
                <div className={styles.bentoMiniLbl}>Pewność AI</div>
              </div>
            </div>

            {/* Simulated Activity Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Inbox size={16} color="#2563EB" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>Zapytanie o cennik b2b</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Automatycznie odpowiedziano (0.2s)</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>ZAMKNIĘTE</span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={16} color="#D97706" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>Nowy Prospect B2B</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Weryfikacja danych RODO OK</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>WYSŁANO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* Interactive Console Sandbox */}
      <FadeInWhenVisible tilt id="demo" style={{ padding: '20px 24px 60px', maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 className={styles.bentoSectionTitle}>
            Zobacz, jak działa w praktyce.
          </h2>
          <p style={{ color: '#64748B', marginTop: '8px', fontSize: '1.05rem' }}>
            Wypróbuj autonomiczny proces odczytywania intencji wiadomości.
          </p>
        </div>
        <TypingEmail />
      </FadeInWhenVisible>

      {/* SYSTEM 4 FILARÓW - BENTO GRID */}
      <FadeInWhenVisible id="filary" className={styles.bentoGridSection}>
        <div className={styles.bentoSectionHeader}>
          <div className={styles.bentoTagline}>ARCHITEKTURA SYSTEMU</div>
          <h2 className={styles.bentoSectionTitle}>4 Filary Pełnej Automatyzacji</h2>
        </div>

        <div className={styles.bentoCardsGrid}>
          {/* Bento Card 1 (Col 8) */}
          <div className={`${styles.bentoCard} ${styles.bentoCardCol8}`}>
            <div>
              <div className={styles.bentoCardIcon}>
                <Bot size={24} />
              </div>
              <h3 className={styles.bentoCardHeading}>1. Inteligentny Asystent E-mail</h3>
              <p className={styles.bentoCardText}>
                MESKIAI czyta ze zrozumieniem Twoje wiadomości, klasyfikuje je według priorytetu i generuje bezbłędne odpowiedzi zgodnie z wytycznymi Twojej firmy.
              </p>
            </div>
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={20} color="#16A34A" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>Pełne wsparcie dla języka polskiego i ponad 40 innych języków.</span>
            </div>
          </div>

          {/* Bento Card 2 (Col 4) */}
          <div className={`${styles.bentoCard} ${styles.bentoCardCol4}`}>
            <div>
              <div className={styles.bentoCardIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Target size={24} />
              </div>
              <h3 className={styles.bentoCardHeading}>2. Radar Prospectingu</h3>
              <p className={styles.bentoCardText}>
                Samodzielne wyszukiwanie wartościowych leadów B2B i automatyczne wysyłanie spersonalizowanych ofert.
              </p>
            </div>
            <div style={{ background: '#FEF3C7', color: '#D97706', padding: '8px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>
              +100 LEADÓW MIESIĘCZNIE
            </div>
          </div>

          {/* Bento Card 3 (Col 4) */}
          <div className={`${styles.bentoCard} ${styles.bentoCardCol4}`}>
            <div>
              <div className={styles.bentoCardIcon} style={{ background: '#DCFCE7', color: '#16A34A' }}>
                <Calendar size={24} />
              </div>
              <h3 className={styles.bentoCardHeading}>3. Terminarz & Kalendarz</h3>
              <p className={styles.bentoCardText}>
                Automatyczne umawianie rozmów z klientami w pasujących terminach bez wymieniania 10 maili.
              </p>
            </div>
            <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '8px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>
              INTEGRACJA GOOGLE MEET
            </div>
          </div>

          {/* Bento Card 4 (Col 8) */}
          <div className={`${styles.bentoCard} ${styles.bentoCardCol8}`}>
            <div>
              <div className={styles.bentoCardIcon} style={{ background: '#F3E8FF', color: '#9333EA' }}>
                <Shield size={24} />
              </div>
              <h3 className={styles.bentoCardHeading}>4. Kategoryzacja & Bezpieczeństwo RODO</h3>
              <p className={styles.bentoCardText}>
                Gwarancja najwyższego poziomu ochrony danych. Szyfrowanie połączeń i bezwzględna ochrona tajemnic firmy.
              </p>
            </div>
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Lock size={20} color="#9333EA" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>Szyfrowane połączenia TLS/SSL i serwery w Unii Europejskiej.</span>
            </div>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* BENTO PRICING CARDS */}
      <FadeInWhenVisible id="cennik" style={{ padding: '80px 24px', maxWidth: '1180px', margin: '0 auto' }}>
        <div className={styles.bentoSectionHeader}>
          <div className={styles.bentoTagline}>CENNIK PLATFORMY</div>
          <h2 className={styles.bentoSectionTitle}>Inwestycja, która zwraca się pierwszego dnia</h2>
        </div>

        <div className={styles.bentoPricingGrid}>
          {/* Pakiet 1 */}
          <div className={styles.bentoPriceCard}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px', fontFamily: 'var(--font-heading) !important' }}>MESKIAI BASIC</div>
            <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '28px' }}>Podstawowy pakiet automatyzacji e-mail.</div>
            
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '3.4rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.04em' }}>299</span>
              <span style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div><strong>50 e-maili</strong> automatycznych / mies.</div></li>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div><strong>10 leadów</strong> do poszukiwań B2B</div></li>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div>Dostęp do Konsoli AI</div></li>
            </ul>
            
            <button 
              disabled={userTier >= 1 || loadingPriceId !== null}
              style={{ width: '100%', padding: '15px', borderRadius: '14px', background: 'transparent', color: '#0F172A', fontWeight: 600, fontSize: '0.95rem', border: '1px solid #E2E8F0', cursor: (userTier >= 1 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 1 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }}
              onClick={() => {
                if (userTier >= 1) return;
                handlePlanSelection(PRICE_BASIC);
              }}
            >
              {loadingPriceId === PRICE_BASIC ? "Przekierowywanie..." : (userTier >= 1 ? (userTier === 1 ? "Twój obecny plan" : "Downgrade") : "Wybieram BASIC")}
            </button>
          </div>

          {/* Pakiet 2 (PRO) */}
          <div className={`${styles.bentoPriceCard} ${styles.bentoPriceCardFeatured}`}>
            <div style={{ background: '#2563EB', color: '#FFFFFF', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '14px' }}>
              REKOMENDOWANY
            </div>
            
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px', fontFamily: 'var(--font-heading) !important' }}>MESKIAI PRO</div>
            <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '28px' }}>Prawdziwy cyfrowy dyrektor dla rozwijających się firm.</div>
            
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '3.8rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.04em' }}>699</span>
              <span style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div><strong>1000 e-maili</strong> automatycznych / mies.</div></li>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div><strong>100 leadów</strong> do poszukiwań B2B</div></li>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div>Zaawansowany Cold Emailing</div></li>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div>Dostosowanie tonu wypowiedzi</div></li>
            </ul>
            
            <button 
              disabled={userTier >= 2 || loadingPriceId !== null}
              style={{ width: '100%', padding: '15px', borderRadius: '14px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem', border: 'none', cursor: (userTier >= 2 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 2 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto', boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)' }}
              onClick={() => {
                if (userTier >= 2) return;
                handlePlanSelection(PRICE_PRO);
              }}
            >
              {loadingPriceId === PRICE_PRO ? "Przekierowywanie..." : (userTier >= 2 ? (userTier === 2 ? "Twój obecny plan" : "Downgrade") : "Zaczynam z PRO")}
            </button>
          </div>

          {/* Pakiet 3 (MAX) */}
          <div className={styles.bentoPriceCard}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px', fontFamily: 'var(--font-heading) !important' }}>MESKIAI MAX</div>
            <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '28px' }}>Bezkompromisowa wydajność bez limitów.</div>
            
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '3.4rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.04em' }}>899</span>
              <span style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div><strong>Brak limitów</strong> e-maili i zapytań</div></li>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div>Pełna automatyzacja Cold Email</div></li>
              <li style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.92rem' }}><Check size={18} color="#2563EB" /> <div>Dedykowany opiekun konta</div></li>
            </ul>
            
            <button 
              disabled={userTier >= 3 || loadingPriceId !== null}
              style={{ width: '100%', padding: '15px', borderRadius: '14px', background: 'transparent', color: '#0F172A', fontWeight: 600, fontSize: '0.95rem', border: '1px solid #E2E8F0', cursor: (userTier >= 3 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 3 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }}
              onClick={() => {
                if (userTier >= 3) return;
                handlePlanSelection(PRICE_MAX);
              }}
            >
              {loadingPriceId === PRICE_MAX ? "Przekierowywanie..." : (userTier >= 3 ? "Twój obecny plan" : "Wybieram MAX")}
            </button>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* FAQ SECTION */}
      <FadeInWhenVisible id="faq" style={{ padding: '60px 24px', maxWidth: '860px', margin: '0 auto' }}>
        <div className={styles.bentoSectionHeader}>
          <h2 className={styles.bentoSectionTitle}>Najczęściej zadawane pytania</h2>
        </div>
        
        <div className={styles.faqList}>
          <FaqAccordionItem 
            question="Czy system integruje się z Shopify, WooCommerce lub innymi platformami?" 
            answer={
              <>Tak! MESKIAI potrafi łączyć się i czytać kontekst z popularnych platform e-commerce takich jak <strong>Shopify</strong> oraz <strong>WooCommerce</strong>. Dzięki temu Twój Pracownik AI dokładnie wie, jakie zamówienie złożył klient, zanim wygeneruje dla niego odpowiedź.</>
            } 
          />
          <FaqAccordionItem 
            question="A co jeśli Pracownik AI nie poradzi sobie w mojej firmie?" 
            answer={
              <><strong>Masz 14 dni na testy bez ryzyka.</strong> Jeśli w tym czasie uznasz, że system nie oszczędza Twojego czasu, możesz anulować subskrypcję jednym kliknięciem z panelu.</>
            } 
          />
          <FaqAccordionItem 
            question="Czy MESKIAI samodzielnie wysyła wiadomości do klientów?" 
            answer={
              <>To zależy od Ciebie! Możesz ustawić Pracownika w tryb "Wsparcia" (tworzy gotowe do wysłania wiadomości i czeka na Twoją akceptację) lub w tryb "Autonomiczny" (samodzielnie zamyka sprawy klientów zgodnie z wytycznymi Twojej firmy).</>
            } 
          />
          <FaqAccordionItem 
            question="Jak długo trwa wdrożenie systemu?" 
            answer={
              <>Integracja zajmuje zaledwie kilka minut. Wystarczy autoryzować system do czytania Twojej skrzynki (np. przez bezpieczne hasło aplikacji Gmail) i zdefiniować podstawowe wytyczne dla Pracownika. System uczy się z każdym dniem.</>
            } 
          />
          <FaqAccordionItem 
            question="Czy mogę podłączyć więcej niż jedną skrzynkę e-mail?" 
            answer={
              <>Owiście! MESKIAI doskonale radzi sobie z zarządzaniem wieloma skrzynkami (np. biuro@, kontakt@, sprzedaz@) w jednym centralnym systemie, sortując maile według ich priorytetów.</>
            } 
          />
          <FaqAccordionItem 
            question="Czy dane moich klientów są bezpieczne?" 
            answer={
              <>Bezpieczeństwo to nasz priorytet. Korzystamy z szyfrowanych połączeń (SSL/TLS), a dane są przetwarzane zgodnie z najwyższymi standardami bezpieczeństwa i przepisami RODO. Żadne wrażliwe dane nie są udostępniane podmiotom trzecim.</>
            } 
          />
        </div>
      </FadeInWhenVisible>

      {/* BOTTOM CTA BANNER */}
      <FadeInWhenVisible style={{ 
        padding: '80px 24px', 
        maxWidth: '1180px', 
        margin: '0 auto 80px auto', 
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: '32px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.04)'
      }}>
        <h2 className={styles.bentoSectionTitle} style={{ marginBottom: '16px' }}>
          Oszczędź ponad 20 godzin tygodniowo.
        </h2>
        <p style={{ color: '#64748B', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '560px', margin: '0 auto 32px auto' }}>
          Zacznij 3-dniowy bezpłatny okres próbny. Przekonaj się jak automatyzacja uwalnia czas Twojego zespołu.
        </p>
        <div>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnBento} style={{ textDecoration: 'none' }}>
              Przejdź do Panelu <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              className={styles.ctaBtnBento}
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? '...' : 'Uruchom 3-dniowy Test'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </FadeInWhenVisible>

      {/* FOOTER */}
      <footer className={styles.advancedFooter}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogo}>
              <div className={styles.logoIcon}>
                <Bot size={18} />
              </div>
              MESKIAI
            </div>
            <p className={styles.footerDesc}>
              Zautomatyzuj obsługę wiadomości w swojej firmie. Uwolnij czas zespołu i buduj przewagę dzięki AI.
            </p>
          </div>
          <div>
            <div className={styles.footerHeading}>Produkt</div>
            <ul className={styles.footerLinks}>
              <li><a href="#filary">Filary Systemu</a></li>
              <li><a href="#demo">Konsola AI</a></li>
              <li><a href="#cennik">Cennik</a></li>
              <li><Link href="/bezpieczenstwo">Bezpieczeństwo</Link></li>
              <li><Link href="/integracje">Integracje</Link></li>
            </ul>
          </div>
          <div>
            <div className={styles.footerHeading}>Firma</div>
            <ul className={styles.footerLinks}>
              <li><Link href="/o-nas">O nas</Link></li>
              <li><Link href="/kontakt">Kontakt</Link></li>
            </ul>
          </div>
          <div>
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
