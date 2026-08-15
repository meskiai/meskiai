"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, CheckCircle, BrainCircuit, Shield, Zap, Target, Bot, Activity, ArrowUpRight, TrendingUp, Users, Cpu, FileText, Lock, Globe, MessageSquare, Play, Settings, Clock, Calendar, Video, BarChart, Sparkles, Home as HomeIcon, LogOut, Database } from 'lucide-react';
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

      {/* Hero Section - Lindy.ai Style */}
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden', padding: '100px 20px 70px', textAlign: 'center' }}>

        <h1 className={styles.heroTitle} style={{ margin: '0 auto', maxWidth: '850px', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0F172A' }}>
          Pracownik AI, który <br />
          <span style={{ color: '#D97706', WebkitTextFillColor: '#D97706', background: 'none' }}>
            pozwala robić więcej.
          </span>
        </h1>
        
        <h2 className={styles.heroSubtitle} style={{ fontSize: '1.15rem', maxWidth: '620px', margin: '20px auto 36px', color: '#64748B', fontWeight: 450, lineHeight: 1.6 }}>
          MESKIAI łączy się ze wszystkimi Twoimi narzędziami, wie wszystko o Twojej firmie i wykonuje prawdziwą pracę za cały zespół.
        </h2>
        
        <div className={styles.ctaWrapper} style={{ marginTop: '0px' }}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{ textDecoration: 'none' }}>
              Przejdź do Panelu <ArrowRight size={20} />
            </Link>
          ) : (
            <>
              <button
                className={styles.ctaBtnPrimary}
                onClick={handleLogin}
                disabled={isLoggingIn}
                style={{ cursor: isLoggingIn ? 'wait' : 'pointer', opacity: isLoggingIn ? 0.7 : 1 }}
              >
                {isLoggingIn ? 'Logowanie...' : 'Wypróbuj za darmo'}
              </button>
              
              <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '10px', marginBottom: '12px', fontWeight: 450 }}>
                3-dniowy okres próbny • Anuluj w dowolnym momencie
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem', color: '#0F172A', fontWeight: 600 }}>
                <div style={{ display: 'flex', color: '#F59E0B', gap: '3px', fontSize: '0.95rem' }}>
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <span style={{ color: '#475569', fontWeight: 600, marginLeft: '2px' }}>4.9</span>
              </div>
            </>
          )}
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

      {/* Active Tasks Animation Panel -> NEW Lindy Style Panel */}
      <FadeInWhenVisible className={styles.lindySection}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className={styles.lindyTextCol}>
            <h2 className={styles.lindyTitle}>Zautomatyzuj swój e-mail.</h2>
            <p className={styles.lindyDesc}>
              Przekaż powtarzalne zadania MESKIAI. Odpowiadanie na najczęstsze pytania, kategoryzacja zapytań ofertowych, automatyczna organizacja priorytetów. Wszystko dzieje się samo, uwalniając Twój czas.
            </p>
          </div>
          <div className={styles.lindyVisualCol}>
            <div className={styles.lindyVisualBox}>
              <div className={styles.lindyGrid}>
                {/* Card 1 */}
                <div className={`${styles.lindyCard} animate-fade-in`}>
                  <div className={styles.lindyCardIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                    <Mail size={18} />
                  </div>
                  <h4 className={styles.lindyCardTitle}>Automatyczne odpowiedzi</h4>
                  <div className={styles.lindyCardBadge}>
                    <Zap size={12} /> Pisze i wysyła maile
                  </div>
                </div>
                {/* Card 2 */}
                <div className={`${styles.lindyCard} animate-fade-in animate-delay-1`}>
                  <div className={styles.lindyCardIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <Shield size={18} />
                  </div>
                  <h4 className={styles.lindyCardTitle}>Ochrona przed spamem</h4>
                  <div className={styles.lindyCardBadge}>
                    <CheckCircle size={12} /> Zawsze aktywna
                  </div>
                </div>
                {/* Card 3 */}
                <div className={`${styles.lindyCard} animate-fade-in animate-delay-2`}>
                  <div className={styles.lindyCardIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <Users size={18} />
                  </div>
                  <h4 className={styles.lindyCardTitle}>Baza wiedzy z zapytań</h4>
                  <div className={styles.lindyCardBadge}>
                    <BrainCircuit size={12} /> Analiza intencji
                  </div>
                </div>
                {/* Card 4 */}
                <div className={`${styles.lindyCard} animate-fade-in animate-delay-3`}>
                  <div className={styles.lindyCardIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Target size={18} />
                  </div>
                  <h4 className={styles.lindyCardTitle}>Wydobywanie kontaktów</h4>
                  <div className={styles.lindyCardBadge}>
                    <TrendingUp size={12} /> Rozwój bazy B2B
                  </div>
                </div>
              </div>
              <div className={styles.lindyBottomBadge}>
                <span className={styles.lindyBadgePill}>+ Nowa rutyna</span>
                <span className={styles.lindyBadgeText}>wystarczy jedno zdanie</span>
              </div>
            </div>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* Features Section - Lindy.ai Toolkit Style */}
      <FadeInWhenVisible className="animate-fade-in" style={{ padding: '60px 20px 80px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }} id="how-it-works">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', marginBottom: '12px' }}>
            ZESTAW NARZĘDZI MESKIAI
          </div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Dlaczego MESKIAI działa jak <br />
            <span style={{ color: '#D97706' }}>prawdziwy członek zespołu.</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.15rem', maxWidth: '640px', margin: '16px auto 0', fontWeight: 450, lineHeight: 1.6 }}>
            Od odpowiadania na maile po analizę rynku i pozyskiwanie leadów, MESKIAI pomaga wykonywać pracę we wszystkich narzędziach, na których polega Twój zespół.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Feature 1 */}
          <div style={{ padding: '32px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#D97706', marginBottom: '12px' }}>01</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.02em' }}>Połączony ze wszystkim.</h3>
            <p style={{ color: '#64748B', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Gmail, Outlook, baza klientów i Twoje narzędzia. MESKIAI obsługuje pocztę i zapytania automatycznie 24/7.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: '#2563EB', flexShrink: 0 }}/> Oszczędność godzin dziennie</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: '#2563EB', flexShrink: 0 }}/> Wymaga zgody przed wysyłką</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div style={{ padding: '32px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#D97706', marginBottom: '12px' }}>02</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.02em' }}>Samodzielna obsługa i leady.</h3>
            <p style={{ color: '#64748B', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Wyszukuj idealnych klientów B2B, twórz oferty i odpowiadaj na zapytania bez konieczności ciągłego nadzoru.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: '#2563EB', flexShrink: 0 }}/> Codzienne świeże kontakty</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A', fontSize: '0.9rem', fontWeight: 500 }}><CheckCircle size={16} style={{ color: '#2563EB', flexShrink: 0 }}/> Automatyczna kategoryzacja</li>
            </ul>
          </div>

        </div>
      </FadeInWhenVisible>



      {/* Pricing Section (Apple Style) */}
      <FadeInWhenVisible className={`${styles.pricingSection} animate-fade-in`} id="cennik">
        <div className={styles.pricingHeader}>
          <h2 className="animate-fade-in-up"><span style={{ color: '#3b82f6' }}>Moc obliczeniowa.</span><br/>Zamiast listy płac.</h2>
          <p className="animate-fade-in-up animate-delay-1">Wybierz pakiet idealnie dopasowany do skali Twojej firmy.</p>
        </div>
        

        <div className={styles.pricingGrid}>
          {/* Pakiet 1 */}
          <div className={`${styles.pricingCard} animate-fade-in-up animate-delay-2`}>
            <div className={styles.pricingName}>MESKIAI</div>
            <div className={styles.pricingDesc}>Podstawowa moc automatyzacji dla freelancerów i małych firm.</div>
            <div className={styles.pricingPrice}>299 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={18} /> <strong>50 e-maili</strong> automatycznych / mies.</li>
              <li><CheckCircle size={18} /> <strong>Badanie rynku i B2B</strong> (limit 10)</li>
              <li><CheckCircle size={18} /> Osobisty Pracownik AI + Baza Wiedzy</li>
            </ul>
            
            <button 
              className={styles.pricingBtn} 
              disabled={userTier >= 1 || loadingPriceId !== null}
              style={{ background: '#3b82f6', color: 'white', border: 'none', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)', opacity: (userTier >= 1 || loadingPriceId !== null) ? 0.5 : 1, cursor: (userTier >= 1 || loadingPriceId !== null) ? 'not-allowed' : 'pointer' }}
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
              <li><CheckCircle size={18} /> <strong>1000 e-maili</strong> automatycznych / mies.</li>
              <li><CheckCircle size={18} /> <strong>Badanie rynku i B2B</strong> (limit 100)</li>
              <li><CheckCircle size={18} /> Zaawansowany Cold Email i wskazówki</li>
              <li><CheckCircle size={18} /> Zmiana tonu i stylu pisania</li>
            </ul>
            
            <button 
              className={styles.pricingBtn} 
              disabled={userTier >= 2 || loadingPriceId !== null}
              style={{ background: '#3b82f6', color: 'white', border: 'none', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)', opacity: (userTier >= 2 || loadingPriceId !== null) ? 0.5 : 1, cursor: (userTier >= 2 || loadingPriceId !== null) ? 'not-allowed' : 'pointer' }}
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
              <li><CheckCircle size={18} /> <strong>Brak limitów:</strong> E-maile, Badania, Klienci</li>
              <li><CheckCircle size={18} /> Pełna automatyzacja Cold Email</li>
              <li><CheckCircle size={18} /> Zmiana tonu i stylu pisania</li>
              <li><CheckCircle size={18} /> <strong>Dedykowany Account Manager</strong></li>
            </ul>
            
            <button 
              className={styles.pricingBtn} 
              disabled={userTier >= 3 || loadingPriceId !== null}
              style={{ background: '#3b82f6', color: 'white', border: 'none', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)', opacity: (userTier >= 3 || loadingPriceId !== null) ? 0.5 : 1, cursor: (userTier >= 3 || loadingPriceId !== null) ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (userTier >= 3) return;
                const priceId = PRICE_MAX;
                handlePlanSelection(priceId);
              }}
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
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
            Masz pytania? Mamy odpowiedzi.
          </h2>
          <p style={{ color: 'var(--subtext)', fontSize: '1.1rem', marginTop: '12px' }}>
            Wszystko, co musisz wiedzieć o wdrożeniu MESKIAI w swojej firmie.
          </p>
        </div>
        
        <div className={styles.faqList}>
          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>Czy system integruje się z Shopify, WooCommerce lub innymi platformami?</summary>
            <div className={styles.faqContent}>
              Tak! MESKIAI potrafi łączyć się i czytać kontekst z popularnych platform e-commerce takich jak <strong>Shopify</strong> oraz <strong>WooCommerce</strong>. Dzięki temu Twój Pracownik AI dokładnie wie, jakie zamówienie złożył klient, zanim wygeneruje dla niego odpowiedź.
            </div>
          </details>
          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>A co jeśli Pracownik AI nie poradzi sobie w mojej firmie?</summary>
            <div className={styles.faqContent}>
              <strong>Masz 14 dni na testy bez ryzyka.</strong> Jeśli w tym czasie uznasz, że system nie oszczędza Twojego czasu, możesz anulować subskrypcję jednym kliknięciem z panelu.
            </div>
          </details>
          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>Czy MESKIAI samodzielnie wysyła wiadomości do klientów?</summary>
            <div className={styles.faqContent}>
              To zależy od Ciebie! Możesz ustawić Pracownika w tryb "Wsparcia" (tworzy gotowe do wysłania wiadomości i czeka na Twoją akceptację) lub w tryb "Autonomiczny" (samodzielnie zamyka sprawy klientów zgodnie z wytycznymi Twojej firmy).
            </div>
          </details>
          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>Jak długo trwa wdrożenie systemu?</summary>
            <div className={styles.faqContent}>
              Integracja zajmuje zaledwie kilka minut. Wystarczy autoryzować system do czytania Twojej skrzynki (np. przez bezpieczne hasło aplikacji Gmail) i zdefiniować podstawowe wytyczne dla Pracownika. System uczy się z każdym dniem.
            </div>
          </details>
          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>Czy mogę podłączyć więcej niż jedną skrzynkę e-mail?</summary>
            <div className={styles.faqContent}>
              Oczywiście! MESKIAI doskonale radzi sobie z zarządzaniem wieloma skrzynkami (np. biuro@, kontakt@, sprzedaz@) w jednym centralnym systemie, sortując maile według ich priorytetów.
            </div>
          </details>
          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>Czy dane moich klientów są bezpieczne?</summary>
            <div className={styles.faqContent}>
              Bezpieczeństwo to nasz priorytet. Korzystamy z szyfrowanych połączeń (SSL/TLS), a dane są przetwarzane zgodnie z najwyższymi standardami bezpieczeństwa i przepisami RODO. Żadne wrażliwe dane nie są udostępniane podmiotom trzecim.
            </div>
          </details>
        </div>
      </FadeInWhenVisible>

      {/* Bottom CTA Section */}
      <FadeInWhenVisible style={{ position: 'relative', overflow: 'hidden', padding: '100px 20px 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', marginBottom: '16px' }}>
          Gotowy, by zautomatyzować swoją pocztę?
        </h2>
        <p style={{ color: '#64748B', fontSize: '1.15rem', marginBottom: '32px', maxWidth: '540px' }}>
          Skonfiguruj swojego Pracownika AI w mniej niż 2 minuty i uwolnij czas od powtarzalnych zadań.
        </p>
        <div style={{ display: 'flex', gap: '14px', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{ textDecoration: 'none' }}>
              Przejdź do Panelu <ArrowRight size={20} />
            </Link>
          ) : (
            <button
              className={styles.ctaBtnPrimary}
              onClick={handleLogin}
              disabled={isLoggingIn}
              style={{ cursor: isLoggingIn ? 'wait' : 'pointer', opacity: isLoggingIn ? 0.7 : 1 }}
            >
              {isLoggingIn ? 'Logowanie...' : 'Wypróbuj za darmo'}
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '12px', fontWeight: 450 }}>
          3-dniowy okres próbny • Anuluj w dowolnym momencie
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.9rem', color: '#0F172A', fontWeight: 600 }}>
          <div style={{ display: 'flex', color: '#F59E0B', gap: '3px', fontSize: '0.95rem' }}>
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <span style={{ color: '#475569', fontWeight: 600, marginLeft: '2px' }}>4.9</span>
        </div>
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
