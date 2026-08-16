"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, CheckCircle, BrainCircuit, Shield, Zap, Target, Bot, Activity, ArrowUpRight, TrendingUp, Users, Cpu, FileText, Lock, Globe, MessageSquare, Play, Settings, Clock, Calendar, Video, BarChart, Sparkles, Home as HomeIcon, LogOut, Database, ChevronDown } from 'lucide-react';
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
    <div className={styles.mockMailApp} style={{ textAlign: 'left', flexDirection: 'column', padding: '0', height: 'auto', minHeight: '300px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--mac-shadow)', backdropFilter: 'blur(20px)' }}>
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
          <div className="animate-slide-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', marginTop: '12px', borderLeft: '2px solid var(--accent)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              MESKIAI <span style={{ opacity: 0.5, color: 'var(--subtext)', fontWeight: 400 }}>[GENERATING]</span>
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
      if (tilt) return 'perspective(1200px) rotateX(16deg) translateY(60px) scale(0.92)';
      if (scale) return 'translateY(40px) scale(0.94)';
      return 'translateY(40px)';
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
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
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
    <div className={styles.faqItem} style={{ borderBottom: '1px solid var(--glass-border)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={styles.faqSummary}
        style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '24px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit', letterSpacing: '-0.02em' }}
      >
        {question}
      </button>
      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease-out, opacity 0.3s ease-out', opacity: isOpen ? 1 : 0 }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingBottom: '24px', fontSize: '1rem', lineHeight: 1.6, color: 'var(--subtext)' }}>
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrustBadges = () => (
  <section className="animate-fade-in animate-delay-4" style={{ padding: '0 20px 40px', maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '24px', opacity: 0.8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--subtext)', fontWeight: 600 }}>
      <Shield size={16} /> 100% Zgodność z RODO
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--subtext)', fontWeight: 600 }}>
      <Lock size={16} /> Szyfrowanie SSL/TLS
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--subtext)', fontWeight: 600 }}>
      <BrainCircuit size={16} /> Powered by OpenAI
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
    // Przekierowanie na customową stronę płatności Stripe Elements
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
              fetchPriority="high"
              decoding="async"
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
              <div className={styles.authButtons}>
                <button
                  className={styles.navLoginBtn}
                  style={{ cursor: isLoggingIn ? 'wait' : 'pointer', opacity: isLoggingIn ? 0.7 : 1 }}
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logowanie...' : 'Zaloguj się'}
                </button>
                <button
                  className={styles.navTryBtn}
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  style={{ cursor: isLoggingIn ? 'wait' : 'pointer', opacity: isLoggingIn ? 0.7 : 1 }}
                >
                  {isLoggingIn ? 'Logowanie...' : 'Wypróbuj'}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>

        <h1 className={`${styles.heroTitle} animate-fade-in`}>
          Pracownik AI, <br/>
          który <span className={styles.heroHighlight}>pozwala na więcej.</span>
        </h1>
        
        <h2 className={`${styles.heroSubtitle} animate-fade-in`} style={{ animationDelay: '0.15s' }}>
          MESKIAI łączy się ze wszystkimi Twoimi narzędziami, wie wszystko o Twojej firmie i wykonuje prawdziwą pracę za cały zespół.
        </h2>
        
        <div className={`${styles.ctaWrapper} animate-fade-in`} style={{ marginTop: '10px', flexDirection: 'column', alignItems: 'center', animationDelay: '0.3s' }}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnLindy} style={{textDecoration: 'none'}}>
              Przejdź do Panelu
            </Link>
          ) : (
            <button
              className={styles.ctaBtnLindy}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Wypróbuj za darmo
            </button>
          )}
          <div className={styles.heroTrialText}>
            3-dniowy okres próbny • Anuluj w dowolnym momencie
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* Advanced Social Proof & Live Mockup Layer with 3D Tilt Scroll */}
      <FadeInWhenVisible tilt style={{ padding: '40px 20px 60px', maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A' }}>
              Zaprojektowany, by działać autonomicznie.
            </h2>
            <p style={{ color: '#64748B', marginTop: '10px', fontSize: '1.08rem' }}>
              Zobacz, jak MESKIAI samodzielnie obsługuje zapytania klientów i tworzy szkice odpowiedzi.
            </p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <TypingEmail />
          </div>
        </div>
      </FadeInWhenVisible>

      {/* SECTION 01 - Active Tasks Animation Panel -> NEW Lindy Style Panel */}
      <FadeInWhenVisible className={styles.lindySection}>
        <div className={styles.lindyContainer}>
          <div className={styles.lindyTextCol}>
            <div className={styles.lindyNumber}>01</div>
            <h2 className={styles.lindyTitle}>Przejmuje Twoje obowiązki.</h2>
            <p className={styles.lindyDesc}>
              Posiada dziesiątki wbudowanych umiejętności: obsługa zapytań, generowanie leadów, tworzenie raportów, kategoryzacja wiadomości. Zrób coś raz, zapisz jako procedurę, a cały zespół będzie mógł z tego korzystać bez dodatkowej pracy.
            </p>
          </div>
          <div className={styles.lindyVisualCol}>
            <div className={styles.lindyVisualBox}>
              <div className={styles.lindySkillHeader} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between' }}>
                <span className={styles.lindySkillTitle}>Umiejętności</span>
                <span className={styles.lindySkillMeta} style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>12 aktywnych • system dobiera właściwe</span>
              </div>
              <div className={styles.lindyGrid}>
                {/* Skill 1 */}
                <div className={`${styles.lindySkillPill} animate-fade-in`}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Mail size={16} /></div>
                    Obsługa zapytań
                  </div>
                  <div className={styles.lindySkillToggle}>Wł.</div>
                </div>
                {/* Skill 2 */}
                <div className={`${styles.lindySkillPill} animate-fade-in animate-delay-1`}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><Target size={16} /></div>
                    Generowanie leadów
                  </div>
                  <div className={styles.lindySkillToggle}>Wł.</div>
                </div>
                {/* Skill 3 */}
                <div className={`${styles.lindySkillPill} animate-fade-in animate-delay-2`}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><TrendingUp size={16} /></div>
                    Analiza ofert
                  </div>
                  <div className={styles.lindySkillToggle}>Wł.</div>
                </div>
                {/* Skill 4 */}
                <div className={`${styles.lindySkillPill} animate-fade-in animate-delay-3`}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><Calendar size={16} /></div>
                    Terminarz
                  </div>
                  <div className={styles.lindySkillToggle}>Wł.</div>
                </div>
                {/* Skill 5 */}
                <div className={`${styles.lindySkillPill} animate-fade-in animate-delay-4`}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><BrainCircuit size={16} /></div>
                    Research firm
                  </div>
                  <div className={styles.lindySkillToggle}>Wł.</div>
                </div>
                {/* Skill 6 */}
                <div className={`${styles.lindySkillPill} animate-fade-in animate-delay-5`}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: 'rgba(226, 232, 240, 0.8)', color: '#64748b' }}><BarChart size={16} /></div>
                    Raportowanie
                  </div>
                  <div className={styles.lindySkillToggleInstall}>Zainstaluj</div>
                </div>
              </div>
              
              <div className={`${styles.lindyDashedBox} animate-fade-in animate-delay-6`}>
                <div className={styles.lindyDashedIcon}>+</div>
                <div className={styles.lindyDashedText}>
                  <h4>Stwórz własną</h4>
                  <p>Pokaż MESKIAI jak wykonujesz zadanie. Zostanie zapisane dla całego zespołu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* SECTION 02 */}
      <FadeInWhenVisible className={styles.lindySection} style={{ marginTop: '20px' }}>
        <div className={styles.lindyContainer}>
          <div className={styles.lindyVisualColLeft}>
            <div className={styles.lindyVisualBox} style={{ background: '#f8fafc' }}>
               {/* Messages Mockup */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 2 }}>
                 <div className="animate-fade-in" style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Pytanie o usługi</span>
                     <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Teraz</span>
                   </div>
                   <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Jesteśmy zainteresowani Waszą ofertą usług. Możemy prosić o szczegóły?</p>
                   <div style={{ marginTop: '12px', padding: '10px', background: '#eff6ff', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8' }}>MESKIAI odpowiedział</span>
                     </div>
                     <p style={{ fontSize: '0.8rem', color: '#1e3a8a', margin: 0, lineHeight: 1.4 }}>Dzień dobry! Z przyjemnością przedstawiam naszą ofertę. Załączyłem cennik do tej wiadomości...</p>
                   </div>
                 </div>
                 
                 <div className="animate-fade-in animate-delay-2" style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Termin dostawy</span>
                     <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>15 min temu</span>
                   </div>
                   <div style={{ marginTop: '8px', padding: '10px', background: '#eff6ff', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8' }}>Wysłano numer listu przewozowego</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className={styles.lindyTextCol}>
            <div className={styles.lindyNumber}>02</div>
            <h2 className={styles.lindyTitle}>Działa 24/7 bez przerw.</h2>
            <p className={styles.lindyDesc}>
              Twoi klienci nie muszą już czekać na odpowiedź do poniedziałku. MESKIAI odpisuje na wiadomości w ułamku sekundy, nawet w środku nocy lub podczas świąt. Zwiększ konwersję dzięki natychmiastowej reakcji i podnieś jakość obsługi.
            </p>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* SECTION 03 */}
      <FadeInWhenVisible className={styles.lindySection} style={{ marginTop: '20px', marginBottom: '40px' }}>
        <div className={styles.lindyContainer}>
          <div className={styles.lindyTextCol}>
            <div className={styles.lindyNumber}>03</div>
            <h2 className={styles.lindyTitle}>Poszukiwanie klientów i pisanie ofert.</h2>
            <p className={styles.lindyDesc}>
              Skonfiguruj kryteria, a MESKIAI samodzielnie przeszuka sieć, zidentyfikuje potencjalnych klientów, zweryfikuje ich dane kontaktowe i wyśle im w pełni spersonalizowaną ofertę. Ty otrzymujesz tylko gotowe leady, które chcą rozmawiać.
            </p>
          </div>
          <div className={styles.lindyVisualCol}>
            <div className={styles.lindyVisualBox} style={{ background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Aktywne poszukiwania</span>
                <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>+42 dziś</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
                
                <div className="animate-fade-in" style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>KS</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Kamil Stępień</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dyrektor ds. Sprzedaży</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Wysłano ofertę</span>
                </div>

                <div className="animate-fade-in animate-delay-2" style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>JK</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Julia Kamińska</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Operations Manager</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Umówione spotkanie</span>
                </div>

                <div className="animate-fade-in animate-delay-4" style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>PW</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>Piotr Włodarczyk</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Head of Growth</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>Kwalifikacja</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* Email Interaction Panel */}
      {/* Email Interaction Panel */}
      <FadeInWhenVisible className="animate-fade-in" style={{ padding: 'clamp(40px, 10vw, 60px) 20px clamp(40px, 10vw, 80px)', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(30px, 8vw, 50px)' }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Twój asystent <span style={{ color: '#3b82f6' }}>przy pracy.</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: 'clamp(1rem, 3vw, 1.15rem)', maxWidth: '540px', margin: '16px auto 0', fontWeight: 450, lineHeight: 1.6 }}>
            Zobacz jak MESKIAI samodzielnie rozwiązuje problemy i asystuje Twoim klientom.
          </p>
        </div>
        
        {/* Modern Minimalist Email/Chat Thread */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)', overflow: 'hidden', maxWidth: '750px', margin: '0 auto' }}>
          
          <div style={{ padding: '0' }}>
            
            {/* Customer Message (Received) */}
            <div className="animate-fade-in" style={{ padding: '32px 32px 24px' }}>
              {/* Message Header */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 600, color: '#0F172A' }}>Nawiązanie współpracy – zapytanie ofertowe</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
                      MR
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>Marcin Rudzki</div>
                      <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                        m.rudzki@agencja-pro.pl
                      </div>
                    </div>
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                    Dziś, 09:20
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, paddingLeft: '48px' }}>
                Dzień dobry,
                <br/><br/>
                Bardzo dziękuję za wczorajszą wiadomość. Przeanalizowałem Państwa wstępną ofertę i idealnie wpisuje się to w nasze potrzeby. 
                Czy moglibyśmy umówić się na krótką rozmowę telefoniczną w tym tygodniu, aby dogadać szczegóły? Pasuje mi środa po 13:00.
                <br/><br/>
                Pozdrawiam,<br/>
                Marcin Rudzki
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', margin: '0 32px' }}></div>

            {/* AI Response (Sent) */}
            <div className="animate-fade-in animate-delay-2" style={{ padding: '24px 32px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#2563EB', fontSize: '0.9rem' }}>
                      AI
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>MESKIAI</span>
                        <span style={{ color: '#2563EB', fontSize: '0.7rem', fontWeight: 600, background: '#DBEAFE', padding: '2px 8px', borderRadius: '12px' }}>Autoodpowiedź</span>
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                        Do: Marcin Rudzki
                      </div>
                    </div>
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                    Dziś, 09:21
                  </div>
              </div>

              {/* Response Body */}
              <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6, paddingLeft: '48px' }}>
                Dzień dobry Panie Marcinie!
                <br/><br/>
                Cieszę się, że oferta spotkała się z zainteresowaniem. Środa po 13:00 jak najbardziej nam pasuje. 
                Zarezerwowałem wstępnie spotkanie w kalendarzu na <strong>środę o 13:30</strong>.
                <br/><br/>
                Wysłałem na Pana adres e-mail oficjalne zaproszenie z linkiem do Google Meet. Do usłyszenia!
              </div>
            </div>
            
          </div>
        </div>
      </FadeInWhenVisible>



      {/* Premium Minimalist Pricing */}
      <FadeInWhenVisible className="animate-fade-in" id="cennik" style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ color: '#D97706', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>Cennik</div>
          <h2 className="animate-fade-in-up" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
            Zatrudnij pracownika, który <br/>
            <span style={{ color: '#D97706' }}>dostarcza więcej, niż kosztuje.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
          
          {/* Pakiet 1 */}
          <div className={`animate-fade-in-up animate-delay-2 ${styles.lindyPricingCard}`} style={{ padding: '40px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>MESKIAI</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', marginBottom: '32px' }}>Podstawowa moc automatyzacji dla małych firm.</div>
            
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.04em', lineHeight: 1 }}>299</span>
              <span style={{ fontSize: '1rem', color: 'var(--subtext)', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#3B82F6" /> <div><strong>50 e-maili</strong> automatycznych / mies.</div></li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#3B82F6" /> <div><strong>10 leadów</strong> potencjalnych klientów</div></li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#3B82F6" /> <div>Osobisty Pracownik AI + Baza Wiedzy</div></li>
            </ul>
            
            <button 
              disabled={userTier >= 1 || loadingPriceId !== null}
              style={{ width: '100%', padding: '16px', borderRadius: '99px', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '1rem', border: '1px solid var(--glass-border)', cursor: (userTier >= 1 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 1 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }}
              onClick={() => {
                if (userTier >= 1) return;
                handlePlanSelection(PRICE_BASIC);
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-border)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {loadingPriceId === PRICE_BASIC ? "Przekierowywanie..." : (userTier >= 1 ? (userTier === 1 ? "Twój obecny plan" : "Downgrade") : "Wybieram ten pakiet")}
            </button>
          </div>
 
          {/* Pakiet 2 (PRO) - Rekomendowany - Glowing Premium Yellow Accent */}
          <div className={`animate-fade-in-up animate-delay-3 ${styles.lindyPricingCard}`} style={{ padding: '48px 40px', background: 'var(--card-bg)', border: '1px solid #D97706', borderRadius: '24px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 0 40px rgba(217, 119, 6, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #D97706, #F59E0B)', color: '#FFF', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}>REKOMENDOWANY</div>
            
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>MESKIAI PRO</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', marginBottom: '32px' }}>Prawdziwy pracownik w chmurze dla skalujących się firm.</div>
            
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.04em', lineHeight: 1 }}>699</span>
              <span style={{ fontSize: '1rem', color: 'var(--subtext)', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#D97706" /> <div><strong>1000 e-maili</strong> automatycznych / mies.</div></li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#D97706" /> <div><strong>100 leadów</strong> potencjalnych klientów</div></li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#D97706" /> <div>Zaawansowany Cold Email i wskazówki</div></li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#D97706" /> <div>Pełna zmiana tonu i stylu pisania</div></li>
            </ul>
            
            <button 
              disabled={userTier >= 2 || loadingPriceId !== null}
              style={{ width: '100%', padding: '16px', borderRadius: '99px', background: '#D97706', color: '#FFF', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: (userTier >= 2 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 2 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto', boxShadow: '0 8px 20px -6px rgba(217, 119, 6, 0.4)' }}
              onClick={() => {
                if (userTier >= 2) return;
                handlePlanSelection(PRICE_PRO);
              }}
            >
              {loadingPriceId === PRICE_PRO ? "Przekierowywanie..." : (userTier >= 2 ? (userTier === 2 ? "Twój obecny plan" : "Downgrade") : "Zaczynamy z PRO")}
            </button>
          </div>
 
          {/* Pakiet 3 (MAX) */}
          <div className={`animate-fade-in-up animate-delay-4 ${styles.lindyPricingCard}`} style={{ padding: '40px', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>MESKIAI MAX</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', marginBottom: '32px' }}>Dla przedsiębiorstw pragnących absolutnej dominacji.</div>
            
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.04em', lineHeight: 1 }}>899</span>
              <span style={{ fontSize: '1rem', color: 'var(--subtext)', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#3B82F6" /> <div><strong>Brak limitów</strong> e-maili i zapytań</div></li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#3B82F6" /> <div>Pełna automatyzacja Cold Email</div></li>
              <li style={{ display: 'flex', gap: '12px', color: 'var(--subtext)', fontSize: '0.95rem' }}><CheckCircle size={20} color="#3B82F6" /> <div><strong>Dedykowany Account Manager</strong></div></li>
            </ul>
            
            <button 
              disabled={userTier >= 3 || loadingPriceId !== null}
              style={{ width: '100%', padding: '16px', borderRadius: '99px', background: 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '1rem', border: '1px solid var(--glass-border)', cursor: (userTier >= 3 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 3 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }}
              onClick={() => {
                if (userTier >= 3) return;
                handlePlanSelection(PRICE_MAX);
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-border)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {loadingPriceId === PRICE_MAX ? "Przekierowywanie..." : (userTier >= 3 ? "Twój obecny plan" : "Wybieram MAX")}
            </button>
          </div>
        </div>

        {/* Risk Reversal under Pricing */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--subtext)' }}>
          <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', color: '#10b981', marginRight: '6px' }}/> 
          Anuluj w dowolnym momencie. Brak długoterminowych umów i ukrytych opłat.
        </div>
      </FadeInWhenVisible>

      {/* FAQ Section */}
      <FadeInWhenVisible className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            FAQ
          </h2>
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
              <>Oczywiście! MESKIAI doskonale radzi sobie z zarządzaniem wieloma skrzynkami (np. biuro@, kontakt@, sprzedaz@) w jednym centralnym systemie, sortując maile według ich priorytetów.</>
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

      {/* Bottom CTA Section */}
      {/* Bottom CTA Section */}
      <FadeInWhenVisible style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        padding: 'clamp(60px, 15vw, 140px) 20px clamp(60px, 15vw, 120px)', 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        background: 'radial-gradient(ellipse 100% 100% at bottom center, rgba(250, 204, 21, 0.2) 0%, rgba(254, 240, 138, 0.05) 50%, transparent 100%)'
      }}>
        <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: '16px' }}>
          Gotowy, kiedy i Ty jesteś.
        </h2>
        <p style={{ color: '#475569', fontSize: '1.2rem', marginBottom: '36px', maxWidth: '600px', fontWeight: 500 }}>
          Rozpocznij automatyzację w kilka minut. Zobacz różnicę od pierwszego dnia.
        </p>
        <div style={{ display: 'flex', gap: '14px', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{ textDecoration: 'none', background: '#3b82f6', color: '#fff', borderRadius: '30px', padding: '14px 32px', fontWeight: 600, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>
              Przejdź do Panelu <ArrowRight size={20} />
            </Link>
          ) : (
            <button
              className={styles.ctaBtnPrimary}
              onClick={handleLogin}
              disabled={isLoggingIn}
              style={{ cursor: isLoggingIn ? 'wait' : 'pointer', opacity: isLoggingIn ? 0.7 : 1, background: '#3b82f6', color: '#fff', borderRadius: '30px', padding: '14px 32px', fontWeight: 600, border: 'none', fontSize: '1.05rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}
            >
              {isLoggingIn ? 'Logowanie...' : 'Wypróbuj za darmo'}
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0', fontWeight: 500 }}>
          3-dniowy okres próbny • Anuluj w dowolnym momencie
        </p>
      </FadeInWhenVisible>

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
