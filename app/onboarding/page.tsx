"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot, ArrowRight, CheckCircle } from "lucide-react";

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("PROFESJONALNY");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const handleSave = async () => {
    if (!context.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessContext: context,
          replyTone: tone,
          onboardingDone: true,
          autoReply: true,   // ← agent aktywny od razu po konfiguracji
        }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 1400);
      } else {
        alert("Błąd zapisu. Spróbuj ponownie.");
        setSaving(false);
      }
    } catch {
      alert("Błąd sieci. Sprawdź połączenie.");
      setSaving(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "var(--background)",
    }}>
      <div style={{
        maxWidth: "560px",
        width: "100%",
        padding: "clamp(28px, 5vw, 48px)",
        borderRadius: "24px",
        background: "var(--card-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--mac-shadow)",
      }}>

        {done ? (
          /* ── Success state ── */
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle size={56} color="#22c55e" style={{ marginBottom: "16px" }} />
            <h1 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>Agent gotowy!</h1>
            <p style={{ color: "var(--subtext)", lineHeight: 1.6 }}>
              Twój asystent AI działa teraz <strong>24/7</strong>.<br />
              Odpowiada na maile nawet gdy przeglądarka jest zamknięta.
            </p>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px", gap: "12px" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "18px",
                background: "linear-gradient(135deg, var(--primary), #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
              }}>
                <img
                src="/logo.png"
                alt="MESKIAI"
                style={{ width: '42px', height: '42px', objectFit: 'contain', filter: 'var(--logo-filter)' }}
              />
              </div>
              <h1 style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)", textAlign: "center", margin: 0 }}>
                Skonfiguruj swojego Agenta AI
              </h1>
              <p style={{ color: "var(--subtext)", textAlign: "center", lineHeight: 1.6, margin: 0, fontSize: "0.93rem" }}>
                Agent będzie odpowiadał na maile <strong style={{ color: "var(--foreground)" }}>24/7</strong> niezależnie od tego,<br />
                czy przeglądarka jest otwarta czy nie.
              </p>
            </div>

            {/* ── Business context ── */}
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "0.88rem", color: "var(--subtext)" }}>
              Opisz swoją firmę i zasady komunikacji
            </label>
            <textarea
              style={{
                width: "100%",
                height: "160px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--glass-border)",
                borderRadius: "12px",
                padding: "14px",
                color: "var(--foreground)",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                resize: "vertical",
                marginBottom: "16px",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              placeholder="np. Prowadzimy sklep z oponami w Warszawie. Pracujemy pn-pt 8-16. Jesteśmy mili, ale stanowczy w kwestii zwrotów. Klientom oferujemy zniżkę 5% na hasło OPONA."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; }}
            />

            {/* ── Tone selector ── */}
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.88rem", color: "var(--subtext)" }}>
              Ton odpowiedzi agenta
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "24px" }}>
              {[
                { id: "PROFESJONALNY", label: "🎩 Profesjonalny", desc: "Oficjalny, uprzejmy" },
                { id: "CASUALOWY",    label: "😊 Casualowy",    desc: "Luźny, bezpośredni" },
                { id: "KROTKI",       label: "⚡ Krótki",       desc: "2–3 zdania max" },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setTone(id)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: "10px",
                    border: tone === id ? "2px solid var(--primary)" : "1px solid var(--glass-border)",
                    background: tone === id ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                    color: tone === id ? "var(--primary)" : "var(--subtext)",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "0.78rem",
                    fontWeight: tone === id ? 700 : 500,
                    transition: "all 0.18s",
                  }}
                >
                  <div style={{ fontSize: "0.82rem", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.75 }}>{desc}</div>
                </button>
              ))}
            </div>

            {/* ── Info badge ── */}
            <div style={{
              padding: "10px 14px",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "10px",
              fontSize: "0.82rem",
              color: "#22c55e",
              marginBottom: "20px",
              lineHeight: 1.5,
            }}>
              ✅ Po konfiguracji agent <strong>automatycznie włączy auto-odpowiedzi</strong>.
              Możesz to zmienić w ustawieniach w dowolnym momencie.
            </div>

            {/* ── Save button ── */}
            <button
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, var(--primary), #3b82f6)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                cursor: context.trim() ? "pointer" : "not-allowed",
                opacity: context.trim() ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
                transition: "opacity 0.2s",
              }}
              onClick={handleSave}
              disabled={saving || !context.trim()}
            >
              {saving ? "Zapisywanie..." : (
                <>Aktywuj Agenta AI <ArrowRight size={18} /></>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
