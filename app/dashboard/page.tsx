"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Mail, Send, RefreshCw, AlertCircle, CheckCircle, 
  Sparkles, User, LogOut, Inbox, Archive, AlertTriangle, Trash2, Bot, Home, HelpCircle, LayoutGrid,
  ArrowUpRight, ArrowDownLeft, ArrowDown, FileText, Building, Search, ArrowRight, ChevronRight, Users,
  Target, Zap, TrendingUp, ShieldAlert, Plus, BarChart2, Activity, Lightbulb, PieChart, ExternalLink, Settings
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import styles from "./page.module.css";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [silentSyncing, setSilentSyncing] = useState(false);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [editedReply, setEditedReply] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [autoReply, setAutoReply] = useState(false);
  const [lastAgentRunAt, setLastAgentRunAt] = useState<string | null>(null);
  const [agentEmailsProcessed, setAgentEmailsProcessed] = useState(0);

  // Dashboard Mode Selection
  const [dashboardMode, setDashboardMode] = useState<"MAIL" | "STRATEGY" | "CLIENTS" | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);

  const [currentTab, setCurrentTab] = useState<"INBOX" | "IMPORTANT" | "SENT" | "SPAM" | "SETTINGS" | "COMPANY" | "STRATEGY" | "ACCOUNT">("INBOX");
  const [businessContext, setBusinessContext] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyNip, setCompanyNip] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyBankAccount, setCompanyBankAccount] = useState("");
  const [defaultVatRate, setDefaultVatRate] = useState("23%");
  const [replyTone, setReplyTone] = useState("PROFESJONALNY");
  const [hasAppPassword, setHasAppPassword] = useState<boolean>(false);
  const [appPasswordInput, setAppPasswordInput] = useState("");
  const [appPasswordError, setAppPasswordError] = useState("");
  const [savingAppPassword, setSavingAppPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showModuleSwitcher, setShowModuleSwitcher] = useState(false);

  // Edit Modes State
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingKnowledge, setIsEditingKnowledge] = useState(false);

  // Strategy Agent State
  const [strategyUrl, setStrategyUrl] = useState("");
  const [isAnalyzingStrategy, setIsAnalyzingStrategy] = useState(false);
  const [strategyResults, setStrategyResults] = useState<any>(null);

  // Clients State
  const [leads, setLeads] = useState<any[]>([]);
  const [generatingLeads, setGeneratingLeads] = useState(false);
  const [showClientsGuide, setShowClientsGuide] = useState(false);
  
  // Welcome Animation
  const [welcomeState, setWelcomeState] = useState<"VISIBLE" | "FADING_OUT" | "HIDDEN">("VISIBLE");

  // Subscription State
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const [cardInfo, setCardInfo] = useState<{ brand: string; last4: string; expMonth?: number; expYear?: number } | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false);

  // Contact Lead State
  const [contactingLead, setContactingLead] = useState<any | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactBody, setContactBody] = useState("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setAutoReply(data.settings.autoReply);
          setHasAppPassword(data.settings.hasAppPassword);
          setBusinessContext(data.settings.businessContext || "");
          setCompanyName(data.settings.companyName || "");
          setCompanyNip(data.settings.companyNip || "");
          setCompanyAddress(data.settings.companyAddress || "");
          setCompanyBankAccount(data.settings.companyBankAccount || "");
          setStrategyUrl(data.settings.companyWebsite || "");
          setDefaultVatRate(data.settings.defaultVatRate || "23%");
          setReplyTone(data.settings.replyTone || "PROFESJONALNY");
          
          if (data.settings.businessContext) setIsEditingKnowledge(false);
          else setIsEditingKnowledge(true);

          if (data.settings.companyName || data.settings.companyNip) setIsEditingCompany(false);
          else setIsEditingCompany(true);

          if (!data.settings.onboardingDone) {
            setTourStep(1);
          }

          let isCheckingOut = false;
          if (data.subscriptionData) {
            setSubscriptionStatus(data.subscriptionData.subscriptionStatus);
            setSubscriptionData(data.subscriptionData);
            if (data.subscriptionData.lastAgentRunAt) {
              setLastAgentRunAt(data.subscriptionData.lastAgentRunAt);
            }
            if (data.subscriptionData.agentEmailsProcessed !== undefined) {
              setAgentEmailsProcessed(data.subscriptionData.agentEmailsProcessed);
            }

            const selectedPlanStr = localStorage.getItem('selectedPlan');
            if (selectedPlanStr) {
              localStorage.removeItem('selectedPlan');
              try {
                const selectedPlanObj = JSON.parse(selectedPlanStr);
                const { id: selectedPlan, time } = selectedPlanObj;
                
                // Only trigger if clicked within the last 10 minutes
                if (Date.now() - time < 10 * 60 * 1000) {
                  // Always go through Stripe Checkout for payment confirmation
                  // (checkout route handles both new subscriptions and upgrades)
                  if (data.subscriptionData.stripePriceId !== selectedPlan) {
                    handleCheckout(selectedPlan);
                    isCheckingOut = true;
                  }
                  // If same plan selected, do nothing (no redirect needed)
                }
              } catch (e) {
                console.error("Invalid selectedPlan format");
              }
            }
          } else {
            const selectedPlanStr = localStorage.getItem('selectedPlan');
            if (selectedPlanStr) {
              try {
                const selectedPlanObj = JSON.parse(selectedPlanStr);
                if (Date.now() - selectedPlanObj.time < 10 * 60 * 1000) {
                  localStorage.removeItem('selectedPlan');
                  handleCheckout(selectedPlanObj.id);
                  isCheckingOut = true;
                }
              } catch (e) {}
            }
          }
          
          if (!isCheckingOut) {
            if (!data.subscriptionData || !['active', 'trialing', 'incomplete'].includes(data.subscriptionData.subscriptionStatus)) {
              router.push("/?error=no_subscription#cennik");
              return;
            }
          }
        } else {
          router.push("/onboarding");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckout = async (priceId: string) => {
    setIsRedirectingToCheckout(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Błąd podczas tworzenia sesji płatności");
        setIsRedirectingToCheckout(false);
      }
    } catch (e) {
      console.error(e);
      setIsRedirectingToCheckout(false);
    }
  };

  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Błąd podczas otwierania panelu zarządzania subskrypcją.");
        setIsOpeningPortal(false);
      }
    } catch (e) {
      console.error(e);
      alert("Błąd połączenia.");
      setIsOpeningPortal(false);
    }
  };

  const fetchSubscriptionDetails = async () => {
    try {
      const res = await fetch("/api/stripe/subscription");
      if (res.ok) {
        const data = await res.json();
        setCardInfo(data.card);
        setCancelAtPeriodEnd(data.cancelAtPeriodEnd);
      }
    } catch (e) {
      console.error("Error fetching subscription details:", e);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm(
      "Czy na pewno chcesz anulować subskrypcję?\n\nZachowasz dostęp do końca opłaconego okresu. Po tym czasie subskrypcja wygaśnie i nie zostanie odnowiona."
    )) return;

    setIsCancelingSubscription(true);
    try {
      const res = await fetch("/api/stripe/subscription", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCancelAtPeriodEnd(true);
        alert("Subskrypcja zostanie anulowana z końcem bieżącego okresu rozliczeniowego. Zachowasz dostęp do tego dnia.");
      } else {
        alert("Błąd: " + (data.error || "Nie udało się anulować subskrypcji."));
      }
    } catch (e) {
      console.error(e);
      alert("Błąd połączenia.");
    } finally {
      setIsCancelingSubscription(false);
    }
  };

  const handleSaveSettings = async (type: 'company' | 'knowledge' | 'all') => {
    if ((type === 'knowledge' || type === 'all') && businessContext.trim().length < 60) {
      alert("Baza wiedzy musi zawierać minimum 60 znaków, aby Agent AI mógł skutecznie działać.");
      return;
    }

    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessContext, companyName, companyNip, companyAddress, companyBankAccount, defaultVatRate, replyTone }),
      });
      if (!res.ok) {
        throw new Error("Błąd zapisu na serwerze");
      }
      alert("Zapisano pomyślnie!");
      if (type === 'company' || type === 'all') setIsEditingCompany(false);
      if (type === 'knowledge' || type === 'all') setIsEditingKnowledge(false);
    } catch (e) {
      console.error(e);
      alert("Wystąpił błąd podczas zapisywania.");
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/threads");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateLeads = async () => {
    if (!businessContext || businessContext.length < 60) {
      alert("Twoja baza wiedzy jest pusta lub zbyt krótka. Uzupełnij opis firmy w Ustawieniach, aby AI wiedziało dla kogo szukać klientów.");
      return;
    }
    setGeneratingLeads(true);
    try {
      const res = await fetch("/api/clients/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        await fetchLeads();
      } else {
        alert(data.error || "Błąd podczas szukania klientów");
      }
    } catch (e) {
      console.error(e);
      alert("Błąd połączenia z serwerem");
    } finally {
      setGeneratingLeads(false);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        await fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenContactModal = async (lead: any) => {
    setContactingLead(lead);
    setContactEmail("");
    setContactSubject("");
    setContactBody("");
    setIsGeneratingEmail(true);

    try {
      const res = await fetch("/api/clients/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id })
      });
      const data = await res.json();
      if (res.ok) {
        setContactEmail(data.emailAddress || "");
        setContactSubject(data.subject || "");
        setContactBody(data.body || "");
      } else {
        alert(data.error || "Nie udało się wygenerować maila. Możesz wpisać treść ręcznie.");
        // We do not close the modal so the user can type manually
      }
    } catch (e) {
      console.error(e);
      alert("Błąd połączenia z serwerem. Możesz wpisać treść ręcznie.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSendLeadEmail = async () => {
    if (!contactingLead || !contactEmail || !contactSubject || !contactBody) {
      alert("Proszę wypełnić wszystkie pola (E-mail, Temat, Treść).");
      return;
    }

    setIsSendingEmail(true);
    try {
      const res = await fetch("/api/clients/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: contactingLead.id,
          toEmail: contactEmail,
          subject: contactSubject,
          body: contactBody
        })
      });

      if (res.ok) {
        setContactingLead(null);
        await fetchLeads();
        alert("Wiadomość została wysłana, a lead zarchiwizowany!");
      } else {
        const data = await res.json();
        alert(data.error || "Nie udało się wysłać maila.");
      }
    } catch (e) {
      alert("Błąd połączenia z serwerem.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAnalyzeStrategy = async () => {
    if (!strategyUrl) {
      alert("Proszę podać adres URL strony.");
      return;
    }
    
    setIsAnalyzingStrategy(true);
    setStrategyResults(null);
    try {
      // Save website to account
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyWebsite: strategyUrl })
      });

      const res = await fetch("/api/strategy/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: strategyUrl })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStrategyResults(data);
        localStorage.setItem("meskiStrategyUrl", strategyUrl);
        localStorage.setItem("meskiStrategyResults", JSON.stringify(data));
      } else {
        alert(data.error || "Wystąpił błąd podczas analizy strony.");
      }
    } catch (e) {
      console.error(e);
      alert("Błąd połączenia podczas analizy.");
    } finally {
      setIsAnalyzingStrategy(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("checkout") === "success") {
        setLoading(true);
        fetch("/api/stripe/verify", { method: "POST" })
          .then(res => res.json())
          .then(data => {
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchSettings();
          })
          .catch(() => fetchSettings());
      } else {
        fetchSettings();
      }
      fetchThreads();
      fetchLeads();
      
      const savedStrategyUrl = localStorage.getItem("meskiStrategyUrl");
      const savedStrategyResults = localStorage.getItem("meskiStrategyResults");
      if (savedStrategyUrl) setStrategyUrl(savedStrategyUrl);
      if (savedStrategyResults) {
        try {
          setStrategyResults(JSON.parse(savedStrategyResults));
        } catch (e) {}
      }
      
      // Auto-refresh every 15 seconds (reduced from 30)
      const interval = setInterval(() => {
        handleSync(true);
      }, 15000);
      
      const hasSeenWelcome = sessionStorage.getItem("meskiHasSeenWelcome");
      if (!hasSeenWelcome) {
        const fadeTimer = setTimeout(() => setWelcomeState("FADING_OUT"), 2000);
        const hideTimer = setTimeout(() => {
          setWelcomeState("HIDDEN");
          sessionStorage.setItem("meskiHasSeenWelcome", "true");
        }, 2800);
        return () => {
          clearInterval(interval);
          clearTimeout(fadeTimer);
          clearTimeout(hideTimer);
        };
      } else {
        setWelcomeState("HIDDEN");
      }
      
      return () => clearInterval(interval);
    }
  }, [status]);

  // handleSync — pyta serwer o nowe maile I uruchamia cron dla bieżącego użytkownika
  const handleSync = async (isSilent = false) => {
    if (isSilent) setSilentSyncing(true);
    else setSyncing(true);

    try {
      // /api/cron/sync uruchamia pełną synchronizację server-side (działa też bez sesji)
      const res = await fetch('/api/cron/sync', { method: 'POST' });
      if (res.ok) {
        await fetchThreads();
        // Odśwież też czas ostatniego uruchomienia
        const settingsRes = await fetch(`/api/settings?t=${Date.now()}`);
        if (settingsRes.ok) {
          const d = await settingsRes.json();
          if (d.subscriptionData?.lastAgentRunAt) setLastAgentRunAt(d.subscriptionData.lastAgentRunAt);
          if (d.subscriptionData?.agentEmailsProcessed !== undefined) setAgentEmailsProcessed(d.subscriptionData.agentEmailsProcessed);
        }
      }
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      if (isSilent) setSilentSyncing(false);
      else setSyncing(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedThread) return;
    if (!editedReply.trim()) {
      alert("Odpowiedź nie może być pusta! Wpisz coś ręcznie lub wygeneruj z AI.");
      return;
    }
    
    setSending(true);
    try {
      const res = await fetch(`/api/threads/${selectedThread.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyContent: editedReply }),
      });
      if (res.ok) {
        await fetchThreads();
        setSelectedThread(null);
      } else {
        const errData = await res.json();
        alert("Błąd podczas wysyłania wiadomości: " + (errData.error || "Nieznany błąd serwera."));
      }
    } catch (e: any) {
      console.error(e);
      alert("Błąd połączenia: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteThread = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten wątek z aplikacji?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/threads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedThread(null);
        await fetchThreads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const toggleAutoReply = async () => {
    const newVal = !autoReply;
    setAutoReply(newVal);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoReply: newVal }),
    });
  };

  if (status === "loading" || loading || isRedirectingToCheckout || (status === "authenticated" && subscriptionStatus === null)) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <RefreshCw className={styles['animate-spin'] || "animate-spin"} size={32} color="var(--primary)" />
        {isRedirectingToCheckout && <div style={{marginTop: '16px', color: 'var(--subtext)'}}>Przekierowywanie do płatności...</div>}
      </div>
    );
  }

  if (subscriptionStatus && !['active', 'trialing', 'incomplete'].includes(subscriptionStatus)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--background)' }}>
        <ShieldAlert size={48} style={{ color: '#ff3b30', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '16px' }}>Brak aktywnej subskrypcji</h2>
        <p style={{ color: 'var(--subtext)', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6, marginBottom: '32px' }}>
          Aby korzystać z MESKIAI, musisz posiadać aktywną subskrypcję.
        </p>
        <button 
          onClick={() => router.push('/#cennik')}
          style={{ background: '#007aff', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 500, cursor: 'pointer' }}
        >
          Wybierz pakiet i opłać
        </button>
      </div>
    );
  }

  const filteredThreads = (threads || []).filter(t => {
    if (currentTab === "INBOX") return t.status === "PENDING_APPROVAL";
    if (currentTab === "IMPORTANT") return t.status === "REQUIRES_ATTENTION";
    if (currentTab === "SENT") return t.status === "REPLIED" || t.status === "AUTO_REPLIED";
    if (currentTab === "SPAM") return t.status === "IGNORED";
    return true;
  }).sort((a, b) => {
    const timeA = a.emails?.[0]?.receivedAt ? new Date(a.emails[0].receivedAt).getTime() : 0;
    const timeB = b.emails?.[0]?.receivedAt ? new Date(b.emails[0].receivedAt).getTime() : 0;
    return timeB - timeA;
  });

  if (dashboardMode === null) {
    return (
      <div className={`${styles.selectionContainer}`} style={{ position: 'relative', minHeight: '100dvh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden' }}>
        {welcomeState !== "HIDDEN" && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--background)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: welcomeState === "FADING_OUT" ? 0 : 1,
            transition: 'opacity 0.8s ease',
            pointerEvents: 'none'
          }}>
            <h1 style={{ 
              fontSize: '4.5rem', 
              fontWeight: 700, 
              color: 'var(--foreground)', 
              letterSpacing: '-2px', 
              opacity: 0, 
              animation: 'fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' 
            }}>
              Dzień dobry.
            </h1>
          </div>
        )}
        
        <div className={styles.ambientBackground}>
          <div className={styles.ambientBlob}></div>
        </div>
        
        {/* Top Navbar (iOS Dynamic Island Style) */}
        <div className={styles.selectionNavbar} style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '800px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', border: '1px solid var(--glass-border)', borderRadius: '32px', background: 'var(--card-bg)', backdropFilter: 'saturate(180%) blur(60px)', WebkitBackdropFilter: 'saturate(180%) blur(60px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.2)', zIndex: 10 }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'opacity 0.2s' }}
            onClick={() => router.push("/")}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <img
              src="/logo.png"
              alt="MESKIAI"
              style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'var(--logo-filter)' }}
            />
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--foreground)' }}>MESKIAI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
            <ThemeToggle />
            
            <div 
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', userSelect: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid var(--glass-border)', transition: 'transform 0.2s' }}
              onClick={() => {
                setDashboardMode("MAIL");
                setCurrentTab("ACCOUNT");
                fetchSubscriptionDetails();
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {session?.user?.email ? session.user.email[0].toUpperCase() : 'U'}
            </div>

            {/* Glassmorphic Profile Popover (iOS Style) */}
            {showProfileMenu && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: '70px', right: '0', background: 'var(--card-bg)', backdropFilter: 'saturate(180%) blur(60px)', WebkitBackdropFilter: 'saturate(180%) blur(60px)', border: '1px solid var(--glass-border)', borderRadius: '32px', padding: '32px', width: '320px', boxShadow: '0 30px 60px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2.5rem', marginBottom: '16px', border: '3px solid var(--glass-border)', boxShadow: '0 10px 20px rgba(0,122,255,0.2)' }}>
                  {session?.user?.email ? session.user.email[0].toUpperCase() : 'U'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>Witaj ponownie</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', marginBottom: '24px', textAlign: 'center', wordBreak: 'break-all' }}>{session?.user?.email}</div>
                
                <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '16px' }}></div>
                
                <button 
                  onClick={() => router.push("/")}
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', padding: '12px 24px', borderRadius: '12px', color: 'var(--foreground)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', marginBottom: '8px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  <Home size={18} /> Strona Główna
                </button>

                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 24px', borderRadius: '12px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                >
                  <LogOut size={18} /> Wyloguj się
                </button>
              </div>
            )}
          </div>
        </div>
        
        {!showGuide ? (
          <div className={`animate-fade-in ${styles.moduleSelectionContent}`}>
            <h1 className={styles.moduleSelectionTitle}>
              Wybierz moduł
            </h1>
            <p className={styles.moduleSelectionSubtitle}>
              Twój asystent AI jest gotowy. Co automatyzujemy dzisiaj?
            </p>

            {/* Guide button - moved above cards */}
            <button 
              className={styles.guideBtn}
              onClick={() => { setShowGuide(true); setGuideIndex(0); }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--subtext)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
            >
              <HelpCircle size={16} /> Jak zacząć?
            </button>

            <div className={styles.moduleCardsList}>
              
              {/* Row 1: Poczta */}
              <div 
                className={styles.horizontalModuleCard}
                style={{ background: 'var(--card-bg)', backdropFilter: 'saturate(200%) blur(80px)', WebkitBackdropFilter: 'saturate(200%) blur(80px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', position: 'relative', overflow: 'hidden' }}
                onClick={() => { setDashboardMode("MAIL"); setCurrentTab("INBOX"); }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(59,130,246,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'var(--mac-shadow), var(--glass-reflection)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                  <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.25)' }}>
                    <Mail size={28} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Agent Pocztowy AI</h2>
                    <p style={{ color: 'var(--subtext)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                      Inteligentna obsługa klienta — szkicowanie i auto-odpowiedzi 24/7.
                    </p>
                  </div>
                </div>
                <div className={styles.moduleArrow} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--subtext)', flexShrink: 0 }}>
                  <ArrowRight size={20} />
                </div>
              </div>

              {/* Row 2: Strategia */}
              <div 
                className={styles.horizontalModuleCard}
                style={{ background: 'var(--card-bg)', backdropFilter: 'saturate(200%) blur(80px)', WebkitBackdropFilter: 'saturate(200%) blur(80px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', position: 'relative', overflow: 'hidden' }}
                onClick={() => { setDashboardMode("STRATEGY"); setCurrentTab("STRATEGY"); }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(16,185,129,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'var(--mac-shadow), var(--glass-reflection)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                  <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <Search size={28} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Agent Strategiczny AI</h2>
                    <p style={{ color: 'var(--subtext)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                      Analiza konkurencji, nowe funkcje i wskazówki sprzedażowe z URL.
                    </p>
                  </div>
                </div>
                <div className={styles.moduleArrow} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--subtext)', flexShrink: 0 }}>
                  <ArrowRight size={20} />
                </div>
              </div>

              {/* Row 3: Klienci */}
              <div 
                className={styles.horizontalModuleCard}
                style={{ background: 'var(--card-bg)', backdropFilter: 'saturate(200%) blur(80px)', WebkitBackdropFilter: 'saturate(200%) blur(80px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', position: 'relative', overflow: 'hidden' }}
                onClick={() => { 
                  setDashboardMode("CLIENTS"); 
                  setCurrentTab("CLIENTS" as any);
                  if (leads.length === 0) handleGenerateLeads();
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(139,92,246,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'var(--mac-shadow), var(--glass-reflection)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                  <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.25)' }}>
                    <Users size={28} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Baza Leadów B2B</h2>
                    <p style={{ color: 'var(--subtext)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                      AI podsuwa codziennie idealnych klientów gotowych na współpracę.
                    </p>
                  </div>
                </div>
                <div className={styles.moduleArrow} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--subtext)', flexShrink: 0 }}>
                  <ArrowRight size={20} />
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className={`animate-fade-in ${styles.guideCard}`}>
            
            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
              {[0, 1, 2, 3, 4].map(idx => (
                <div key={idx} style={{ height: '4px', width: '40px', borderRadius: '2px', background: idx === guideIndex ? 'var(--primary)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }}></div>
              ))}
            </div>

            {guideIndex === 0 && (
              <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '16px' }}>
                  <Building size={48} />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Krok 1: Twoja Firma</h2>
                <p style={{ color: 'var(--subtext)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px' }}>
                  Niezależnie od wybranego modułu, wejdź w zakładkę <strong>Dane Firmy</strong>. Uzupełnij tam nazwę, NIP, adres i numer konta. Te dane są niezbędne do wystawiania poprawnych faktur dla Twoich klientów.
                </p>
              </div>
            )}

            {guideIndex === 1 && (
              <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '16px' }}>
                  <Bot size={48} />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Krok 2: Baza Wiedzy AI</h2>
                <p style={{ color: 'var(--subtext)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px' }}>
                  Wybierz moduł <strong>Agent Pocztowy</strong>, a następnie przejdź do zakładki Baza Wiedzy. Opisz tam szczegółowo czym zajmuje się Twoja firma. AI użyje tych informacji do generowania trafnych i profesjonalnych odpowiedzi.
                </p>
              </div>
            )}

            {guideIndex === 2 && (
              <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '16px' }}>
                  <Mail size={48} />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Krok 3: Agent Pocztowy</h2>
                <p style={{ color: 'var(--subtext)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px' }}>
                  Wchodzące maile trafiają do zakładki <strong>Do Akceptacji</strong>, gdzie AI proponuje gotową odpowiedź. Jeśli chcesz, aby sztuczna inteligencja odpisywała całkowicie samodzielnie, włącz przełącznik <strong>Auto-Reply (AI)</strong> na pasku bocznym.
                </p>
              </div>
            )}

            {guideIndex === 3 && (
              <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
                  <Search size={48} />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Krok 4: Agent Strategiczny AI</h2>
                <p style={{ color: 'var(--subtext)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px' }}>
                  Wybierz <strong>Agent Strategiczny AI</strong>. Wklej URL swojej strony, a system natychmiast wyciągnie ofertę, przeanalizuje rynek i podrzuci Ci konkretne, punktowe wskazówki, jak zwiększyć konwersję i poprawić ofertę na tle konkurencji.
                </p>
              </div>
            )}

            {guideIndex === 4 && (
              <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '16px' }}>
                  <Users size={48} />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Krok 5: Baza Leadów B2B</h2>
                <p style={{ color: 'var(--subtext)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px' }}>
                  Wybierz <strong>Zdobądź Klientów</strong>. AI przeczesuje internet w poszukiwaniu firm pasujących do Twojej bazy wiedzy. Za jednym kliknięciem możesz wysłać im genialną, spersonalizowaną ofertę.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '60px', borderTop: '1px solid var(--glass-border)', paddingTop: '32px' }}>
              {guideIndex > 0 ? (
                <button 
                  onClick={() => setGuideIndex(guideIndex - 1)}
                  style={{ background: 'transparent', color: 'var(--subtext)', border: 'none', padding: '12px 24px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Wstecz
                </button>
              ) : (
                <button 
                  onClick={() => setShowGuide(false)}
                  style={{ background: 'transparent', color: 'var(--subtext)', border: 'none', padding: '12px 24px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Pomiń
                </button>
              )}

              {guideIndex < 4 ? (
                <button 
                  onClick={() => setGuideIndex(guideIndex + 1)}
                  style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '12px 32px', borderRadius: '32px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Dalej <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => setShowGuide(false)}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '32px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 16px rgba(59,130,246,0.4)' }}
                >
                  Zacznijmy! <CheckCircle size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.dashboardLayout}>
      <div className={styles.ambientBackground}>
        <div className={styles.ambientBlob}></div>
      </div>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', padding: '0 8px' }}>
          <div 
            className={styles.logo}
            onClick={() => router.push("/")}
            style={{ cursor: 'pointer', margin: 0, padding: 0 }}
            title="Przejdź do strony głównej"
          >
            <img
              src="/logo.png"
              alt="MESKIAI"
              style={{ width: '26px', height: '26px', objectFit: 'contain', filter: 'var(--logo-filter)', flexShrink: 0 }}
            />
            MESKIAI
            {silentSyncing && <RefreshCw size={12} className={styles['animate-spin']} color="var(--subtext)" style={{ marginLeft: "4px" }} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            {/* Dropdown Toggle */}
            <button 
              onClick={() => setShowModuleSwitcher(!showModuleSwitcher)}
              style={{ background: showModuleSwitcher ? 'rgba(255, 255, 255, 0.1)' : 'transparent', border: '1px solid', borderColor: showModuleSwitcher ? 'var(--primary)' : 'var(--glass-border)', color: showModuleSwitcher ? 'var(--foreground)' : 'var(--subtext)', cursor: 'pointer', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              title="Szybkie przełączanie modułów"
              onMouseEnter={(e) => { if(!showModuleSwitcher) { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'var(--primary)'; } }}
              onMouseLeave={(e) => { if(!showModuleSwitcher) { e.currentTarget.style.color = 'var(--subtext)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--glass-border)'; } }}
            >
              <LayoutGrid size={18} />
            </button>
            
            {/* Popover Dropdown */}
            {showModuleSwitcher && (
              <div className="animate-fade-in" style={{ position: 'absolute', top: '100%', right: '40px', marginTop: '8px', background: 'var(--card-bg)', backdropFilter: 'saturate(200%) blur(40px)', WebkitBackdropFilter: 'saturate(200%) blur(40px)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '8px', width: '220px', boxShadow: '0 20px 40px rgba(0,0,0,0.3), var(--glass-reflection)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button 
                  onClick={() => { setDashboardMode("MAIL"); setCurrentTab("INBOX"); setShowModuleSwitcher(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'transparent', border: 'none', color: dashboardMode === 'MAIL' ? 'var(--primary)' : 'var(--subtext)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textAlign: 'left', width: '100%', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Mail size={16} /> Poczta (AI)
                </button>
                <button 
                  onClick={() => { setDashboardMode("STRATEGY"); setCurrentTab("STRATEGY"); setShowModuleSwitcher(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'transparent', border: 'none', color: dashboardMode === 'STRATEGY' ? 'var(--primary)' : 'var(--subtext)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textAlign: 'left', width: '100%', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Search size={16} /> Agent Strategiczny AI
                </button>
                <button 
                  onClick={() => { setDashboardMode("CLIENTS"); setCurrentTab("CLIENTS" as any); setShowModuleSwitcher(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'transparent', border: 'none', color: dashboardMode === 'CLIENTS' ? 'var(--primary)' : 'var(--subtext)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textAlign: 'left', width: '100%', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Users size={16} /> Klienci (B2B)
                </button>
              </div>
            )}

            {/* Traditional Back Arrow */}
            <button 
              onClick={() => setDashboardMode(null)}
              style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--subtext)', cursor: 'pointer', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              title="Wróć do wyboru"
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'var(--foreground)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--subtext)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
            >
              <ArrowDownLeft size={18} style={{ transform: 'rotate(45deg)' }} />
            </button>
          </div>
        </div>
        
        <div className={styles.nav}>
          {dashboardMode === "MAIL" && (
            <>
              <button 
                className={`${styles.navItem} ${currentTab === "INBOX" ? styles.active : ""}`}
                onClick={() => { setCurrentTab("INBOX"); setSelectedThread(null); }}
              >
                <Inbox size={18} /> Do Akceptacji
              </button>
              <button 
                className={`${styles.navItem} ${currentTab === "IMPORTANT" ? styles.active : ""}`}
                onClick={() => { setCurrentTab("IMPORTANT"); setSelectedThread(null); }}
              >
                <AlertCircle size={18} /> Ważne
              </button>
              <button 
                className={`${styles.navItem} ${currentTab === "SENT" ? styles.active : ""}`}
                onClick={() => { setCurrentTab("SENT"); setSelectedThread(null); }}
              >
                <Send size={18} /> Wysłane
              </button>
              <button 
                className={`${styles.navItem} ${currentTab === "SPAM" ? styles.active : ""}`}
                onClick={() => { setCurrentTab("SPAM"); setSelectedThread(null); }}
              >
                <AlertTriangle size={18} /> Spam / Boty
              </button>
            </>
          )}

          {dashboardMode === "STRATEGY" && (
            <button 
              className={`${styles.navItem} ${currentTab === "STRATEGY" ? styles.active : ''}`}
              onClick={() => { setCurrentTab("STRATEGY"); setSelectedThread(null); }}
            >
              <Search size={20} />
              Analiza
            </button>
          )}

          {dashboardMode === "CLIENTS" && (
            <button 
              className={`${styles.navItem} ${currentTab === "CLIENTS" as any ? styles.active : ""}`}
              onClick={() => { setCurrentTab("CLIENTS" as any); setSelectedThread(null); }}
            >
              <Users size={18} /> Klienci (AI)
            </button>
          )}
          
          <div style={{ marginTop: '24px', marginBottom: '8px', padding: '0 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Konfiguracja
          </div>
          
          {dashboardMode === "MAIL" && (
            <button 
              className={`${styles.navItem} ${currentTab === "SETTINGS" ? styles.active : ""}`}
              onClick={() => { setCurrentTab("SETTINGS"); setSelectedThread(null); }}
            >
              <Bot size={18} /> Baza Wiedzy (AI)
            </button>
          )}
          
          <button 
            className={`${styles.navItem} ${currentTab === "COMPANY" ? styles.active : ""}`}
            onClick={() => { setCurrentTab("COMPANY"); setSelectedThread(null); }}
          >
            <Building size={18} /> Dane Firmy
          </button>

        </div>

        <div className={styles.userSection}>

          {/* ── Agent 24/7 Status Badge ── */}
          <div style={{
            padding: '10px 12px',
            borderRadius: '12px',
            background: autoReply
              ? 'rgba(34,197,94,0.08)'
              : 'rgba(255,255,255,0.04)',
            border: autoReply
              ? '1px solid rgba(34,197,94,0.25)'
              : '1px solid var(--glass-border)',
            marginBottom: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0' }}>
              {/* Pulsujący wskaźnik */}
              <div style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: autoReply ? '#22c55e' : 'var(--subtext)',
                }} />
                {autoReply && (
                  <div style={{
                    position: 'absolute', inset: '-3px',
                    borderRadius: '50%',
                    background: 'rgba(34,197,94,0.3)',
                    animation: 'agentPulse 2s ease-in-out infinite',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: autoReply ? '#22c55e' : 'var(--subtext)',
                letterSpacing: '0.02em',
              }}>
                {autoReply ? 'Agent aktywny 24/7' : 'Agent wyłączony'}
              </span>
            </div>

          </div>

          <div className={styles.settingToggle} style={{ position: 'relative' }}>
            {tourStep === 3 && (
              <div style={{ position: 'absolute', bottom: '100%', right: '0', zIndex: 1001, marginBottom: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', color: 'var(--primary)', animation: 'bounce 2s infinite' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', background: 'var(--card-bg)', padding: '6px 12px', borderRadius: '12px', whiteSpace: 'nowrap', border: '2px solid var(--primary)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>Włącz Auto-Reply</span>
                  <ArrowDown size={32} style={{ marginRight: '10px' }} />
                </div>
              </div>
            )}
            <span className={styles.toggleLabel}>Auto-Reply (AI)</span>
            <label className={styles.switch}>
              <input type="checkbox" checked={autoReply} onChange={toggleAutoReply} />
              <span className={styles.slider}></span>
            </label>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div 
              className={`${styles.avatarRow} ${currentTab === "ACCOUNT" ? styles.active : ""}`} 
              onClick={() => {
                setCurrentTab("ACCOUNT");
                setDashboardMode("MAIL");
                fetchSubscriptionDetails();
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.avatar}>
                {session?.user?.image ? <img src={session.user.image} alt="User" /> : <User size={16} />}
              </div>
              <span style={{ fontSize: "0.85rem", color: "var(--subtext)", overflow: "hidden", textOverflow: "ellipsis", flex: 1, fontWeight: currentTab === "ACCOUNT" ? 600 : 400 }}>
                {session?.user?.name || session?.user?.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            {currentTab === "INBOX" && "Skrzynka Odbiorcza"}
            {currentTab === "IMPORTANT" && "Ważne (Do sprawdzenia)"}
            {currentTab === "SENT" && "Wysłane Wiadomości"}
            {currentTab === "SPAM" && "Pominięte i Zablokowane"}
            {currentTab === "SETTINGS" && "Ustawienia Agenta AI"}
            {currentTab === "ACCOUNT" && "Ustawienia Konta"}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            <div style={{ position: 'relative' }}>
              {tourStep === 2 && (
                <div style={{ position: 'absolute', top: '100%', right: '50%', zIndex: 1001, marginTop: '20px' }}>
                  <div style={{ transform: 'translateX(50%)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)', animation: 'bounce 2s infinite' }}>
                      <ArrowUpRight size={32} style={{ transform: 'rotate(-45deg)', marginBottom: '8px' }} />
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', background: 'var(--card-bg)', padding: '6px 12px', borderRadius: '12px', whiteSpace: 'nowrap', border: '2px solid var(--primary)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>Kliknij słońce / księżyc</span>
                    </div>
                  </div>
                </div>
              )}
              <ThemeToggle />
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => handleSync(false)} disabled={syncing}>
              <RefreshCw size={14} className={syncing ? styles['animate-spin'] : ""} style={{ marginRight: '6px' }} />
              Odśwież teraz
            </button>
          </div>
        </header>

        <div className={styles.workspace}>
          
          {/* SETTINGS (KNOWLEDGE BASE) VIEW */}
          {currentTab === "SETTINGS" && (
            <div className="animate-fade-in" style={{ flex: 1, padding: "32px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
              <div style={{ maxWidth: "600px", width: "100%" }}>
                {/* BAZA WIEDZY */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: "1.5rem", color: "var(--foreground)", margin: 0 }}>Baza Wiedzy Agenta AI</h2>
                  {!isEditingKnowledge && (
                    <button className="btn btn-secondary" onClick={() => setIsEditingKnowledge(true)} style={{ padding: '6px 16px' }}>
                      ✏️ Edytuj
                    </button>
                  )}
                </div>
                
                <p style={{ color: "var(--subtext)", marginBottom: "24px", lineHeight: 1.5 }}>
                  Zaktualizuj informacje o swojej firmie. Sztuczna inteligencja używa tych danych, aby rozumieć kontekst zapytań klientów i generować profesjonalne, dokładne odpowiedzi.
                </p>

                {!isEditingKnowledge ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--foreground)' }}>
                      {businessContext || <span style={{ color: 'var(--subtext)', fontStyle: 'italic' }}>Brak wprowadzonych danych.</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--subtext)', fontWeight: 600, marginBottom: '8px' }}>Preferowany ton odpowiedzi:</div>
                      <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--primary)', color: 'white', borderRadius: '24px', fontWeight: 600, fontSize: '0.9rem' }}>
                        {replyTone}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ position: 'relative' }}>
                      {tourStep === 1 && (
                        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1001 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--primary)', animation: 'bounce 2s infinite' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', background: 'var(--card-bg)', padding: '6px 12px', borderRadius: '12px', border: '2px solid var(--primary)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>Pisz tutaj!</span>
                            <ArrowDown size={32} />
                          </div>
                        </div>
                      )}
                      <textarea
                        className={styles.textarea}
                        style={{ height: "300px", marginBottom: "24px" }}
                        value={businessContext}
                        onChange={(e) => setBusinessContext(e.target.value)}
                        placeholder="Opisz swoją firmę..."
                      />
                      
                      <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>
                          Ton odpowiedzi agenta AI {userTier <= 1 && <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.75rem' }}>(Wymaga planu PRO)</span>}
                        </label>
                        <select 
                          className={styles.input}
                          value={replyTone}
                          onChange={(e) => setReplyTone(e.target.value)}
                          disabled={userTier <= 1}
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', opacity: userTier <= 1 ? 0.5 : 1, cursor: userTier <= 1 ? 'not-allowed' : 'auto' }}
                        >
                          <option value="PROFESJONALNY">Profesjonalny (Szanowny Panie / Z poważaniem)</option>
                          <option value="LUŹNY (CASUAL)">Luźny / Casual (Cześć / Pozdrawiam)</option>
                          <option value="KRÓTKO I NA TEMAT">Krótko i na temat (Bez zbędnych uprzejmości)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {businessContext && (
                        <button className="btn btn-secondary" onClick={() => setIsEditingKnowledge(false)} style={{ flex: 1, padding: "12px" }}>Anuluj</button>
                      )}
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 2, padding: "12px", display: "flex", justifyContent: "center", gap: "8px" }}
                        onClick={() => handleSaveSettings('knowledge')}
                        disabled={savingSettings}
                      >
                        {savingSettings ? <RefreshCw className={styles['animate-spin']} size={18} /> : <Bot size={18} />}
                        Zapisz Zmiany
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ACCOUNT SETTINGS VIEW */}
          {currentTab === "ACCOUNT" && (() => {
            const PRICE_BASIC = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
            const PRICE_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
            const PRICE_MAX = process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX;

            const currentPriceId = subscriptionData?.stripePriceId;
            const planName =
              currentPriceId === PRICE_MAX ? "MAX" :
              currentPriceId === PRICE_PRO ? "PRO" :
              currentPriceId === PRICE_BASIC ? "BASIC" :
              currentPriceId ? `Pakiet (${currentPriceId.slice(-6)})` : "Brak planu";

            const expiryDate = subscriptionData?.stripeCurrentPeriodEnd
              ? new Date(subscriptionData.stripeCurrentPeriodEnd).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null;

            const cardBrandLabel = cardInfo
              ? `${cardInfo.brand.charAt(0).toUpperCase()}${cardInfo.brand.slice(1)} •••• ${cardInfo.last4}`
              : null;

            return (
              <div className={`animate-fade-in ${styles.accountPage}`}>

                {/* ── Row 1: User identity + quick-action buttons ── */}
                <div className={styles.accountUserStrip}>
                  <div className={styles.accountAvatarSm}>
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className={styles.accountUserMeta}>
                    <span className={styles.accountUserName}>
                      {session?.user?.name || session?.user?.email?.split("@")[0] || "Użytkownik"}
                    </span>
                    <span className={styles.accountUserEmail}>{session?.user?.email}</span>
                  </div>
                  <div className={styles.accountQuickBtns}>
                    <button
                      className={styles.accountIconBtn}
                      onClick={() => router.push("/")}
                      title="Strona główna"
                    >
                      <Home size={15} />
                    </button>
                    <button
                      className={`${styles.accountIconBtn} ${styles.accountIconBtnDanger}`}
                      onClick={() => signOut({ callbackUrl: "/" })}
                      title="Wyloguj się"
                    >
                      <LogOut size={15} />
                    </button>
                  </div>
                </div>

                {/* ── Row 2: Subscription info ── */}
                <div className={styles.accountSectionCard}>
                  <div className={styles.accountSectionHeader}>
                    <Zap size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span>Subskrypcja</span>
                    {cancelAtPeriodEnd ? (
                      <span className={`${styles.infoBadge} ${styles.infoBadgeDanger}`} style={{ marginLeft: "auto" }}>Anulowana</span>
                    ) : (
                      <span className={`${styles.infoBadge} ${styles.infoBadgeSuccess}`} style={{ marginLeft: "auto" }}>✓ Aktywna</span>
                    )}
                  </div>
                  <div className={styles.accountInfoGrid}>
                    <span className={styles.infoLabel}>Pakiet</span>
                    <span className={styles.infoValue}>{planName}</span>
                    <span className={styles.infoLabel}>Karta</span>
                    <span className={styles.infoValue}>{cardBrandLabel || "Brak danych"}</span>
                    {expiryDate && (
                      <>
                        <span className={styles.infoLabel}>{cancelAtPeriodEnd ? "Wygasa" : "Odnowienie"}</span>
                        <span className={styles.infoValue}>{expiryDate}</span>
                      </>
                    )}
                  </div>
                  {cancelAtPeriodEnd && expiryDate && (
                    <div className={styles.cancelNotice}>⚠️ Wygasa <strong>{expiryDate}</strong> — pełny dostęp do tego dnia.</div>
                  )}
                  <div className={styles.accountBtnRow}>
                    <button onClick={handleOpenPortal} disabled={isOpeningPortal} className={styles.accountBtnSecondary}>
                      {isOpeningPortal ? <RefreshCw className={styles["animate-spin"]} size={13} /> : <ExternalLink size={13} />}
                      Zarządzaj (Stripe)
                    </button>
                    <button onClick={() => router.push("/#cennik")} className={styles.accountBtnPrimary}>
                      <ArrowUpRight size={13} /> Upgrade
                    </button>
                  </div>
                  {!cancelAtPeriodEnd && (
                    <button onClick={handleCancelSubscription} disabled={isCancelingSubscription} className={styles.accountBtnCancel}>
                      {isCancelingSubscription ? <RefreshCw className={styles["animate-spin"]} size={13} /> : <Trash2 size={13} />}
                      Anuluj subskrypcję
                    </button>
                  )}
                </div>

                {/* ── Row 3: Usage limits ── */}
                {(() => {
                  const PRICE_BASIC = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
                  const PRICE_PRO   = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
                  const PRICE_MAX   = process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX;
                  const pid         = subscriptionData?.stripePriceId;
                  const isBasic     = pid === PRICE_BASIC;
                  const isPro       = pid === PRICE_PRO;
                  const isMax       = pid === PRICE_MAX;
                  const isUnlimited = isMax;

                  const emailsUsed:   number = subscriptionData?.emailsSentThisMonth ?? 0;
                  const searchesUsed: number = subscriptionData?.competitorSearchesThisMonth ?? 0;
                  const emailLimit   = isBasic ? 50 : isPro ? 1000 : isMax ? Infinity : 0;
                  const searchLimit  = isBasic ? 10  : isPro ? 100  : isMax ? Infinity : 0;
                  const emailPct     = isUnlimited ? 0 : Math.min(100, Math.round((emailsUsed   / (emailLimit  || 1)) * 100));
                  const searchPct    = isUnlimited ? 0 : Math.min(100, Math.round((searchesUsed / (searchLimit || 1)) * 100));
                  const limitFmt     = (n: number) => n === Infinity ? "∞" : n.toLocaleString("pl-PL");
                  const barColor     = (pct: number) => pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";

                  return (
                    <div className={styles.accountSectionCard}>
                      <div className={styles.accountSectionHeader}>
                        <BarChart2 size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
                        <span>Limity tego miesiąca</span>
                        {isUnlimited && (
                          <span className={`${styles.infoBadge} ${styles.infoBadgeSuccess}`} style={{ marginLeft: "auto" }}>MAX — bez limitów</span>
                        )}
                      </div>
                      <div className={styles.limitsGrid}>
                        {/* Email limit */}
                        <div className={styles.limitItem}>
                          <div className={styles.limitItemHeader}>
                            <Mail size={12} style={{ color: "#3b82f6", flexShrink: 0 }} />
                            <span className={styles.limitItemLabel}>E-maile</span>
                            <span className={styles.limitItemCount} style={{ color: isUnlimited ? "#22c55e" : emailPct >= 90 ? "#ef4444" : "var(--subtext)" }}>
                              {isUnlimited ? "∞" : `${emailsUsed} / ${limitFmt(emailLimit)}`}
                            </span>
                          </div>
                          {!isUnlimited && (
                            <div className={styles.limitBar}>
                              <div className={styles.limitBarFill} style={{ width: `${emailPct}%`, background: `linear-gradient(90deg, ${barColor(emailPct)}, ${barColor(emailPct)}cc)` }} />
                            </div>
                          )}
                        </div>
                        {/* Search limit */}
                        <div className={styles.limitItem}>
                          <div className={styles.limitItemHeader}>
                            <Search size={12} style={{ color: "#10b981", flexShrink: 0 }} />
                            <span className={styles.limitItemLabel}>Analizy URL</span>
                            <span className={styles.limitItemCount} style={{ color: isUnlimited ? "#22c55e" : searchPct >= 90 ? "#ef4444" : "var(--subtext)" }}>
                              {isUnlimited ? "∞" : `${searchesUsed} / ${limitFmt(searchLimit)}`}
                            </span>
                          </div>
                          {!isUnlimited && (
                            <div className={styles.limitBar}>
                              <div className={styles.limitBarFill} style={{ width: `${searchPct}%`, background: `linear-gradient(90deg, ${barColor(searchPct)}, ${barColor(searchPct)}cc)` }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Row 4: Integracje ── */}
                <div className={styles.accountSectionCard} style={{ marginTop: "24px" }}>
                  <div className={styles.accountSectionHeader}>
                    <ShieldAlert size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span>Integracja E-mail</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>Hasło Aplikacji Google</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--subtext)" }}>Zmień hasło w przypadku błędu połączenia</div>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      onClick={async () => {
                        // Reset it locally and let the user enter a new one in the INBOX tab
                        setHasAppPassword(false);
                        setCurrentTab("INBOX");
                      }}
                      style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                    >
                      Zmień hasło
                    </button>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* COMPANY VIEW */}
          {currentTab === "COMPANY" && (
            <div className="animate-fade-in" style={{ flex: 1, padding: "32px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
              <div style={{ maxWidth: "600px", width: "100%" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: "1.5rem", color: "var(--foreground)", margin: 0 }}>Dane Firmy (Wystawca)</h2>
                  {!isEditingCompany && (
                    <button className="btn btn-secondary" onClick={() => setIsEditingCompany(true)} style={{ padding: '6px 16px' }}>
                      ✏️ Edytuj
                    </button>
                  )}
                </div>
                <p style={{ color: "var(--subtext)", marginBottom: "24px", lineHeight: 1.5 }}>
                  Wprowadź dane swojej firmy, które będą automatycznie używane przy wystawianiu faktur przez Agenta AI.
                </p>
                
                {!isEditingCompany ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Nazwa Firmy</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>{companyName || <span style={{ color: 'var(--subtext)' }}>—</span>}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>NIP</div>
                        <div style={{ fontSize: '1rem', color: 'var(--foreground)' }}>{companyNip || <span style={{ color: 'var(--subtext)' }}>—</span>}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Domyślny VAT</div>
                        <div style={{ fontSize: '1rem', color: 'var(--foreground)' }}>{defaultVatRate || <span style={{ color: 'var(--subtext)' }}>—</span>}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Adres</div>
                      <div style={{ fontSize: '1rem', color: 'var(--foreground)', whiteSpace: 'pre-wrap' }}>{companyAddress || <span style={{ color: 'var(--subtext)' }}>—</span>}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Konto Bankowe</div>
                      <div style={{ fontSize: '1rem', color: 'var(--foreground)', fontFamily: 'monospace' }}>{companyBankAccount || <span style={{ color: 'var(--subtext)' }}>—</span>}</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>Nazwa Firmy</label>
                        <input 
                          type="text"
                          className={styles.input}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="np. Moja Firma Sp. z o.o."
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>NIP</label>
                        <input 
                          type="text"
                          className={styles.input}
                          value={companyNip}
                          onChange={(e) => setCompanyNip(e.target.value)}
                          placeholder="np. 1234567890"
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>Adres</label>
                        <textarea 
                          className={styles.textarea}
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="np. ul. Testowa 1&#10;00-001 Warszawa"
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)', height: '80px', resize: 'vertical' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>Konto Bankowe</label>
                        <input 
                          type="text"
                          className={styles.input}
                          value={companyBankAccount}
                          onChange={(e) => setCompanyBankAccount(e.target.value)}
                          placeholder="np. PL 12 3456 7890 0000 0000 0000 0000"
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>Domyślna Stawka VAT</label>
                        <select 
                          className={styles.input}
                          value={defaultVatRate}
                          onChange={(e) => setDefaultVatRate(e.target.value)}
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                        >
                          <option value="23%">23% (Stawka podstawowa)</option>
                          <option value="8%">8% (Stawka obniżona)</option>
                          <option value="5%">5% (Stawka preferencyjna)</option>
                          <option value="0%">0% (Eksport / WDT)</option>
                          <option value="ZW">ZW (Zwolnienie np. usługi medyczne)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {(companyName || companyNip) && (
                        <button className="btn btn-secondary" onClick={() => setIsEditingCompany(false)} style={{ flex: 1, padding: "12px" }}>Anuluj</button>
                      )}
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 2, padding: "12px", display: "flex", justifyContent: "center", gap: "8px" }}
                        onClick={() => handleSaveSettings('company')}
                        disabled={savingSettings}
                      >
                        {savingSettings ? <RefreshCw className={styles['animate-spin']} size={18} /> : <Building size={18} />}
                        Zapisz Dane Firmy
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STRATEGY VIEW */}
          {currentTab === "STRATEGY" && (
            <div className="animate-fade-in" style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", justifyContent: "center", background: 'var(--background)' }}>
              <div style={{ maxWidth: "1000px", width: "100%", display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Header & Search Bar (Minimalist iOS Settings style) */}
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: "2rem", fontWeight: 600, color: "var(--foreground)", margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Raport Witryny</h2>
                  <p style={{ color: "var(--subtext)", fontSize: "1rem", margin: 0 }}>Wprowadź adres URL, aby pobrać informacje i wygenerować raport rynkowy.</p>
                  
                  <div style={{ marginTop: '24px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)', boxShadow: 'var(--mac-shadow), var(--glass-reflection)' }}>
                    {strategyResults && !isAnalyzingStrategy ? (
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Adres strony</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--foreground)' }}>{strategyUrl}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ color: '#34c759', fontWeight: 500, fontSize: '0.9rem' }}>Raport zapisany</span>
                          <button
                            onClick={() => {
                              setStrategyResults(null);
                              localStorage.removeItem("meskiStrategyResults");
                            }}
                            style={{ background: 'rgba(120,120,128,0.1)', color: 'var(--foreground)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Zmień stronę
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '12px', display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, background: 'rgba(120,120,128,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                          <Search size={16} style={{ color: 'var(--subtext)' }} />
                          <input 
                            type="url"
                            value={strategyUrl}
                            onChange={(e) => setStrategyUrl(e.target.value)}
                            placeholder="np. twojastrona.pl"
                            style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 12px', color: 'var(--foreground)', fontSize: '1rem', outline: 'none' }}
                          />
                        </div>
                        <button 
                          onClick={handleAnalyzeStrategy}
                          disabled={isAnalyzingStrategy || !strategyUrl}
                          style={{ background: '#007aff', color: 'white', border: 'none', padding: '0 24px', borderRadius: '10px', fontWeight: 500, fontSize: '0.95rem', cursor: (isAnalyzingStrategy || !strategyUrl) ? 'not-allowed' : 'pointer', opacity: (isAnalyzingStrategy || !strategyUrl) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          {isAnalyzingStrategy && <RefreshCw className="animate-spin" size={16} />}
                          {isAnalyzingStrategy ? 'Pobieranie...' : 'Zapisz i Analizuj'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isAnalyzingStrategy && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: 'var(--subtext)' }}>
                    <RefreshCw size={36} className="animate-spin" style={{ color: '#007aff', marginBottom: '20px' }} />
                    <div style={{ fontSize: '1.15rem', fontWeight: 500, color: 'var(--foreground)' }}>Pobieranie danych i modelowanie statystyk...</div>
                  </div>
                )}

                {strategyResults && !isAnalyzingStrategy && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Traffic & Potential Stats (Minimalist row) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px', fontWeight: 600 }}>Szacunkowy Ruch</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {strategyResults.websiteStats?.map((stat: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i !== strategyResults.websiteStats.length - 1 ? '12px' : '0', borderBottom: i !== strategyResults.websiteStats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                              <div style={{ fontSize: '1.05rem', color: 'var(--subtext)' }}>{stat.label}</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)' }}>{stat.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px', fontWeight: 600 }}>Potencjał Klientów</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', marginBottom: '12px' }}>
                              <span style={{ color: 'var(--subtext)' }}>Konkurencja</span>
                              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{strategyResults.estimatedStats?.theirClients || 0}</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'rgba(120,120,128,0.16)', borderRadius: '5px', overflow: 'hidden' }}>
                              <div style={{ width: '40%', height: '100%', background: '#ff3b30', borderRadius: '5px' }}></div>
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', marginBottom: '12px' }}>
                              <span style={{ color: 'var(--subtext)' }}>Nasz Potencjał</span>
                              <span style={{ fontWeight: 600, color: '#007aff' }}>{strategyResults.estimatedStats?.ourPotentialClients || 0}</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'rgba(120,120,128,0.16)', borderRadius: '5px', overflow: 'hidden' }}>
                              <div style={{ width: '85%', height: '100%', background: '#007aff', borderRadius: '5px' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Competitors */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', fontWeight: 600 }}>Analiza Konkurencji</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {strategyResults.competitors?.map((comp: any, i: number) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: i !== strategyResults.competitors.length - 1 ? '24px' : '0', borderBottom: i !== strategyResults.competitors.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--foreground)' }}>{comp.name}</div>
                              <div style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '8px', background: comp.interest === 'Wysokie' ? 'rgba(255, 59, 48, 0.1)' : comp.interest === 'Średnie' ? 'rgba(255, 149, 0, 0.1)' : 'rgba(52, 199, 89, 0.1)', color: comp.interest === 'Wysokie' ? '#ff3b30' : comp.interest === 'Średnie' ? '#ff9500' : '#34c759', fontWeight: 600 }}>
                                Zagrożenie: {comp.interest}
                              </div>
                            </div>
                            <div style={{ fontSize: '1.05rem', color: 'var(--subtext)', lineHeight: 1.6 }}>
                              <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>Oferta:</span> {comp.offer}
                            </div>
                            {comp.howToStandOut && (
                              <div style={{ fontSize: '1.05rem', color: 'var(--foreground)', lineHeight: 1.6, background: 'rgba(120,120,128,0.08)', padding: '16px', borderRadius: '12px' }}>
                                <span style={{ color: '#007aff', fontWeight: 600, marginRight: '6px' }}>Szanse:</span>
                                {comp.howToStandOut}
                              </div>
                            )}
                            {comp.url && (
                              <a href={comp.url.startsWith('http') ? comp.url : `https://${comp.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1rem', color: '#007aff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, marginTop: '8px', width: 'fit-content' }}>
                                Przejdź na stronę <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sales & Services */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px', fontWeight: 600 }}>Wskazówki Biznesowe</div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {strategyResults.salesSuggestions?.map((sug: string, i: number) => (
                            <li key={i} style={{ display: 'flex', gap: '16px', fontSize: '1.05rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
                              <div style={{ color: '#007aff', flexShrink: 0, marginTop: '2px' }}>•</div>
                              {sug}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px', fontWeight: 600 }}>Wykryte Usługi i Funkcje</div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {strategyResults.products?.map((prod: string, i: number) => (
                            <li key={i} style={{ display: 'flex', gap: '16px', fontSize: '1.05rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
                              <div style={{ color: '#34c759', flexShrink: 0, marginTop: '2px' }}><CheckCircle size={18} /></div>
                              {prod}
                            </li>
                          ))}
                          {strategyResults.additions?.map((add: string, i: number) => (
                            <li key={i} style={{ display: 'flex', gap: '16px', fontSize: '1.05rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
                              <div style={{ color: '#ff9500', flexShrink: 0, marginTop: '2px' }}><Plus size={18} /></div>
                              {add}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CLIENTS VIEW */}
          {currentTab === "CLIENTS" as any && (
            <div className="animate-fade-in" style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
              <div style={{ maxWidth: "1200px", width: "100%", display: 'flex', flexDirection: 'column', gap: '40px' }}>
                
                {/* 1. Header & Stats Panel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: "2rem", fontWeight: 600, color: "var(--foreground)", margin: 0, letterSpacing: '-0.5px' }}>Klienci</h2>
                    <p style={{ color: "var(--subtext)", fontSize: "0.95rem", marginTop: '8px', maxWidth: '600px', lineHeight: 1.5 }}>
                      Zarządzaj wygenerowanymi leadami i monitoruj szanse sprzedaży.
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: 'var(--subtext)' }}>Wszystkie</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--foreground)', marginTop: '2px' }}>{leads.length}</span>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border)', margin: '0 8px' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: 'var(--subtext)' }}>Gorące</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 600, color: '#34c759', marginTop: '2px' }}>{leads.filter(l => l.probability >= 80).length}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--subtext)', fontWeight: 500 }}>
                      Widok: Aktywne
                    </div>
                  </div>
                  <button 
                    onClick={handleGenerateLeads}
                    disabled={generatingLeads}
                    style={{ 
                      background: generatingLeads ? 'var(--card-bg)' : 'var(--foreground)', 
                      color: generatingLeads ? 'var(--subtext)' : 'var(--background)',
                      border: '1px solid ' + (generatingLeads ? 'var(--border)' : 'transparent'),
                      padding: '8px 16px', 
                      borderRadius: '8px',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      cursor: generatingLeads ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: generatingLeads ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => { if(!generatingLeads) { e.currentTarget.style.opacity = '0.9'; } }}
                    onMouseLeave={(e) => { if(!generatingLeads) { e.currentTarget.style.opacity = '1'; } }}
                  >
                    {generatingLeads ? (
                      <><RefreshCw size={16} className="animate-spin" /> Analiza...</>
                    ) : (
                      <><Search size={16} /> Szukaj leadów</>
                    )}
                  </button>
                </div>

                {/* 3. Empty State */}
                {leads.length === 0 && !generatingLeads && (
                  <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '32px' }}>
                    <Users size={64} style={{ color: 'var(--subtext)', opacity: 0.5, margin: '0 auto 24px' }} />
                    <h3 style={{ color: 'var(--foreground)', fontSize: '1.5rem', marginBottom: '12px' }}>Brak leadów w systemie</h3>
                    <p style={{ color: 'var(--subtext)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>Kliknij przycisk "Znajdź nowe Leady", aby sztuczna inteligencja rozpoczęła analizę rynku na podstawie profilu Twojej firmy.</p>
                  </div>
                )}

                {/* 4. New Leads Section */}
                {leads.filter(l => l.status === "NEW").length > 0 && (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {leads.filter(l => l.status === "NEW").map((lead) => (
                        <div key={lead.id} style={{ 
                          background: 'var(--card-bg)', 
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '20px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                        }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, paddingRight: '24px' }}>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 8px 0' }}>{lead.name}</h3>
                              <p style={{ color: 'var(--subtext)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{lead.description}</p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div style={{ 
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--subtext)', 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {lead.source}
                              </div>
                              <div style={{ 
                                background: lead.probability >= 80 ? 'rgba(52,199,89,0.1)' : lead.probability >= 60 ? 'rgba(255,149,0,0.1)' : 'rgba(255,59,48,0.1)', 
                                border: `1px solid ${lead.probability >= 80 ? 'rgba(52,199,89,0.2)' : lead.probability >= 60 ? 'rgba(255,149,0,0.2)' : 'rgba(255,59,48,0.2)'}`,
                                color: lead.probability >= 80 ? '#34c759' : lead.probability >= 60 ? '#ff9500' : '#ff3b30', 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }}></div>
                                {lead.probability}%
                              </div>
                            </div>
                          </div>
  
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <button 
                              onClick={() => handleOpenContactModal(lead)}
                              style={{ 
                                background: 'transparent', 
                                color: 'var(--foreground)', 
                                border: '1px solid var(--foreground)', 
                                padding: '6px 12px', 
                                borderRadius: '6px', 
                                fontWeight: 500, 
                                fontSize: '0.85rem',
                                cursor: 'pointer', 
                                transition: 'all 0.2s', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px' 
                              }}
                              onMouseEnter={(e) => { 
                                e.currentTarget.style.background = 'var(--foreground)'; 
                                e.currentTarget.style.color = 'var(--background)'; 
                              }}
                              onMouseLeave={(e) => { 
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--foreground)';
                              }}
                            >
                              <Sparkles size={14} /> Napisz (AI)
                            </button>
                            <button 
                              onClick={() => handleUpdateLeadStatus(lead.id, "CONTACTED")}
                              style={{ 
                                background: 'transparent', 
                                color: 'var(--subtext)', 
                                border: '1px solid var(--border)', 
                                padding: '6px 12px', 
                                borderRadius: '6px', 
                                fontWeight: 500, 
                                fontSize: '0.85rem',
                                cursor: 'pointer', 
                                transition: 'all 0.2s', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px' 
                              }}
                              onMouseEnter={(e) => { 
                                e.currentTarget.style.background = 'var(--foreground)'; 
                                e.currentTarget.style.color = 'var(--background)'; 
                                e.currentTarget.style.borderColor = 'var(--foreground)';
                              }}
                              onMouseLeave={(e) => { 
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--subtext)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                              }}
                            >
                              <CheckCircle size={14} /> Oznacz jako kontakt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Contacted Leads Section */}
                {leads.filter(l => l.status === "CONTACTED").length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Zarchiwizowane
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {leads.filter(l => l.status === "CONTACTED").map((lead) => (
                        <div key={lead.id} style={{ 
                          background: 'transparent', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          opacity: 0.7
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--subtext)', margin: 0, textDecoration: 'line-through' }}>{lead.name}</h4>
                            <div style={{ fontSize: '0.8rem', color: 'var(--border)' }}>{lead.source}</div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--subtext)' }}>{lead.probability}%</div>
                            <div style={{ color: 'var(--subtext)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                              <CheckCircle size={14} /> Zamknięte
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contact Lead Modal */}
              {contactingLead && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                      Napisz (Cold Email) do: {contactingLead.name}
                    </h3>
                    
                    {isGeneratingEmail ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--subtext)' }}>
                        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
                        <p>Agent AI analizuje profil firmy i pisze spersonalizowanego maila...</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>E-mail Odbiorcy</label>
                          <input 
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="np. kontakt@firma.pl"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>Temat Wiadomości</label>
                          <input 
                            type="text"
                            value={contactSubject}
                            onChange={(e) => setContactSubject(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>Treść Wiadomości</label>
                          <textarea 
                            value={contactBody}
                            onChange={(e) => setContactBody(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', minHeight: '200px', resize: 'vertical' }}
                          />
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                          <button 
                            onClick={() => setContactingLead(null)}
                            style={{ background: 'transparent', color: 'var(--subtext)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Anuluj
                          </button>
                          <button 
                            onClick={handleSendLeadEmail}
                            disabled={isSendingEmail}
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: isSendingEmail ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            {isSendingEmail ? <><RefreshCw size={16} className="animate-spin" /> Wysyłam...</> : <><Send size={16} /> Wyślij</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}



          {/* APP PASSWORD PROMPT */}
          {!hasAppPassword && ["INBOX", "IMPORTANT", "SENT", "SPAM"].includes(currentTab) && (
            <div style={{ padding: "40px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100%", flex: 1, width: "100%" }}>
              <div style={{ maxWidth: "600px", width: "100%", background: "var(--card-bg)", borderRadius: "16px", padding: "32px", border: "1px solid var(--border)", boxShadow: "var(--mac-shadow)" }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "32px", background: "rgba(255, 59, 48, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <ShieldAlert size={32} color="var(--danger)" />
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "8px" }}>Wymagane Hasło Aplikacji Google</h2>
                  <p style={{ color: "var(--subtext)", lineHeight: 1.5 }}>
                    Aby Agent AI mógł bezpiecznie czytać i odpowiadać na Twoje maile bez przerw, musisz wygenerować <strong>Hasło Aplikacji</strong> w swoim koncie Google.
                  </p>
                </div>

                <div style={{ background: "rgba(0,0,0,0.02)", padding: "20px", borderRadius: "12px", marginBottom: "24px", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", color: "var(--foreground)" }}>Jak połączyć konto w 2 minuty?</h3>
                  <ol style={{ paddingLeft: "20px", color: "var(--subtext)", display: "flex", flexDirection: "column", gap: "10px", margin: 0 }}>
                    <li><strong>Włącz IMAP w Gmailu:</strong> Wejdź na Gmail, kliknij zębatkę (Ustawienia) ➔ Zobacz wszystkie ustawienia ➔ zakładka <em>Przekazywanie i POP/IMAP</em> ➔ zaznacz <strong>"Włącz IMAP"</strong> i Zapisz.</li>
                    <li>Zaloguj się do Google i przejdź do <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>Ustawień Bezpieczeństwa</a>.</li>
                    <li>Upewnij się, że masz włączoną <strong>Weryfikację dwuetapową</strong> (to wymóg Google).</li>
                    <li>W pasku wyszukiwania u góry wpisz <strong>"Hasła aplikacji"</strong> (App passwords) i utwórz nowe hasło nazywając je np. "Meski AI".</li>
                    <li>Skopiuj wygenerowane 16-literowe hasło bez spacji i wklej je poniżej.</li>
                  </ol>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--subtext)" }}>Wklej Hasło Aplikacji Google (16 liter)</label>
                  <input 
                    type="text" 
                    value={appPasswordInput}
                    onChange={e => {
                      setAppPasswordInput(e.target.value);
                      setAppPasswordError("");
                    }}
                    placeholder="np. abcd efgh ijkl mnop"
                    className={styles.input}
                    style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "1rem" }}
                  />
                  {appPasswordError && (
                    <div style={{ color: "var(--danger)", fontSize: "0.85rem", background: "rgba(255,59,48,0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,59,48,0.2)" }}>
                      {appPasswordError}
                    </div>
                  )}
                  <button 
                    className="btn btn-primary"
                    disabled={savingAppPassword || !appPasswordInput.trim()}
                    onClick={async () => {
                      setSavingAppPassword(true);
                      setAppPasswordError("");
                      try {
                        const res = await fetch("/api/settings/app-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ appPassword: appPasswordInput })
                        });
                        
                        let data: any = {};
                        try {
                          data = await res.json();
                        } catch(e) {}
                        
                        if (res.ok) {
                          setHasAppPassword(true);
                          fetch('/api/cron/sync', { method: 'POST' }).catch(() => {});
                          fetchThreads(); 
                        } else {
                          setAppPasswordError(data.error || "Serwer odrzucił połączenie. Upewnij się, że wpisałeś poprawne hasło.");
                        }
                      } catch(e) {
                        setAppPasswordError("Błąd połączenia z serwerem. Spróbuj ponownie.");
                      }
                      setSavingAppPassword(false);
                    }}
                    style={{ padding: "14px", width: "100%", display: "flex", justifyContent: "center", gap: "8px", marginTop: "8px" }}
                  >
                    {savingAppPassword ? <RefreshCw className={styles['animate-spin']} size={18} /> : <CheckCircle size={18} />}
                    Zapisz i podłącz skrzynkę
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* THREADS LIST (INBOX, SENT, SPAM) */}
          {hasAppPassword && ["INBOX", "IMPORTANT", "SENT", "SPAM"].includes(currentTab) && (
            <div className={`animate-fade-in ${styles.threadListPanel}`}>
              <div className={styles.threadList}>
                {filteredThreads.length === 0 && (
                  <div className={styles.emptyState}>Brak wiadomości.</div>
                )}
                {filteredThreads.map((thread, index) => {
                    const latestEmail = thread.emails[0];
                    if (!latestEmail) return null;
                    const isPending = thread.status === 'PENDING_APPROVAL';
                    
                    return (
                      <div 
                        key={thread.id} 
                        className={`animate-fade-in ${styles.threadItem} ${selectedThread?.id === thread.id ? styles.selected : ''}`}
                        onClick={() => {
                          setSelectedThread(thread);
                          setEditedReply(thread.draftReply || "");
                        }}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className={styles.threadHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={styles.sender}>{latestEmail.from.split('<')[0]}</span>
                            <span className={styles.date}>{new Date(latestEmail.receivedAt).toLocaleDateString()}</span>
                          </div>
                          <button 
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', transition: 'all 0.2s ease' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteThread(thread.id);
                            }}
                            title="Usuń e-mail"
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            {deleting && selectedThread?.id === thread.id ? <RefreshCw size={14} className={styles['animate-spin']} /> : <Trash2 size={14} />}
                          </button>
                        </div>
                        <div className={styles.subject}>{latestEmail.subject}</div>
                        <div className={styles.statusBadge} data-status={thread.status}>
                          {isPending ? 'Do Akceptacji' : thread.status === 'AUTO_REPLIED' ? 'Auto-odpowiedź' : thread.status === 'IGNORED' ? 'Spam' : thread.status === 'REQUIRES_ATTENTION' ? 'Wymaga Uwagi' : 'Wysłano'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* THREAD VIEW */}
          {hasAppPassword && ["INBOX", "IMPORTANT", "SENT", "SPAM"].includes(currentTab) && (
            <div className={`animate-fade-in animate-delay-1 ${styles.threadViewPanel}`}>
              {!selectedThread ? (
                <div className={styles.emptyState}>Wybierz wiadomość z listy po lewej stronie.</div>
              ) : (
                <>
                  <div className={styles.threadViewHeader}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--foreground)' }}>{selectedThread.emails[0]?.subject}</h2>
                    <button 
                      className="btn" 
                      style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px' }}
                      onClick={() => handleDeleteThread(selectedThread.id)}
                      disabled={deleting}
                    >
                      <Trash2 size={16} style={{ marginRight: '6px' }} />
                      Usuń wątek
                    </button>
                  </div>
                  
                  <div className={styles.conversationHistory}>
                    {(selectedThread.emails || []).slice().reverse().map((email: any) => (
                      <div key={email.id} className={`${styles.emailBubble} ${email.isFromAgent ? styles.fromAgent : styles.fromClient}`}>
                        <div className={styles.emailHeader}>
                          <strong>{email.from.split('<')[0]}</strong> • {new Date(email.receivedAt).toLocaleString()}
                        </div>
                        <div className={styles.emailBodyCard}>
                          {email.body || email.snippet}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedThread.status === 'PENDING_APPROVAL' && (
                    <div className={styles.approvalSection}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Sparkles size={16} color="var(--primary)" />
                          <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>Propozycja AI</span>
                        </div>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={async () => {
                            setEditedReply("Generowanie odpowiedzi...");
                            try {
                              const res = await fetch(`/api/threads/${selectedThread.id}/generate`, { method: "POST" });
                              if (res.ok) {
                                const data = await res.json();
                                setEditedReply(data.draftReply || "");
                                await fetchThreads();
                              } else {
                                alert("Nie udało się wygenerować odpowiedzi.");
                                setEditedReply("");
                              }
                            } catch (e) {
                              setEditedReply("");
                            }
                          }}
                        >
                          <RefreshCw size={12} style={{ marginRight: '4px' }} />
                          Generuj ponownie
                        </button>
                      </div>
                      <textarea 
                        className={styles.textarea}
                        value={editedReply}
                        onChange={(e) => setEditedReply(e.target.value)}
                        rows={5}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={handleSendReply}
                          disabled={sending}
                        >
                          {sending ? <RefreshCw className={styles['animate-spin']} size={16} /> : <Send size={16} />}
                          Wyślij Odpowiedź
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {selectedThread.status !== 'PENDING_APPROVAL' && (
                    <div className={styles.approvalSection}>
                      <div className={styles.successMessage}>
                        {selectedThread.status === 'IGNORED' ? (
                          <><AlertCircle size={18} color="#f59e0b" /> Zignorowano (Bot/Spam)</>
                        ) : (
                          <><CheckCircle size={18} color="#10b981" /> Odpowiedź została wysłana</>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ONBOARDING TOUR OVERLAY */}
      {tourStep > 0 && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--foreground)' }}>
              Krok {tourStep} z 3: {tourStep === 1 ? 'Baza Wiedzy' : tourStep === 2 ? 'Motyw' : 'Poczta i Auto-Reply'}
            </h3>
            
            <p style={{ color: 'var(--subtext)', lineHeight: 1.6, marginBottom: '24px', minHeight: '80px' }}>
              {tourStep === 1 && "Aby AI mogło poprawnie odpowiadać, opisz swoją firmę w zakładce Baza Wiedzy (widzisz ją teraz za tym oknem). Napisz minimum 60 znaków – to kluczowe, by asystent miał z czego czerpać informacje!"}
              {tourStep === 2 && "Zwróć uwagę na górny pasek nawigacyjny. Widzisz ikonkę słońca/księżyca? Po kliknięciu w nią możesz w dowolnym momencie zmienić wygląd całej aplikacji z trybu ciemnego na jasny lub odwrotnie."}
              {tourStep === 3 && "Właśnie przeszliśmy do Skrzynki. Tutaj pojawiają się e-maile. Zwróć uwagę na lewy dolny róg menu (nad Twoim awatarem) – to suwak 'Auto-Reply (AI)'. Gdy go włączysz, sztuczna inteligencja zacznie wysyłać odpowiedzi całkowicie sama!"}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: tourStep === 1 ? 'var(--primary)' : 'var(--border)' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: tourStep === 2 ? 'var(--primary)' : 'var(--border)' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: tourStep === 3 ? 'var(--primary)' : 'var(--border)' }} />
              </div>
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  if (tourStep === 1) {
                    setTourStep(2);
                  } else if (tourStep === 2) {
                    setCurrentTab("INBOX");
                    setTourStep(3);
                  } else {
                    setTourStep(0);
                    try {
                      await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ onboardingDone: true })
                      });
                    } catch (e) {
                      console.error("Failed to mark onboarding as done", e);
                    }
                  }
                }}
              >
                {tourStep < 3 ? 'Dalej' : 'Zakończ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
