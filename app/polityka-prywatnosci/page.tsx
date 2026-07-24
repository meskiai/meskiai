import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Fingerprint, Database, CheckCircle, Cookie } from "lucide-react";
import styles from "./page.module.css";
import homeStyles from "../page.module.css";
import { ThemeToggle } from "../components/ThemeToggle";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Reusing the beautiful ambient background from the home page */}
      <div className={homeStyles.ambientBackground}>
        <div className={homeStyles.ambientBlob} style={{ top: "10%", right: "10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, var(--ambient-2) 0%, transparent 60%)" }}></div>
        <div className={homeStyles.ambientBlob} style={{ bottom: "-20%", left: "10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, var(--ambient-3) 0%, transparent 60%)" }}></div>
      </div>

      <main className={styles.main}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Wróć
          </Link>

          <div className={styles.header}>
            <div className={`${homeStyles.badge} animate-fade-in-up`} style={{ marginBottom: '24px', display: 'inline-flex' }}>
              <ShieldCheck size={14} className={homeStyles.badgeHighlight} /> Zgodność z RODO
            </div>
            <h1 className="animate-fade-in-up animate-delay-1">Twoja Prywatność.<br/>Nasz Priorytet.</h1>
            <p className="animate-fade-in-up animate-delay-2">
              Przejrzyste zasady przetwarzania danych osobowych i plików cookies w aplikacji Meski AI. Zbudowane na fundamencie absolutnego bezpieczeństwa.
            </p>
          </div>

          <div className={styles.documentList}>
            {/* Section 1 */}
            <div className={`${styles.sectionCard} animate-fade-in-up animate-delay-3`}>
              <div className={styles.sectionIcon}><Fingerprint size={28} /></div>
              <div className={styles.sectionContent}>
                <h2>1. Jakie dane zbieramy?</h2>
                <p>W ramach świadczenia naszych usług gromadzimy wyłącznie to, co jest niezbędne do poprawnego działania platformy:</p>
                <ul>
                  <li><strong>Dane logowania (OAuth):</strong> Adres e-mail, nazwa użytkownika oraz unikalny identyfikator udostępniony przez Google w trakcie uwierzytelniania.</li>
                  <li><strong>Dane biznesowe:</strong> W ramach automatyzacji przetwarzamy zawartość wskazanych przez Ciebie wiadomości e-mail oraz dane firmowe do faktur.</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className={`${styles.sectionCard} animate-fade-in-up animate-delay-4`}>
              <div className={styles.sectionIcon}><Database size={28} /></div>
              <div className={styles.sectionContent}>
                <h2>2. Dlaczego używamy Twoich danych?</h2>
                <p>Dane są używane ściśle w celu realizacji świadczonych przez nas usług premium, w szczególności do:</p>
                <ul>
                  <li>Bezpiecznego uwierzytelnienia i utrzymania ciągłości Twojej sesji (NextAuth).</li>
                  <li>Świadczenia usługi wyższej konieczności: generowania trafnych odpowiedzi AI na wiadomości e-mail oraz automatycznego tworzenia plików PDF z fakturami.</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className={`${styles.sectionCard} animate-fade-in-up animate-delay-5`}>
              <div className={styles.sectionIcon}><Lock size={28} /></div>
              <div className={styles.sectionContent}>
                <h2>3. Zero-Training Policy (Modele AI)</h2>
                <p>Korzystamy z najnowocześniejszych rozwiązań AI dostarczanych m.in. przez Google LLC (Gemini AI). Gwarantujemy jednak żelazną zasadę prywatności:</p>
                <div className={styles.highlightBox}>
                  <strong>Żadne dane</strong> przesyłane przez Ciebie lub Twoich klientów do naszych modułów AI nie są wykorzystywane do trenowania publicznych modeli sztucznej inteligencji. Twój biznes pozostaje wyłącznie Twój.
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className={`${styles.sectionCard} animate-fade-in-up animate-delay-6`}>
              <div className={styles.sectionIcon}><Cookie size={28} /></div>
              <div className={styles.sectionContent}>
                <h2>4. Czyste Pliki Cookies</h2>
                <p>
                  Nasz system używa plików cookies wyłącznie w celach technicznych i utrzymania bezpieczeństwa (tzw. <em>Strictly Necessary Cookies</em>). Służą one do zachowania Twojej sesji logowania. 
                  <strong> Nie stosujemy</strong> inwazyjnych skryptów śledzących, nie handlujemy danymi analitycznymi i nie sprzedajemy profilu użytkownika podmiotom trzecim.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className={`${styles.sectionCard} animate-fade-in-up animate-delay-7`}>
              <div className={styles.sectionIcon}><CheckCircle size={28} /></div>
              <div className={styles.sectionContent}>
                <h2>5. Pełnia Twoich Praw (RODO)</h2>
                <p>Zgodnie z ogólnym rozporządzeniem o ochronie danych (RODO) przysługuje Ci absolutne prawo do kontroli nad swoimi informacjami. Masz prawo do:</p>
                <ul>
                  <li>Dostępu do swoich danych oraz otrzymania ich czytelnej kopii.</li>
                  <li>Natychmiastowego sprostowania oraz ograniczenia przetwarzania.</li>
                  <li>Bezwzględnego usunięcia danych z naszych serwerów (Prawo do bycia zapomnianym).</li>
                </ul>
                <p>Aby zrealizować swoje prawa, wystarczy skontaktować się z nami z poziomu panelu klienta.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
