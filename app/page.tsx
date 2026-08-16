"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, CheckCircle, BrainCircuit, Shield, Zap, Target, Bot, Activity, ArrowUpRight, TrendingUp, Users, Cpu, FileText, Lock, Globe, MessageSquare, Play, Settings, Clock, Calendar, Video, BarChart, Sparkles, Home as HomeIcon, LogOut, Database, ChevronDown, Check } from 'lucide-react';
import { useEffect, useState, useRef } from "react";

import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";
import styles from "./page.module.css";

const TypingEmail = () => {
  const [text, setText] = useState('');
  const fullText = "Dzień dobry, na czym polega MESKIAI i jak automatyzuje obsługę zapytań?";
  const aiText = "Dzień dobry. MESKIAI to Twój autonomiczny pracownik AI. Odpowiada na pytania klientów 24/7/365, klasyfikuje maile, prowadzi research firm i przygotowuje gotowe oferty w ułamku sekundy.";
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
      {/* Console Window Bar */}
      <div style={{ padding: '14px 22px', display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#090D16', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#EF4444' }}></div>
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#F59E0B' }}></div>
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10B981' }}></div>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={14} color="#DF9E21" /> MESKIAI Neural Console v3.4
        </div>
        <div style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
          SYSTEM ACTIVE
        </div>
      </div>
      
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span>Zapytanie Klienta</span>
            <span style={{ opacity: 0.8, color: '#3B82F6' }}>[INBOUND GMAIL]</span>
          </div>
          <div style={{ fontSize: '0.95rem', color: '#F1F5F9', lineHeight: 1.65, fontWeight: 400 }}>
            {text}{!showAi && <span className={styles.typingCursor} style={{ background: '#3B82F6' }}>|</span>}
          </div>
        </div>
        
        {showAi && (
          <div className="animate-slide-right" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start', borderLeft: '3px solid #DF9E21', background: 'rgba(223, 158, 33, 0.08)', padding: '18px 22px', borderRadius: '0 16px 16px 0' }}>
            <div style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Sparkles size={14} /> MESKIAI AUTOPILOT <span style={{ opacity: 0.7, color: '#94A3B8', fontWeight: 500 }}>[99.8% CONFIDENCE]</span>
            </div>
            <div style={{ fontSize: '0.95rem', color: '#F8FAFC', lineHeight: 1.65, fontWeight: 400 }}>
              {aiTyped}{aiTyped.length < aiText.length ? <span className={styles.typingCursor} style={{ background: '#DF9E21' }}>|</span> : ''}
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
        <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease', color: '#DF9E21' }} />
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
  <section style={{ padding: '0 20px 40px', maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '32px', opacity: 0.9 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
      <Shield size={16} color="#16A34A" /> 100% Zgodność z RODO
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
      <Lock size={16} color="#2563EB" /> Szyfrowanie SSL/TLS
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
      <BrainCircuit size={16} color="#DF9E21" /> Powered by OpenAI
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
      
      {/* Floating Apple/Lindy Pill Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            <img src="/logo.png" alt="MESKIAI" className={styles.logoImg} />
            <span className={styles.logoText}>MESKIAI</span>
          </Link>

          <ul className={styles.navLinks}>
            <li><a href="#mozliwosci" className={styles.navLink}>Możliwości</a></li>
            <li><a href="#jak-dziala" className={styles.navLink}>Jak działa</a></li>
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

      {/* Hero Section - Apple x Lindy Aesthetics */}
      <section className={styles.hero}>
        <div className={styles.appleBadgePill}>
          <div className={styles.pulseDot}></div>
          <Sparkles size={14} color="#DF9E21" /> SYSTEM AUTONOMICZNY NV-AI v3.4 ACTIVE
        </div>

        <h1 className={styles.lindyHeroTitle}>
          Pracownik AI, który rozwiązuje <br/>
          Twoje maile <span className={styles.goldGlowText}>zanim zdążysz je przeczytać.</span>
        </h1>
        
        <p className={styles.heroSubtitle}>
          MESKIAI przejmuje obsługę zapytań klientów, kwalifikuje leady B2B i automatyzuje procedury w ułamku sekundy.
        </p>
        
        <div className={styles.ctaWrapper}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnLindy} style={{ textDecoration: 'none' }}>
              Przejdź do Panelu <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              className={styles.ctaBtnLindy}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Rozpocznij 3-dniowy Test Bez Opłat <ArrowRight size={18} />
            </button>
          )}
          <div className={styles.heroTrialText}>
            Brak opłat na start • Natychmiastowa aktywacja w 2 minuty
          </div>
        </div>

        {/* Real-Time Stats Counter Cards */}
        <div className={styles.statsBarGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.statValGold}`}>99.8%</div>
            <div className={styles.statLbl}>Trafność klasyfikacji zapytań</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statVal}>&lt; 3 sek</div>
            <div className={styles.statLbl}>Czas reakcji w trybie 24/7</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statVal} ${styles.statValGold}`}>100%</div>
            <div className={styles.statLbl}>Zgodność z RODO i szyfrowanie</div>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* Live AI Console Window */}
      <FadeInWhenVisible tilt id="jak-dziala" style={{ padding: '20px 20px 60px', maxWidth: '980px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '980px', width: '100%', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className={styles.lindyTitle}>
              Zaprojektowany, by działać bezobsługowo.
            </h2>
            <p style={{ color: '#64748B', marginTop: '10px', fontSize: '1.08rem' }}>
              Zobacz na żywo, jak MESKIAI przetwarza zapytania klientów.
            </p>
          </div>
          
          <div style={{ position: 'relative' }}>
            <TypingEmail />
          </div>
        </div>
      </FadeInWhenVisible>

      {/* LINDY FEATURE 01 - Skill Matrix */}
      <FadeInWhenVisible id="mozliwosci" className={styles.lindySection}>
        <div className={styles.lindyContainer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.lindyNumber}>// 01</div>
            <h2 className={styles.lindyTitle}>Przejmuje Twoje obowiązki.</h2>
            <p className={styles.lindyDesc}>
              Posiada dziesiątki wbudowanych umiejętności: obsługa zapytań, generowanie leadów, tworzenie raportów, kategoryzacja wiadomości. Zrób coś raz, zapisz jako procedurę, a cały zespół będzie mógł z tego korzystać.
            </p>
          </div>
          <div>
            <div className={styles.lindyVisualBox}>
              <div className={styles.lindySkillHeader}>
                <span className={styles.lindySkillTitle}>Umiejętności Agenta</span>
                <span className={styles.lindySkillMeta}>12 aktywnych modułów</span>
              </div>
              <div className={styles.lindyGrid}>
                <div className={styles.lindySkillPill}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}><Mail size={16} /></div>
                    Obsługa zapytań
                  </div>
                  <div className={styles.lindySkillToggle}>WŁ</div>
                </div>
                <div className={styles.lindySkillPill}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: '#DCFCE7', color: '#16A34A' }}><Target size={16} /></div>
                    Generowanie leadów
                  </div>
                  <div className={styles.lindySkillToggle}>WŁ</div>
                </div>
                <div className={styles.lindySkillPill}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: '#FEF3C7', color: '#D97706' }}><TrendingUp size={16} /></div>
                    Analiza ofert
                  </div>
                  <div className={styles.lindySkillToggle}>WŁ</div>
                </div>
                <div className={styles.lindySkillPill}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: '#FEE2E2', color: '#EF4444' }}><Calendar size={16} /></div>
                    Terminarz
                  </div>
                  <div className={styles.lindySkillToggle}>WŁ</div>
                </div>
                <div className={styles.lindySkillPill}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: '#F3E8FF', color: '#9333EA' }}><BrainCircuit size={16} /></div>
                    Research firm
                  </div>
                  <div className={styles.lindySkillToggle}>WŁ</div>
                </div>
                <div className={styles.lindySkillPill}>
                  <div className={styles.lindySkillLeft}>
                    <div className={styles.lindySkillIcon} style={{ background: '#F1F5F9', color: '#64748B' }}><BarChart size={16} /></div>
                    Raportowanie
                  </div>
                  <div className={styles.lindySkillToggleInstall}>+ DODAJ</div>
                </div>
              </div>
              
              <div className={styles.lindyDashedBox}>
                <div className={styles.lindyDashedIcon}>+</div>
                <div className={styles.lindyDashedText}>
                  <h4>Stwórz własną procedurę</h4>
                  <p>Pokaż MESKIAI jak wykonujesz zadanie. Zostanie zapamiętana dla całego zespołu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* LINDY FEATURE 02 - 24/7 Operation */}
      <FadeInWhenVisible className={styles.lindySection}>
        <div className={styles.lindyContainer}>
          <div>
            <div className={styles.lindyVisualBox}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>Zapytanie o integrację B2B</span>
                     <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Teraz</span>
                   </div>
                   <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>Dzień dobry, chcemy przetestować MESKIAI dla zespołu 15 doradców. Czy posiadają Państwo opiekuna wdrożenia?</p>
                   <div style={{ marginTop: '14px', padding: '12px 14px', background: '#EFF6FF', borderRadius: '12px', borderLeft: '3px solid #2563EB' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                       <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB' }}>MESKIAI odpowiedział (0.3s)</span>
                     </div>
                     <p style={{ fontSize: '0.82rem', color: '#1E40AF', margin: 0, lineHeight: 1.5 }}>Dzień dobry! Z przyjemnością. W planie Enterprise przydzielamy dedykowanego opiekuna. Szczegóły wysłałem w załączniku...</p>
                   </div>
                 </div>
                 
                 <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>Weryfikacja zamówienia #8492</span>
                     <span style={{ fontSize: '0.75rem', color: '#64748B' }}>8 min temu</span>
                   </div>
                   <div style={{ padding: '8px 12px', background: '#DCFCE7', borderRadius: '10px', color: '#16A34A', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                     <Check size={14} /> Auto-odpowiedź wysłana • Zrealizowano
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.lindyNumber}>// 02</div>
            <h2 className={styles.lindyTitle}>Działa 24/7 bez przerw.</h2>
            <p className={styles.lindyDesc}>
              Twoi klienci nie muszą już czekać na odpowiedź do poniedziałku. MESKIAI odpisuje na wiadomości w ułamku sekundy, nawet w środku nocy lub podczas świąt. Zwiększ konwersję dzięki natychmiastowej reakcji i podnieś jakość obsługi.
            </p>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* LINDY FEATURE 03 - Prospecting */}
      <FadeInWhenVisible className={styles.lindySection}>
        <div className={styles.lindyContainer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className={styles.lindyNumber}>// 03</div>
            <h2 className={styles.lindyTitle}>Poszukiwanie klientów i pisanie ofert.</h2>
            <p className={styles.lindyDesc}>
              Skonfiguruj kryteria, a MESKIAI samodzielnie przeszuka sieć, zidentyfikuje potencjalnych klientów, zweryfikuje ich dane kontaktowe i wyśle im w pełni spersonalizowaną ofertę. Ty otrzymujesz tylko gotowe leady.
            </p>
          </div>
          <div>
            <div className={styles.lindyVisualBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>Pozyskani Klienci B2B</span>
                <span style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', color: '#16A34A', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>+42 dziś</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#0F172A' }}>KS</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>Kamil Stępień</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Dyrektor ds. Sprzedaży</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#D97706', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>Wysłano ofertę</span>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', color: '#0F172A' }}>JK</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>Julia Kamińska</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Operations Manager</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>Umówiono spotkanie</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* Luxury Pricing Grid */}
      <FadeInWhenVisible id="cennik" style={{ padding: '90px 20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ color: '#DF9E21', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '14px', textTransform: 'uppercase', fontFamily: 'var(--font-heading) !important' }}>PRZEJRZYSTA SUBSKRYPCJA</div>
          <h2 className={styles.lindyTitle} style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)' }}>
            Zatrudnij pracownika, który <br/>
            <span className={styles.goldGlowText}>dostarcza więcej, niż kosztuje.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
          {/* Pakiet 1 */}
          <div className={styles.lindyPricingCard} style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>MESKIAI</div>
            <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '32px' }}>Podstawowa moc automatyzacji dla małych firm.</div>
            
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>299</span>
              <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#2563EB" /> <div><strong>50 e-maili</strong> automatycznych / mies.</div></li>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#2563EB" /> <div><strong>10 leadów</strong> do poszukiwań B2B</div></li>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#2563EB" /> <div>Osobisty Pracownik AI + Baza Wiedzy</div></li>
            </ul>
            
            <button 
              disabled={userTier >= 1 || loadingPriceId !== null}
              style={{ width: '100%', padding: '16px', borderRadius: '99px', background: 'transparent', color: '#0F172A', fontWeight: 600, fontSize: '1rem', border: '1px solid #E2E8F0', cursor: (userTier >= 1 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 1 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }}
              onClick={() => {
                if (userTier >= 1) return;
                handlePlanSelection(PRICE_BASIC);
              }}
            >
              {loadingPriceId === PRICE_BASIC ? "Przekierowywanie..." : (userTier >= 1 ? (userTier === 1 ? "Twój obecny plan" : "Downgrade") : "Wybieram ten pakiet")}
            </button>
          </div>

          {/* Pakiet 2 (PRO) - Rekomendowany */}
          <div className={`${styles.lindyPricingCard} ${styles.proGoldPricingCard}`} style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #F59E0B, #DF9E21)', color: '#FFFFFF', padding: '6px 20px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}><Sparkles size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> REKOMENDOWANY</div>
            
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>MESKIAI PRO</div>
            <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '32px' }}>Prawdziwy pracownik w chmurze dla skalujących się firm.</div>
            
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '4rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>699</span>
              <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#DF9E21" /> <div><strong>1000 e-maili</strong> automatycznych / mies.</div></li>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#DF9E21" /> <div><strong>100 leadów</strong> do poszukiwań B2B</div></li>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#DF9E21" /> <div>Zaawansowany Cold Email i wskazówki</div></li>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#DF9E21" /> <div>Pełna zmiana tonu i stylu pisania</div></li>
            </ul>
            
            <button 
              disabled={userTier >= 2 || loadingPriceId !== null}
              style={{ width: '100%', padding: '16px', borderRadius: '99px', background: 'linear-gradient(135deg, #DF9E21 0%, #D97706 100%)', color: '#FFFFFF', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: (userTier >= 2 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 2 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto', boxShadow: '0 10px 25px rgba(223, 158, 33, 0.4)' }}
              onClick={() => {
                if (userTier >= 2) return;
                handlePlanSelection(PRICE_PRO);
              }}
            >
              {loadingPriceId === PRICE_PRO ? "Przekierowywanie..." : (userTier >= 2 ? (userTier === 2 ? "Twój obecny plan" : "Downgrade") : "Zaczynamy z PRO")}
            </button>
          </div>

          {/* Pakiet 3 (MAX) */}
          <div className={styles.lindyPricingCard} style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>MESKIAI MAX</div>
            <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '32px' }}>Dla przedsiębiorstw pragnących absolutnej dominacji.</div>
            
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>899</span>
              <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>zł / mies.</span>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#2563EB" /> <div><strong>Brak limitów</strong> e-maili i zapytań</div></li>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#2563EB" /> <div>Pełna automatyzacja Cold Email</div></li>
              <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '0.95rem' }}><CheckCircle size={20} color="#2563EB" /> <div><strong>Dedykowany Account Manager</strong></div></li>
            </ul>
            
            <button 
              disabled={userTier >= 3 || loadingPriceId !== null}
              style={{ width: '100%', padding: '16px', borderRadius: '99px', background: 'transparent', color: '#0F172A', fontWeight: 600, fontSize: '1rem', border: '1px solid #E2E8F0', cursor: (userTier >= 3 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 3 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }}
              onClick={() => {
                if (userTier >= 3) return;
                handlePlanSelection(PRICE_MAX);
              }}
            >
              {loadingPriceId === PRICE_MAX ? "Przekierowywanie..." : (userTier >= 3 ? "Twój obecny plan" : "Wybieram MAX")}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: '#64748B' }}>
          <CheckCircle size={15} style={{ display: 'inline', verticalAlign: 'text-bottom', color: '#16A34A', marginRight: '6px' }}/> 
          Anuluj w dowolnym momencie. Brak długoterminowych umów i ukrytych opłat.
        </div>
      </FadeInWhenVisible>

      {/* FAQ Section */}
      <FadeInWhenVisible id="faq" style={{ padding: '50px 20px', maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 className={styles.lindyTitle} style={{ margin: 0 }}>
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
      <FadeInWhenVisible style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        padding: 'clamp(70px, 12vw, 130px) 20px', 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        background: 'radial-gradient(ellipse 100% 100% at bottom center, rgba(223, 158, 33, 0.12) 0%, rgba(254, 240, 138, 0.03) 50%, transparent 100%)'
      }}>
        <h2 className={styles.lindyTitle} style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)', marginBottom: '18px' }}>
          Gotowy, kiedy i Ty jesteś.
        </h2>
        <p style={{ color: '#475569', fontSize: '1.15rem', marginBottom: '36px', maxWidth: '600px', fontWeight: 450 }}>
          Rozpocznij automatyzację w kilka minut. Zobacz różnicę od pierwszego dnia.
        </p>
        <div style={{ display: 'flex', gap: '14px', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnLindy} style={{ textDecoration: 'none' }}>
              Przejdź do Panelu <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              className={styles.ctaBtnLindy}
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Logowanie...' : 'Wypróbuj za darmo'} <ArrowRight size={18} />
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
          3-dniowy okres próbny • Anuluj w dowolnym momencie
        </p>
      </FadeInWhenVisible>

      <footer className={styles.advancedFooter}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogo}>
              <img src="/logo.png" alt="MESKIAI" style={{ width: '28px', height: '28px' }} />
              MESKIAI
            </div>
            <p className={styles.footerDesc}>
              Zautomatyzuj swój biznes w 5 minut. Uwolnij czas swojego zespołu i przyspiesz wzrost dzięki potędze sztucznej inteligencji.
            </p>
          </div>
          <div>
            <div className={styles.footerHeading}>Produkt</div>
            <ul className={styles.footerLinks}>
              <li><a href="#mozliwosci">Możliwości</a></li>
              <li><a href="#jak-dziala">Jak działa</a></li>
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
