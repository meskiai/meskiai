"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle, Globe, MessageSquare, BarChart, Home as HomeIcon, LogOut, ChevronDown, Star, FileText, Users, Zap, TrendingUp, Shield, Tag, Code, Sparkles } from 'lucide-react';
import React, { useEffect, useState, useRef } from "react";

import { PRICE_BASIC, PRICE_PRO, PRICE_MAX } from "@/lib/pricing";
import styles from "./page.module.css";

/* ─────────────────────────────────────────
   STRIPE RIBBON SVG — 1:1 match
   Curved solid-colour bands flowing from
   upper-right diagonally to lower-left.
   Colors (outermost→innermost):
   orange, hot-pink, magenta/violet, blue
───────────────────────────────────────── */
const StripeRibbon = () => (
  /*
   * SVG ribbon – 4 curved bands fanning out from upper-right focal point.
   * All bands originate near (800, -200) and spread toward the bottom,
   * creating the Stripe-signature flowing ribbon effect.
   * viewBox 800×700, positioned absolutely on the right side of hero.
   */
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 700"
    preserveAspectRatio="xMaxYMin meet"
    className={styles.stripeRibbonSvg}
  >
    {/* ── Blue / Indigo — deepest, spreads most to the left ── */}
    <path
      d="M 800 -200 C 720 0 580 300 200 700 L 350 700 C 700 300 770 0 800 -200 Z"
      fill="#5469d4"
    />

    {/* ── Violet / Purple ── */}
    <path
      d="M 800 -200 C 740 20 640 280 350 700 L 490 700 C 760 280 790 20 800 -200 Z"
      fill="#9b51e0"
    />

    {/* ── Hot Pink / Magenta ── */}
    <path
      d="M 800 -200 C 760 50 700 250 490 700 L 620 700 C 810 250 820 50 800 -200 Z"
      fill="#e8387a"
    />

    {/* ── Orange / Amber — outermost, stays most to the right ── */}
    <path
      d="M 800 -200 C 790 80 780 220 620 700 L 800 700 C 900 220 900 80 800 -200 Z"
      fill="#f5a623"
    />
  </svg>
);

