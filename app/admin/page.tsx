"use client";

import { useEffect, useState, Fragment } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, Users, Database, ArrowLeft, Activity, 
  RefreshCw, ChevronDown, ChevronUp, Bot, ShoppingCart, 
  Briefcase, Mail, Clock, Key
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const ADMIN_EMAIL = "miloszmeskisim@gmail.com";

  // Weryfikacja po stronie klienta
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      router.replace("/dashboard");
    } else {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Błąd pobierania danych");
      }
      
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (userId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  if (status === "loading" || isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", color: "var(--foreground)" }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (session?.user?.email !== ADMIN_EMAIL) {
    return null;
  }

  // Obliczenia statystyk globalnych
  const totalUsers = users.length;
  const activeSubscriptions = users.filter(u => u.subscriptionStatus === "active").length;
  const totalEmailsProcessed = users.reduce((acc, u) => acc + (u.settings?.agentEmailsProcessed || 0), 0);
  const activeAgents = users.filter(u => u.settings?.autoReply).length;
  const activeStores = users.filter(u => !!u.settings?.storeUrl).length;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              onClick={() => router.push("/dashboard")}
              style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground)", cursor: "pointer", transition: "0.2s" }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <ShieldAlert size={28} style={{ color: "var(--primary)" }} />
                Panel Administratora
              </h1>
              <p style={{ color: "var(--muted)", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
                Zaawansowane widoki użytkowników
              </p>
            </div>
          </div>
          
          <button 
            onClick={fetchUsers}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--card-bg)", border: "1px solid var(--border)", padding: "10px 20px", borderRadius: "12px", color: "var(--foreground)", cursor: "pointer", fontWeight: 600 }}
          >
            <RefreshCw size={18} />
            Odśwież dane
          </button>
        </div>

        {error && (
          <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", color: "#ef4444", marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {/* Global Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--muted)", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
              <Users size={16} /> Wszyscy użytkownicy
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{totalUsers}</div>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--muted)", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
              <Activity size={16} /> Aktywne subskrypcje
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981" }}>{activeSubscriptions}</div>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--muted)", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
              <Bot size={16} /> Agenci 24/7
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#60a5fa" }}>{activeAgents}</div>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--muted)", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
              <ShoppingCart size={16} /> Podłączone sklepy
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a855f7" }}>{activeStores}</div>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--muted)", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
              <Database size={16} /> Przetworzone e-maile
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{totalEmailsProcessed}</div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ width: "40px", padding: "16px 12px" }}></th>
                  <th style={{ padding: "16px 12px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Użytkownik</th>
                  <th style={{ padding: "16px 12px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Rejestracja</th>
                  <th style={{ padding: "16px 12px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Subskrypcja</th>
                  <th style={{ padding: "16px 12px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Wątki</th>
                  <th style={{ padding: "16px 12px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Agent 24/7</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const isExpanded = expandedRows[u.id];
                  const hasStore = !!u.settings?.storeUrl;
                  const hasAgent = !!u.settings?.autoReply;

                  return (
                    <Fragment key={u.id}>
                      <tr 
                        onClick={() => toggleRow(u.id)}
                        style={{ borderBottom: (i === users.length - 1 && !isExpanded) ? "none" : "1px solid var(--border)", background: isExpanded ? "rgba(255,255,255,0.03)" : "transparent", transition: "background 0.2s", cursor: "pointer" }} 
                        className="hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <td style={{ padding: "16px 12px", textAlign: "center", color: "var(--muted)" }}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <div style={{ fontWeight: 600, marginBottom: "4px" }}>{u.name || "Brak imienia"}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{u.email}</div>
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <div style={{ fontSize: "0.9rem" }}>{new Date(u.createdAt).toLocaleDateString('pl-PL')}</div>
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <span style={{ 
                            display: "inline-block", 
                            padding: "4px 12px", 
                            borderRadius: "20px", 
                            fontSize: "0.8rem", 
                            fontWeight: 600,
                            background: u.subscriptionStatus === "active" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: u.subscriptionStatus === "active" ? "#10b981" : "#ef4444",
                            marginBottom: "4px"
                          }}>
                            {u.subscriptionStatus?.toUpperCase() || "INACTIVE"}
                          </span>
                          {u.stripeCurrentPeriodEnd && (
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                              Wygasa: {new Date(u.stripeCurrentPeriodEnd).toLocaleDateString('pl-PL')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <div style={{ fontWeight: 600 }}>{u.threadStats?.total || 0}</div>
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <span title="Agent Autoodpowiedzi" style={{ padding: "4px 8px", borderRadius: "8px", background: hasAgent ? "rgba(59, 130, 246, 0.1)" : "rgba(0,0,0,0.05)", color: hasAgent ? "#3b82f6" : "var(--muted)", fontSize: "0.8rem", fontWeight: 600 }}>
                              {hasAgent ? "ON" : "OFF"}
                            </span>
                            <span title="Integracja E-commerce" style={{ padding: "4px 8px", borderRadius: "8px", background: hasStore ? "rgba(168, 85, 247, 0.1)" : "rgba(0,0,0,0.05)", color: hasStore ? "#a855f7" : "var(--muted)", fontSize: "0.8rem", fontWeight: 600 }}>
                              {hasStore ? "SKLEP" : "BRAK"}
                            </span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Rozwinięcie (Szczegóły) */}
                      {isExpanded && (
                        <tr style={{ background: "rgba(0,0,0,0.015)", borderBottom: i === users.length - 1 ? "none" : "1px solid var(--border)" }}>
                          <td colSpan={6} style={{ padding: "24px 40px" }}>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                              
                              {/* Sekcja: Wątki & E-maile */}
                              <div style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "16px", borderRadius: "16px" }}>
                                <h4 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px", color: "var(--foreground)" }}>
                                  <Mail size={16} style={{ color: "#60a5fa" }} /> Zestawienie E-maili
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Wszystkie wątki:</span> <strong>{u.threadStats?.total || 0}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Odpowiedziano (Auto):</span> <strong style={{ color: "#10b981" }}>{u.threadStats?.autoReplied || 0}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Wymaga uwagi:</span> <strong style={{ color: "#ef4444" }}>{u.threadStats?.requiresAttention || 0}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Oczekujące:</span> <strong style={{ color: "#f59e0b" }}>{u.threadStats?.pending || 0}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Sekcja: Agent & Konfiguracja */}
                              <div style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "16px", borderRadius: "16px" }}>
                                <h4 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px", color: "var(--foreground)" }}>
                                  <Bot size={16} style={{ color: "#8b5cf6" }} /> Konfiguracja Agenta
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Status Auto-Reply:</span> 
                                    <strong>{hasAgent ? "Aktywny" : "Wyłączony"}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Ostatnie wywołanie:</span> 
                                    <strong>{u.settings?.lastAgentRunAt ? new Date(u.settings.lastAgentRunAt).toLocaleString('pl-PL') : "Nigdy"}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Dostępne Kredyty AI:</span> 
                                    <strong>{u.settings?.aiCredits || 0}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}><Key size={14} /> Hasło Aplikacji Google:</span> 
                                    <strong style={{ color: u.hasAppPassword ? "#10b981" : "#ef4444" }}>{u.hasAppPassword ? "Skonfigurowane" : "Brak"}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Sekcja: Firma & E-commerce */}
                              <div style={{ background: "var(--background)", border: "1px solid var(--border)", padding: "16px", borderRadius: "16px" }}>
                                <h4 style={{ margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px", color: "var(--foreground)" }}>
                                  <Briefcase size={16} style={{ color: "#f59e0b" }} /> E-commerce / Firma
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Sklep (Integracja):</span> 
                                    <strong>{u.settings?.storeType ? u.settings.storeType.toUpperCase() : "Brak"}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>URL Sklepu:</span> 
                                    <strong>{u.settings?.storeUrl || "-"}</strong>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted)" }}>Nazwa firmy:</span> 
                                    <strong style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.settings?.companyName || "-"}</strong>
                                  </div>
                                </div>
                              </div>

                            </div>
                            
                            {/* Business Context Full Width */}
                            {u.settings?.businessContext && (
                              <div style={{ marginTop: "16px", padding: "16px", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: "12px", fontSize: "0.85rem" }}>
                                <strong style={{ color: "var(--foreground)", display: "block", marginBottom: "8px" }}>Kontekst biznesowy Agenta:</strong>
                                <div style={{ color: "var(--subtext)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                  {u.settings.businessContext}
                                </div>
                              </div>
                            )}

                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                      Brak użytkowników w bazie.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
