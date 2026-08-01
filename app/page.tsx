"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bot, Mail, Zap, FileText, Settings, ArrowRight, CheckCircle, Sparkles, 
  Shield, Clock, Users, BookOpen, LogOut, Home as HomeIcon, AlertCircle,
  ChevronRight, ArrowUpRight, Search, Globe, Lock
} from "lucide-react";
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
      <div style={{ display: 'flex', width: '100vw', height: '100vh', background: 'var(--background)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--foreground)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      {/* Light dynamic background gradient */}
      <div className={styles.ambientBackground} />
      
      {/* Frosted Glass Nav */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo} onClick={() => router.push("/")}>
            <img
              src="/logo.png"
              alt="MESKIAI logo"
              style={{ filter: 'var(--logo-filter)' }}
            />
            <span>MESKIAI</span>
          </div>

          <div className={styles.navLinks}>
            <a href="#funkcje" className={styles.navLink}>Funkcje</a>
            <a href="#cennik" className={styles.navLink}>Cennik</a>
            <a href="/regulamin" className={styles.navLink}>Regulamin</a>
          </div>
          
          <div className={styles.navActions}>
            <ThemeToggle />
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
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                        {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      background: 'var(--card-bg)', backdropFilter: 'saturate(140%) blur(35px)',
                      WebkitBackdropFilter: 'saturate(140%) blur(35px)',
                      border: '1px solid var(--border)', borderRadius: '12px',
                      padding: '6px', width: '200px',
                      boxShadow: 'var(--mac-shadow)',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session?.user?.name || session?.user?.email?.split('@')[0]}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--subtext)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session?.user?.email}
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color: 'var(--foreground)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', transition: 'background 0.15s', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HomeIcon size={13} style={{ color: 'var(--subtext)' }} /> Panel roboczy
                    </Link>

                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#ff453a', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={13} /> Wyloguj się
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className={styles.ctaBtnNav}
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                Zaloguj się
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Split-Screen Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.splitHeroGrid}>
          {/* Hero Left - Text & Buttons */}
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <Sparkles size={12} className={styles.badgeHighlight} /> Poczta Biznesowa Nowej Generacji
            </div>
            
            <h1 className={styles.heroTitle}>
              Poczta, która pracuje. <br />Kiedy Ty odpoczywasz.
            </h1>
            
            <p className={styles.heroSubtitle}>
              Pierwszy w pełni autonomiczny asystent e-mail dla biznesu B2B. Działa w chmurze przez całą dobę. Odpowiada klientom, zbiera leady i chroni Twój wolny czas.
            </p>
            
            <div className={styles.ctaWrapper}>
              {status === "authenticated" ? (
                <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{ textDecoration: 'none' }}>
                  Otwórz Panel roboczy <ArrowRight size={15} />
                </Link>
              ) : (
                <>
                  <button className={styles.ctaBtnPrimary} onClick={() => {
                    document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Rozpocznij korzystanie
                  </button>
                  <button className={styles.ctaBtnSecondary} onClick={() => {
                    document.getElementById('funkcje')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Dowiedz się więcej <ChevronRight size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero Right - Minimal Status Widget */}
          <div className={styles.heroRight}>
            <div className={styles.heroStatusWidget}>
              <div className={styles.statusHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={styles.activeIndicator} />
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--foreground)' }}>Agent AI: Aktywny</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--subtext)' }}>Live Monitor</span>
              </div>
              
              <div className={styles.statusIndicators}>
                <div>
                  <div className={styles.statusLabel}>Wykorzystanie CPU</div>
                  <div className={styles.statusValue}>1.4%</div>
                </div>
                <div>
                  <div className={styles.statusLabel}>Uptime</div>
                  <div className={styles.statusValue}>99.99%</div>
                </div>
                <div>
                  <div className={styles.statusLabel}>Weryfikacja wiedzy</div>
                  <div className={styles.statusValue}>Zabezpieczona</div>
                </div>
              </div>

              <div className={styles.statusList}>
                <div className={styles.statusRow}>
                  <span>📥 Zapytanie ofertowe</span>
                  <span className={`${styles.statusRowBadge} ${styles.badgeSuccess}`}>Auto-odpowiedź</span>
                </div>
                <div className={styles.statusRow}>
                  <span>📞 Ustalenie terminu</span>
                  <span className={`${styles.statusRowBadge} ${styles.badgeProgress}`}>W toku</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Narrative Feature Rows */}
      <section className={styles.featureRowsSection} id="funkcje">
        
        {/* Row 1 - AI Autopilot */}
        <div className={styles.featureRow}>
          <div className={styles.rowText}>
            <div className={styles.rowLabel}>Autopilot e-mail</div>
            <h2 className={styles.rowTitle}>Odpisywanie na autopilocie. Zawsze w punkt.</h2>
            <p className={styles.rowDesc}>
              Twój asystent na bieżąco odbiera wiadomości i pisze profesjonalne odpowiedzi w ułamku sekundy. Doskonale odróżnia maile o spotkaniach, wycenach czy reklamacjach, automatycznie przypisując im odpowiednie statusy.
            </p>
          </div>
          <div className={styles.rowVisual}>
            <div className={styles.featureWidget}>
              <div className={styles.mailSimContainer}>
                <div className={styles.mailSimBubble}>
                  <strong>Klient:</strong> Czy mają Państwo wolny czas na rozmowę w ten piątek o 14:00?
                </div>
                <div className={`${styles.mailSimBubble} ${styles.mailSimAgent}`}>
                  <strong>Agent AI:</strong> Dziękuję za kontakt. Piątek o godzinie 14:00 nam odpowiada. Proszę o potwierdzenie rezerwacji.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 - B2B Lead generation */}
        <div className={styles.featureRowInverse}>
          <div className={styles.rowVisual}>
            <div className={styles.featureWidget}>
              <div className={styles.leadsSimContainer}>
                <div className={styles.leadsSimRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={styles.leadsSimAvatar}>PK</div>
                    <span style={{ fontWeight: 600 }}>Piotr Kowalski</span>
                  </div>
                  <span className={styles.leadsSimPercent}>92% dopasowania</span>
                </div>
                <div className={styles.leadsSimRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={styles.leadsSimAvatar} style={{ background: '#30d158' }}>AM</div>
                    <span style={{ fontWeight: 600 }}>Anna Mazur</span>
                  </div>
                  <span className={styles.leadsSimPercent}>88% dopasowania</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.rowText}>
            <div className={styles.rowLabel}>Sprzedaż proaktywna</div>
            <h2 className={styles.rowTitle}>Inteligentne targetowanie B2B. Leady w skrzynce.</h2>
            <p className={styles.rowDesc}>
              System nie tylko czeka na maile – sam szuka dla Ciebie potencjalnych kontrahentów na rynku. Analizuje profile firm i na tacy podsuwa Ci idealnie dopasowane kontakty handlowe wraz z wersją roboczą pierwszej wiadomości.
            </p>
          </div>
        </div>

        {/* Row 3 - Website integration context */}
        <div className={styles.featureRow}>
          <div className={styles.rowText}>
            <div className={styles.rowLabel}>Baza Wiedzy</div>
            <h2 className={styles.rowTitle}>Wiedza wstrzyknięta prosto z Twojej witryny WWW.</h2>
            <p className={styles.rowDesc}>
              Zapomnij o żmudnym wpisywaniu instrukcji. Wklej link do swojej strony internetowej, a Agent AI automatycznie pobierze z niej cenniki, usługi i regulaminy, tworząc z nich nieomylną bazę wiedzy.
            </p>
          </div>
          <div className={styles.rowVisual}>
            <div className={styles.featureWidget}>
              <div className={styles.urlSimContainer}>
                <div className={styles.urlSimField}>
                  <span>https://twoja-pracownia.pl</span>
                  <Globe size={12} style={{ color: 'var(--primary)' }} />
                </div>
                <div className={styles.urlSimTags}>
                  <span className={styles.urlSimTag}>✓ Cennik usług</span>
                  <span className={styles.urlSimTag}>✓ Godziny pracy</span>
                  <span className={styles.urlSimTag}>✓ Kontakt</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Pricing Matrix */}
      <section className={styles.pricingSection} id="cennik">
        <div className={styles.pricingHeader}>
          <h2>Przejrzyste pakiety.</h2>
          <p>Wybierz limit wiadomości dopasowany do skali Twojej firmy.</p>
        </div>

        <div className={styles.warningBox}>
          <AlertCircle size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h3>Weryfikacja konta</h3>
            <p>
              Dokonaj rejestracji logując się **dokładnie na to firmowe konto Google (Gmail)**, które ma być obsługiwane automatycznie przez Agenta AI.
            </p>
          </div>
        </div>
        
        <div className={styles.pricingGrid}>
          {/* Plan Basic */}
          <div className={styles.pricingCard}>
            <div className={styles.pricingName}>Meski AI Basic</div>
            <div className={styles.pricingDesc}>Idealny wybór dla mikroprzedsiębiorstw i freelancerów.</div>
            <div className={styles.pricingPrice}>299 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={13} /> Dostęp do Agenta 24/7</li>
              <li><CheckCircle size={13} /> Do 50 e-maili / mies.</li>
              <li><CheckCircle size={13} /> Analiza strony internetowej</li>
              <li><CheckCircle size={13} /> Indywidualna baza wiedzy</li>
              <li><CheckCircle size={13} /> Do 10 leadów B2B / mies.</li>
            </ul>
            
            <button 
              className={styles.pricingBtn}
              disabled={userTier >= 1}
              style={userTier >= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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

          {/* Plan PRO */}
          <div className={`${styles.pricingCard} ${styles.pro}`}>
            <div className={styles.proBadge}>Rekomendowany</div>
            <div className={styles.pricingName}>Meski AI PRO</div>
            <div className={styles.pricingDesc}>Zaprojektowany dla rosnących firm handlowo-usługowych.</div>
            <div className={styles.pricingPrice}>699 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={13} /> Dostęp do Agenta 24/7</li>
              <li><CheckCircle size={13} /> Do 1000 e-maili / mies.</li>
              <li><CheckCircle size={13} /> Analiza strony internetowej</li>
              <li><CheckCircle size={13} /> Moduł zmiany tonu AI</li>
              <li><CheckCircle size={13} /> Do 200 leadów B2B / mies.</li>
              <li><CheckCircle size={13} /> Moduł automatycznych Cold Email</li>
            </ul>
            
            <button 
              className={styles.pricingBtn}
              disabled={userTier >= 2}
              style={userTier >= 2 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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

          {/* Plan MAX */}
          <div className={styles.pricingCard}>
            <div className={styles.pricingName}>Meski AI MAX</div>
            <div className={styles.pricingDesc}>Nielimitowana moc obliczeniowa bez żadnych ograniczeń.</div>
            <div className={styles.pricingPrice}>899 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={13} /> Nielimitowane e-maile AI</li>
              <li><CheckCircle size={13} /> Nielimitowane leady B2B</li>
              <li><CheckCircle size={13} /> Nielimitowany moduł Cold Email</li>
              <li><CheckCircle size={13} /> Analiza strony internetowej</li>
              <li><CheckCircle size={13} /> Dedykowany support priorytetowy</li>
            </ul>
            
            <button 
              className={styles.pricingBtn}
              disabled={userTier >= 3}
              style={userTier >= 3 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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
      
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="/regulamin">Regulamin</a>
          <a href="/polityka-prywatnosci">Polityka Prywatności</a>
        </div>
        <p>&copy; {new Date().getFullYear()} Meski AI. Zaprojektowano w Polsce.</p>
      </footer>
    </main>
  );
}