/* ─────────────────────────────────────────
   STRIPE 1:1 PRODUCT GRAPHIC & PROMO BANNER
───────────────────────────────────────── */
const StripeProductGraphic = () => (
  <div className={styles.stripePromoWrapper}>
    <div className={styles.stripePromoBanner}>
      {/* Background warm ribbon gradient */}
      <div className={styles.stripePromoMeshBg} />

      {/* Embedded Browser / App Window Mockup */}
      <div className={styles.stripeBrowserMockup}>
        {/* Browser Top Bar */}
        <div className={styles.stripeBrowserTopBar}>
          <div className={styles.stripeBrowserDots}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <div className={styles.stripeBrowserUrlBar}>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>🔒</span>
            <span>dashboard.meskiai.com</span>
          </div>
        </div>

        {/* Browser Inner App Layout */}
        <div className={styles.stripeAppInner}>
          {/* Dark Purple Sidebar (like Zenflow in Stripe screenshot) */}
          <div className={styles.stripeAppSidebar}>
            <div className={styles.stripeAppLogo}>
              <span className={styles.stripeAppLogoIcon}>
                <Image src="/logo_white.png?v=4" alt="MESKIAI" width={16} height={16} style={{ objectFit: 'contain' }} />
              </span>
              <span>MESKIAI</span>
            </div>
            <div className={styles.stripeAppMenu}>
              <div className={styles.stripeMenuItem}>Pulpit</div>
              <div className={`${styles.stripeMenuItem} ${styles.stripeMenuItemActive}`}>Wiadomości &amp; Czat</div>
              <div className={styles.stripeMenuItem}>Baza Wiedzy</div>
              <div className={styles.stripeMenuItem}>Integracje</div>
              <div className={styles.stripeMenuItem}>Ustawienia</div>
            </div>
          </div>

          {/* Main App Content Area */}
          <div className={styles.stripeAppMain}>
            <div className={styles.stripeAppGreeting}>Witaj, Twój Zespół</div>
            <div className={styles.stripeWireframeBoxTop} />
            <div className={styles.stripeWireframeGrid}>
              <div className={styles.stripeWireframeBox} />
              <div className={styles.stripeWireframeBox} />
            </div>
            <div className={styles.stripeWireframeBoxBottom} />
          </div>
        </div>
      </div>

      {/* Floating White Card 1: Top-Right */}
      <div className={`${styles.stripeFloatingCard} ${styles.floatingCardTopRight}`}>
        <div className={styles.floatingCardTitle}>Automatyczne odpowiedzi AI</div>
        <div className={styles.floatingCardDesc}>Błyskawiczna analiza e-maili i zapytań w czasie rzeczywistym.</div>
        <div className={styles.floatingCardSnippet}>
          <span className={styles.codeMethod}>meskiaiAgent.create(</span>
          <span className={styles.codeString}>'auto-reply'</span>
          <span className={styles.codeMethod}>);</span>
        </div>
      </div>

      {/* Floating White Card 2: Bottom-Right */}
      <div className={`${styles.stripeFloatingCard} ${styles.floatingCardBottomRight}`}>
        <div className={styles.floatingCardTitle}>Baza wiedzy &amp; Dokumenty</div>
        <div className={styles.floatingCardDesc}>Agent korzysta z regulaminów, cenników i instrukcji firmy.</div>
        <div className={styles.floatingCardSnippet}>
          <span className={styles.codeMethod}>meskiaiAgent.connect(</span>
          <span className={styles.codeString}>'knowledge-base'</span>
          <span className={styles.codeMethod}>);</span>
        </div>
      </div>

      {/* Floating White Card 3: Bottom-Left */}
      <div className={`${styles.stripeFloatingCard} ${styles.floatingCardBottomLeft}`}>
        <div className={styles.floatingCardTitle}>Integracja z e-commerce</div>
        <div className={styles.floatingCardDesc}>Odczyt statusu przesyłek i faktur z Shopify, WooCommerce i BaseLinkera.</div>
        <div className={styles.floatingCardSnippet}>
          <span className={styles.codeMethod}>meskiaiAgent.create(</span>
          <span className={styles.codeString}>'order-tracking'</span>
          <span className={styles.codeMethod}>);</span>
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   3 COLUMN FEATURE STRIP BELOW GRAPHIC (1:1 Stripe)
───────────────────────────────────────── */
const StripeFeatureCards3Col = () => {
  return (
    <div className={styles.stripeFeatureStrip3Col}>
      {/* Col 1 */}
      <div className={styles.stripeFeatureCol}>
        <div className={styles.stripeFeatureIconBox}>
          <Zap size={18} color="#635BFF" />
        </div>
        <p className={styles.stripeFeatureText}>
          <strong>Szybsza obsługa klientów.</strong> Zredukuj czas odpowiedzi z kilku godzin do poniżej 30 sekund i obsłuż 10x więcej zapytań bez dodawania etatów.
        </p>
        <Link href="#cennik" className={styles.stripeFeatureLink}>
          Dowiedz się więcej ›
        </Link>
      </div>

      {/* Col 2 */}
      <div className={styles.stripeFeatureCol}>
        <div className={styles.stripeFeatureIconBox}>
          <TrendingUp size={18} color="#635BFF" />
        </div>
        <p className={styles.stripeFeatureText}>
          <strong>Wzrost sprzedaży i leadów.</strong> Automatycznie wyłapuj zapytania handlowe, kwalifikuj leady i zamieniaj wiadomości w transakcje.
        </p>
        <Link href="#cennik" className={styles.stripeFeatureLink}>
          Dowiedz się więcej ›
        </Link>
      </div>

      {/* Col 3 */}
      <div className={styles.stripeFeatureCol}>
        <div className={styles.stripeFeatureIconBox}>
          <Shield size={18} color="#635BFF" />
        </div>
        <p className={styles.stripeFeatureText}>
          <strong>Pełne bezpieczeństwo i kontrola.</strong> Wyznacz ścisłe reguły dla AI, unikaj halucynacji i zachowaj 100% zgodności ze standardami firmy.
        </p>
        <Link href="#cennik" className={styles.stripeFeatureLink}>
          Dowiedz się więcej ›
        </Link>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   BRAND LOGOS STRIP
   (Gmail, Shopify, WooCommerce, Slack, BaseLinker, Fakturownia)
   Matching the Stripe logos row 1:1
───────────────────────────────────────── */
const BrandLogosStrip = () => (
  <div className={styles.marqueeStrip}>
    <div className={styles.marqueeTrack}>
      {[0, 1, 2].map((key) => (
        <React.Fragment key={key}>
          {/* Google */}
          <div className={styles.marqueeItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google</span>
          </div>
          {/* Shopify */}
          <div className={styles.marqueeItem}>
            <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" style={{ height: 22, width: 'auto' }} />
            <span>Shopify</span>
          </div>
          {/* WooCommerce */}
          <div className={styles.marqueeItem}>
            <img src="https://cdn.worldvectorlogo.com/logos/woocommerce.svg" alt="WooCommerce" style={{ height: 20, width: 'auto' }} />
            <span>WooCommerce</span>
          </div>
          {/* Gmail */}
          <div className={styles.marqueeItem}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" style={{ height: 20, width: 'auto' }} />
            <span>Gmail</span>
          </div>
          {/* Slack */}
          <div className={styles.marqueeItem}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" style={{ height: 22, width: 'auto' }} />
            <span>Slack</span>
          </div>
          {/* BaseLinker */}
          <div className={styles.marqueeItem} style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            BaseLinker
          </div>
          {/* Fakturownia */}
          <div className={styles.marqueeItem} style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            Fakturownia
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   DASHBOARD SECTION
───────────────────────────────────────── */
const AnimatedDashboardSection = () => (
  <div style={{ width: '100%', padding: '80px 24px 60px', position: 'relative', zIndex: 10, background: '#fff' }}>
    <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 56px' }}>
      <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, color: '#0A2540', textAlign: 'center', marginBottom: '16px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
        Pracuje, kiedy Ty odpoczywasz.
      </h2>
      <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#425466', textAlign: 'center', maxWidth: '640px', margin: '0 auto', lineHeight: 1.65 }}>
        Zobacz jak MESKIAI samodzielnie analizuje zapytania, korzysta z baz wiedzy i odpisuje klientom w czasie rzeczywistym.
      </p>
    </div>
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      <DashboardSimulation />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   FEATURE CARDS (3 columns)
───────────────────────────────────────── */
const VisualFeatureCards = () => {
  const features = [
    { num: '01', icon: <Globe size={22} color="#635BFF" />, title: 'Wielokanałowość.', desc: 'Nieważne czy klient pisze maila, wysyła DM na Instagramie czy pyta na czacie. MESKIAI łączy i obsługuje wszystkie kanały z jednego miejsca.' },
    { num: '02', icon: <MessageSquare size={22} color="#635BFF" />, title: 'Brzmi jak człowiek.', desc: 'Zapomnij o sztywnych regułkach typowego bota. Nasz system płynnie naśladuje unikalny ton Twojej marki, budując prawdziwe relacje z klientami.' },
    { num: '03', icon: <BarChart size={22} color="#635BFF" />, title: 'Kopalnia wiedzy.', desc: 'Agent nie tylko odpisuje, ale automatycznie kategoryzuje problemy, dając Ci na tacy raporty o tym, czego aktualnie brakuje w firmie.' },
  ];

  return (
    <div className={styles.featureStrip}>
      {features.map((f, i) => (
        <div key={i} className={styles.featureStripItem}>
          <div className={styles.featureStripNum}>{f.num}</div>
          <div className={styles.featureStripIcon}>{f.icon}</div>
          <h3 className={styles.featureStripTitle}>{f.title}</h3>
          <p className={styles.featureStripDesc}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   STRIPE 1:1 4-STAT BANNER & NETWORK RAY GRAPHIC
───────────────────────────────────────── */
const StripeStatsAndNetworkGraphic = () => {
  return (
    <div className={styles.stripeNetworkSection}>
      {/* ── TOP 4 STAT METRICS ROW ── */}
      <div className={styles.stripeStatMetricsStrip}>
        <div className={styles.stripeStatMetricsInner}>
          {/* Stat 1 */}
          <div className={styles.stripeStatItem}>
            <div className={styles.stripeStatNumber}>15+</div>
            <p className={styles.stripeStatLabel}>
              gotowych integracji e-commerce (Shopify, WooCommerce, BaseLinker)
            </p>
          </div>

          {/* Stat 2 */}
          <div className={styles.stripeStatItem}>
            <div className={`${styles.stripeStatNumber} ${styles.statMutedBlue}`}>&lt; 30s</div>
            <p className={styles.stripeStatLabel}>
              średni czas automatycznej odpowiedzi na maile i zapytania
            </p>
          </div>

          {/* Stat 3 */}
          <div className={styles.stripeStatItem}>
            <div className={`${styles.stripeStatNumber} ${styles.statMutedBlue}`}>99.8%</div>
            <p className={styles.stripeStatLabel}>
              precyzji odpowiedzi opartych na bazie wiedzy firmy
            </p>
          </div>

          {/* Stat 4 */}
          <div className={styles.stripeStatItem}>
            <div className={styles.stripeStatNumber}>-80%</div>
            <p className={styles.stripeStatLabel}>
              mniej rutynowych i powtarzalnych wiadomości w skrzynce
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BLUE RAY BURST GRAPHIC ── */}
      <div className={styles.stripeRayBurstCard}>
        {/* Radiating SVG Ray Burst Network */}
        <svg
          className={styles.stripeRaySvg}
          viewBox="0 0 800 360"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <linearGradient id="rayGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Render 70 radiating particle rays from bottom-center (400, 360) */}
          {Array.from({ length: 70 }).map((_, i) => {
            const angleDeg = -165 + (i * (150 / 69));
            const angleRad = (angleDeg * Math.PI) / 180;
            const length = 180 + ((i * 37) % 130);
            const endX = 400 + Math.cos(angleRad) * length;
            const endY = 360 + Math.sin(angleRad) * length;
            const dotRadius = 1.2 + (i % 3) * 0.6;

            return (
              <g key={i}>
                <line
                  x1={400}
                  y1={360}
                  x2={endX}
                  y2={endY}
                  stroke="url(#rayGrad)"
                  strokeWidth={0.8 + (i % 2) * 0.5}
                  strokeOpacity={0.65}
                />
                <circle
                  cx={endX}
                  cy={endY}
                  r={dotRadius}
                  fill="#2563EB"
                  fillOpacity={0.85}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   FADE-IN WRAPPER
───────────────────────────────────────── */
const FadeInWhenVisible = ({ children, delay = 0, className, style, id }: { children: React.ReactNode, delay?: number, className?: string, style?: React.CSSProperties, id?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);

  return (
    <section id={id} ref={domRef} className={className} style={{ ...style, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(24px)', transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`, willChange: 'transform, opacity' }}>
      {children}
    </section>
  );
};

/* ─────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────── */
const FaqAccordionItem = ({ question, answer }: { question: string, answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '24px 0', fontSize: '1.05rem', fontWeight: 600, color: '#0A2540', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit' }}>
        {question}
        <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease', color: '#635BFF', flexShrink: 0 }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease-out, opacity 0.3s ease-out', opacity: isOpen ? 1 : 0 }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingBottom: '24px', fontSize: '0.95rem', lineHeight: 1.7, color: '#425466' }}>{answer}</div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   DASHBOARD SIMULATION (unchanged logic)
───────────────────────────────────────── */
const DashboardSimulation = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [typingState, setTypingState] = useState<'idle' | 'waiting' | 'typing' | 'done'>('idle');

  const folders = [
    { id: 0, name: '# zamówienia', label: 'Zamówienia' },
    { id: 1, name: '# sprzedaż', label: 'Sprzedaż B2B' },
    { id: 2, name: '# księgowość', label: 'Faktury i zwroty' }
  ];

  const emails = [
    { sender: 'Jan Kowalski', avatar: 'https://i.pravatar.cc/150?u=jan', time: '14:02', content: 'Dzień dobry,\nchciałem zapytać o status mojego zamówienia #9442. Kiedy mogę spodziewać się wysyłki?', aiResponse: 'Dzień dobry Panie Janie,\nTwoje zamówienie #9442 zostało już spakowane i czeka na odbiór przez kuriera DPD. Przewidywany czas dostawy to jutro do godziny 12:00.', card: { title: 'Zamówienie #9442', desc: 'Status: Gotowe do wysyłki (DPD)', color: '#Fef3c7' }, buttons: ['Zaktualizuj status', 'Powiadom klienta'] },
    { sender: 'Anna Nowak', avatar: 'https://i.pravatar.cc/150?u=anna', time: '11:45', content: 'Szanowni Państwo,\njesteśmy hurtownią e-commerce i chcielibyśmy nawiązać współpracę. Czy oferujecie zniżki hurtowe przy zamówieniach powyżej 10,000 zł?', aiResponse: 'Dzień dobry Pani Anno,\nDziękujemy za zainteresowanie. Przy zamówieniach powyżej 10,000 zł oferujemy stały rabat hurtowy w wysokości 15% oraz odroczony termin płatności do 30 dni.', card: { title: 'Katalog_B2B_2026.pdf', desc: 'Oferta hurtowa (3.2 MB)', color: '#E0E7FF' }, buttons: ['Wyślij cennik', 'Przypisz do handlowca'] },
    { sender: 'Michał Wiśniewski', avatar: 'https://i.pravatar.cc/150?u=michal', time: '09:30', content: 'Cześć,\nna ostatniej fakturze za zamówienie #9921 brakuje mojego numeru NIP (851-23-44-111). Czy możecie to poprawić i odesłać korektę?', aiResponse: 'Cześć Michał,\nPrzepraszam za niedogodność. Wygenerowałem notę korygującą z podanym numerem NIP: 851-23-44-111. Faktura została wysłana na Twój adres.', card: { title: 'Korekta_FV_9921.pdf', desc: 'Wygenerowano automatycznie w Fakturowni', color: '#DCFCE7' }, buttons: ['Pobierz PDF', 'Zatwierdź korektę'] }
  ];

  useEffect(() => {
    setTypingState('waiting');
    setTypedText('');
    let interval: NodeJS.Timeout;
    const waitTimer = setTimeout(() => {
      setTypingState('typing');
      let i = 0;
      const textToType = emails[activeTab].aiResponse;
      interval = setInterval(() => {
        setTypedText(textToType.slice(0, i));
        i += 2;
        if (i > textToType.length) { setTypedText(textToType); clearInterval(interval); setTimeout(() => setTypingState('done'), 300); }
      }, 15);
    }, 800);
    return () => { clearTimeout(waitTimer); if (interval) clearInterval(interval); };
  }, [activeTab]);

  return (
    <div style={{ display: 'flex', width: '100%', maxWidth: '960px', height: '520px', margin: '0 auto', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 24px 80px rgba(0,0,0,0.10)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: '220px', minWidth: '220px', background: '#F8FAFC', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>MESKIAI Inbox</div>
          <ChevronDown size={14} color="#64748B" />
        </div>
        <div style={{ padding: '16px 12px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>KANAŁY OBSŁUGI</div>
        {folders.map((folder, idx) => (
          <div key={folder.id} onClick={() => setActiveTab(idx)} style={{ padding: '8px 20px', fontSize: '0.88rem', cursor: 'pointer', background: activeTab === idx ? 'rgba(99,91,255,0.08)' : 'transparent', color: activeTab === idx ? '#635BFF' : '#475569', fontWeight: activeTab === idx ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {folder.name}
            {activeTab !== idx && <span style={{ background: '#E2E8F0', padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem', color: '#64748B' }}>1</span>}
          </div>
        ))}
        <div style={{ padding: '8px 20px', fontSize: '0.88rem', color: '#CBD5E1' }}># zwroty</div>
        <div style={{ padding: '8px 20px', fontSize: '0.88rem', color: '#CBD5E1' }}># reklamacje</div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', minWidth: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>{folders[activeTab].name}</div>
          <div style={{ color: '#64748B', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={13} /> 3 agentów online</div>
        </div>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Customer message */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <img src={emails[activeTab].avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0F172A' }}>{emails[activeTab].sender}</span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{emails[activeTab].time}</span>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, maxWidth: '480px', whiteSpace: 'pre-line' }}>
                {emails[activeTab].content}
              </div>
            </div>
          </div>

          {/* AI response */}
          {typingState !== 'idle' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Image src="/logo.png" alt="MESKIAI" width={22} height={22} style={{ objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0F172A' }}>MESKIAI</span>
                  <span style={{ background: '#635BFF', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.04em' }}>AI</span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Teraz</span>
                </div>
                <div style={{ background: '#F5F3FF', border: '1px solid rgba(99,91,255,0.15)', borderRadius: '12px', padding: '12px 16px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, maxWidth: '480px', whiteSpace: 'pre-line' }}>
                  {typingState === 'waiting' ? (
                    <div style={{ display: 'flex', gap: '4px', padding: '4px 0' }}>
                      {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                    </div>
                  ) : (
                    <span>
                      {typedText}
                      {typingState === 'typing' && <span style={{ borderLeft: '2px solid #635BFF', marginLeft: '1px', animation: 'blink 0.7s step-end infinite' }}> </span>}
                    </span>
                  )}
                </div>
                {typingState === 'done' && (
                  <div style={{ marginTop: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '360px' }}>
                    <div style={{ width: 32, height: 32, background: emails[activeTab].card.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={16} color="#0F172A" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' }}>{emails[activeTab].card.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{emails[activeTab].card.desc}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', background: '#FAFAFA' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#94A3B8' }}>
            Napisz wiadomość do {folders[activeTab].name}...
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE EXPORT
═══════════════════════════════════════════ */
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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
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
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <main className={styles.main}>

      {/* ════════════════════════════════
          HERO — STRIPE 1:1
      ════════════════════════════════ */}
      <section className={styles.heroSection}>

        {/* SVG Ribbon background */}
        <StripeRibbon />

        {/* ── NAVBAR ── */}
        <nav className={styles.nav}>
          <div className={styles.navInner}>
            {/* Brand */}
            <a href="/" className={styles.navBrand} onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}>
              <Image src="/logo.png" alt="MESKIAI" width={28} height={28} className={styles.navBrandImg} priority />
              MESKIAI
            </a>

            {/* Nav links */}
            <ul className={styles.navLinks}>
              <li><a href="#features" className={styles.navLink}>Produkty <span className={styles.navLinkArrow}>∨</span></a></li>
              <li><a href="#cennik" className={styles.navLink}>Rozwiązania <span className={styles.navLinkArrow}>∨</span></a></li>
              <li><a href="#faq" className={styles.navLink}>Zasoby <span className={styles.navLinkArrow}>∨</span></a></li>
              <li><a href="#cennik" className={styles.navLink}>Cennik</a></li>
            </ul>

            {/* Auth actions */}
            <div className={styles.navActions}>
              {status === "authenticated" ? (
                <div style={{ position: 'relative' }} ref={menuRef}>
                  <button className={styles.avatarBtn} onClick={() => setShowUserMenu(!showUserMenu)} aria-label="User menu">
                    {session?.user?.image
                      ? <img src={session.user.image} alt={session.user.name || "User"} />
                      : <div className={styles.avatarPlaceholder}><span>{session?.user?.name?.[0]?.toUpperCase() || 'U'}</span></div>
                    }
                  </button>
                  {showUserMenu && (
                    <div style={{ position: 'absolute', right: 0, top: '44px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '8px', width: '230px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 100 }}>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0F172A' }}>{session?.user?.name || session?.user?.email?.split('@')[0]}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', wordBreak: 'break-all' }}>{session?.user?.email}</div>
                      </div>
                      <Link href="/dashboard" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '8px', color: '#0F172A', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none' }}>
                        <HomeIcon size={15} color="#64748B" /> Panel Główny
                      </Link>
                      <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />
                      <button onClick={() => signOut({ callbackUrl: '/' })} style={{ width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#EF4444', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
                        <LogOut size={15} /> Wyloguj się
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button className={styles.navSignIn} onClick={handleLogin} disabled={isLoggingIn}>
                    {isLoggingIn ? '...' : 'Zaloguj się'}
                  </button>
                  <Link href="/kontakt" className={styles.navContactSales}>
                    Skontaktuj się ›
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── HERO CONTENT ── */}
        <div className={styles.heroContainer}>

          {/* Big H1 */}
          <h1 className={styles.heroTitle}>
            Cyfrowy pracownik AI, który automatyzuje{' '}
            <span className={styles.heroTitleAccent} style={{ color: '#635BFF' }}>Twoją firmę.</span>
          </h1>

          {/* Muted subtitle below H1 — separate paragraph like on Stripe */}
          <p className={styles.heroSubtitle}>
            Obsługuj e-maile, odpowiadaj klientom i integruj systemy –{' '}
            od pierwszego zapytania po miliony zamówień.
          </p>

          {/* CTA Buttons */}
          <div className={styles.heroActions}>
            {status === "authenticated" ? (
              <Link href="/dashboard" className={styles.heroPrimaryBtn}>
                Otwórz Panel ›
              </Link>
            ) : (
              <>
                <button className={styles.heroPrimaryBtn} onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                  Rozpocznij za darmo ›
                </button>
                <button className={styles.heroGoogleBtn} onClick={handleLogin} disabled={isLoggingIn}>
                  {/* Google G icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  {isLoggingIn ? '...' : 'Zaloguj przez Google'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          SCROLLING BRANDS MARQUEE STRIP (nad panelem)
      ════════════════════════════════ */}
      <BrandLogosStrip />

      {/* ════════════════════════════════
          PRODUCT GRAPHIC BANNER (1:1 Stripe)
      ════════════════════════════════ */}
      <StripeProductGraphic />

      {/* ════════════════════════════════
          3 COLUMN FEATURE STRIP (1:1 Stripe)
      ════════════════════════════════ */}
      <FadeInWhenVisible id="features">
        <StripeFeatureCards3Col />
      </FadeInWhenVisible>

      {/* ════════════════════════════════
          SCALE STATS & NETWORK GRAPHIC (1:1 Stripe)
      ════════════════════════════════ */}
      <FadeInWhenVisible>
        <StripeStatsAndNetworkGraphic />
      </FadeInWhenVisible>

      {/* ════════════════════════════════
          PRICING
      ════════════════════════════════ */}
      <FadeInWhenVisible id="cennik" className={styles.pricingContainer}>
        <h2 className={styles.sectionTitle}>Twój nowy pracownik.</h2>
        <p className={styles.sectionSubtitle}>Członek zespołu, który dostarcza wartość wielokrotnie przewyższającą swój koszt.</p>

        <div className={styles.pricingGrid}>
          {/* Basic */}
          <div className={styles.priceCard}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 8px 0' }}>MESKIAI Starter</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 28px 0' }}>Idealne na start dla małych firm i freelancerów.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>119</span>
              <span style={{ color: '#64748B', fontWeight: 500 }}>zł / mc</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#334155' }}><CheckCircle size={18} color="#635BFF" /> 500 Kredytów / mc</li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#334155' }}><CheckCircle size={18} color="#635BFF" /> Dostęp do bazy wiedzy</li>
            </ul>
            <button disabled={userTier >= 1 || loadingPriceId !== null} style={{ width: '100%', padding: '13px', borderRadius: '8px', background: 'transparent', border: '1px solid #E2E8F0', color: '#0A2540', fontWeight: 500, fontSize: '0.95rem', cursor: (userTier >= 1 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 1 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }} onClick={() => { if (userTier < 1) handlePlanSelection(PRICE_BASIC); }}>
              {loadingPriceId === PRICE_BASIC ? "Przekierowywanie..." : (userTier >= 1 ? (userTier === 1 ? "Twój plan" : "Downgrade") : "Wybieram")}
            </button>
          </div>

          {/* Pro */}
          <div className={`${styles.priceCard} ${styles.priceCardPro}`}>
            <div className={styles.proBadge}>REKOMENDOWANY</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 8px 0' }}>MESKIAI Pro</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 28px 0' }}>Dla firm potrzebujących pełnej automatyzacji sprzedaży.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>199</span>
              <span style={{ color: '#64748B', fontWeight: 500 }}>zł / mc</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#334155' }}><CheckCircle size={18} color="#635BFF" /> 5000 Kredytów / mc</li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#334155' }}><CheckCircle size={18} color="#635BFF" /> Integracja API (Shopify, itd.)</li>
            </ul>
            <button disabled={userTier >= 2 || loadingPriceId !== null} style={{ width: '100%', padding: '13px', borderRadius: '8px', background: '#635BFF', color: '#FFFFFF', fontWeight: 500, fontSize: '0.95rem', border: 'none', cursor: (userTier >= 2 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 2 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }} onClick={() => { if (userTier < 2) handlePlanSelection(PRICE_PRO); }}>
              {loadingPriceId === PRICE_PRO ? "Przekierowywanie..." : (userTier >= 2 ? (userTier === 2 ? "Twój plan" : "Downgrade") : "Wybieram Pro")}
            </button>
          </div>

          {/* Max */}
          <div className={styles.priceCard}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 8px 0' }}>MESKIAI Max</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 28px 0' }}>Dla przedsiębiorstw bez kompromisów.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>299</span>
              <span style={{ color: '#64748B', fontWeight: 500 }}>zł / mc</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#334155' }}><CheckCircle size={18} color="#635BFF" /> Nielimitowane Kredyty</li>
              <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#334155' }}><CheckCircle size={18} color="#635BFF" /> Dedykowany Account Manager</li>
            </ul>
            <button disabled={userTier >= 3 || loadingPriceId !== null} style={{ width: '100%', padding: '13px', borderRadius: '8px', background: 'transparent', border: '1px solid #E2E8F0', color: '#0A2540', fontWeight: 500, fontSize: '0.95rem', cursor: (userTier >= 3 || loadingPriceId !== null) ? 'not-allowed' : 'pointer', opacity: (userTier >= 3 || loadingPriceId !== null) ? 0.5 : 1, transition: 'all 0.2s', marginTop: 'auto' }} onClick={() => { if (userTier < 3) handlePlanSelection(PRICE_MAX); }}>
              {loadingPriceId === PRICE_MAX ? "Przekierowywanie..." : (userTier >= 3 ? "Twój plan" : "Wybieram")}
            </button>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* ════════════════════════════════
          FAQ
      ════════════════════════════════ */}
      <FadeInWhenVisible id="faq" className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>Najczęściej zadawane pytania</h2>
        <div style={{ marginTop: '48px', borderTop: '1px solid #E2E8F0' }}>
          <FaqAccordionItem question="Skąd agent bierze informacje o zamówieniach?" answer={<>Gdy klient pyta o zamówienie e-mailowo (np. podając jego numer), MESKIAI łączy się przez oficjalne API z systemem Twojej firmy (np. Shopify), odczytuje dane (status płatności, link do śledzenia wysyłki) i natychmiast generuje spersonalizowaną odpowiedź dla klienta.</>} />
          <FaqAccordionItem question="Czy muszę udostępniać hasła do moich platform?" answer={<>Nie. System łączy się poprzez bezpieczne klucze API oraz tokeny uwierzytelniające. Masz pełną kontrolę nad tym, do czego Agent ma dostęp i możesz w dowolnej chwili wyłączyć te uprawnienia.</>} />
          <FaqAccordionItem question="Czy Agent potrafi przekierować trudną sprawę do człowieka?" answer={<>Tak, jeśli system rozpozna, że zapytanie jest nietypowe, wykracza poza jego bazę wiedzy lub klient wyraźnie zażąda kontaktu z konsultantem, konwersacja zostanie płynnie przekazana do Twojego zespołu.</>} />
          <FaqAccordionItem question="Jak długo trwa wdrożenie i nauka Agenta?" answer={<>Podstawowa integracja zajmuje kilka minut. Następnie wgrywasz materiały na temat swojej firmy (regulaminy, politykę zwrotów, bazę wiedzy), które Agent przyswaja natychmiastowo. Od tego momentu jest gotowy do samodzielnej obsługi klientów.</>} />
          <FaqAccordionItem question='Czy sztuczna inteligencja będzie "zmyślać" odpowiedzi?' answer={<>Nasz system wykorzystuje ścisłe limity (tzw. guardrails) – opiera się tylko i wyłącznie na informacjach, które mu udostępnisz. Jeśli klient zada pytanie, na które Agent nie znajdzie odpowiedzi w bazie wiedzy, nie zmyśli jej. Przekaże to zapytanie do człowieka.</>} />
          <FaqAccordionItem question="Jakie platformy i systemy obsługuje MESKIAI?" answer={<>Wspieramy natywną integrację z najpopularniejszymi platformami e-commerce (Shopify, WooCommerce, BaseLinker). Dodajemy nowe integracje co miesiąc, a jeśli masz system dedykowany – nasz zespół stworzy dla Ciebie własne złącze (w pakiecie Max).</>} />
          <FaqAccordionItem question="Czy można anulować subskrypcję?" answer={<>Tak, możesz zrezygnować w dowolnym momencie z poziomu swojego panelu, jednym kliknięciem bez żadnych komplikacji, kruczków czy umów długoterminowych.</>} />
        </div>
      </FadeInWhenVisible>

      {/* ════════════════════════════════
          BOTTOM CTA (1:1 Stripe Ready to get started?)
      ════════════════════════════════ */}
      <FadeInWhenVisible>
        <div className={styles.stripeReadySection}>
          <div className={styles.stripeReadyContainer}>
            {/* Left Col: Main CTA */}
            <div className={styles.stripeReadyLeft}>
              <h2 className={styles.stripeReadyTitle}>Gotowy, by zacząć?</h2>
              <p className={styles.stripeReadyDesc}>
                Załóż konto w 2 minuty lub skontaktuj się z nami, aby dobrać dedykowany pakiet dla Twojej firmy.
              </p>
              <div className={styles.stripeReadyBtns}>
                <button
                  className={styles.stripeReadyPrimaryBtn}
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Rozpocznij teraz ›
                </button>
                <Link href="/kontakt" className={styles.stripeReadySecondaryBtn}>
                  Skontaktuj się
                </Link>
              </div>
            </div>

            {/* Right Side: 2 Feature Items */}
            <div className={styles.stripeReadyRight}>
              {/* Item 1 */}
              <div className={styles.stripeReadyItem}>
                <div className={styles.stripeReadyIconBox}>
                  <Tag size={18} color="#635BFF" />
                </div>
                <h3 className={styles.stripeReadyItemTitle}>Sprawdź cennik i pakiety</h3>
                <p className={styles.stripeReadyItemDesc}>
                  Przejrzyste plany dopasowane do skali Twojej firmy bez ukrytych opłat.
                </p>
                <a href="#cennik" className={styles.stripeReadyLink}>
                  Szczegóły cennika ›
                </a>
              </div>

              {/* Item 2 */}
              <div className={styles.stripeReadyItem}>
                <div className={styles.stripeReadyIconBox}>
                  <Code size={18} color="#635BFF" />
                </div>
                <h3 className={styles.stripeReadyItemTitle}>Szybka integracja</h3>
                <p className={styles.stripeReadyItemDesc}>
                  Uruchom MESKIAI w swojej firmie w mniej niż 10 minut.
                </p>
                <a href="#faq" className={styles.stripeReadyLink}>
                  Opcje integracji ›
                </a>
              </div>
            </div>
          </div>
        </div>
      </FadeInWhenVisible>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <div className={styles.advancedFooter} style={{ marginTop: 'auto' }}>
        <div className={styles.footerGrid}>
          <div className={styles.footerColumn}>
            <div className={styles.footerLogo}>
              <Image src="/logo.png" alt="MESKIAI Logo" width={26} height={26} style={{ objectFit: 'contain' }} />
              MESKIAI
            </div>
            <p className={styles.footerDesc}>Twój wirtualny pracownik, który łączy i automatyzuje działania firmy w czasie rzeczywistym. Gotowość 24/7.</p>
          </div>
          <div className={styles.footerColumn}>
            <h4 className={styles.footerHeading}>Firma</h4>
            <div className={styles.footerLinksList}>
              <Link href="/o-nas">O nas</Link>
              <Link href="/kontakt">Kontakt</Link>
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4 className={styles.footerHeading}>Produkt</h4>
            <div className={styles.footerLinksList}>
              <Link href="/integracje">Integracje</Link>
              <Link href="/bezpieczenstwo">Bezpieczeństwo</Link>
              <Link href="/przypadki-uzycia">Przypadki użycia</Link>
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4 className={styles.footerHeading}>Prawo i Pomoc</h4>
            <div className={styles.footerLinksList}>
              <Link href="/regulamin">Regulamin serwisu</Link>
              <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
              <Link href="/polityka-cookies">Polityka Cookies</Link>
              <Link href="/centrum-pomocy">Centrum pomocy</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div>© {new Date().getFullYear()} MESKIAI. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/regulamin">Regulamin</Link>
            <Link href="/polityka-prywatnosci">Prywatność</Link>
          </div>
        </div>
      </div>

    </main>
  );
}
