"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Mail, Zap, FileText, Settings, ArrowRight, CheckCircle, Sparkles, Shield, Clock, Users, BookOpen, LogOut, Home as HomeIcon } from "lucide-react";
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
        
        <div className="animate-fade-in-up animate-delay-1" style={{ 
          maxWidth: '800px', 
          margin: '0 auto 48px auto', 
          padding: '24px 32px', 
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--mac-shadow), inset 0 1px 1px rgba(255,255,255,0.2)',
          borderRadius: '24px', 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '20px', 
          color: 'var(--subtext)', 
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden'
        }}>
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
              <li style={{ color: 'var(--subtext)' }}><CheckCircle size={18} style={{ opacity: 0.5 }} /> Brak opcji zmiany tonu agenta (Tylko PRO/MAX)</li>
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

      {/* Clean 3-Column Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <div className={`${styles.badge} animate-fade-in-up`} style={{ marginBottom: '16px', display: 'inline-flex' }}>
            <Sparkles size={14} className={styles.badgeHighlight} /> Co oferujemy
          </div>
          <h2 className="animate-fade-in-up">Moc, której potrzebujesz.<br/>Zamknięta w pięknym szkle.</h2>
        </div>
        
        <div className={styles.featuresMinimalGrid}>
          {/* Pillar 1 */}
          <div className={`${styles.featureMinimalItem} animate-fade-in-up`}>
            <div className={styles.featureNumber}>01</div>
            <Zap size={32} className={styles.minimalIcon} />
            <h3>Automatyzacja 360°</h3>
            <p>Zastępujemy człowieka w rutynie. Twój osobisty agent AI natychmiast odpisuje klientom, pilnując Twojej bazy wiedzy.</p>
          </div>

          {/* Pillar 2 */}
          <div className={`${styles.featureMinimalItem} animate-fade-in-up animate-delay-1`}>
            <div className={styles.featureNumber}>02</div>
            <Users size={32} className={styles.minimalIcon} />
            <h3>Proaktywna Sprzedaż</h3>
            <p>Zapomnij o braku leadów. Inteligentny moduł analizuje rynek i na tacy podsuwa Ci wyselekcjonowane, gotowe na współpracę kontakty B2B.</p>
          </div>

          {/* Pillar 3 */}
          <div className={`${styles.featureMinimalItem} animate-fade-in-up animate-delay-2`}>
            <div className={styles.featureNumber}>03</div>
            <Shield size={32} className={styles.minimalIcon} />
            <h3>Pancerne Bezpieczeństwo</h3>
            <p>Jakość klasy Enterprise. Oferujemy bankowe szyfrowanie i pewność, że Twoje dane biznesowe nigdy nie posłużą do treningu publicznych modeli AI.</p>
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
