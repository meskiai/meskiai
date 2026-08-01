"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle, Sparkles, Shield, Zap, Users, Globe, AlertCircle,
  LogOut, Home as HomeIcon, ChevronRight, Mail
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPriceId, setCurrentPriceId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  /* ── Fetch active subscription ── */
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/settings")
        .then(r => r.json())
        .then(d => {
          if (d.subscriptionData && ["active", "trialing", "incomplete"].includes(d.subscriptionData.subscriptionStatus)) {
            setCurrentPriceId(d.subscriptionData.stripePriceId);
          }
        })
        .catch(console.error);
    }
  }, [status]);

  /* ── Click-outside for user menu ── */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    if (showUserMenu) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [showUserMenu]);

  /* ── Smart sticky header ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 50) setShowHeader(true);
      else if (y > lastScrollY.current) setShowHeader(false);
      else setShowHeader(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Tier helpers ── */
  const PRICE_BASIC = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || "basic";
  const PRICE_PRO   = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO   || "pro";
  const PRICE_MAX   = process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX   || "max";

  const getTier = (id: string | null) => {
    if (id === PRICE_MAX)   return 3;
    if (id === PRICE_PRO)   return 2;
    if (id === PRICE_BASIC) return 1;
    return 0;
  };
  const userTier = getTier(currentPriceId);

  /* ── Buy handler ── */
  const handleBuy = (priceId: string) => {
    localStorage.setItem("selectedPlan", JSON.stringify({ id: priceId, time: Date.now() }));
    if (status === "authenticated") router.push("/dashboard");
    else signIn("google", { callbackUrl: "/dashboard" });
  };

  /* ── Pricing button factory ──────────────────────────────────────────── */
  // Returns the correct variant + label for each plan card.
  // planTier: tier of this card (1=Basic, 2=PRO, 3=MAX)
  // userTier: tier the logged-in user currently owns (0=none)
  const PricingButton = ({ planTier, priceId, defaultLabel, upgradeLabel }: {
    planTier: number;
    priceId: string;
    defaultLabel: string;   // label when nobody is logged in or user has no plan
    upgradeLabel: string;   // label when user can upgrade to this plan
  }) => {
    if (userTier === planTier) {
      // User already has THIS plan — show "current"
      return <button className={styles.pricingBtnCurrent} disabled>✓ Twój obecny plan</button>;
    }
    if (userTier > 0 && planTier < userTier) {
      // User has a higher plan — downgrade not allowed
      return <button className={styles.pricingBtnDisabled} disabled>Niedostępne (Downgrade)</button>;
    }
    if (userTier > 0 && planTier > userTier) {
      // User can upgrade to this plan
      return (
        <button className={styles.pricingBtnUpgrade} onClick={() => handleBuy(priceId)}>
          {upgradeLabel} <ChevronRight size={13} style={{ marginLeft: 2 }} />
        </button>
      );
    }
    // No plan owned — standard purchase
    return (
      <button className={styles.pricingBtnActive} onClick={() => handleBuy(priceId)}>
        {defaultLabel}
      </button>
    );
  };

  /* ── Loading splash ── */
  if (status === "loading") {
    return (
      <div style={{ display:"flex", width:"100vw", height:"100vh", background:"var(--background)", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"24px", height:"24px", border:"2px solid var(--border)", borderTopColor:"var(--foreground)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        <style jsx global>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <main className={styles.main}>

      {/* ── Navigation ── */}
      <nav className={`${styles.nav} ${!showHeader ? styles.navHidden : ""}`}>
        <div className={styles.navContent}>
          {/* Logo */}
          <div className={styles.logo} onClick={() => router.push("/")}>
            <img src="/logo.png" alt="MESKIAI" style={{ filter: "var(--logo-filter)" }} />
            MESKIAI
          </div>

          {/* Links */}
          <div className={styles.navLinks}>
            <a href="#funkcje" className={styles.navLink}>Funkcje</a>
            <a href="#cennik"  className={styles.navLink}>Cennik</a>
            <a href="/regulamin" className={styles.navLink}>Regulamin</a>
          </div>

          {/* Actions */}
          <div className={styles.navActions}>
            <ThemeToggle />

            {status === "authenticated" ? (
              <div ref={menuRef} style={{ position: "relative" }}>
                <button className={styles.avatarBtn} onClick={() => setShowUserMenu(v => !v)}>
                  {session?.user?.image
                    ? <img src={session.user.image} alt="avatar" />
                    : <div className={styles.avatarPlaceholder}>{session?.user?.email?.[0]?.toUpperCase() ?? "U"}</div>
                  }
                </button>

                {showUserMenu && (
                  <div style={{
                    position:"absolute", top:"calc(100% + 8px)", right:0,
                    background:"var(--card-bg)", backdropFilter:"blur(24px)",
                    WebkitBackdropFilter:"blur(24px)",
                    border:"1px solid var(--border)", borderRadius:"12px",
                    padding:"6px", width:"190px", boxShadow:"var(--mac-shadow)", zIndex:200
                  }}>
                    <div style={{ padding:"8px 12px", borderBottom:"1px solid var(--border)", marginBottom:"4px" }}>
                      <div style={{ fontSize:"0.78rem", fontWeight:600, color:"var(--foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {session?.user?.name || session?.user?.email?.split("@")[0]}
                      </div>
                      <div style={{ fontSize:"0.68rem", color:"var(--subtext)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {session?.user?.email}
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setShowUserMenu(false)}
                      style={{ display:"flex", alignItems:"center", gap:"8px", padding:"7px 12px", borderRadius:"8px", color:"var(--foreground)", fontSize:"0.76rem", fontWeight:500, textDecoration:"none", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background="var(--sidebar-hover)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    >
                      <HomeIcon size={13} style={{ color:"var(--subtext)" }}/> Panel roboczy
                    </Link>
                    <div style={{ height:"1px", background:"var(--border)", margin:"4px 0" }}/>
                    <button
                      onClick={() => signOut({ callbackUrl:"/" })}
                      style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"7px 12px", borderRadius:"8px", background:"transparent", border:"none", color:"#ff453a", fontSize:"0.76rem", fontWeight:500, cursor:"pointer", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(255,69,58,0.07)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    >
                      <LogOut size={13}/> Wyloguj się
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.navPrimaryBtn} onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                Zaloguj się
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Sparkles size={11} className={styles.heroBadgeIcon}/> Agent AI dla firm B2B
        </div>

        <h1 className={styles.heroTitle}>
          Zatrudnij AI.<br />Uwolnij swój czas.
        </h1>

        <p className={styles.heroParagraph}>
          Autonomiczny asystent e-mail, który działa 24/7 — odpowiada klientom, generuje leady B2B i chroni Twój czas, bez Twojego udziału.
        </p>

        <div className={styles.heroButtons}>
          {status === "authenticated" ? (
            <Link href="/dashboard" className={styles.heroBtnPrimary}>
              Wejdź do panelu <ArrowRight size={15}/>
            </Link>
          ) : (
            <>
              <button className={styles.heroBtnPrimary} onClick={() => document.getElementById("cennik")?.scrollIntoView({ behavior:"smooth" })}>
                Wybierz pakiet <ArrowRight size={15}/>
              </button>
              <button className={styles.heroBtnSecondary} onClick={() => document.getElementById("funkcje")?.scrollIntoView({ behavior:"smooth" })}>
                Jak to działa?
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>24/7</div>
          <div className={styles.statLabel}>Aktywność agenta</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>{"<"}2s</div>
          <div className={styles.statLabel}>Czas odpowiedzi AI</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>90%</div>
          <div className={styles.statLabel}>Mniej czasu na maile</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statNumber}>∞</div>
          <div className={styles.statLabel}>Skalowalność</div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className={styles.featuresSection} id="funkcje">
        <div className={styles.featuresSectionTitle}>
          <h2>Wszystko, czego potrzebuje Twój biznes.</h2>
          <p>Jeden agent. Wiele możliwości.</p>
        </div>

        <div className={styles.featuresGrid}>
          {/* Large card — Autopilot Mail */}
          <div className={styles.featureCardLarge}>
            <div className={styles.featureCardLargeText}>
              <h3>Autopilot e-mail 24/7.</h3>
              <p>
                Agent analizuje treść każdej wiadomości i odpowiada w naturalnym języku — dopasowując ton, temat i ofertę do każdego klienta. Sprawy wymagające Twojej uwagi trafiają do osobnego widoku.
              </p>
            </div>
            <div className={styles.miniWindow}>
              <div className={styles.miniWindowHeader}>
                <div className={`${styles.dot} ${styles.redDot}`}/>
                <div className={`${styles.dot} ${styles.yellowDot}`}/>
                <div className={`${styles.dot} ${styles.greenDot}`}/>
              </div>
              <div className={styles.miniWindowBody}>
                <div className={styles.chatBubble}><strong>Klient:</strong> Czy obsługujecie Wrocław? Potrzebuję wyceny na piątek.</div>
                <div className={`${styles.chatBubble} ${styles.chatBubbleAgent}`}><strong>Agent AI:</strong> Tak, działamy we Wrocławiu. Poniżej cennik usług — zapraszam do kontaktu, by ustalić szczegóły na piątek.</div>
              </div>
            </div>
          </div>

          {/* Card — Leads B2B */}
          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon}><Users size={18}/></div>
            <h3>Leady B2B na żądanie.</h3>
            <p>Moduł klientów samodzielnie wyszukuje firmy dopasowane do Twojego profilu i generuje dla nich spersonalizowany cold email gotowy do wysyłki.</p>
            <div className={styles.miniWindow} style={{ marginTop: 8 }}>
              <div className={styles.miniWindowHeader}>
                <div className={`${styles.dot} ${styles.redDot}`}/>
                <div className={`${styles.dot} ${styles.yellowDot}`}/>
                <div className={`${styles.dot} ${styles.greenDot}`}/>
              </div>
              <div className={styles.miniWindowBody}>
                <div className={styles.leadRow}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div className={styles.leadAvatar}>PK</div>
                    <span style={{ fontWeight:600 }}>P. Kowalski</span>
                  </div>
                  <span className={styles.leadPct}>94%</span>
                </div>
                <div className={styles.leadRow}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div className={styles.leadAvatar} style={{ background:"#30d158" }}>AM</div>
                    <span style={{ fontWeight:600 }}>A. Mazur</span>
                  </div>
                  <span className={styles.leadPct}>89%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card — Website knowledge */}
          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon}><Globe size={18}/></div>
            <h3>Baza wiedzy z Twojej strony WWW.</h3>
            <p>Wklej link do swojej strony, a Agent pobierze z niej cenniki, usługi i godziny otwarcia — żadnego ręcznego wpisywania instrukcji.</p>
          </div>

          {/* Card — Security */}
          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon}><Shield size={18}/></div>
            <h3>Precyzja bez halucynacji.</h3>
            <p>Agent odpowiada wyłącznie na podstawie Twojej bazy wiedzy. Nie zmyśla faktów — sprawy poza zakresem trafiają do Ciebie, nie do klienta.</p>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className={styles.pricingSection} id="cennik">
        <h2 className={styles.pricingTitle}>Transparentne plany.</h2>
        <p className={styles.pricingSubtitle}>Wybierz skalę odpowiednią dla Twojego biznesu. Bez ukrytych kosztów.</p>

        <div className={styles.warningBox}>
          <AlertCircle size={20} style={{ color:"var(--primary)", flexShrink:0, marginTop:1 }}/>
          <div>
            <h3>Ważne przed zakupem</h3>
            <p>Zaloguj się dokładnie na to konto Gmail, które chcesz automatyzować. Agent AI obsługuje tylko tę skrzynkę, na którą się zalogujesz.</p>
          </div>
        </div>

        <div className={styles.pricingGrid}>

          {/* ── Basic ── */}
          <div className={styles.pricingCard}>
            {userTier === 1 && <span className={styles.pricingCurrentBadge}>Twój plan</span>}
            <div className={styles.pricingName}>Meski AI Basic</div>
            <div className={styles.pricingDesc}>Idealny start dla freelancerów i mikrofirm.</div>
            <div className={styles.pricingPrice}>299 <span>zł / mies.</span></div>
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={13}/> Dostęp do Agenta 24/7</li>
              <li><CheckCircle size={13}/> Do 50 e-maili / mies.</li>
              <li><CheckCircle size={13}/> Analiza strony internetowej</li>
              <li><CheckCircle size={13}/> Baza wiedzy firmy</li>
              <li><CheckCircle size={13}/> Do 10 leadów B2B / mies.</li>
            </ul>
            <PricingButton
              planTier={1}
              priceId={PRICE_BASIC}
              defaultLabel="Wybieram Basic"
              upgradeLabel="Upgrade do Basic"
            />
          </div>

          {/* ── PRO ── */}
          <div className={`${styles.pricingCard} ${styles.pricingCardPro}`}>
            {userTier === 2
              ? <span className={styles.pricingCurrentBadge}>Twój plan</span>
              : <span className={styles.pricingBadge}>Rekomendowany</span>
            }
            <div className={styles.pricingName}>Meski AI PRO</div>
            <div className={styles.pricingDesc}>Dla rosnących firm handlowych i usługowych.</div>
            <div className={styles.pricingPrice}>699 <span>zł / mies.</span></div>
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={13}/> Dostęp do Agenta 24/7</li>
              <li><CheckCircle size={13}/> Do 1 000 e-maili / mies.</li>
              <li><CheckCircle size={13}/> Analiza strony internetowej</li>
              <li><CheckCircle size={13}/> Moduł zmiany tonu AI</li>
              <li><CheckCircle size={13}/> Do 200 leadów B2B / mies.</li>
              <li><CheckCircle size={13}/> Cold Email na autopilocie</li>
            </ul>
            <PricingButton
              planTier={2}
              priceId={PRICE_PRO}
              defaultLabel="Zaczynamy z PRO"
              upgradeLabel="Upgrade do PRO"
            />
          </div>

          {/* ── MAX ── */}
          <div className={styles.pricingCard}>
            {userTier === 3 && <span className={styles.pricingCurrentBadge}>Twój plan</span>}
            <div className={styles.pricingName}>Meski AI MAX</div>
            <div className={styles.pricingDesc}>Nielimitowana moc — bez żadnych ograniczeń.</div>
            <div className={styles.pricingPrice}>899 <span>zł / mies.</span></div>
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle size={13}/> Nielimitowane e-maile AI</li>
              <li><CheckCircle size={13}/> Nielimitowane leady B2B</li>
              <li><CheckCircle size={13}/> Nielimitowany Cold Email</li>
              <li><CheckCircle size={13}/> Analiza strony internetowej</li>
              <li><CheckCircle size={13}/> Dedykowany support priorytetowy</li>
            </ul>
            <PricingButton
              planTier={3}
              priceId={PRICE_MAX}
              defaultLabel="Kupuję Pakiet Max"
              upgradeLabel="Upgrade do MAX"
            />
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="/regulamin">Regulamin</a>
          <a href="/polityka-prywatnosci">Polityka Prywatności</a>
        </div>
        <p>© {new Date().getFullYear()} Meski AI · Zaprojektowano w Polsce</p>
      </footer>

    </main>
  );
}
