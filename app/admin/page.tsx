"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Users, Database, ArrowLeft, Activity, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (status === "loading" || isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", color: "var(--foreground)" }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  // Double check
  if (session?.user?.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
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
                Zastrzeżony dostęp dla {ADMIN_EMAIL}
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

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "24px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--muted)", marginBottom: "12px", fontWeight: 600 }}>
              <Users size={20} /> Całkowita liczba użytkowników
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: 800 }}>{users.length}</div>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "24px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--muted)", marginBottom: "12px", fontWeight: 600 }}>
              <Activity size={20} /> Aktywne subskrypcje
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: 800 }}>
              {users.filter(u => u.subscriptionStatus === "active").length}
            </div>
          </div>
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "24px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--muted)", marginBottom: "12px", fontWeight: 600 }}>
              <Database size={20} /> Suma przetworzonych e-maili
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: 800 }}>
              {users.reduce((acc, u) => acc + (u.settings?.agentEmailsProcessed || 0), 0)}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Użytkownik</th>
                  <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Data Rejestracji</th>
                  <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Plan / Subskrypcja</th>
                  <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Kredyty</th>
                  <th style={{ padding: "16px 24px", color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Statystyki</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i === users.length - 1 ? "none" : "1px solid var(--border)", background: "transparent", transition: "background 0.2s" }} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{u.name || "Brak imienia"}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontSize: "0.9rem" }}>{new Date(u.createdAt).toLocaleDateString('pl-PL')}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ 
                        display: "inline-block", 
                        padding: "4px 12px", 
                        borderRadius: "20px", 
                        fontSize: "0.8rem", 
                        fontWeight: 600,
                        background: u.subscriptionStatus === "active" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: u.subscriptionStatus === "active" ? "#10b981" : "#ef4444"
                      }}>
                        {u.subscriptionStatus?.toUpperCase() || "INACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                      {u.settings?.aiCredits || 0}
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "0.85rem", color: "var(--muted)" }}>
                      <div>E-maile: <b>{u.settings?.agentEmailsProcessed || 0}</b></div>
                      <div>Wątki: <b>{u._count?.threads || 0}</b></div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
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
