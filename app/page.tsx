"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bot, Mail, Zap, FileText, Settings, ArrowRight, CheckCircle, Sparkles, 
  Shield, Clock, Users, BookOpen, LogOut, Home as HomeIcon, AlertCircle 
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
      <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.ambientBackground}>
        <div className={styles.ambientBlob}></div>
      </div>
      
      {/* Navigation - Apple Thin Style */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo} onClick={() => router.push("/")}>
            <img
              src="/logo.png"
              alt="MESKIAI logo"
              style={{ filter: 'invert(1)' }}
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
                      background: 'rgba(28, 28, 30, 0.9)', backdropFilter: 'saturate(140%) blur(30px)',
                      WebkitBackdropFilter: 'saturate(140%) blur(30px)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                      padding: '6px', width: '200px',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session?.user?.name || session?.user?.email?.split('@')[0]}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#86868b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session?.user?.email}
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', transition: 'background 0.15s', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <HomeIcon size={14} style={{ color: '#86868b' }} /> Panel roboczy
                    </Link>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#ff453a', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} /> Wyloguj się
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
          <Sparkles size={12} className={styles.badgeHighlight} /> Nowa Era Obsługi Klienta B2B
        </div>
        
        <h1 className={styles.heroTitle}>
          Zatrudnij AI. <br />Uwolnij swój czas.
        </h1>
        
        <p className={styles.heroSubtitle}>
          MESKIAI to nowoczesny, w pełni autonomiczny asystent poczty e-mail pracujący bezpośrednio w chmurze 24/7. Odpisuje klientom, wyszukuje leady i analizuje ofertę.
        </p>
        
        <div className={styles.ctaWrapper}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.ctaBtnPrimary} style={{ textDecoration: 'none' }}>
              Przejdź do Panelu <ArrowRight size={16} />
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
                Poznaj funkcje <ChevronRightIcon />
              </button>
            </>
          )}
        </div>
      </section>

      {/* Premium Dashboard Preview */}
      <section className={styles.mockupContainer}>
        <div className={styles.laptopMockup}>
          <div className={styles.mockupHeader}>
            <div className={`${styles.dot} ${styles.redDot}`} />
            <div className={`${styles.dot} ${styles.yellowDot}`} />
            <div className={`${styles.dot} ${styles.greenDot}`} />
            <div style={{ margin: '0 auto', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.5px' }}>MESKIAI Workspace</div>
          </div>
          <div className={styles.mockupBody}>
            <div className={styles.mockupSidebar}>
              <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
                <div className={`${styles.sidebarIcon} ${styles.sidebarIconActive}`} />
                <div className={styles.sidebarText} />
              </div>
              <div className={styles.sidebarItem}>
                <div className={styles.sidebarIcon} />
                <div className={styles.sidebarText} style={{ width: '45%' }} />
              </div>
              <div className={styles.sidebarItem}>
                <div className={styles.sidebarIcon} />
                <div className={styles.sidebarText} style={{ width: '55%' }} />
              </div>
            </div>
            <div className={styles.mockupContent}>
              <div className={styles.previewThread}>
                <div className={styles.previewMailRow}>
                  <strong style={{ fontSize: '0.8rem', color: '#ffffff' }}>Klient: Piotr Kamiński</strong>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`${styles.previewBadge} ${styles.badgeCall}`}>📞 Spotkanie</span>
                    <span className={`${styles.previewBadge} ${styles.badgeStatus}`}>W toku (Odpisano)</span>
                  </div>
                </div>
                <div className={styles.previewBubble}>
                  Dzień dobry, chciałbym umówić się na spotkanie w Poznaniu w celu omówienia oferty i wyceny wdrożenia. Czy mają Państwo wolny termin w piątek po 14:00?
                </div>
                <div className={`${styles.previewBubble} ${styles.previewAgentBubble}`}>
                  Dzień dobry, dziękuję za kontakt. Oczywiście, nasza pracownia w Poznaniu jest otwarta i chętnie się spotkamy. Proponuję piątek o godzinie 14:30. Proszę o potwierdzenie, czy ten termin Panu odpowiada.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className={styles.featuresSection} id="funkcje">
        <div className={styles.featuresHeader}>
          <h2>Zaprojektowany do pracy.<br/>Wykonany z precyzją.</h2>
        </div>
        
        <div className={styles.bentoGrid}>
          {/* Card 1 - Large 2-column span */}
          <div className={`${styles.bentoCard} ${styles.span2}`}>
            <Zap size={24} className={styles.bentoIcon} />
            <h3>Autonomiczny asystent e-mail 24/7</h3>
            <p>
              Pracuje w tle przez całą dobę. Gdy śpisz lub masz wyłączony komputer, Agent analizuje przychodzące wiadomości przez protokół POP3 i automatycznie odpisuje na nie za pomocą SMTP, wykorzystując całą zdobytą bazę wiedzy o Twoim biznesie.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.bentoCard}>
            <Users size={24} className={styles.bentoIcon} />
            <h3>Proaktywne leady B2B</h3>
            <p>
              System sam przeszukuje rynek pod kątem potencjalnych partnerów biznesowych. Podaje na tacy profil firmy, osobę decyzyjną oraz generuje dedykowane wiadomości cold email.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.bentoCard}>
            <Shield size={24} className={styles.bentoIcon} />
            <h3>Brak zmyślania faktów</h3>
            <p>
              Najważniejsza zasada w biznesie to prawdomówność. Jeśli klient zapyta o rzecz, której nie ma w Twojej bazie wiedzy, Agent nie wymyśli odpowiedzi – grzecznie poinformuje klienta o weryfikacji i przeniesie sprawę do panelu ważnych zadań.
            </p>
          </div>

          {/* Card 4 - Large 2-column span */}
          <div className={`${styles.bentoCard} ${styles.span2}`}>
            <FileText size={24} className={styles.bentoIcon} />
            <h3>Zrozumienie Twojej oferty ze strony WWW</h3>
            <p>
              Po prostu podaj link do swojej strony internetowej w panelu. Asystent automatycznie przeanalizuje całą ofertę, cenniki, godziny otwarcia i zasady działania Twojego biznesu. Używa tej wiedzy w ułamku sekundy do tworzenia spersonalizowanych odpowiedzi.
            </p>
          </div>
        </div>
      </section>

      {/* Why Us Statement */}
      <section className={styles.whyUsSection}>
        <div className={styles.whyUsContent}>
          <h2>
            Nie sprzedajemy kolejnego oprogramowania.
            <span>Sprzedajemy Twój wolny czas.</span>
          </h2>
          <p>
            Większość paneli SaaS wymaga nieustannej kontroli. Nasz asystent pracuje całkowicie niezależnie. Ty zyskujesz spokój i czas na rozwój biznesu, podczas gdy rutynowe zapytania klientów obsługują się same.
          </p>
        </div>
      </section>

      {/* Pricing Section (Apple Subscription Cards) */}
      <section className={styles.pricingSection} id="cennik">
        <div className={styles.pricingHeader}>
          <h2>Czyste warunki. Prosty wybór.</h2>
          <p>Dopasuj moc asystenta do wielkości swojej firmy.</p>
        </div>

        <div className={styles.warningBox}>
          <AlertCircle size={22} style={{ color: '#0071e3', flexShrink: 0 }} />
          <div>
            <h3>Ważne przed zakupem</h3>
            <p>
              Zaloguj się do platformy **dokładnie tym adresem Gmail**, na którym ma pracować Agent AI. Subskrypcja zostanie przypisana na stałe do tego profilu.
            </p>
          </div>
        </div>
        
        <div className={styles.pricingGrid}>
          {/* Tier 1 */}
          <div className={styles.pricingCard}>
            <div className={styles.pricingName}>Meski AI</div>
            <div className={styles.pricingDesc}>Dedykowane wsparcie dla freelancerów i mikroprzedsiębiorstw.</div>
            <div className={styles.pricingPrice}>299 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={14} /> Dostęp do Agenta 24/7</li>
              <li><CheckCircle size={14} /> Do 50 e-maili / mies.</li>
              <li><CheckCircle size={14} /> Analiza strony internetowej</li>
              <li><CheckCircle size={14} /> Zintegrowana baza wiedzy</li>
              <li><CheckCircle size={14} /> Generowanie do 10 leadów B2B</li>
            </ul>
            
            <button 
              className={styles.pricingBtn}
              disabled={userTier >= 1}
              style={userTier >= 1 ? { background: '#333336', color: '#86868b', cursor: 'not-allowed' } : {}}
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
              {userTier >= 1 ? (userTier === 1 ? "Obecny plan" : "Aktywny wyższy plan") : "Wybierz plan Basic"}
            </button>
          </div>

          {/* Tier 2 - PRO */}
          <div className={`${styles.pricingCard} ${styles.pro}`}>
            <div className={styles.proBadge}>Polecany</div>
            <div className={styles.pricingName}>Meski AI PRO</div>
            <div className={styles.pricingDesc}>Optymalna moc dla rosnących zespołów i firm handlowo-usługowych.</div>
            <div className={styles.pricingPrice}>699 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={14} /> Dostęp do Agenta 24/7</li>
              <li><CheckCircle size={14} /> Do 1000 e-maili / mies.</li>
              <li><CheckCircle size={14} /> Analiza strony internetowej</li>
              <li><CheckCircle size={14} /> Moduł zmiany tonu odpowiedzi</li>
              <li><CheckCircle size={14} /> Generowanie do 200 leadów B2B</li>
              <li><CheckCircle size={14} /> Moduł automatycznych Cold Email</li>
            </ul>
            
            <button 
              className={styles.pricingBtn}
              disabled={userTier >= 2}
              style={userTier >= 2 ? { background: '#333336', color: '#86868b', cursor: 'not-allowed' } : {}}
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
              {userTier >= 2 ? (userTier === 2 ? "Obecny plan" : "Aktywny wyższy plan") : "Wybierz plan PRO"}
            </button>
          </div>

          {/* Tier 3 - MAX */}
          <div className={styles.pricingCard}>
            <div className={styles.pricingName}>Meski AI MAX</div>
            <div className={styles.pricingDesc}>Pełna, bezkompromisowa wydajność bez żadnych limitów.</div>
            <div className={styles.pricingPrice}>899 <span>zł / mies.</span></div>
            
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={14} /> Nielimitowane e-maile AI</li>
              <li><CheckCircle size={14} /> Nielimitowane leady B2B</li>
              <li><CheckCircle size={14} /> Nielimitowany moduł Cold Email</li>
              <li><CheckCircle size={14} /> Analiza strony internetowej</li>
              <li><CheckCircle size={14} /> Wsparcie dedykowanego opiekuna</li>
            </ul>
            
            <button 
              className={styles.pricingBtn}
              disabled={userTier >= 3}
              style={userTier >= 3 ? { background: '#333336', color: '#86868b', cursor: 'not-allowed' } : {}}
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
              {userTier >= 3 ? "Obecny plan" : "Wybierz plan MAX"}
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

// Inline Icon Helper Components to keep imports standard
function ChevronRightIcon() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
