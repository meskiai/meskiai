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

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles size={12} className={styles.badgeHighlight} /> Luksus Wolnego Czasu
        </div>
        
        <h1 className={styles.heroTitle}>
          Asystent poczty, <br />zdefiniowany na nowo.
        </h1>
        
        <p className={styles.heroSubtitle}>
          Ekskluzywny Agent AI dla firm B2B, które cenią perfekcję działania. Odpowiada klientom i rozwija Twój biznes w pełnej harmonii 24 godziny na dobę.
        </p>
        
        <div className={styles.ctaWrapper}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{ textDecoration: 'none' }}>
              Wejdź do panelu asystenta <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <button className={styles.ctaBtnPrimary} onClick={() => {
                document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Rozpocznij inwestycję
              </button>
              <button className={styles.ctaBtnSecondary} onClick={() => {
                document.getElementById('funkcje')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Poznaj szczegóły
              </button>
            </>
          )}
        </div>
      </section>

      {/* Exclusive Apple Card Showcase Grid */}
      <section className={styles.carouselSection} id="funkcje">
        <div className={styles.carouselGrid}>
          {/* Card 1 */}
          <div className={styles.carouselCard}>
            <Zap size={22} className={styles.carouselIcon} />
            <div>
              <h3>Pełna Autonomia</h3>
              <p>
                Pracuje cicho w chmurze bez potrzeby instalacji oprogramowania. Klient otrzymuje natychmiastową, rzetelną odpowiedź, kiedy Ty zajmujesz się ważniejszymi sprawami.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.carouselCard}>
            <Shield size={22} className={styles.carouselIcon} />
            <div>
              <h3>Precyzja Informacji</h3>
              <p>
                Asystent nie zmyśla faktów ani ofert. Bazując na cennikach ze strony WWW, zawsze podaje bezbłędne dane. Wątpliwości kieruje bezpośrednio do Twojej weryfikacji.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className={styles.carouselCard}>
            <Users size={22} className={styles.carouselIcon} />
            <div>
              <h3>Elitarne B2B</h3>
              <p>
                Samodzielnie identyfikuje obiecujące firmy handlowe, znajduje decydentów i przygotowuje spersonalizowane cold emaile – prosto do wysyłki.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Spotlights with macOS Window Mockups */}
      <section className={styles.spotlightSection}>
        
        {/* Spotlight 1: Automatic Mail Reply */}
        <div className={styles.spotlightRow}>
          <div className={styles.spotlightText}>
            <h2 className={styles.spotlightTitle}>Odpisywanie na poziomie eksperta.</h2>
            <p className={styles.spotlightDesc}>
              Zaawansowany moduł konwersacji analizuje intencje klienta i tworzy naturalne odpowiedzi. System automatycznie dopasuje status wiadomości, oszczędzając do 90% czasu potrzebnego na obsługę maili.
            </p>
          </div>
          <div className={styles.spotlightVisual}>
            <div className={styles.macosWindow}>
              <div className={styles.macosHeader}>
                <div className={`${styles.dot} ${styles.redDot}`} />
                <div className={`${styles.dot} ${styles.yellowDot}`} />
                <div className={`${styles.dot} ${styles.greenDot}`} />
              </div>
              <div className={styles.macosBody}>
                <div className={styles.macosBubble}>
                  <strong>Klient:</strong> Czy realizują Państwo zlecenia w Poznaniu i jak wygląda wycena?
                </div>
                <div className={`${styles.macosBubble} ${styles.macosAgentBubble}`}>
                  <strong>Agent AI:</strong> Dziękuję za kontakt. Tak, realizujemy zlecenia na terenie Poznania. Wycena jest ustalana indywidualnie – nasz cennik usług rozpoczyna się od 200 zł...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight 2: Leads Simulation */}
        <div className={styles.spotlightRowInverse}>
          <div className={styles.spotlightVisual}>
            <div className={styles.macosWindow}>
              <div className={styles.macosHeader}>
                <div className={`${styles.dot} ${styles.redDot}`} />
                <div className={`${styles.dot} ${styles.yellowDot}`} />
                <div className={`${styles.dot} ${styles.greenDot}`} />
              </div>
              <div className={styles.macosBody}>
                <div className={styles.leadsPreviewWidget}>
                  <div className={styles.leadsPreviewRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={styles.leadAvatarCircle}>PK</div>
                      <span style={{ fontWeight: 600 }}>Przemysław Kaczmarek</span>
                    </div>
                    <span className={styles.leadPercentLabel}>94% dopasowania</span>
                  </div>
                  <div className={styles.leadsPreviewRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={styles.leadAvatarCircle} style={{ background: '#30d158' }}>AM</div>
                      <span style={{ fontWeight: 600 }}>Anna Michalak</span>
                    </div>
                    <span className={styles.leadPercentLabel}>89% dopasowania</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.spotlightText}>
            <h2 className={styles.spotlightTitle}>Cold Emailing nowej generacji.</h2>
            <p className={styles.spotlightDesc}>
              Moduł generowania leadów samodzielnie bada rynek w poszukiwaniu nowych klientów. Dostarcza zweryfikowane adresy e-mail osób decyzyjnych oraz natychmiast generuje dedykowane, unikalne wiadomości.
            </p>
          </div>
        </div>

        {/* Spotlight 3: Website Scan */}
        <div className={styles.spotlightRow}>
          <div className={styles.spotlightText}>
            <h2 className={styles.spotlightTitle}>Wiedza zebrana ze strony w minutę.</h2>
            <p className={styles.spotlightDesc}>
              Wystarczy podać link do swojej strony internetowej w ustawieniach asystenta. Agent AI w kilka sekund zbierze informacje o usługach, cennikach i godzinach pracy, wstrzykując je jako główne źródło prawdy do bazy wiedzy.
            </p>
          </div>
          <div className={styles.spotlightVisual}>
            <div className={styles.macosWindow}>
              <div className={styles.macosHeader}>
                <div className={`${styles.dot} ${styles.redDot}`} />
                <div className={`${styles.dot} ${styles.yellowDot}`} />
                <div className={`${styles.dot} ${styles.greenDot}`} />
              </div>
              <div className={styles.macosBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--subtext)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>https://twoja-pracownia.pl</span>
                    <Globe size={12} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.62rem', color: 'var(--foreground)' }}>✓ Cennik usług</span>
                    <span style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.62rem', color: 'var(--foreground)' }}>✓ Lokalizacje</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Pricing Matrix */}
      <section className={styles.pricingSection} id="cennik">
        <div className={styles.pricingHeader}>
          <h2>Inwestycja w Twój spokój.</h2>
          <p>Wybierz plan odpowiadający skali Twojego biznesu.</p>
        </div>

        <div className={styles.warningBox}>
          <AlertCircle size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h3>Ważna uwaga techniczna</h3>
            <p>
              Wykup subskrypcję logując się **dokładnie na to firmowe konto Google (Gmail)**, które ma być automatyzowane przez Agenta AI.
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
