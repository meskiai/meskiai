"use client";

import Link from 'next/link';
import { Terminal, Key, Webhook, Code, Cpu, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import styles from '../page.module.css';

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const curlExample = `curl -X POST https://meskiai.com/api/webhooks/orders \\
  -H "Authorization: Bearer YOUR_API_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderId": "10042",
    "customerEmail": "jan.kowalski@example.com",
    "status": "SHIPPED",
    "trackingUrl": "https://inpost.pl/sledzenie?number=6820491823"
  }'`;

  const nodeExample = `import { MeskiaiClient } from '@meskiai/sdk';

const client = new MeskiaiClient({
  apiKey: process.env.MESKIAI_API_KEY
});

// Wyzwolenie ręcznej analizy skrzynki pocztowej
const syncResult = await client.syncThreads({
  forceRun: true
});

console.log(\`Przetworzono wątków: \${syncResult.processedCount}\`);`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', color: '#0A2540', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <a href="/" className={styles.navBrand}>
            <img src="/logo.png" alt="MESKIAI" className={styles.navBrandImg} />
            MESKIAI
          </a>
          <div className={styles.navActions} style={{ marginLeft: 'auto' }}>
            <Link href="/" className={styles.navLink}>
              ‹ Wróć na stronę główną
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: 700, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', background: 'rgba(99,91,255,0.08)', padding: '6px 14px', borderRadius: '20px' }}>
            DOKUMENTACJA &amp; DEWELOPERZY
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#0A2540', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
            API MESKIAI &amp; Webhooki Integracyjne
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#425466', lineHeight: 1.65, maxWidth: '780px' }}>
            Integracja serwisu MESKIAI z własnymi aplikacjami, sklepami internetowymi oraz systemami CRM przy użyciu bezpiecznych punktów końcowych REST API.
          </p>
        </div>

        {/* Quick Nav / Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '56px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <Key size={20} color="#635BFF" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A2540', marginBottom: '4px' }}>Autoryzacja Bearer</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Wszystkie zapytania API wymagają podania nagłówka `Authorization: Bearer KEY`.
            </p>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <Webhook size={20} color="#635BFF" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A2540', marginBottom: '4px' }}>Webhooki Zamówień</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Przesyłaj statusy przesyłek w czasie rzeczywistym z autorskich systemów E-commerce.
            </p>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px' }}>
            <Cpu size={20} color="#635BFF" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A2540', marginBottom: '4px' }}>Synchroniczny Sync</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Wycofuj ręczne uruchomienie skanowania poczty przy użyciu żądania POST.
            </p>
          </div>
        </div>

        {/* Section 1: Endpoint POST /api/webhooks/orders */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ background: '#10B981', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>POST</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0A2540', margin: 0 }}>/api/webhooks/orders</h2>
          </div>
          <p style={{ color: '#425466', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Służy do powiadamiania Agenta AI o bieżących zamówieniach z Twojego sklepu internetowego. Dzięki temu agent natychmiast wie, pod jakim adresem znajduje się przesyłka klienta.
          </p>
          
          <div style={{ background: '#0F172A', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #1E293B', pb: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'monospace' }}>cURL Example</span>
              <button 
                onClick={() => copyCode(curlExample, 1)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedIndex === 1 ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                {copiedIndex === 1 ? "Skopiowano" : "Kopiuj"}
              </button>
            </div>
            <pre style={{ margin: 0, color: '#38BDF8', fontSize: '0.88rem', fontFamily: 'Courier New, monospace', overflowX: 'auto', lineHeight: 1.5 }}>
              {curlExample}
            </pre>
          </div>
        </section>

        {/* Section 2: Node.js SDK / Fetch Example */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ background: '#635BFF', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>SDK / TS</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0A2540', margin: 0 }}>Integracja z Node.js &amp; TypeScript</h2>
          </div>
          <p style={{ color: '#425466', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Możesz łatwo wymusić pobranie i analizę poczty e-mail przy użyciu prostej metody HTTP lub dedykowanego klienta TypeScript.
          </p>

          <div style={{ background: '#0F172A', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #1E293B', pb: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontFamily: 'monospace' }}>TypeScript Example</span>
              <button 
                onClick={() => copyCode(nodeExample, 2)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedIndex === 2 ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                {copiedIndex === 2 ? "Skopiowano" : "Kopiuj"}
              </button>
            </div>
            <pre style={{ margin: 0, color: '#F1F5F9', fontSize: '0.88rem', fontFamily: 'Courier New, monospace', overflowX: 'auto', lineHeight: 1.5 }}>
              {nodeExample}
            </pre>
          </div>
        </section>

        {/* API Keys Help Banner */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px' }}>Potrzebujesz Klucza API do integracji?</h3>
            <p style={{ color: '#64748B', fontSize: '0.92rem', margin: 0 }}>
              Wygenerujesz go w kilka sekund w panelu nawigacji w sekcji Ustawienia &gt; Integracje API.
            </p>
          </div>
          <Link href="/dashboard" style={{ background: '#0A2540', color: '#FFFFFF', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            Przejdź do Panelu ›
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className={styles.advancedFooter}>
        <div className={styles.footerBottom} style={{ margin: 0, paddingTop: 0, borderTop: 'none' }}>
          <div>&copy; {new Date().getFullYear()} MESKIAI. Wszelkie prawa zastrzeżone.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/regulamin">Regulamin</Link>
            <Link href="/polityka-prywatnosci">Prywatność</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
