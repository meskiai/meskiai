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
      fontFamily: 'var(--font-geist-sans), sans-serif'
    }}>
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
        animation: 'fade-in-up 0.6s ease-out forwards',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* User Logo */}
        <img 
          src="/logo.png" 
          alt="MESKIAI Logo" 
          style={{ width: '56px', height: '56px', objectFit: 'contain', marginBottom: '24px' }} 
        />
        
        <h1 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 700, 
          color: 'var(--foreground)', 
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          Zaloguj się do MESKIAI
        </h1>
        
        <p style={{ 
          color: 'var(--subtext)', 
          marginBottom: '40px',
          fontSize: '1rem',
          lineHeight: 1.5,
          fontWeight: 500
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
            padding: '12px 24px',
            background: '#FFFFFF',
            color: '#3C4043',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#F8F9FA';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Google Icon SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
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
