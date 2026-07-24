"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--subtext)',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--sidebar-hover)';
          e.currentTarget.style.color = 'var(--foreground)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--subtext)';
        }}
        title="Ustawienia motywu"
      >
        {theme === 'dark' ? <Moon size={20} /> : theme === 'light' ? <Sun size={20} /> : <Monitor size={20} />}
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 0',
            minWidth: '150px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button 
              onClick={() => { setTheme('light'); setIsOpen(false); }}
              style={{
                background: theme === 'light' ? 'var(--sidebar-active)' : 'transparent',
                color: theme === 'light' ? 'var(--primary)' : 'var(--foreground)',
                border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
              }}
            >
              <Sun size={16} /> Jasny
            </button>
            <button 
              onClick={() => { setTheme('dark'); setIsOpen(false); }}
              style={{
                background: theme === 'dark' ? 'var(--sidebar-active)' : 'transparent',
                color: theme === 'dark' ? 'var(--primary)' : 'var(--foreground)',
                border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
              }}
            >
              <Moon size={16} /> Ciemny
            </button>
            <button 
              onClick={() => { setTheme('system'); setIsOpen(false); }}
              style={{
                background: theme === 'system' ? 'var(--sidebar-active)' : 'transparent',
                color: theme === 'system' ? 'var(--primary)' : 'var(--foreground)',
                border: 'none', padding: '10px 16px', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
              }}
            >
              <Monitor size={16} /> System
            </button>
          </div>
        </>
      )}
    </div>
  );
}
