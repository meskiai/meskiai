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
      {/* Dynamic Theme Glow Blobs */}
      <div className={styles.ambientBackground}>
        <div className={styles.ambientBlob1} />
        <div className={styles.ambientBlob2} />
        <div className={styles.ambientBlob3} />
      </div>
      
      {/* Frosted glass top nav */}
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
          <Sparkles size={12} className={styles.badgeHighlight} /> Nowy Standard Poczty Biznesowej
        </div>
        
        <h1 className={styles.heroTitle}>
          Zatrudnij AI. <br />Uwolnij swój czas.
        </h1>
        
        <p className={styles.heroSubtitle}>
          MESKIAI to w pełni autonomiczny asystent poczty e-mail pracujący bezpośrednio w chmurze. Odpowiada klientom, generuje bazy leadów i analizuje ofertę 24/7.
        </p>
        
        <div className={styles.ctaWrapper}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{ textDecoration: 'none' }}>
              Wejdź do Panelu <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <button className={styles.ctaBtnPrimary} onClick={() => {
                document.getElementById('cennik')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Wybierz pakiet
              </button>
              <button className={styles.ctaBtnSecondary} onClick={() => {
                document.getElementById('funkcje')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Dowiedz się więcej <ChevronRight size={14} />
              </button>
            </>
          )}
        </div>
      </section>

      {/* Cyberpunk/Frosted Laptop Showcase */}
      <section className={styles.mockupContainer}>
        <div className={styles.laptopMockup}>
          <div className={styles.mockupHeader}>
            <div className={`${styles.dot} ${styles.redDot}`} />
            <div className={`${styles.dot} ${styles.yellowDot}`} />
            <div className={`${styles.dot} ${styles.greenDot}`} />
            <div style={{ margin: '0 auto', fontSize: '0.7rem', color: 'var(--subtext)', opacity: 0.8, fontWeight: 500, letterSpacing: '0.5px' }}>MESKIAI Dashboard Preview</div>
          </div>
          <div className={styles.mockupBody}>
            <div className={styles.mockupSidebar}>
              <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
                <div className={`${styles.sidebarIcon} ${styles.sidebarIconActive}`} />
                <div className={styles.sidebarText} />
              </div>
              <div className={styles.sidebarItem}>
                <div className={styles.sidebarIcon} />
                <div className={styles.sidebarText} style={{ width: '40%' }} />
              </div>
              <div className={styles.sidebarItem}>
                <div className={styles.sidebarIcon} />
                <div className={styles.sidebarText} style={{ width: '60%' }} />
              </div>
            </div>
            <div className={styles.mockupContent}>
              <div className={styles.previewThread}>
                <div className={styles.previewMailRow}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>Klient: Piotr Kamiński</strong>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`${styles.previewBadge} ${styles.badgeCall}`}>📞 Spotkanie</span>
                    <span className={`${styles.previewBadge} ${styles.badgeStatus}`}>W toku (Odpisano)</span>
                  </div>
                </div>
                <div className={styles.previewBubble}>
                  Dzień dobry, chciałbym umówić się na spotkanie w Poznaniu w celu omówienia oferty i wyceny wdrożenia. Czy mają Państwo wolny termin w piątek po 14:00?
                </div>
                <div className={`${styles.previewBubble} ${styles.previewAgentBubble}`}>
                  Dzień dobry, dziękuję za kontakt. Oczywiście, nasza pracownia w Poznaniu jest otwarta i chętnie się spotkamy. Proponuję spotkanie w piątek o godzinie 14:30. Proszę o potwierdzenie, czy ten termin Panu odpowiada.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid with Live CSS Previews */}
      <section className={styles.featuresSection} id="funkcje">
        <div className={styles.featuresHeader}>
          <h2>Architektura pełnej automatyzacji.</h2>
        </div>
        
        <div className={styles.bentoGrid}>
          {/* Card 1 - Large: Thread status manager */}
          <div className={`${styles.bentoCard} ${styles.span2}`}>
            <div className={styles.bentoWidget}>
              <div className={styles.threadListWidget}>
                <div className={styles.widgetThreadItem}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>📧 Zapytanie o wycenę</span>
                  <span style={{ color: '#30d158', background: 'rgba(48,209,88,0.12)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem' }}>AUTO_REPLIED</span>
                </div>
                <div className={styles.widgetThreadItem} style={{ opacity: 0.85 }}>
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>📞 Termin spotkania</span>
                  <span style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem' }}>W TOKU (ODPISANO)</span>
                </div>
              </div>
            </div>
            <div>
              <h3>Zarządzanie wątkami 24/7</h3>
              <p>
                W pełni autonomiczne pobieranie poczty przez POP3. AI automatycznie klasyfikuje wiadomości i natychmiast odpisuje przez serwer SMTP.
              </p>
            </div>
          </div>

          {/* Card 2 - Leads generator table */}
          <div className={styles.bentoCard}>
            <div className={styles.bentoWidget}>
              <div className={styles.leadsBoardWidget}>
                <div className={styles.widgetLeadRow}>
                  <div className={styles.widgetLeadLeft}>
                    <div className={styles.leadAvatar}>PK</div>
                    <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>Pol-Bud Sp. z o.o.</span>
                  </div>
                  <span className={styles.leadPercent}>94%</span>
                </div>
                <div className={styles.widgetLeadRow}>
                  <div className={styles.widgetLeadLeft}>
                    <div className={styles.leadAvatar} style={{ background: 'var(--primary)' }}>JS</div>
                    <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>Jan Stal</span>
                  </div>
                  <span className={styles.leadPercent}>87%</span>
                </div>
              </div>
            </div>
            <div>
              <h3>Wyszukiwarka leadów</h3>
              <p>
                Analizuje rynek w poszukiwaniu nowych klientów. Filtruje firmy, dopasowuje profile i automatyzuje wysyłkę cold maili.
              </p>
            </div>
          </div>

          {/* Card 3 - Safety Shield */}
          <div className={styles.bentoCard}>
            <div className={styles.bentoWidget}>
              <div className={styles.shieldWidget}>
                <Shield size={26} />
              </div>
            </div>
            <div>
              <h3>Brak zmyślania faktów</h3>
              <p>
                Bezpieczeństwo przede wszystkim. W przypadku braku wiedzy w bazie, Agent nie zmyśla nieprawdziwych danych, lecz przekazuje sprawę do Twojej weryfikacji.
              </p>
            </div>
          </div>

          {/* Card 4 - Large: Scanner URL */}
          <div className={`${styles.bentoCard} ${styles.span2}`}>
            <div className={styles.bentoWidget}>
              <div className={styles.websiteWidget}>
                <div className={styles.widgetUrlInput}>
                  <span>https://twoja-pracownia.pl</span>
                  <Globe size={12} style={{ color: 'var(--primary)' }} />
                </div>
                <div className={styles.widgetTagRow}>
                  <span className={styles.widgetTag}>✓ Cenniki</span>
                  <span className={styles.widgetTag}>✓ Godziny pracy</span>
                  <span className={styles.widgetTag}>✓ Zakres usług</span>
                </div>
              </div>
            </div>
            <div>
              <h3>Kontekst z Twojej witryny WWW</h3>
              <p>
                Wklej link do swojej strony internetowej w ustawieniach. Agent AI zbierze dane o Twojej działalności i wykorzysta je jako główne źródło wiedzy o firmie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Philosophy */}
      <section className={styles.whyUsSection}>
        <div className={styles.whyUsContent}>
          <h2>
            Prawdziwy asystent nie wymaga nadzoru.
            <span>Kupujesz swój wolny czas.</span>
          </h2>
          <p>
            Systemy typu CRM wymagają setek kliknięć. Nasz Agent AI działa autonomicznie bezpośrednio z poziomu Twojej skrzynki pocztowej. Zyskujesz profesjonalnego pracownika, który nigdy nie bierze urlopu.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className={styles.pricingSection} id="cennik">
        <div className={styles.pricingHeader}>
          <h2>Minimalizm w cenniku.</h2>
          <p>Wybierz moc asystenta dopasowaną do Twojej skrzynki mailowej.</p>
        </div>

        <div className={styles.warningBox}>
          <AlertCircle size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h3>Ważne przed rejestracją</h3>
            <p>
              Prosimy o wykupienie wybranej subskrypcji logując się **dokładnie tym kontem Google (Gmail)**, które ma być automatyzowane przez Agenta AI.
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
