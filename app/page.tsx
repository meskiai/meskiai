"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Zap, FileText, Settings, ArrowRight, CheckCircle, Sparkles, Shield, Clock, Users, BookOpen, LogOut, Home as HomeIcon, Globe, Inbox, Sliders, BarChart2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPriceId, setCurrentPriceId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX) return 3;
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return 2;
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC) return 1;
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
      <div className={styles.ambientBackground}>
        <div className={styles.ambientBlob}></div>
      </div>
      
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
            <ThemeToggle />
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
                  onClick={() => {
                    document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Wybierz pakiet
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.badge} animate-fade-in`}>
          <Sparkles size={14} className={styles.badgeHighlight} /> Nowa era automatyzacji B2B
        </div>
        
        <h1 className={`${styles.heroTitle} animate-fade-in animate-delay-1`}>
          Zatrudnij AI. <br />Uwolnij swój czas.
        </h1>
        
        <h2 className={`${styles.heroSubtitle} animate-fade-in animate-delay-2`}>
          Aplikacja MESKIAI to innowacyjny panel zarządzania Twoim wirtualnym asystentem e-mail. Logowanie za pomocą Google pozwala nam na bezpieczną identyfikację Twojego konta w naszym systemie. Aplikacja nie wymaga i nie prosi o dostęp do czytania Twoich skrzynek pocztowych przez interfejs API Google.
        </h2>
        
        <div className={`${styles.ctaWrapper} animate-fade-in animate-delay-3`}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{textDecoration: 'none'}}>
              Przejdź do Panelu <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <button className={styles.ctaBtnPrimary} onClick={() => {
                document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Wybierz pakiet
              </button>
              <button className={styles.ctaBtnSecondary} onClick={() => {
                document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Zobacz Cennik
              </button>
            </>
          )}
        </div>
      </section>

      {/* Pricing Section (Apple Style) */}
      <section className={styles.pricingSection} id="cennik">
        <div className={styles.pricingHeader}>
          <h2 className="animate-fade-in-up">Moc obliczeniowa.<br/>Zamiast listy płac.</h2>
          <p className="animate-fade-in-up animate-delay-1">Wybierz pakiet idealnie dopasowany do skali Twojej firmy.</p>
        </div>
        
        <div className={`animate-fade-in-up animate-delay-1 ${styles.warningBox}`}>
          {/* Subtle glow effect in the background */}
          <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(60px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent)', filter: 'blur(60px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }}></div>

          <div style={{ 
            width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 16px rgba(0,122,255,0.25)' 
          }}>
            <Mail size={24} color="white" />
          </div>
          
          <div style={{ fontSize: '1rem', lineHeight: '1.6', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--foreground)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.3px' }}>Ważna informacja przed zakupem</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Pamiętaj, aby dokonać zakupu <strong>logując się dokładnie na konto Gmail firmowe</strong>, na którym ma działać Agent AI. Twój asystent zostanie trwale przypisany do konta, z którego wykupiono subskrypcję, aby móc płynnie zarządzać Twoją komunikacją biznesową.
            </p>
          </div>
        </div>
        
        <div className={styles.pricingGrid}>
          {/* Pakiet 1 */}
          <div className={`${styles.pricingCard} animate-fade-in-up animate-delay-2`}>
            <div className={styles.pricingName}>Meski AI</div>
            <div className={styles.pricingDesc}>Podstawowa moc automatyzacji dla freelancerów i małych firm.</div>
            <div className={styles.pricingPrice}>299 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={18} /> Osobisty Agent AI do poczty</li>
              <li><CheckCircle size={18} /> Do 50 automatycznych e-maili miesięcznie</li>
              <li><CheckCircle size={18} /> Do 10 wyszukań konkurencji miesięcznie</li>
              <li><CheckCircle size={18} /> Podstawowe podpowiedzi biznesowe</li>
              <li><CheckCircle size={18} /> Propozycje klientów (limit 10 B2B)</li>
              <li><CheckCircle size={18} /> Zintegrowana baza wiedzy</li>
            </ul>
            
            <button 
              className={styles.pricingBtn} 
              disabled={userTier >= 1}
              style={{ opacity: userTier >= 1 ? 0.5 : 1, cursor: userTier >= 1 ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (userTier >= 1) return;
                localStorage.setItem('selectedPlan', JSON.stringify({ id: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'basic', time: Date.now() }));
                if (status === "authenticated") {
                  router.push("/dashboard");
                } else {
                  signIn("google", { callbackUrl: "/dashboard" });
                }
              }}
            >
              {userTier >= 1 ? (userTier === 1 ? "Twój obecny plan" : "Niedostępne (Downgrade)") : "Wybieram ten pakiet"}
            </button>
          </div>

          {/* Pakiet 2 (PRO) - Rekomendowany */}
          <div className={`${styles.pricingCard} ${styles.pro} animate-fade-in-up animate-delay-3`}>
            <div>
              <div className={styles.proBadge}><Sparkles size={14}/> Rekomendowany</div>
              <div className={styles.pricingName}>Meski AI PRO</div>
              <div className={styles.pricingDesc}>Zbudowany dla skalujących się biznesów. Prawdziwy pracownik w chmurze.</div>
              <div className={styles.pricingPrice}>699 <span>zł / mies.</span></div>
            </div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={18} /> Osobisty Agent AI do poczty</li>
              <li><CheckCircle size={18} /> Do 1000 automatycznych e-maili miesięcznie</li>
              <li><CheckCircle size={18} /> Do 100 wyszukań konkurencji miesięcznie</li>
              <li><CheckCircle size={18} /> Zaawansowane podpowiedzi biznesowe</li>
              <li><CheckCircle size={18} /> Propozycje klientów (limit 200 B2B)</li>
              <li><CheckCircle size={18} /> Cold Email (Generowanie AI)</li>
              <li><CheckCircle size={18} /> Zmiana tonu i stylu pisania Agenta</li>
            </ul>
            
            <button 
              className={styles.pricingBtn} 
              disabled={userTier >= 2}
              style={{ opacity: userTier >= 2 ? 0.5 : 1, cursor: userTier >= 2 ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (userTier >= 2) return;
                localStorage.setItem('selectedPlan', JSON.stringify({ id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'pro', time: Date.now() }));
                if (status === "authenticated") {
                  router.push("/dashboard");
                } else {
                  signIn("google", { callbackUrl: "/dashboard" });
                }
              }}
            >
              {userTier >= 2 ? (userTier === 2 ? "Twój obecny plan" : "Niedostępne (Downgrade)") : "Zaczynamy z PRO"}
            </button>
          </div>

          {/* Pakiet 3 (MAX) */}
          <div className={`${styles.pricingCard} animate-fade-in-up animate-delay-4`}>
            <div className={styles.pricingName}>Meski AI MAX</div>
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
              disabled={userTier >= 3}
              style={{ opacity: userTier >= 3 ? 0.5 : 1, cursor: userTier >= 3 ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (userTier >= 3) return;
                localStorage.setItem('selectedPlan', JSON.stringify({ id: process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX || 'max', time: Date.now() }));
                if (status === "authenticated") {
                  router.push("/dashboard");
                } else {
                  signIn("google", { callbackUrl: "/dashboard" });
                }
              }}
            >
              {userTier >= 3 ? "Twój obecny plan" : "Kupuję Pakiet Max"}
            </button>
          </div>
        </div>
      </section>

      {/* Why Us Statement (Apple Style) */}
      <section className={styles.whyUsSection}>
        <div className={styles.whyUsContent}>
          <h2 className="animate-fade-in-up">
            Nie sprzedajemy oprogramowania.<br/>
            <span>Sprzedajemy Twój wolny czas.</span>
          </h2>
          <p className="animate-fade-in-up animate-delay-1">
            Większość narzędzi wymaga Twojej uwagi. Meski AI działa całkowicie w tle. Ty zyskujesz klientów i opłacone faktury, a my zajmujemy się całą czarną robotą. 
          </p>
        </div>
      </section>

      {/* Premium Bento Features Section */}
      <section className={styles.bentoSection}>
        <div className={styles.bentoHeader}>
          <span className={styles.bentoEyebrow}>Możliwości klasy Pro</span>
          <h2 className={styles.bentoTitle}>Oto co potrafi Meski AI.</h2>
          <p className={styles.bentoSubtitle}>Jeden agent. Działa 24/7. Obsługuje całą Twoją komunikację.</p>
        </div>

        <div className={styles.bentoGrid}>

          {/* HERO CARD — Agent 24/7 */}
          <div className={`${styles.bentoCard} ${styles.bentoBig} ${styles.bentoHero}`}>
            <div className={styles.bentoCardGlow} style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.35) 0%, transparent 60%)' }} />
            <div className={styles.bentoCardIcon}>
              <Bot size={28} color="white" />
            </div>
            <span className={styles.bentoCardTag} style={{ color: '#818cf8' }}>Agent AI</span>
            <h3 className={styles.bentoCardTitle}>Poczta, która działa.<br/>Kiedy Ty śpisz.</h3>
            <p className={styles.bentoCardText}>Autonomiczny asystent POP3/SMTP odpowiada na maile w Twoim imieniu — naturalnie, kontekstowo i bez Twojej ingerencji.</p>
            <div className={styles.bentoStatRow}>
              <div className={styles.bentoStat}>
                <span className={styles.bentoStatNum}>24/7</span>
                <span className={styles.bentoStatLabel}>Dostępność</span>
              </div>
              <div className={styles.bentoStat}>
                <span className={styles.bentoStatNum}>2 min</span>
                <span className={styles.bentoStatLabel}>Czas reakcji</span>
              </div>
              <div className={styles.bentoStat}>
                <span className={styles.bentoStatNum}>100%</span>
                <span className={styles.bentoStatLabel}>Automatyzacja</span>
              </div>
            </div>
          </div>

          {/* Cold Email */}
          <div className={`${styles.bentoCard} ${styles.bentoCold}`}>
            <div className={styles.bentoCardGlow} style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.3) 0%, transparent 60%)' }} />
            <div className={styles.bentoCardIcon} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <Mail size={22} color="white" />
            </div>
            <span className={styles.bentoCardTag} style={{ color: '#34d399' }}>Cold Email</span>
            <h3 className={styles.bentoCardTitle}>Zimne maile.<br/>Gorące wyniki.</h3>
            <p className={styles.bentoCardText}>AI generuje spersonalizowane maile sprzedażowe B2B, które konwertują.</p>
            <div className={styles.bentoStatRow}>
              <div className={styles.bentoStat}>
                <span className={styles.bentoStatNum}>200+</span>
                <span className={styles.bentoStatLabel}>Leadów / mies.</span>
              </div>
            </div>
          </div>

          {/* Analiza SWOT */}
          <div className={`${styles.bentoCard} ${styles.bentoSwot}`}>
            <div className={styles.bentoCardGlow} style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.3) 0%, transparent 60%)' }} />
            <div className={styles.bentoCardIcon} style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
              <BarChart2 size={22} color="white" />
            </div>
            <span className={styles.bentoCardTag} style={{ color: '#60a5fa' }}>Analiza</span>
            <h3 className={styles.bentoCardTitle}>Raport SWOT<br/>w sekundy.</h3>
            <p className={styles.bentoCardText}>Wklej link. Agent analizuje ofertę, SEO, trendy i CPC. Bez analityków.</p>
          </div>

          {/* Bezpieczeństwo */}
          <div className={`${styles.bentoCard} ${styles.bentoSecurity}`}>
            <div className={styles.bentoCardGlow} style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.25) 0%, transparent 60%)' }} />
            <div className={styles.bentoCardIcon} style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <Shield size={22} color="white" />
            </div>
            <span className={styles.bentoCardTag} style={{ color: '#c084fc' }}>Bezpieczeństwo</span>
            <h3 className={styles.bentoCardTitle}>Zero dostępu<br/>do Twojej skrzynki.</h3>
            <p className={styles.bentoCardText}>Logowanie Google tylko do identyfikacji. Dane pocztowe nigdy nie trafiają do API Google ani nie trenują modeli AI.</p>
          </div>

          {/* Czysta Skrzynka */}
          <div className={`${styles.bentoCard} ${styles.bentoInbox}`}>
            <div className={styles.bentoCardGlow} style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.25) 0%, transparent 60%)' }} />
            <div className={styles.bentoCardIcon} style={{ background: 'linear-gradient(135deg, #b45309, #fbbf24)' }}>
              <Inbox size={22} color="white" />
            </div>
            <span className={styles.bentoCardTag} style={{ color: '#fcd34d' }}>Smart Filter</span>
            <h3 className={styles.bentoCardTitle}>Tylko prawdziwi<br/>ludzie.</h3>
            <p className={styles.bentoCardText}>Spam, boty i alerty systemowe są automatycznie odsiewane. Na panelu widzisz tylko to, co ważne.</p>
          </div>

          {/* Ton odpowiedzi */}
          <div className={`${styles.bentoCard} ${styles.bentoTone}`}>
            <div className={styles.bentoCardGlow} style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(244,63,94,0.25) 0%, transparent 60%)' }} />
            <div className={styles.bentoCardIcon} style={{ background: 'linear-gradient(135deg, #9f1239, #f43f5e)' }}>
              <Sliders size={22} color="white" />
            </div>
            <span className={styles.bentoCardTag} style={{ color: '#fb7185' }}>Personalizacja</span>
            <h3 className={styles.bentoCardTitle}>Twój głos.<br/>Twoje zasady.</h3>
            <p className={styles.bentoCardText}>Wybierz ton: formalny, przyjazny, krótki. Agent zawsze pisze tak, jak Ty — nie jak robot.</p>
          </div>

        </div>
      </section>
      
      <footer className={styles.footer}>
        <div className={styles.footerLinks} style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
          <a href="/regulamin">Regulamin</a>
          <a href="/polityka-prywatnosci">Polityka Prywatności i Cookies</a>
        </div>
        <p>&copy; {new Date().getFullYear()} Meski AI. Zaprojektowano w Polsce.</p>
      </footer>
    </main>
  );
}
