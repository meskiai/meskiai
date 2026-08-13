"use client";

import { signIn } from "next-auth/react";
import { Bot } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--background)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        animation: 'fade-in-up 0.6s ease-out forwards'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          margin: '0 auto 24px auto',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Bot size={32} color="var(--primary)" />
        </div>
        
        <h1 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 600, 
          color: 'var(--foreground)', 
          marginBottom: '8px' 
        }}>
          Zaloguj się do MESKIAI
        </h1>
        
        <p style={{ 
          color: 'var(--subtext)', 
          marginBottom: '32px',
          fontSize: '0.95rem',
          lineHeight: 1.5
        }}>
          Uzyskaj dostęp do swojego panelu zarządzania i wirtualnego asystenta.
        </p>

        <button 
          onClick={() => signIn("google", { callbackUrl })}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '16px',
            background: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(255,255,255,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,255,255,0.1)';
          }}
        >
          Kontynuuj z Google
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', background: 'var(--background)' }}></div>}>
      <LoginForm />
    </Suspense>
  );
}
