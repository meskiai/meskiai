"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Mail, Send, RefreshCw, AlertCircle, CheckCircle, 
  Sparkles, User, LogOut, Inbox, Archive, AlertTriangle, Trash2, Bot, Home, HelpCircle, LayoutGrid,
  ArrowUpRight, ArrowDownLeft, ArrowDown, FileText, Building, Search, ArrowRight, ChevronRight, ChevronLeft, Users,
  Target, Zap, TrendingUp, ShieldAlert, Plus, BarChart2, Activity, Lightbulb, PieChart, ExternalLink, Settings,
  X, DollarSign, CheckSquare, ArrowDownRight, Info, Star, Loader2, MessageSquare
} from "lucide-react";
import { PRICE_BASIC, PRICE_PRO, PRICE_MAX, getPlanLimits } from "@/lib/pricing";
import styles from "./page.module.css";
import AgentChat from "@/components/AgentChat";
const getCleanDraftReply = (draft: string | null): string => {
  if (!draft) return "";
  if (draft.includes("[ANALIZA AGENTA]:")) {
    if (draft.includes("[PROPONOWANE POTWIERDZENIE (NIEWYSŁANE)]:")) {
      const match = draft.match(/\[PROPONOWANE POTWIERDZENIE \(NIEWYSŁANE\)\]:\n([\s\S]*)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    if (draft.includes("[WYSŁANE POTWIERDZENIE]:")) {
      return "";
    }
  }
  return draft;
};

const getAgentAnalysis = (draft: string | null): string => {
  if (!draft) return "";
  if (draft.includes("[ANALIZA AGENTA]:")) {
    const match = draft.match(/\[ANALIZA AGENTA\]:\n([\s\S]*?)(?:\n\n\[(?:WYSŁANE POTWIERDZENIE|PROPONOWANE POTWIERDZENIE))/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return draft;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [silentSyncing, setSilentSyncing] = useState(false);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [editedReply, setEditedReply] = useState("");
  const [resolvingThread, setResolvingThread] = useState(false);
  const [sending, setSending] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [autoReply, setAutoReply] = useState(false);
  const [lastAgentRunAt, setLastAgentRunAt] = useState<string | null>(null);
  const [agentEmailsProcessed, setAgentEmailsProcessed] = useState(0);

  // Dashboard Mode Selection
  const [dashboardMode, setDashboardMode] = useState<"MAIL" | "STRATEGY" | "CLIENTS" | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);

  const [currentTab, setCurrentTab] = useState<"INBOX" | "IMPORTANT" | "SENT" | "SPAM" | "SETTINGS" | "STRATEGY" | "ACCOUNT" | "CHAT">("INBOX");
  const [integrationMethod, setIntegrationMethod] = useState<'API' | 'WEBHOOK'>('API');
  const [showOverdueImportantAlert, setShowOverdueImportantAlert] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackStars, setFeedbackStars] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showModuleSwitcher, setShowModuleSwitcher] = useState(false);
  const [showManualReply, setShowManualReply] = useState(false);
  const [isGeneratingManualReply, setIsGeneratingManualReply] = useState(false);
  const [showUpgradeReminder, setShowUpgradeReminder] = useState(false);

  // Edit Modes State
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingKnowledge, setIsEditingKnowledge] = useState(false);

  // Strategy Agent State
  const [strategyUrl, setStrategyUrl] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [isAnalyzingStrategy, setIsAnalyzingStrategy] = useState(false);
  const [strategyLoadingStep, setStrategyLoadingStep] = useState(0);
  const [strategyResults, setStrategyResults] = useState<any>(null);

  // Clients State
  const [leads, setLeads] = useState<any[]>([]);
  const [generatingLeads, setGeneratingLeads] = useState(false);
  const [showClientsGuide, setShowClientsGuide] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [newOrderNum, setNewOrderNum] = useState("");
  const [newOrderEmail, setNewOrderEmail] = useState("");
  const [newOrderStatus, setNewOrderStatus] = useState("W realizacji");
  const [newOrderItems, setNewOrderItems] = useState("");
  const [newOrderPrice, setNewOrderPrice] = useState("");
  const [newOrderTracking, setNewOrderTracking] = useState("");
  
  // Store Integration State
  const [storeType, setStoreType] = useState<"shopify" | "woocommerce" | "custom" | "">(""); 
  const [storeUrl, setStoreUrl] = useState("");
  const [storeApiKey, setStoreApiKey] = useState("");
  const [storeApiSecret, setStoreApiSecret] = useState("");
  const [savingStoreSettings, setSavingStoreSettings] = useState(false);
  const [testingStoreConnection, setTestingStoreConnection] = useState(false);
  const [storeTestResult, setStoreTestResult] = useState<{success: boolean; message: string; details?: string} | null>(null);
  const [storeConnected, setStoreConnected] = useState(false);

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
  const [generationStep, setGenerationStep] = useState(0);

  // Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  // Computed Limits
  const getTier = (priceId: string | null | undefined) => {
    if (priceId === PRICE_MAX) return 3;
    if (priceId === PRICE_PRO) return 2;
    if (priceId === PRICE_BASIC) return 1;
    return 0;
  };
  const userTier = getTier(subscriptionData?.stripePriceId);

  const pid = subscriptionData?.stripePriceId;
  const limits = getPlanLimits(pid);
  const isUnlimited = limits.credits === Infinity;
  
  const aiCredits = subscriptionData?.aiCredits ?? 0;
  
  const isEmailLimitReached = !isUnlimited && aiCredits < 10;
  const isSearchLimitReached = !isUnlimited && aiCredits < 20;
  const isLeadLimitReached = !isUnlimited && aiCredits < 10;

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
          setCompanyWebsite(data.settings.companyWebsite || "");
          setDefaultVatRate(data.settings.defaultVatRate || "23%");
          setReplyTone(data.settings.replyTone || "PROFESJONALNY");
          // Store integration
          if (data.settings.storeType) setStoreType(data.settings.storeType);
          if (data.settings.storeUrl) setStoreUrl(data.settings.storeUrl);
          if (data.settings.storeApiKey) setStoreApiKey(data.settings.storeApiKey);
          // storeApiSecret comes back as "__SET__" if configured — show a placeholder
          if (data.settings.storeApiSecret === "__SET__") setStoreApiSecret("__HIDDEN__");
          const hasStore = !!(data.settings.storeType && data.settings.storeUrl && data.settings.storeApiKey);
          setStoreConnected(hasStore);
          if (!data.settings.companyWebsite) {
            setStrategyResults(null);
            localStorage.removeItem("meskiStrategyResults");
          }

          if (data.settings.businessContext) setIsEditingKnowledge(false);
          else setIsEditingKnowledge(true);

          if (data.settings.companyName || data.settings.companyNip) setIsEditingCompany(false);
          else setIsEditingCompany(true);

          if (!data.settings.onboardingDone) {
            setShowGuide(true);
            setGuideIndex(0);
          }

          let isCheckingOut = false;
          if (data.subscriptionData) {
            setSubscriptionStatus(data.subscriptionData.subscriptionStatus);
            setSubscriptionData(data.subscriptionData);
            
            // Check for feedback prompt eligibility: 3 days after sub purchase/account creation
            const sub = data.subscriptionData;
            const isActive = sub.subscriptionStatus === "active" || sub.subscriptionStatus === "trialing";
            const hasNotSubmitted = !sub.feedbackSubmitted;
            const regDate = sub.createdAt ? new Date(sub.createdAt).getTime() : Date.now();
            const isThreeDaysOld = (Date.now() - regDate) > 3 * 24 * 60 * 60 * 1000;
            
            if (isActive && hasNotSubmitted && isThreeDaysOld) {
              setShowFeedbackModal(true);
            }
            
            // Show guide for first-time subscribed users
            if (data.subscriptionData.subscriptionStatus === 'active') {
              if (!localStorage.getItem('hasSeenGuide')) {
                setShowGuide(true);
                setGuideIndex(0);
                localStorage.setItem('hasSeenGuide', 'true');
              }
            }
            if (data.subscriptionData.lastAgentRunAt) {
              setLastAgentRunAt(data.subscriptionData.lastAgentRunAt);
            }
            if (data.subscriptionData.agentEmailsProcessed !== undefined) {
              setAgentEmailsProcessed(data.subscriptionData.agentEmailsProcessed);
            }

            if (!sessionStorage.getItem('hasCountedVisit')) {
              sessionStorage.setItem('hasCountedVisit', 'true');
              const tier = getTier(data.subscriptionData.stripePriceId);
              if (tier < 3) {
                const visitCount = parseInt(localStorage.getItem('dashboardVisitCount') || '0', 10) + 1;
                localStorage.setItem('dashboardVisitCount', visitCount.toString());
                if (visitCount % 5 === 0) {
                  setShowUpgradeReminder(true);
                }
              }
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
            const isTrialActive = data.subscriptionData?.trialState?.isTrialActive;
            if (!isTrialActive && (!data.subscriptionData || !['active', 'trialing', 'incomplete'].includes(data.subscriptionData.subscriptionStatus))) {
              router.push("/?error=no_subscription#cennik");
              return;
            }
          }
        } else {
          // No settings record yet — user is new. Show the guide and let them complete setup.
          setShowGuide(true);
          setGuideIndex(0);
        }
      } else {
        setSubscriptionStatus("error");
      }
    } catch (e) {
      console.error(e);
      setSubscriptionStatus("error");
    }
  };

  const handleCheckout = async (priceId: string) => {
    setIsRedirectingToCheckout(true);
    window.location.href = `/checkout?priceId=${priceId}`;
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
        showToast("Błąd podczas otwierania panelu zarządzania subskrypcją.", "error");
        setIsOpeningPortal(false);
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd połączenia.", "error");
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
        showToast("Subskrypcja zostanie anulowana z końcem bieżącego okresu rozliczeniowego. Zachowasz dostęp do tego dnia.", "info");
      } else {
        showToast("Błąd: " + (data.error || "Nie udało się anulować subskrypcji."), "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd połączenia.", "error");
    } finally {
      setIsCancelingSubscription(false);
    }
  };

  const handleSaveSettings = async (type: 'company' | 'knowledge' | 'all') => {
    if ((type === 'knowledge' || type === 'all') && businessContext.trim().length < 20) {
      showToast("Baza wiedzy musi zawierać minimum 20 znaków, aby Agent AI mógł skutecznie działać.", "error");
      return;
    }

    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessContext, companyName, companyNip, companyAddress, companyBankAccount, defaultVatRate, replyTone, companyWebsite }),
      });
      if (!res.ok) {
        let errMsg = "Błąd zapisu na serwerze";
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch(e){}
        throw new Error(errMsg);
      }
      showToast("Zapisano pomyślnie!", "success");
      if (type === 'company' || type === 'all') setIsEditingCompany(false);
      if (type === 'knowledge' || type === 'all') setIsEditingKnowledge(false);
    } catch (e: any) {
      console.error(e);
      showToast(`Wystąpił błąd podczas zapisywania: ${e.message}`, "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveStoreSettings = async () => {
    if (!storeType) { showToast("Wybierz typ sklepu", "error"); return; }
    if (!storeUrl.trim()) { showToast("Podaj adres URL sklepu", "error"); return; }
    if (!storeApiKey.trim()) { showToast("Podaj klucz API", "error"); return; }
    setSavingStoreSettings(true);
    try {
      const body: any = { storeType, storeUrl: storeUrl.trim(), storeApiKey: storeApiKey.trim() };
      if (storeApiSecret && storeApiSecret !== "__HIDDEN__") body.storeApiSecret = storeApiSecret.trim();
      const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Błąd zapisu");
      showToast("✓ Ustawienia sklepu zapisano!", "success");
      setStoreConnected(true);
      setStoreTestResult(null);
    } catch (e: any) {
      showToast(`Błąd: ${e.message}`, "error");
    } finally {
      setSavingStoreSettings(false);
    }
  };

  const testStoreConnection = async () => {
    if (!storeType || !storeUrl.trim() || !storeApiKey.trim()) { showToast("Uzupełnij typ sklepu, URL i klucz API przed testem", "error"); return; }
    setTestingStoreConnection(true);
    setStoreTestResult(null);
    try {
      const body: any = { storeType, storeUrl: storeUrl.trim(), storeApiKey: storeApiKey.trim() };
      if (storeApiSecret && storeApiSecret !== "__HIDDEN__") body.storeApiSecret = storeApiSecret.trim();
      const res = await fetch("/api/store/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      setStoreTestResult(data);
      if (data.success) setStoreConnected(true);
    } catch (e: any) {
      setStoreTestResult({ success: false, message: `Błąd: ${e.message}` });
    } finally {
      setTestingStoreConnection(false);
    }
  };

  const disconnectStore = async () => {
    setSavingStoreSettings(true);
    try {
      await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storeType: null, storeUrl: null, storeApiKey: null, storeApiSecret: null }) });
      setStoreType(""); setStoreUrl(""); setStoreApiKey(""); setStoreApiSecret("");
      setStoreConnected(false); setStoreTestResult(null);
      showToast("Rozłączono sklep", "success");
    } catch (e: any) {
      showToast("Błąd: " + e.message, "error");
    } finally {
      setSavingStoreSettings(false);
    }
  };

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/threads");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
        
        // Scan for unreplied important threads overdue by more than 2 hours (checking if alert is currently snoozed)
        const snoozedUntil = localStorage.getItem('overdueAlertSnoozedUntil');
        const isSnoozed = snoozedUntil ? Date.now() < parseInt(snoozedUntil, 10) : false;

        const overdue = (data.threads || []).some((t: any) => 
          t.status === "REQUIRES_ATTENTION" &&
          !t.draftReply && // not being worked on by agent
          (Date.now() - new Date(t.updatedAt).getTime()) > 2 * 60 * 60 * 1000
        );
        setShowOverdueImportantAlert(overdue && !isSnoozed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const detectThreadTopic = (emails: any[]) => {
    if (!emails || emails.length === 0) return null;
    const content = emails.map(e => `${e.subject} ${e.body || e.snippet}`).join(" ").toLowerCase();
    
    if (content.includes("spotkan") || content.includes("telefon") || content.includes("call") || content.includes("zadzwo") || content.includes("kalendarz") || content.includes("termin") || content.includes("slot")) {
      return { label: "Spotkanie / Rozmowa", emoji: "📞", color: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)" };
    }
    if (content.includes("ofert") || content.includes("cen") || content.includes("koszt") || content.includes("wycen") || content.includes("ile za") || content.includes("ile kosztuje")) {
      return { label: "Oferta / Wycena", emoji: "💰", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" };
    }
    if (content.includes("reklamac") || content.includes("zwrot") || content.includes("nie dział") || content.includes("błąd") || content.includes("zepsut") || content.includes("popsut") || content.includes("wadliw")) {
      return { label: "Reklamacja / Zwrot", emoji: "⚠️", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" };
    }
    if (content.includes("faktur") || content.includes("rachunek") || content.includes("fv") || content.includes("przelew") || content.includes("płatn") || content.includes("platn")) {
      return { label: "Faktura / Płatność", emoji: "📄", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" };
    }
    return null;
  };

  const handleResolveThread = async (threadId: string) => {
    setResolvingThread(true);
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REPLIED" })
      });
      if (res.ok) {
        showToast("Sprawa została zakończona i przeniesiona do archiwum.", "success");
        setSelectedThread(null);
        await fetchThreads();
      } else {
        showToast("Nie udało się zakończyć sprawy.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd połączenia z serwerem.", "error");
    } finally {
      setResolvingThread(false);
    }
  };


  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd podczas wczytywania zamówień", "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAddOrder = async () => {
    if (!newOrderNum.trim() || !newOrderEmail.trim() || !newOrderItems.trim() || !newOrderPrice.trim()) {
      showToast("Uzupełnij wszystkie wymagane pola", "error");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: newOrderNum,
          customerEmail: newOrderEmail,
          status: newOrderStatus,
          items: newOrderItems,
          totalPrice: newOrderPrice,
          trackingUrl: newOrderTracking
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Zamówienie zostało dodane do bazy", "success");
        setShowAddOrderModal(false);
        setNewOrderNum("");
        setNewOrderEmail("");
        setNewOrderItems("");
        setNewOrderPrice("");
        setNewOrderTracking("");
        await fetchOrders();
      } else {
        showToast(data.error || "Błąd podczas dodawania zamówienia", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd połączenia z serwerem", "error");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to zamówienie?")) return;

    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Zamówienie zostało usunięte", "success");
        await fetchOrders();
      } else {
        const data = await res.json();
        showToast(data.error || "Błąd podczas usuwania zamówienia", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd połączenia z serwerem", "error");
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
    if (isLeadLimitReached) {
      showToast("Wykorzystałeś swój miesięczny limit generowania leadów. Przejdź do 'Moje Konto' i zrób upgrade pakietu, aby kontynuować.", "error");
      return;
    }
    if (!businessContext || businessContext.length < 20) {
      showToast("Twoja baza wiedzy jest pusta lub zbyt krótka. Uzupełnij opis firmy w Ustawieniach, aby AI wiedziało dla kogo szukać klientów.", "error");
      return;
    }
    setGeneratingLeads(true);
    try {
      const res = await fetch("/api/clients/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        await fetchLeads();
      } else {
        showToast(data.error || "Błąd podczas szukania klientów", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd połączenia z serwerem", "error");
    } finally {
      setGeneratingLeads(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/settings/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: feedbackStars, comment: feedbackComment })
      });
      if (res.ok) {
        showToast("Dziękujemy za opinię!", "success");
        setShowFeedbackModal(false);
        if (subscriptionData) {
          setSubscriptionData({
            ...subscriptionData,
            feedbackSubmitted: true
          });
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Błąd wysyłania opinii", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd połączenia z serwerem", "error");
    } finally {
      setSubmittingFeedback(false);
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
    setGenerationStep(0);

    const interval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1500);

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
        showToast(data.error || "Nie udało się wygenerować maila. Możesz wpisać treść ręcznie.", "error");
        // We do not close the modal so the user can type manually
      }
    } catch (e) {
      console.error(e);
      showToast("Błąd połączenia z serwerem. Możesz wpisać treść ręcznie.", "error");
    } finally {
      clearInterval(interval);
      setIsGeneratingEmail(false);
    }
  };

  const handleSendLeadEmail = async () => {
    if (isEmailLimitReached) {
      showToast("Wykorzystałeś swój miesięczny limit wysłanych e-maili. Przejdź do 'Moje Konto' i zrób upgrade pakietu, aby kontynuować.", "error");
      return;
    }
    if (!contactingLead || !contactEmail || !contactSubject || !contactBody) {
      showToast("Proszę wypełnić wszystkie pola (E-mail, Temat, Treść).", "error");
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
        showToast("Wiadomość została wysłana, a lead zarchiwizowany!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Nie udało się wysłać maila.", "error");
      }
    } catch (e) {
      showToast("Błąd połączenia z serwerem.", "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAnalyzeStrategy = async () => {
    if (isSearchLimitReached) {
      showToast("Wykorzystałeś swój miesięczny limit analiz strategii. Przejdź do 'Moje Konto' i zrób upgrade pakietu, aby kontynuować.", "error");
      return;
    }
    const targetUrl = strategyUrl.trim();
    if (!targetUrl) {
      showToast("Proszę podać adres URL strony.", "error");
      return;
    }
    
    setIsAnalyzingStrategy(true);
    setStrategyLoadingStep(0);
    setStrategyResults(null);
    
    const stepsInterval = setInterval(() => {
      setStrategyLoadingStep(prev => prev < 4 ? prev + 1 : prev);
    }, 2500);

    try {
      const res = await fetch("/api/strategy/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      
      clearInterval(stepsInterval);
      setStrategyLoadingStep(5);
      
      if (res.ok) {
        setStrategyResults(data);
        localStorage.setItem("meskiStrategyUrl", targetUrl);
        localStorage.setItem("meskiStrategyResults", JSON.stringify(data));
      } else {
        showToast(data.error || "Wystąpił błąd podczas analizy strony.", "error");
      }
    } catch (e) {
      clearInterval(stepsInterval);
      console.error(e);
      showToast("Błąd połączenia podczas analizy.", "error");
    } finally {
      setIsAnalyzingStrategy(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated") {
      const searchParams = new URLSearchParams(window.location.search);
      const isCheckout = searchParams.get("checkout") === "success";

      const initDashboard = () => {
        fetchSettings();
        fetchThreads();
        fetchLeads();
        fetchOrders();
      };

      if (isCheckout) {
        setLoading(true);
        const checkStripe = async (attempts = 0) => {
          try {
            const res = await fetch("/api/stripe/verify", { method: "POST" });
            const data = await res.json();
            if (data.success || attempts > 4) {
              window.history.replaceState({}, document.title, window.location.pathname);
              initDashboard();
            } else {
              setTimeout(() => checkStripe(attempts + 1), 1500);
            }
          } catch (e) {
            initDashboard();
          }
        };
        checkStripe();
      } else {
        initDashboard();
      }

      const savedStrategyResults = localStorage.getItem("meskiStrategyResults");
      if (savedStrategyResults) {
        try {
          const parsed = JSON.parse(savedStrategyResults);
          if (parsed.marketOverview) {
            setStrategyResults(parsed);
          } else {
            localStorage.removeItem("meskiStrategyResults");
          }
        } catch (e) {}
      }
      
      // Auto-refresh co 60 sekund (aby nie zapychać serwera ciągłymi połączeniami IMAP dla wszystkich użytkowników)
      const interval = setInterval(() => {
        handleSync(true);
      }, 60000);
      
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

  // handleSync — odświeża widok (w tle tylko odpytuje bazę, przyciskiem wymusza globalny IMAP)
  const handleSync = async (isSilent = false) => {
    if (isSilent) setSilentSyncing(true);
    else setSyncing(true);

    try {
      if (!isSilent) {
        // /api/cron/sync uruchamia pełną synchronizację server-side (dla wszystkich)
        await fetch('/api/cron/sync', { method: 'POST' });
      }
      
      await fetchThreads();
      // Odśwież też czas ostatniego uruchomienia
      const settingsRes = await fetch(`/api/settings?t=${Date.now()}`);
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        if (d.subscriptionData?.lastAgentRunAt) setLastAgentRunAt(d.subscriptionData.lastAgentRunAt);
        if (d.subscriptionData?.agentEmailsProcessed !== undefined) setAgentEmailsProcessed(d.subscriptionData.agentEmailsProcessed);
      }
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      if (isSilent) setSilentSyncing(false);
      else setSyncing(false);
    }
  };

  const handleSendReply = async () => {
    if (isEmailLimitReached) {
      showToast("Wykorzystałeś swój miesięczny limit wysłanych e-maili. Przejdź do 'Moje Konto' i zrób upgrade pakietu, aby kontynuować.", "error");
      return;
    }
    if (!selectedThread) return;
    if (!editedReply.trim()) {
      showToast("Odpowiedź nie może być pusta! Wpisz coś ręcznie lub wygeneruj z AI.", "error");
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
        showToast("Błąd podczas wysyłania wiadomości: " + (errData.error || "Nieznany błąd serwera."), "error");
      }
    } catch (e: any) {
      console.error(e);
      showToast("Błąd połączenia: " + e.message, "error");
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

  const isTrialActive = subscriptionData?.trialState?.isTrialActive;
  if (!isTrialActive && subscriptionStatus && !['active', 'trialing', 'incomplete'].includes(subscriptionStatus)) {
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
    // Zabezpieczenie przed pobieraniem tysięcy maili ze sterty HISTORY
    if (currentTab === "SPAM") return t.status === "IGNORED" && !t.threadId.startsWith("HISTORY_");
    return true;
  }).sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const isRepliedImportant = selectedThread && selectedThread.status === 'REQUIRES_ATTENTION' && (selectedThread.emails || []).some((e: any) => e.isFromAgent);

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
              style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'var(--logo-filter)', mixBlendMode: 'var(--logo-blend-mode)' as any }}
            />
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--foreground)' }}>MESKIAI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
            
            
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
        
        <div className={`animate-fade-in ${styles.moduleSelectionContent}`}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#635BFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            PANEL GŁÓWNY MESKIAI
          </div>
          <h1 className={styles.moduleSelectionTitle} style={{ color: '#0A2540', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Wybierz moduł
          </h1>
          <p className={styles.moduleSelectionSubtitle} style={{ color: '#425466', fontSize: '0.98rem' }}>
            Twój asystent AI jest gotowy. Co automatyzujemy dzisiaj?
          </p>

          {/* Guide button - moved above cards */}
          <button 
            className={styles.guideBtn}
            onClick={() => { setShowGuide(true); setGuideIndex(0); }}
            style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', color: '#635BFF', borderRadius: '30px', padding: '8px 20px', fontWeight: 600, boxShadow: '0 2px 8px rgba(99,91,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#635BFF'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E6EBF1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <HelpCircle size={16} color="#635BFF" /> Jak zacząć?
          </button>

          <div className={styles.moduleCardsList}>
            
            {/* Row 1: Poczta */}
            <div 
              className={styles.horizontalModuleCard}
              style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', transition: 'all 0.25s ease', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)', position: 'relative', overflow: 'hidden' }}
              onClick={() => { setDashboardMode("MAIL"); setCurrentTab("INBOX"); }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#635BFF'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(99, 91, 255, 0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E6EBF1'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(10, 37, 64, 0.04)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '14px', background: '#F5F3FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E0E7FF' }}>
                  <Mail size={26} color="#635BFF" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', margin: 0, letterSpacing: '-0.02em' }}>Agent Pocztowy AI</h2>
                    <span style={{ background: '#F5F3FF', color: '#635BFF', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', border: '1px solid #E0E7FF' }}>Auto-Reply 24/7</span>
                  </div>
                  <p style={{ color: '#425466', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                    Inteligentna obsługa klienta — szkicowanie i auto-odpowiedzi 24/7.
                  </p>
                </div>
              </div>
              <div className={styles.moduleArrow} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F5F3FF', border: '1px solid #E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#635BFF', flexShrink: 0, transition: 'transform 0.2s ease' }}>
                <ArrowRight size={20} color="#635BFF" />
              </div>
            </div>

            {/* Row 2: Strategia */}
            <div 
              className={styles.horizontalModuleCard}
              style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', transition: 'all 0.25s ease', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)', position: 'relative', overflow: 'hidden' }}
              onClick={() => { setDashboardMode("STRATEGY"); setCurrentTab("STRATEGY"); }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#635BFF'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(99, 91, 255, 0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E6EBF1'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(10, 37, 64, 0.04)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '14px', background: '#F5F3FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E0E7FF' }}>
                  <Search size={26} color="#635BFF" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', margin: 0, letterSpacing: '-0.02em' }}>Agent Strategiczny AI</h2>
                    <span style={{ background: '#F5F3FF', color: '#635BFF', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', border: '1px solid #E0E7FF' }}>Action Plan</span>
                  </div>
                  <p style={{ color: '#425466', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                    Analiza konkurencji, nowe funkcje i wskazówki sprzedażowe z URL.
                  </p>
                </div>
              </div>
              <div className={styles.moduleArrow} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F5F3FF', border: '1px solid #E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#635BFF', flexShrink: 0, transition: 'transform 0.2s ease' }}>
                <ArrowRight size={20} color="#635BFF" />
              </div>
            </div>

            {/* Row 3: Klienci */}
            <div 
              className={styles.horizontalModuleCard}
              style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', transition: 'all 0.25s ease', boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)', position: 'relative', overflow: 'hidden' }}
              onClick={() => { 
                setDashboardMode("CLIENTS"); 
                setCurrentTab("CLIENTS" as any);
                if (leads.length === 0) handleGenerateLeads();
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#635BFF'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(99, 91, 255, 0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#E6EBF1'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(10, 37, 64, 0.04)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '14px', background: '#F5F3FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E0E7FF' }}>
                  <Users size={26} color="#635BFF" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A2540', margin: 0, letterSpacing: '-0.02em' }}>Baza Leadów</h2>
                    <span style={{ background: '#F5F3FF', color: '#635BFF', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', border: '1px solid #E0E7FF' }}>Cold Email</span>
                  </div>
                  <p style={{ color: '#425466', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                    AI podsuwa codziennie idealnych klientów gotowych na współpracę.
                  </p>
                </div>
              </div>
              <div className={styles.moduleArrow} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F5F3FF', border: '1px solid #E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#635BFF', flexShrink: 0, transition: 'transform 0.2s ease' }}>
                <ArrowRight size={20} color="#635BFF" />
              </div>
            </div>

          </div>
        </div>

        {/* Onboarding Guide Fixed Modal */}
        {showGuide && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10, 37, 64, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="animate-fade-in" style={{ 
              background: '#FFFFFF', 
              border: '1px solid #E6EBF1', 
              padding: '36px 32px', 
              borderRadius: '24px', 
              maxWidth: '520px', 
              width: '100%', 
              textAlign: 'center', 
              boxShadow: '0 20px 50px -10px rgba(10, 37, 64, 0.15), 0 10px 20px -5px rgba(10, 37, 64, 0.08)', 
              position: 'relative' 
            }}>
              <button 
                onClick={() => {
                  setShowGuide(false);
                  fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onboardingDone: true }) });
                }} 
                style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0A2540'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
              >
                <X size={18} />
              </button>

              {/* Progress Indicator */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '28px' }}>
                {[0, 1, 2, 3].map(idx => (
                  <div key={idx} style={{ height: '4px', width: idx === guideIndex ? '32px' : '10px', borderRadius: '2px', background: idx === guideIndex ? '#635BFF' : '#E2E8F0', transition: 'all 0.3s' }}></div>
                ))}
              </div>

              {guideIndex === 0 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#EEF2FF', border: '1px solid #E0E7FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Bot size={28} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 10px 0', color: '#0A2540', letterSpacing: '-0.02em' }}>Krok 1: Baza Wiedzy AI</h2>
                  <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
                    Z bocznego menu wybierz zakładkę <strong>Baza Wiedzy</strong>. Opisz tam szczegółowo, czym zajmuje się Twoja firma. To najważniejszy krok! AI użyje tej wiedzy do szukania idealnych klientów i odpisywania na wiadomości.
                  </p>
                </div>
              )}

              {guideIndex === 1 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#EEF2FF', border: '1px solid #E0E7FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Mail size={28} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 10px 0', color: '#0A2540', letterSpacing: '-0.02em' }}>Krok 2: Agent Pocztowy AI</h2>
                  <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
                    Wybierz <strong>Agent Pocztowy AI</strong>. Nowe maile trafiają tu bezpośrednio, a AI od razu pisze szkic odpowiedzi. Aby asystent odpisywał samoczynnie w trybie 24/7, po prostu włącz suwak <strong>Auto-Reply (AI)</strong> na dole ekranu.
                  </p>
                </div>
              )}

              {guideIndex === 2 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#EEF2FF', border: '1px solid #E0E7FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Search size={28} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 10px 0', color: '#0A2540', letterSpacing: '-0.02em' }}>Krok 3: Agent Strategiczny AI</h2>
                  <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
                    Wejdź w <strong>Agent Strategiczny AI</strong>. Podaj adres strony internetowej, a system natychmiast wyciągnie model biznesowy, zmapuje rynek i wygeneruje konkretny Action Plan jak pokonać konkurencję.
                  </p>
                </div>
              )}

              {guideIndex === 3 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: '#EEF2FF', border: '1px solid #E0E7FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Users size={28} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 10px 0', color: '#0A2540', letterSpacing: '-0.02em' }}>Krok 4: Baza Leadów</h2>
                  <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
                    Wybierz moduł <strong>Baza Leadów</strong>. AI samo znajdzie nowe firmy pasujące do Twojej działalności. Kliknij dowolnego leada, a system jednym przyciskiem napisze za Ciebie fenomenalną wiadomość sprzedażową Cold Email.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #E6EBF1' }}>
                {guideIndex > 0 ? (
                  <button 
                    onClick={() => setGuideIndex(guideIndex - 1)}
                    style={{ padding: '11px 20px', fontWeight: 600, fontSize: '0.88rem', borderRadius: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
                  >
                    Wstecz
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setShowGuide(false);
                      fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onboardingDone: true }) });
                    }}
                    style={{ padding: '11px 20px', fontWeight: 600, fontSize: '0.88rem', borderRadius: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
                  >
                    Pomiń
                  </button>
                )}

                {guideIndex < 3 ? (
                  <button 
                    onClick={() => setGuideIndex(guideIndex + 1)}
                    style={{ padding: '11px 24px', fontWeight: 600, fontSize: '0.88rem', background: '#635BFF', border: 'none', borderRadius: '10px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(99,91,255,0.25)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#5249E0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#635BFF'; e.currentTarget.style.transform = 'none'; }}
                  >
                    Dalej <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setShowGuide(false);
                      fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onboardingDone: true }) });
                    }}
                    style={{ padding: '11px 24px', fontWeight: 600, fontSize: '0.88rem', background: '#635BFF', border: 'none', borderRadius: '10px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(99,91,255,0.25)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#5249E0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#635BFF'; e.currentTarget.style.transform = 'none'; }}
                  >
                    Zacznijmy! <CheckCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {showUpgradeReminder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10, 37, 64, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade-in" style={{ 
            background: '#FFFFFF', 
            border: '1px solid #E6EBF1', 
            padding: '36px 32px', 
            borderRadius: '24px', 
            maxWidth: '440px', 
            width: '100%', 
            textAlign: 'center', 
            boxShadow: '0 20px 50px -10px rgba(10, 37, 64, 0.15), 0 10px 20px -5px rgba(10, 37, 64, 0.08)', 
            position: 'relative' 
          }}>
            <button 
              onClick={() => setShowUpgradeReminder(false)} 
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0A2540'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
            >
              <X size={18} />
            </button>

            <div style={{ width: '60px', height: '60px', background: '#EEF2FF', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#635BFF', border: '1px solid #E0E7FF' }}>
              <Zap size={28} style={{ fill: '#635BFF', color: '#635BFF' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0A2540', letterSpacing: '-0.02em' }}>Odblokuj Pełen Potencjał</h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '28px' }}>
              Twój obecny pakiet ma ograniczenia. Przejdź na wyższy plan subskrypcji, aby zyskać większe limity wysyłki e-maili, dodatkowe analizy leadów oraz pełną automatyzację.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowUpgradeReminder(false)} 
                style={{ padding: '11px 20px', fontWeight: 600, fontSize: '0.88rem', borderRadius: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
              >
                Później
              </button>
              <button 
                onClick={() => { setShowUpgradeReminder(false); window.location.href = '/#cennik'; }} 
                style={{ 
                  padding: '11px 24px', 
                  fontWeight: 600, 
                  fontSize: '0.88rem', 
                  background: '#635BFF', 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: '#FFFFFF', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  boxShadow: '0 4px 12px rgba(99, 91, 255, 0.25)', 
                  transition: 'all 0.2s' 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#5249E0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#635BFF'; e.currentTarget.style.transform = 'none'; }}
              >
                Sprawdź Pakiety <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10, 37, 64, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="animate-fade-in" style={{ 
            background: '#FFFFFF', 
            border: '1px solid #E6EBF1', 
            padding: '36px 32px', 
            borderRadius: '24px', 
            maxWidth: '440px', 
            width: '100%', 
            textAlign: 'center', 
            boxShadow: '0 20px 50px -10px rgba(10, 37, 64, 0.15), 0 10px 20px -5px rgba(10, 37, 64, 0.08)', 
            position: 'relative' 
          }}>
            <button 
              onClick={() => setShowFeedbackModal(false)} 
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0A2540'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
            >
              <X size={18} />
            </button>

            <div style={{ width: '60px', height: '60px', background: '#EEF2FF', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#635BFF', border: '1px solid #E0E7FF' }}>
              <Star size={28} style={{ fill: '#635BFF', color: '#635BFF' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0A2540', letterSpacing: '-0.02em' }}>Podziel się opinią</h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Dziękujemy za korzystanie z MESKIAI! Twoja opinia pomaga nam ulepszać agenta dla Twojej firmy.
            </p>

            {/* Stars Selector */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFeedbackStars(num)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s ease-out' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <Star 
                    size={32} 
                    style={{ 
                      color: num <= feedbackStars ? '#F59E0B' : '#CBD5E1', 
                      fill: num <= feedbackStars ? '#F59E0B' : 'transparent',
                      transition: 'color 0.2s, fill 0.2s'
                    }} 
                  />
                </button>
              ))}
            </div>

            {/* Feedback Comment */}
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Co możemy poprawić lub co najbardziej Ci się podoba? (opcjonalnie)..."
              style={{
                width: '100%',
                height: '100px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px 14px',
                color: '#0A2540',
                fontSize: '0.9rem',
                lineHeight: 1.45,
                resize: 'none',
                marginBottom: '24px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#635BFF'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 91, 255, 0.12)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.boxShadow = 'none'; }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowFeedbackModal(false)} 
                style={{ padding: '11px 20px', fontWeight: 600, fontSize: '0.88rem', borderRadius: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
              >
                Pomiń
              </button>
              <button 
                onClick={handleSubmitFeedback} 
                disabled={submittingFeedback}
                style={{ 
                  padding: '11px 24px', 
                  fontWeight: 600, 
                  fontSize: '0.88rem', 
                  background: '#635BFF', 
                  border: 'none', 
                  borderRadius: '10px', 
                  color: '#FFFFFF', 
                  cursor: submittingFeedback ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  boxShadow: '0 4px 12px rgba(99, 91, 255, 0.25)', 
                  transition: 'all 0.2s', 
                  opacity: submittingFeedback ? 0.6 : 1 
                }}
                onMouseEnter={(e) => { if (!submittingFeedback) { e.currentTarget.style.background = '#5249E0'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#635BFF'; e.currentTarget.style.transform = 'none'; }}
              >
                {submittingFeedback ? "Wysyłanie..." : "Wyślij opinię"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddOrderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-fade-in" style={{ 
            background: 'var(--modal-bg)', 
            border: '1px solid var(--border)', 
            padding: '36px 32px', 
            borderRadius: '24px', 
            maxWidth: '500px', 
            width: '90%', 
            boxShadow: 'var(--mac-shadow), var(--glass-reflection)', 
            backdropFilter: 'saturate(190%) blur(50px)',
            WebkitBackdropFilter: 'saturate(190%) blur(50px)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 8px 0' }}>Dodaj testowe zamówienie</h3>
            <p style={{ color: 'var(--subtext)', fontSize: '0.85rem', margin: '0 0 24px 0', lineHeight: 1.4 }}>
              Dodaj parametry do bazy. Pytając o nie w e-mailu, Agent automatycznie pobierze ich szczegóły.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--subtext)', textTransform: 'uppercase', marginBottom: '6px' }}>Numer zamówienia *</label>
                <input 
                  type="text" 
                  value={newOrderNum} 
                  onChange={(e) => setNewOrderNum(e.target.value)} 
                  placeholder="np. 998822 lub ZO-1042" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--foreground)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--subtext)', textTransform: 'uppercase', marginBottom: '6px' }}>E-mail klienta *</label>
                <input 
                  type="email" 
                  value={newOrderEmail} 
                  onChange={(e) => setNewOrderEmail(e.target.value)} 
                  placeholder="np. jan.kowalski@wp.pl" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--foreground)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--subtext)', textTransform: 'uppercase', marginBottom: '6px' }}>Zakupione produkty *</label>
                <input 
                  type="text" 
                  value={newOrderItems} 
                  onChange={(e) => setNewOrderItems(e.target.value)} 
                  placeholder="np. Ebook o AI, Kurs automatyzacji" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--foreground)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--subtext)', textTransform: 'uppercase', marginBottom: '6px' }}>Cena łączna *</label>
                  <input 
                    type="text" 
                    value={newOrderPrice} 
                    onChange={(e) => setNewOrderPrice(e.target.value)} 
                    placeholder="np. 149.00 PLN" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--foreground)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--subtext)', textTransform: 'uppercase', marginBottom: '6px' }}>Status zamówienia *</label>
                  <select 
                    value={newOrderStatus} 
                    onChange={(e) => setNewOrderStatus(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--modal-bg)', color: 'var(--foreground)', fontSize: '0.9rem' }}
                  >
                    <option value="W realizacji">W realizacji</option>
                    <option value="Wysłane">Wysłane</option>
                    <option value="Dostarczone">Dostarczone</option>
                    <option value="Opłacone">Opłacone</option>
                    <option value="Anulowane">Anulowane</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--subtext)', textTransform: 'uppercase', marginBottom: '6px' }}>Link do śledzenia paczki</label>
                <input 
                  type="text" 
                  value={newOrderTracking} 
                  onChange={(e) => setNewOrderTracking(e.target.value)} 
                  placeholder="np. https://inpost.pl/..." 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--foreground)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowAddOrderModal(false)}
                style={{ padding: '10px 20px' }}
              >
                Anuluj
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddOrder}
                style={{ padding: '10px 20px' }}
              >
                Zapisz zamówienie
              </button>
            </div>
          </div>
        </div>
      )}
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
              style={{ width: '26px', height: '26px', objectFit: 'contain', filter: 'var(--logo-filter)', mixBlendMode: 'var(--logo-blend-mode)' as any, flexShrink: 0 }}
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
                  <Users size={16} /> Klienci
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
              <button 
                className={`${styles.navItem} ${currentTab === "CHAT" ? styles.active : ""}`}
                onClick={() => { setCurrentTab("CHAT"); setSelectedThread(null); }}
              >
                <MessageSquare size={18} /> Czat z Agentem
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
            <>
              <button 
                className={`${styles.navItem} ${currentTab === "SETTINGS" ? styles.active : ""}`}
                onClick={() => { setCurrentTab("SETTINGS"); setSelectedThread(null); }}
              >
                <Bot size={18} /> Baza Wiedzy (AI)
              </button>
              <button 
                className={`${styles.navItem} ${currentTab === "ORDERS" as any ? styles.active : ""}`}
                onClick={() => { setCurrentTab("ORDERS" as any); setSelectedThread(null); }}
              >
                <CheckSquare size={18} /> Zamówienia (E-commerce)
              </button>
            </>
          )}
          
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
            {currentTab === "CHAT" && "Czat z Agentem AI"}
            {currentTab === "ACCOUNT" && "Ustawienia Konta"}
            {currentTab === "ORDERS" as any && "Baza Zamówień (E-commerce)"}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            <div style={{ position: 'relative' }}>
              
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => handleSync(false)} disabled={syncing}>
              <RefreshCw size={14} className={syncing ? styles['animate-spin'] : ""} style={{ marginRight: '6px' }} />
              Odśwież teraz
            </button>
          </div>
        </header>

        {showOverdueImportantAlert && (
          <div className="animate-fade-in" style={{ margin: '24px 32px 0 32px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', backdropFilter: 'blur(20px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--foreground)', fontSize: '0.95rem', fontWeight: 600 }}>Masz nieodpisane wiadomości!</strong>
                <p style={{ color: 'var(--subtext)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>W zakładce "Ważne" znajdują się wiadomości wymagające Twojej uwagi, które czekają bez odpowiedzi od ponad 2 godzin.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn" 
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} 
                onClick={() => {
                  setCurrentTab("IMPORTANT");
                  setSelectedThread(null);
                }}
              >
                Przejdź do Ważne
              </button>
              <button 
                className="btn" 
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(120, 120, 128, 0.15)', color: 'var(--foreground)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }} 
                onClick={() => {
                  localStorage.setItem('overdueAlertSnoozedUntil', (Date.now() + 4 * 60 * 60 * 1000).toString());
                  setShowOverdueImportantAlert(false);
                }}
              >
                Przypomnij mi później
              </button>
              <button 
                style={{ background: 'transparent', border: 'none', color: 'var(--subtext)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                onClick={() => setShowOverdueImportantAlert(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className={styles.workspace}>
          
          {/* SETTINGS (KNOWLEDGE BASE) VIEW */}
          {currentTab === "CHAT" && (
            <AgentChat aiCredits={aiCredits} isUnlimited={isUnlimited} />
          )}

          {currentTab === "SETTINGS" && (
            <div className="animate-fade-in" style={{ flex: 1, padding: "32px 24px", overflowY: "auto" }}>
              <div style={{ maxWidth: "600px", width: "100%", margin: "0 auto" }}>
                {/* BAZA WIEDZY */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: "1.5rem", color: "var(--foreground)", margin: 0 }}>Baza Wiedzy Agenta AI</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(99, 91, 255, 0.1)', color: '#635BFF', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} />
                      {subscriptionData?.stripePriceId === PRICE_MAX ? "∞" : subscriptionData?.aiCredits?.toLocaleString("pl-PL") ?? 0} Kredytów
                    </div>
                    {!isEditingKnowledge && (
                      <button className="btn btn-secondary" onClick={() => setIsEditingKnowledge(true)} style={{ padding: '6px 16px' }}>
                        ✏️ Edytuj
                      </button>
                    )}
                  </div>
                </div>
                
                <p style={{ color: "var(--subtext)", marginBottom: "24px", lineHeight: 1.5 }}>
                  Zaktualizuj informacje o swojej firmie. Sztuczna inteligencja używa tych danych, aby rozumieć kontekst zapytań klientów i generować profesjonalne, dokładne odpowiedzi.
                </p>

                {!isEditingKnowledge ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {companyWebsite && (
                      <div style={{ background: 'var(--card-bg)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.3rem' }}>🌐</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--subtext)', fontWeight: 600, marginBottom: '2px' }}>Strona firmy (źródło wiedzy agenta)</div>
                          <a href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none', wordBreak: 'break-all' }}>{companyWebsite}</a>
                        </div>
                      </div>
                    )}
                    <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--foreground)' }}>
                      {businessContext || <span style={{ color: 'var(--subtext)', fontStyle: 'italic' }}>Brak wprowadzonych danych.</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--subtext)', fontWeight: 600, marginBottom: '8px' }}>Preferowany ton odpowiedzi:</div>
                      <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--primary)', color: 'var(--background)', borderRadius: '24px', fontWeight: 600, fontSize: '0.9rem' }}>
                        {replyTone}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--subtext)', marginBottom: '8px' }}>
                        🌐 Adres strony firmowej <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>(Agent AI czyta tę stronę przed odpowiedzią)</span>
                      </label>
                      <input
                        type="url"
                        className={styles.input}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="np. https://twojafirma.pl"
                      />
                      <p style={{ fontSize: '0.78rem', color: 'var(--subtext)', marginTop: '6px', lineHeight: 1.5 }}>
                        Agent pobierze treść tej strony i użyje jej do odpowiadania na pytania o ofertę, ceny, godziny itp.
                      </p>
                    </div>

                    <div style={{ position: 'relative' }}>
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
                <div className={styles.accountInner}>

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
                        <Home size={16} />
                      </button>
                      <button
                        className={`${styles.accountIconBtn} ${styles.accountIconBtnDanger}`}
                        onClick={() => signOut({ callbackUrl: "/" })}
                        title="Wyloguj się"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  </div>

                  {/* ── Row 2: Subscription info ── */}
                  <div className={styles.accountSectionCard}>
                    <div className={styles.accountSectionHeader}>
                      <Zap size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
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

                    {/* Modest Glassmorphism Credit Card Graphic */}
                    <div style={{ marginTop: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                      <div style={{
                        width: '100%', maxWidth: '320px', aspectRatio: '1.586', borderRadius: '16px', padding: '24px',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.2)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        position: 'relative', overflow: 'hidden'
                      }}>
                        {/* Ambient glow inside the card */}
                        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'var(--primary)', filter: 'blur(40px)', opacity: 0.25, borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '100px', height: '100px', background: 'var(--accent)', filter: 'blur(40px)', opacity: 0.15, borderRadius: '50%' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px', color: 'var(--foreground)', opacity: 0.8 }}>MESKIAI</span>
                          {/* Fake EMV Chip */}
                          <div style={{ width: '36px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg, #ffd700, #daa520)', border: '1px solid rgba(0,0,0,0.1)', opacity: 0.9, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '30%', left: '0', right: '0', height: '1px', background: 'rgba(0,0,0,0.2)' }}></div>
                            <div style={{ position: 'absolute', top: '60%', left: '0', right: '0', height: '1px', background: 'rgba(0,0,0,0.2)' }}></div>
                            <div style={{ position: 'absolute', top: '0', bottom: '0', left: '30%', width: '1px', background: 'rgba(0,0,0,0.2)' }}></div>
                            <div style={{ position: 'absolute', top: '0', bottom: '0', left: '70%', width: '1px', background: 'rgba(0,0,0,0.2)' }}></div>
                          </div>
                        </div>
                        
                        <div style={{ zIndex: 1, marginTop: 'auto' }}>
                          <div style={{ fontSize: '1.35rem', letterSpacing: '4px', fontFamily: 'monospace', color: 'var(--foreground)', opacity: 0.9, marginBottom: '12px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            •••• •••• •••• {cardInfo?.last4 || "0000"}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--subtext)', marginBottom: '2px' }}>Posiadacz</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {session?.user?.name || session?.user?.email?.split('@')[0] || "KLIENT"}
                              </span>
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, fontStyle: 'italic', color: 'var(--foreground)', opacity: 0.7 }}>
                              {cardInfo?.brand?.toUpperCase() || "STRIPE"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {cancelAtPeriodEnd && expiryDate && (
                      <div className={styles.cancelNotice}>⚠️ Wygasa <strong>{expiryDate}</strong> — pełny dostęp do tego dnia.</div>
                    )}
                    <div className={styles.accountBtnRow}>
                      <button onClick={handleOpenPortal} disabled={isOpeningPortal} className={styles.accountBtnSecondary}>
                        {isOpeningPortal ? <RefreshCw className={styles["animate-spin"]} size={16} /> : <ExternalLink size={16} />}
                        Zarządzaj (Stripe)
                      </button>
                      <button onClick={() => router.push("/#cennik")} className={styles.accountBtnPrimary}>
                        <ArrowUpRight size={16} /> Upgrade
                      </button>
                    </div>
                    {!cancelAtPeriodEnd && (
                      <button onClick={handleCancelSubscription} disabled={isCancelingSubscription} className={styles.accountBtnCancel}>
                        {isCancelingSubscription ? <RefreshCw className={styles["animate-spin"]} size={16} /> : <Trash2 size={16} />}
                        Anuluj subskrypcję
                      </button>
                    )}
                  </div>

                  {/* ── Row 3: AI Credits ── */}
                  {(() => {
                    const pid         = subscriptionData?.stripePriceId;
                    const isBasic     = pid === PRICE_BASIC;
                    const isPro       = pid === PRICE_PRO;
                    const isMax       = pid === PRICE_MAX;
                    const isUnlimited = isMax;
                    const creditsRemaining = subscriptionData?.aiCredits ?? 0;
                    const creditsLimit = pid === PRICE_PRO ? 5000 : (pid === PRICE_BASIC ? 500 : (isMax ? Infinity : 50));
                    
                    const pctRemaining = isUnlimited ? 100 : Math.min(100, Math.max(0, Math.round((creditsRemaining / creditsLimit) * 100)));
                    const limitFmt     = (n: number) => n >= 90000000 ? "∞" : n.toLocaleString("pl-PL");
                    const barColor     = (pct: number) => pct <= 10 ? "#ef4444" : pct <= 30 ? "#f59e0b" : "#635BFF";

                    return (
                      <div className={styles.accountSectionCard}>
                        <div className={styles.accountSectionHeader}>
                          <Zap size={16} style={{ color: "#635BFF", flexShrink: 0 }} />
                          <span>Kredyty AI</span>
                          {isUnlimited && (
                            <span className={`${styles.infoBadge} ${styles.infoBadgeSuccess}`} style={{ marginLeft: "auto" }}>MAX — bez limitów</span>
                          )}
                        </div>
                        <div className={styles.limitsGrid} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {/* Credits limit */}
                          <div className={styles.limitItem}>
                            <div className={styles.limitItemHeader}>
                              <span className={styles.limitItemLabel}>Pozostałe Kredyty:</span>
                              <span className={styles.limitItemCount} style={{ color: isUnlimited ? "#22c55e" : pctRemaining <= 10 ? "#ef4444" : "var(--subtext)", fontWeight: 700, fontSize: "1.1rem" }}>
                                {isUnlimited ? "∞" : `${limitFmt(creditsRemaining)}`}
                              </span>
                            </div>
                            {!isUnlimited && (
                              <div className={styles.limitBar} style={{ height: "10px", borderRadius: "10px", background: "var(--bg-secondary)" }}>
                                <div className={styles.limitBarFill} style={{ width: `${pctRemaining}%`, background: `linear-gradient(90deg, ${barColor(pctRemaining)}cc, ${barColor(pctRemaining)})`, height: "100%", borderRadius: "10px", transition: "width 0.3s ease" }} />
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--subtext)", marginTop: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Mail size={12}/> Odpowiedź mail: 10</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Users size={12}/> Wygenerowanie leada: 10</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Search size={12}/> Analiza konkurencji: 20</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Row 4: Integracje ── */}
                  <div className={styles.accountSectionCard} style={{ marginTop: "8px" }}>
                    <div className={styles.accountSectionHeader}>
                      <ShieldAlert size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <span>Integracja E-mail</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", padding: "20px 24px", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                            Status Połączenia Gmail
                            {hasAppPassword ? (
                              <span style={{ fontSize: "0.75rem", background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", padding: "3px 8px", borderRadius: "20px", fontWeight: 600 }}>Połączono</span>
                            ) : (
                              <span style={{ fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "3px 8px", borderRadius: "20px", fontWeight: 600 }}>Wymagane Hasło</span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "var(--subtext)" }}>
                            {hasAppPassword 
                              ? `Aktywne konto Gmail: ${session?.user?.email}` 
                              : `Należy podpiąć hasło aplikacji dla konta: ${session?.user?.email}`
                            }
                          </div>
                        </div>
                        <button 
                          className={hasAppPassword ? styles.accountBtnSecondary : styles.accountBtnPrimary}
                          style={{ flex: "none", width: "auto", padding: "10px 18px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}
                          onClick={async () => {
                            setHasAppPassword(false);
                            setCurrentTab("INBOX");
                          }}
                        >
                          {hasAppPassword ? "Zmień hasło" : "Podepnij pocztę Gmail"}
                        </button>
                      </div>

                      {/* Helper notice explaining what to do */}
                      <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", fontSize: "0.85rem", color: "var(--subtext)", lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Info size={14} style={{ color: "var(--primary)" }} />
                          Gdzie wpisać Hasło Aplikacji?
                        </div>
                        Po kliknięciu przycisku powyżej zostaniesz przeniesiony do widoku Skrzynki. Zobaczysz tam 4-krokowy kreator, w którym wygenerujesz i wkleisz 16-literowe hasło aplikacji wygenerowane w ustawieniach bezpieczeństwa Google.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* STRATEGIC AGENT VIEW */}
          {currentTab === "STRATEGY" && (
            <div className="animate-fade-in" style={{ flex: 1, padding: "24px 16px", overflowY: "auto", background: 'var(--background)' }}>
              <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Header & Search Bar */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0A2540", margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Agent Strategiczny (Raport Witryny)</h2>
                  <p style={{ color: "#64748B", fontSize: "0.92rem", margin: 0, lineHeight: 1.5 }}>Wprowadź adres URL swojej firmy lub konkurenta, aby Agent AI wygenerował profesjonalny raport rynkowy i analizę SWOT.</p>
                  
                  <div style={{ marginTop: '20px', background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(10,37,64,0.04)' }}>
                    {strategyResults && !isAnalyzingStrategy ? (
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '2px' }}>Adres strony</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A2540' }}>{strategyUrl}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.88rem', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '8px' }}>✓ Raport zapisany</span>
                          <button
                            onClick={() => {
                              setStrategyResults(null);
                              localStorage.removeItem("meskiStrategyResults");
                            }}
                            style={{ background: '#F1F5F9', color: '#0A2540', border: '1px solid #E2E8F0', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Zmień stronę
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.strategySearchRow} style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
                          <Search size={18} style={{ color: '#635BFF', flexShrink: 0 }} />
                          <input 
                            type="text"
                            value={strategyUrl}
                            onChange={(e) => setStrategyUrl(e.target.value)}
                            placeholder="np. twojastrona.pl"
                            style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 10px', color: '#0A2540', fontSize: '0.95rem', outline: 'none' }}
                          />
                        </div>
                        <button 
                          onClick={handleAnalyzeStrategy}
                          disabled={isAnalyzingStrategy || !strategyUrl}
                          className={styles.strategyAnalyzeBtn}
                          style={{ background: '#635BFF', color: '#FFFFFF', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', cursor: (isAnalyzingStrategy || !strategyUrl) ? 'not-allowed' : 'pointer', opacity: (isAnalyzingStrategy || !strategyUrl) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(99, 91, 255, 0.25)', transition: 'all 0.2s' }}
                        >
                          {isAnalyzingStrategy && <RefreshCw className="animate-spin" size={16} />}
                          {isAnalyzingStrategy ? 'Pobieranie...' : 'Zapisz i Analizuj (AI)'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isAnalyzingStrategy && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#64748B', background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '24px', boxShadow: '0 4px 20px rgba(10,37,64,0.04)' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <div className={styles.pulseRing} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #635BFF', opacity: 0.2 }}></div>
                      <div className={styles.pulseRing} style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '2px solid #635BFF', opacity: 0.4, animationDelay: '0.5s' }}></div>
                      <div style={{ background: '#EEF2FF', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E0E7FF', zIndex: 10 }}>
                        <RefreshCw size={24} className="animate-spin" style={{ color: '#635BFF' }} />
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', marginBottom: '14px', textAlign: 'center' }}>
                      {strategyLoadingStep === 0 && "Skanowanie struktury strony i oferty..."}
                      {strategyLoadingStep === 1 && "Pobieranie szacunkowych danych rynkowych..."}
                      {strategyLoadingStep === 2 && "Analiza słów kluczowych i pozycji SEO..."}
                      {strategyLoadingStep === 3 && "Modelowanie strategii konkurencji..."}
                      {strategyLoadingStep === 4 && "Generowanie raportu wykonawczego przez AI..."}
                      {strategyLoadingStep === 5 && "Zakończono analizę."}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[0, 1, 2, 3, 4].map((step) => (
                        <div key={step} style={{ width: '36px', height: '4px', borderRadius: '2px', background: strategyLoadingStep >= step ? '#635BFF' : '#E2E8F0', transition: 'background 0.3s' }}></div>
                      ))}
                    </div>
                  </div>
                )}

                {strategyResults && !isAnalyzingStrategy && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* KEY METRICS */}
                    <div className={styles.strategyMetricsGrid}>
                      
                      <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '20px 24px', boxShadow: '0 4px 16px rgba(10,37,64,0.04)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Trudność SEO</div>
                          <TrendingUp size={20} style={{ color: '#635BFF' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0A2540', letterSpacing: '-1px' }}>{strategyResults.keyMetrics?.seoDifficulty || 0}</span>
                          <span style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 600 }}>/ 100</span>
                        </div>
                        <div style={{ marginTop: '12px', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${strategyResults.keyMetrics?.seoDifficulty || 0}%`, background: strategyResults.keyMetrics?.seoDifficulty > 70 ? '#EF4444' : strategyResults.keyMetrics?.seoDifficulty > 40 ? '#F59E0B' : '#10B981', borderRadius: '3px' }}></div>
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '20px 24px', boxShadow: '0 4px 16px rgba(10,37,64,0.04)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Średni CPC</div>
                          <DollarSign size={20} style={{ color: '#10B981' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0A2540', letterSpacing: '-1px' }}>{strategyResults.keyMetrics?.averageCpc || "N/A"}</span>
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '0.84rem', color: '#64748B' }}>
                          Szacowany koszt kliknięcia w Google Ads
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '20px 24px', boxShadow: '0 4px 16px rgba(10,37,64,0.04)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Trend Rynku</div>
                          <Activity size={20} style={{ color: '#F59E0B' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0A2540', letterSpacing: '-1px' }}>{strategyResults.marketOverview?.estimatedGrowth || "Stabilny"}</span>
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '0.84rem', color: '#64748B' }}>
                          {strategyResults.marketOverview?.mainTrend || "Ogólny trend wzrostowy w branży"}
                        </div>
                      </div>

                    </div>

                    {/* SWOT ANALYSIS */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 4px 20px rgba(10,37,64,0.04)' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 700 }}>Podsumowanie Wykonawcze</div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', margin: '0 0 24px 0', letterSpacing: '-0.01em' }}>Analiza SWOT & Pozycja Rynkowa</h3>
                      
                      <div className={styles.swotGrid}>
                        
                        {/* Strengths */}
                        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#10B981' }}>
                            <ArrowUpRight size={22} />
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Mocne Strony</h4>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {strategyResults.swotAnalysis?.strengths?.map((item: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#0A2540', lineHeight: 1.5 }}>
                                <div style={{ color: '#10B981', flexShrink: 0, fontWeight: 700 }}>•</div>{item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '16px', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#EF4444' }}>
                            <ArrowDownRight size={22} />
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Słabe Strony</h4>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {strategyResults.swotAnalysis?.weaknesses?.map((item: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#0A2540', lineHeight: 1.5 }}>
                                <div style={{ color: '#EF4444', flexShrink: 0, fontWeight: 700 }}>•</div>{item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div style={{ background: '#EEF2FF', border: '1px solid #E0E7FF', borderRadius: '16px', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#635BFF' }}>
                            <Zap size={22} />
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Szanse</h4>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {strategyResults.swotAnalysis?.opportunities?.map((item: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#0A2540', lineHeight: 1.5 }}>
                                <div style={{ color: '#635BFF', flexShrink: 0, fontWeight: 700 }}>•</div>{item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Threats */}
                        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '16px', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#D97706' }}>
                            <ShieldAlert size={22} />
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Zagrożenia</h4>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {strategyResults.swotAnalysis?.threats?.map((item: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#0A2540', lineHeight: 1.5 }}>
                                <div style={{ color: '#D97706', flexShrink: 0, fontWeight: 700 }}>•</div>{item}
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                      
                      <div style={{ marginTop: '20px', padding: '16px 20px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '0.95rem', lineHeight: 1.55, color: '#0A2540' }}>
                        <strong style={{ color: '#635BFF' }}>Werdykt AI:</strong> {strategyResults.marketOverview?.summary}
                      </div>
                    </div>

                    {/* COMPETITORS & ACTION PLAN */}
                    <div className={styles.competitorPlanGrid}>
                      
                      {/* Competitors Table/Cards */}
                      <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 4px 20px rgba(10,37,64,0.04)', flex: 2, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 700 }}>Mapa Rynku</div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', margin: '0 0 20px 0', letterSpacing: '-0.01em' }}>Główni Konkurenci</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {strategyResults.competitors?.map((comp: any, i: number) => (
                            <div 
                              key={i} 
                              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px 18px' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EEF2FF', border: '1px solid #E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#635BFF', flexShrink: 0 }}>
                                    <Target size={18} />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A2540' }}>{comp.name}</div>
                                    <a 
                                      href={comp.url?.startsWith('http') ? comp.url : `https://${comp.url}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      style={{ fontSize: '0.82rem', color: '#635BFF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                    >
                                      {comp.url} <ArrowUpRight size={13} />
                                    </a>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                                  <Activity size={13} style={{ color: '#64748B' }} />
                                  <span style={{ color: '#64748B' }}>Ruch:</span>
                                  <strong style={{ color: '#0A2540', fontWeight: 700 }}>{comp.trafficEstimate}</strong>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Przewaga:</span>
                                  <span style={{ color: '#0A2540' }}>{comp.mainAdvantage}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ color: '#64748B', fontWeight: 600, flexShrink: 0 }}>Luka:</span>
                                  <span style={{ color: '#0A2540', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Sparkles size={13} style={{ color: '#F59E0B' }} />
                                    {comp.strategyGap}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Plan */}
                      <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 4px 20px rgba(10,37,64,0.04)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 700 }}>Rekomendacje</div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0A2540', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckSquare size={22} style={{ color: '#10B981' }} /> Action Plan
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                          {strategyResults.actionPlan?.map((plan: string, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, marginTop: '2px' }}>
                                {i + 1}
                              </div>
                              <div style={{ fontSize: '0.92rem', color: '#0A2540', lineHeight: 1.55 }}>
                                {plan}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => { setDashboardMode("CLIENTS"); setCurrentTab("CLIENTS" as any); }}
                          style={{ marginTop: '28px', width: '100%', background: '#635BFF', color: '#FFFFFF', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '0.98rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(99, 91, 255, 0.25)', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#5249E0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#635BFF'; e.currentTarget.style.transform = 'none'; }}
                        >
                          Generuj Leady dla tej strategii <ArrowRight size={18} />
                        </button>
                      </div>

                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CLIENTS VIEW */}
          {currentTab === "CLIENTS" as any && (
            <div className="animate-fade-in" style={{ flex: 1, padding: "24px 16px", overflowY: "auto" }}>
              <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* 1. Header & Stats Panel */}
                <div className={styles.leadHeaderRow}>
                  <div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0A2540", margin: 0, letterSpacing: '-0.02em' }}>Baza Leadów</h2>
                    <p style={{ color: "#64748B", fontSize: "0.92rem", marginTop: '6px', maxWidth: '600px', lineHeight: 1.5 }}>
                      Zarządzaj wygenerowanymi leadami i wysyłaj spersonalizowane oferty Cold Email przez AI.
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '16px', padding: '12px 20px', boxShadow: '0 2px 10px rgba(10,37,64,0.03)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#64748B' }}>Wszystkie</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0A2540', marginTop: '2px' }}>{leads.length}</span>
                    </div>
                    <div style={{ width: '1px', background: '#E6EBF1', margin: '0 4px' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#64748B' }}>Gorące</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>{leads.filter(l => l.probability >= 80).length}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Toolbar */}
                <div className={styles.leadToolbar}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    Widok: Aktywne Lead'y
                  </div>
                  <button 
                    onClick={handleGenerateLeads}
                    disabled={generatingLeads}
                    className={styles.leadSearchBtn}
                  >
                    {generatingLeads ? (
                      <><RefreshCw size={16} className="animate-spin" /> Analiza rynku...</>
                    ) : (
                      <><Search size={16} /> Szukaj nowych leadów (AI)</>
                    )}
                  </button>
                </div>

                {/* 3. Empty State */}
                {leads.length === 0 && !generatingLeads && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '24px' }}>
                    <Users size={56} style={{ color: '#635BFF', opacity: 0.6, margin: '0 auto 20px' }} />
                    <h3 style={{ color: '#0A2540', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>Brak leadów w systemie</h3>
                    <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: 1.55, fontSize: '0.9rem' }}>Kliknij przycisk "Szukaj nowych leadów", aby sztuczna inteligencja rozpoczęła analizę rynku dla Twojej firmy.</p>
                  </div>
                )}

                {/* 4. New Leads Section */}
                {leads.filter(l => l.status === "NEW").length > 0 && (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {leads.filter(l => l.status === "NEW").map((lead) => (
                        <div key={lead.id} className={styles.leadCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '240px' }}>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2540', margin: '0 0 6px 0' }}>{lead.name}</h3>
                              <p style={{ color: '#64748B', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>{lead.description}</p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div style={{ 
                                background: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                color: '#475569', 
                                padding: '4px 10px', 
                                borderRadius: '8px', 
                                fontSize: '0.72rem', 
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}>
                                {lead.source}
                              </div>
                              <div style={{ 
                                background: lead.probability >= 80 ? '#ECFDF5' : lead.probability >= 60 ? '#FFFBEB' : '#FEF2F2', 
                                border: `1px solid ${lead.probability >= 80 ? '#A7F3D0' : lead.probability >= 60 ? '#FDE68A' : '#FEE2E2'}`,
                                color: lead.probability >= 80 ? '#10B981' : lead.probability >= 60 ? '#D97706' : '#EF4444', 
                                padding: '4px 10px', 
                                borderRadius: '8px', 
                                fontSize: '0.72rem', 
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                {lead.probability}% dopasowania
                              </div>
                            </div>
                          </div>
  
                          <div className={styles.leadBtnRow}>
                            <button 
                              onClick={() => handleOpenContactModal(lead)}
                              style={{ 
                                background: '#635BFF', 
                                color: '#FFFFFF', 
                                border: 'none', 
                                padding: '10px 18px', 
                                borderRadius: '10px', 
                                fontWeight: 600, 
                                fontSize: '0.88rem',
                                cursor: 'pointer', 
                                transition: 'all 0.2s', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(99,91,255,0.25)'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#5249E0'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#635BFF'; e.currentTarget.style.transform = 'none'; }}
                            >
                              <Sparkles size={16} /> Napisz (AI Cold Email)
                            </button>
                            <button 
                              onClick={() => handleUpdateLeadStatus(lead.id, "CONTACTED")}
                              style={{ 
                                background: '#F1F5F9', 
                                color: '#475569', 
                                border: '1px solid #E2E8F0', 
                                padding: '10px 16px', 
                                borderRadius: '10px', 
                                fontWeight: 600, 
                                fontSize: '0.88rem',
                                cursor: 'pointer', 
                                transition: 'all 0.2s', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '6px' 
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                            >
                              <CheckCircle size={16} /> Oznacz jako kontakt
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
              
              {/* Modal moved to the root to fix position: fixed centering issues */}
            </div>
          )}

          {/* ORDERS VIEW */}
          {currentTab === "ORDERS" as any && (
            <div className="animate-fade-in" style={{ flex: 1, padding: "32px 24px", overflowY: "auto" }}>
              <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", display: 'flex', flexDirection: 'column', gap: '40px' }}>
                
                {/* 1. Header & Stats Panel */}
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                  <div style={{ flex: '1 1 500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: "2rem", fontWeight: 600, color: "var(--foreground)", margin: 0, letterSpacing: '-0.5px' }}>Integracja Sklepu E-commerce</h2>
                      <span style={{ background: 'rgba(52,199,89,0.12)', color: '#34c759', border: '1px solid rgba(52,199,89,0.3)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34c759', display: 'inline-block' }}></span>
                        WEBHOOK AKTYWNY
                      </span>
                    </div>
                    <p style={{ color: "var(--subtext)", fontSize: "0.95rem", marginTop: '4px', maxWidth: '620px', lineHeight: 1.5 }}>
                      Polacz swoj sklep przez Webhook - zamowienia beda przesylane bezposrednio do Agenta, dzieki czemu sprawdzi on statusy wysylek i dostepnosc produktow w czasie rzeczywistym.
                    </p>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowAddOrderModal(true)}
                    style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={18} /> Reczne zamowienie
                  </button>
                </div>

                {/* 1.5 Webhook Integration Configuration Panel */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '24px 24px', boxShadow: 'var(--mac-shadow)', position: 'relative', overflow: 'hidden' }}>
                  {/* Background accent */}
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle at 100% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>Polaczenie ze sklepem</h3>
                      <p style={{ margin: 0, color: 'var(--subtext)', fontSize: '0.85rem' }}>
                        Skonfiguruj integracje przez Webhook, aby Agent mial staly dostep do danych o zamowieniach.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: 'var(--foreground)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                      Nie potrzebujesz kluczy API, hasel ani kont deweloperskich. Po prostu skopiuj ponizszy adres URL i wklej go w panelu swojego sklepu:
                    </p>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--input-bg)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/orders?userId=${session?.user?.id || ''}`}
                        style={{ flex: '1 1 300px', background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none' }}
                        id="webhook-url-input"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('webhook-url-input') as HTMLInputElement;
                          if (input) {
                            input.select();
                            navigator.clipboard.writeText(input.value);
                            showToast("Skopiowano link do schowka!", "success");
                          }
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                      >
                        Kopiuj link
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '8px' }}>
                      <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.2)', fontSize: '0.82rem', color: 'var(--subtext)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--foreground)' }}>Jak dodac w Shopify (1 min):</strong><br/>
                        1. Wejdz w Shopify Admin &rarr; Settings &rarr; Notifications.<br/>
                        2. Przewin na sam dol do sekcji Webhooks i kliknij Create webhook.<br/>
                        3. Wybierz Event: Order creation, Format: JSON i wklej skopiowany URL.<br/>
                        4. Kliknij Zapisz. (Zalecamy dodac drugi webhook dla Order update).
                      </div>
                      <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', fontSize: '0.82rem', color: 'var(--subtext)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--foreground)' }}>Jak dodac w WooCommerce (1 min):</strong><br/>
                        1. Wejdz w WordPress &rarr; WooCommerce &rarr; Settings &rarr; Advanced &rarr; Webhooks.<br/>
                        2. Kliknij Add webhook.<br/>
                        3. Nazwij go (np. "MESKIAI"), ustaw status na Active.<br/>
                        4. Wybierz Topic: Order created i wklej skopiowany URL w pole Delivery URL.<br/>
                        5. Kliknij Zapisz. (Dodaj drugi dla Order updated).
                      </div>
                    </div>
                  </div>
                </div>


                {/* 1.5. Information Banner */}
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  padding: '20px 24px', 
                  borderRadius: '16px', 
                  background: 'rgba(59, 130, 246, 0.04)', 
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  fontSize: '0.9rem',
                  color: 'var(--foreground)',
                  lineHeight: 1.5,
                  alignItems: 'flex-start'
                }}>
                  <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>Jak Agent AI pozyskuje wiedzę i zapobiega zmyślaniu (halucynacjom)?</strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--subtext)' }}>
                      <li>
                        <strong>Baza zamówień:</strong> Przy pytaniu o zamówienie Agent wyciągnie numer (np. #1024) lub e-mail nadawcy i pobierze dane z tabeli poniżej.
                      </li>
                      <li>
                        <strong>Kategoryczny zakaz zmyślania:</strong> Jeśli zamówienia nie ma w bazie, Agent <u>nigdy</u> nie zmyśli statusu ani linku. Poprosi klienta o poprawne dane lub oznaczy maila jako <strong>Wymaga uwagi (REQUIRES_ATTENTION)</strong>, abyś mógł odpowiedzieć ręcznie.
                      </li>
                      <li>
                        <strong>Ogólne zasady sklepu:</strong> Informacje o regulaminie, polityce zwrotów i asortymencie Agent pobiera z Twojej <strong>Bazy Wiedzy (AI)</strong> oraz automatycznie skanuje z Twojej witryny firmowej.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 2. Orders Table / Empty State */}
                {loadingOrders ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <RefreshCw className={styles['animate-spin']} size={24} style={{ color: 'var(--subtext)' }} />
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: 'var(--mac-shadow)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <CheckSquare size={28} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--foreground)', margin: '0 0 8px 0' }}>Baza zamówień jest pusta</h4>
                      <p style={{ color: 'var(--subtext)', margin: 0, maxWidth: '400px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        Dodaj testowe zamówienie, np. nr #998822, a następnie wyślij maila z pytaniem o to zamówienie, aby przetestować asystenta.
                      </p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setShowAddOrderModal(true)}>
                      Utwórz pierwsze zamówienie
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--mac-shadow)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--subtext)', fontWeight: 600 }}>
                          <th style={{ padding: '16px 20px' }}>Numer zamówienia</th>
                          <th style={{ padding: '16px 20px' }}>E-mail klienta</th>
                          <th style={{ padding: '16px 20px' }}>Zakupione produkty</th>
                          <th style={{ padding: '16px 20px' }}>Kwota</th>
                          <th style={{ padding: '16px 20px' }}>Status</th>
                          <th style={{ padding: '16px 20px' }}>Link śledzenia</th>
                          <th style={{ padding: '16px 20px', textAlign: 'right' }}>Akcje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((ord) => (
                          <tr key={ord.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground)' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 600 }}>#{ord.orderNumber}</td>
                            <td style={{ padding: '16px 20px', color: 'var(--subtext)' }}>{ord.customerEmail}</td>
                            <td style={{ padding: '16px 20px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.items}</td>
                            <td style={{ padding: '16px 20px', fontWeight: 500 }}>{ord.totalPrice}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '0.78rem', 
                                fontWeight: 600,
                                background: ord.status === 'Wysłane' ? 'rgba(52,199,89,0.1)' : 
                                            ord.status === 'Dostarczone' ? 'rgba(59,130,246,0.1)' :
                                            ord.status === 'Opłacone' ? 'rgba(16,185,129,0.1)' :
                                            ord.status === 'Anulowane' ? 'rgba(239,68,68,0.1)' : 'rgba(255,149,0,0.1)',
                                color: ord.status === 'Wysłane' ? '#34c759' : 
                                       ord.status === 'Dostarczone' ? '#3b82f6' :
                                       ord.status === 'Opłacone' ? '#10b981' :
                                       ord.status === 'Anulowane' ? '#ef4444' : '#ff9500'
                              }}>
                                {ord.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '0.85rem' }}>
                              {ord.trackingUrl ? (
                                <a href={ord.trackingUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                  Śledź paczkę <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span style={{ color: 'var(--border)' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                              <button 
                                onClick={() => handleDeleteOrder(ord.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* APP PASSWORD PROMPT */}
          {!hasAppPassword && ["INBOX", "IMPORTANT", "SENT", "SPAM"].includes(currentTab) && (
            <div className="animate-fade-in" style={{ padding: "24px 16px", display: "flex", justifyContent: "center", alignItems: "flex-start", height: "100%", flex: 1, width: "100%", overflowY: "auto" }}>
              <div style={{ maxWidth: "600px", width: "100%", background: "#FFFFFF", borderRadius: "24px", padding: "32px 24px", border: "1px solid #E6EBF1", boxShadow: "0 10px 40px rgba(10, 37, 64, 0.08)", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <ShieldAlert size={32} />
                  </div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0A2540", marginBottom: "8px", letterSpacing: "-0.02em" }}>Wymagane Hasło Aplikacji Google</h2>
                  <p style={{ color: "#64748B", fontSize: "0.92rem", lineHeight: 1.55 }}>
                    Aby Agent AI mógł bezpiecznie czytać i odpowiadać na Twoje maile bez przerw, musisz wygenerować <strong>Hasło Aplikacji</strong> w swoim koncie Google.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '16px' }}>
                  
                  {/* Step 1 */}
                  <div className={styles.gmailStepCard} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px 20px', transition: 'all 0.2s' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EEF2FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0, border: '1px solid #E0E7FF' }}>1</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 700, color: '#0A2540' }}>Włącz logowanie dwuetapowe (2FA)</h4>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45 }}>Jest to absolutnie wymagane przez Google, aby wygenerować Hasło Aplikacji.</p>
                    </div>
                    <a href="https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome" target="_blank" rel="noreferrer" className={styles.gmailStepBtn} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0A2540', textDecoration: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                      Włącz 2FA <ExternalLink size={14} color="#635BFF" />
                    </a>
                  </div>

                  {/* Step 2 */}
                  <div className={styles.gmailStepCard} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px 20px', transition: 'all 0.2s' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EEF2FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0, border: '1px solid #E0E7FF' }}>2</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 700, color: '#0A2540' }}>Włącz POP w Gmailu</h4>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45 }}>Zaznacz opcję <strong>"Włącz POP dla poczty otrzymywanej od tej chwili"</strong> i kliknij Zapisz Zmiany.</p>
                    </div>
                    <a href="https://mail.google.com/mail/u/0/#settings/fwdandpop" target="_blank" rel="noreferrer" className={styles.gmailStepBtn} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0A2540', textDecoration: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                      Ustawienia POP <ExternalLink size={14} color="#635BFF" />
                    </a>
                  </div>

                  {/* Step 3 */}
                  <div className={styles.gmailStepCard} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px 20px', transition: 'all 0.2s' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0, border: '1px solid #A7F3D0' }}>3</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 700, color: '#0A2540' }}>Utwórz Hasło Aplikacji</h4>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45 }}>Google poprosi Cię o podanie nazwy (np. "MESKIAI"). <br/><em style={{ opacity: 0.85 }}>Wymaga włączonego logowania dwuetapowego (2FA).</em></p>
                    </div>
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className={styles.gmailStepBtn} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0A2540', textDecoration: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                      Utwórz Hasło <ExternalLink size={14} color="#635BFF" />
                    </a>
                  </div>

                  {/* Step 4 */}
                  <div className={styles.gmailStepCard} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px 20px', transition: 'all 0.2s' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F5F3FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0, border: '1px solid #E0E7FF' }}>4</div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 700, color: '#0A2540' }}>Wklej wygenerowane 16-literowe hasło</h4>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45 }}>Możesz wkleić je ze spacjami lub bez.</p>
                      </div>
                      
                      <div className={styles.gmailInputRow} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
                        <input 
                          type="text" 
                          value={appPasswordInput}
                          onChange={e => { setAppPasswordInput(e.target.value); setAppPasswordError(""); }}
                          placeholder="xxxx xxxx xxxx xxxx"
                          className={styles.input}
                          style={{ flex: '1 1 200px', padding: "12px 16px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#0A2540", fontSize: "1.05rem", letterSpacing: '1px', minWidth: '0' }}
                        />
                        <button 
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
                              try { data = await res.json(); } catch(e) {}
                              
                              if (res.ok) {
                                setHasAppPassword(true);
                                showToast("Hasło poprawne! Trwa pierwsza synchronizacja e-maili. Zajmie to około 1-2 minuty...", "success");
                                handleSync();
                              } else {
                                setAppPasswordError(data.error || "Serwer odrzucił połączenie. Upewnij się, że wkleiłeś poprawne hasło (to 16 znaków, a nie Twoje główne hasło do poczty).");
                              }
                            } catch(e) {
                              setAppPasswordError("Błąd połączenia z serwerem. Spróbuj ponownie.");
                            }
                            setSavingAppPassword(false);
                          }}
                          style={{ padding: "12px 24px", whiteSpace: "nowrap", flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#635BFF', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(99, 91, 255, 0.25)', cursor: 'pointer' }}
                        >
                          {savingAppPassword ? <RefreshCw className={styles['animate-spin']} size={16} /> : <CheckCircle size={16} style={{ marginRight: '6px' }} />}
                          Połącz z AI
                        </button>
                      </div>
                      
                      {/* App Password warning banner */}
                      <div style={{ 
                        display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '12px', 
                        background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: '0.82rem', color: '#92400E', lineHeight: 1.45 
                      }}>
                        <Info size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#D97706' }} />
                        <div>
                          <strong>Ważne bezpieczeństwo:</strong> Wklej tutaj 16-literowe hasło aplikacji wygenerowane w ustawieniach Google. Zwykłe główne hasło do poczty Gmail <strong>nie zadziała</strong> ze względów bezpieczeństwa.
                        </div>
                      </div>

                      {appPasswordError && (
                        <div style={{ color: "#DC2626", fontSize: "0.85rem", background: "#FEF2F2", padding: "10px 14px", borderRadius: "10px", border: "1px solid #FEE2E2" }}>
                          {appPasswordError}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* MOBILE MAIL FOLDER TABS BAR */}
          {hasAppPassword && ["INBOX", "IMPORTANT", "SENT", "SPAM"].includes(currentTab) && !selectedThread && (
            <div className={styles.mobileMailFolderTabs}>
              <button 
                className={`${styles.mobileFolderTab} ${currentTab === 'INBOX' ? styles.activeFolderTab : ''}`}
                onClick={() => { setCurrentTab('INBOX'); setSelectedThread(null); }}
              >
                Do Akceptacji ({(threads || []).filter(t => t.status === 'PENDING_APPROVAL').length})
              </button>
              <button 
                className={`${styles.mobileFolderTab} ${currentTab === 'IMPORTANT' ? styles.activeFolderTab : ''}`}
                onClick={() => { setCurrentTab('IMPORTANT'); setSelectedThread(null); }}
              >
                Ważne ({(threads || []).filter(t => t.status === 'REQUIRES_ATTENTION').length})
              </button>
              <button 
                className={`${styles.mobileFolderTab} ${currentTab === 'SENT' ? styles.activeFolderTab : ''}`}
                onClick={() => { setCurrentTab('SENT'); setSelectedThread(null); }}
              >
                Wysłane ({(threads || []).filter(t => t.status === 'REPLIED' || t.status === 'AUTO_REPLIED').length})
              </button>
              <button 
                className={`${styles.mobileFolderTab} ${currentTab === 'SPAM' ? styles.activeFolderTab : ''}`}
                onClick={() => { setCurrentTab('SPAM'); setSelectedThread(null); }}
              >
                Spam ({(threads || []).filter(t => t.status === 'IGNORED' && !t.threadId?.startsWith('HISTORY_')).length})
              </button>
            </div>
          )}

          {/* THREADS LIST (INBOX, SENT, SPAM) */}
          {hasAppPassword && ["INBOX", "IMPORTANT", "SENT", "SPAM"].includes(currentTab) && (
            <div className={`animate-fade-in ${styles.threadListPanel} ${selectedThread ? styles.hasSelection : ''}`}>
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
                        onClick={async () => {
                          // Show the thread immediately with the preview data (1 email)
                          setSelectedThread(thread);
                          setShowManualReply(false);
                          if (thread.status === 'REQUIRES_ATTENTION') {
                            setEditedReply(getCleanDraftReply(thread.draftReply));
                          } else {
                            setEditedReply(thread.draftReply || "");
                          }
                          // Then fetch full conversation history (all emails) in the background
                          try {
                            const fullRes = await fetch(`/api/threads/${thread.id}`);
                            if (fullRes.ok) {
                              const fullData = await fullRes.json();
                              setSelectedThread(fullData.thread);
                            }
                          } catch (e) {
                            console.error("Failed to load full thread:", e);
                          }
                        }}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className={styles.threadHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={styles.sender}>
                              {currentTab === "SENT" || latestEmail.isFromAgent 
                                ? `Do: ${latestEmail.to.split('<')[0]}` 
                                : latestEmail.from.split('<')[0]}
                            </span>
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
                        
                        {/* Topic indicator */}
                        {(() => {
                          const topic = detectThreadTopic(thread.emails);
                          if (!topic) return null;
                          return (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '4px', background: topic.bg, border: `1px solid ${topic.border}`, color: topic.color, fontSize: '0.72rem', fontWeight: 600, marginTop: '4px', marginBottom: '8px', marginRight: '6px' }}>
                              <span>{topic.emoji}</span>
                              <span>{topic.label}</span>
                            </div>
                          );
                        })()}

                        <div 
                          className={styles.statusBadge} 
                          data-status={thread.status === 'REQUIRES_ATTENTION' && (thread.emails || []).some((e: any) => e.isFromAgent) ? 'PENDING_APPROVAL' : thread.status}
                          style={thread.status === 'REQUIRES_ATTENTION' && (thread.emails || []).some((e: any) => e.isFromAgent) ? { background: 'rgba(245,158,11,0.12)', color: '#d97706', boxShadow: 'none' } : {}}
                        >
                          {isPending ? 'Do Akceptacji' : thread.status === 'AUTO_REPLIED' ? 'Auto-odpowiedź' : thread.status === 'IGNORED' ? 'Spam' : thread.status === 'REQUIRES_ATTENTION' ? ((thread.emails || []).some((e: any) => e.isFromAgent) ? 'W toku (Odpisano)' : 'Wymaga Uwagi') : 'Wysłano'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* THREAD VIEW */}
          {hasAppPassword && ["INBOX", "IMPORTANT", "SENT", "SPAM"].includes(currentTab) && (
            <div className={`animate-fade-in animate-delay-1 ${styles.threadViewPanel} ${!selectedThread ? styles.noSelection : ''}`}>
              {!selectedThread ? (
                <div className={styles.emptyState}>Wybierz wiadomość z listy po lewej stronie.</div>
              ) : (
                <>
                  <div className={styles.threadViewHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <button 
                        className={styles.mobileBackButton}
                        onClick={() => setSelectedThread(null)}
                      >
                        <ChevronLeft size={20} color="#635BFF" /> Skrzynka
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EEF2FF', color: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.88rem', border: '1px solid #E0E7FF', flexShrink: 0 }}>
                          {selectedThread.emails[0]?.from ? selectedThread.emails[0].from.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0A2540', margin: 0, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedThread.emails[0]?.subject}
                          </h2>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedThread.emails[0]?.from.split('<')[0]}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      style={{ background: 'transparent', color: '#EF4444', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '8px', flexShrink: 0 }}
                      onClick={() => handleDeleteThread(selectedThread.id)}
                      disabled={deleting}
                      title="Usuń wątek"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className={styles.conversationHistory}>
                    {(selectedThread.emails || []).map((email: any) => (
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

                  {/* ── AI draft + send section (PENDING_APPROVAL / REQUIRES_ATTENTION when not yet replied) ── */}
                  {((selectedThread.status === 'PENDING_APPROVAL' || selectedThread.status === 'REQUIRES_ATTENTION') && !isRepliedImportant) && (
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
                                setEditedReply(data.draftReply || data.reply || "");
                                await fetchThreads();
                              } else {
                                showToast("Nie udało się wygenerować odpowiedzi.", "error");
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

                      {selectedThread.status === 'REQUIRES_ATTENTION' && selectedThread.draftReply && (
                        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px', fontWeight: 600 }}>
                            <AlertTriangle size={16} /> Analiza Agenta (Nie zostanie wysłana do klienta)
                          </h4>
                          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                            {getAgentAnalysis(selectedThread.draftReply)}
                          </div>
                        </div>
                      )}

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

                  {/* ── Sent / replied / important-already-replied / ignored: show status + always-available manual reply ── */}
                  {((selectedThread.status !== 'PENDING_APPROVAL' && selectedThread.status !== 'REQUIRES_ATTENTION') || isRepliedImportant) && (
                    <div className={styles.approvalSection}>
                      <div className={styles.successMessage}>
                        {selectedThread.status === 'IGNORED' ? (
                          <><AlertCircle size={18} color="#f59e0b" /> Zignorowano (Bot/Spam)</>
                        ) : (
                          <><CheckCircle size={18} color="#10b981" /> Odpowiedź została wysłana</>
                        )}
                      </div>

                      {/* Display unresolved warning for REQUIRES_ATTENTION threads that have a reply */}
                      {selectedThread.status === 'REQUIRES_ATTENTION' && (
                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <AlertCircle size={18} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--foreground)' }}>Niedokończona sprawa (W toku)</div>
                              <p style={{ fontSize: '0.78rem', color: 'var(--subtext)', marginTop: '4px', lineHeight: 1.4 }}>
                                Agent AI (lub Ty) wysłał już wiadomość w tym wątku, ale sprawa nadal widnieje jako ważna w toku. Jeśli cała sprawa z klientem jest załatwiona, kliknij przycisk poniżej, aby ją zarchiwizować.
                              </p>
                            </div>
                          </div>
                          <button
                            className="btn btn-primary"
                            style={{ background: '#d97706', color: 'white', fontSize: '0.82rem', padding: '8px 16px', alignSelf: 'flex-start', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => handleResolveThread(selectedThread.id)}
                            disabled={resolvingThread}
                          >
                            {resolvingThread ? <RefreshCw size={14} className={styles['animate-spin']} /> : <CheckCircle size={14} />}
                            Zakończ sprawę (Zarchiwizuj)
                          </button>
                        </div>
                      )}

                      {/* Always-available manual reply toggle */}
                      {selectedThread.status !== 'IGNORED' && (
                        <div style={{ marginTop: '16px' }}>
                          {!showManualReply ? (
                            <button
                              className="btn btn-secondary"
                              style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '10px' }}
                              onClick={() => { setShowManualReply(true); setEditedReply(''); }}
                            >
                              <Send size={15} />
                              Napisz kolejną odpowiedź
                            </button>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Send size={15} color="var(--primary)" /> Odpowiedz ręcznie
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button
                                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary)', cursor: isGeneratingManualReply ? 'not-allowed' : 'pointer', fontSize: '0.78rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
                                    disabled={isGeneratingManualReply}
                                    onClick={async () => {
                                      if (!selectedThread) return;
                                      setIsGeneratingManualReply(true);
                                      setEditedReply('Generowanie...');
                                      try {
                                        const res = await fetch(`/api/threads/${selectedThread.id}/generate`, { method: 'POST' });
                                        if (res.ok) {
                                          const data = await res.json();
                                          setEditedReply(data.draftReply || data.reply || '');
                                          await fetchThreads();
                                        } else {
                                          showToast('Nie udało się wygenerować odpowiedzi.', 'error');
                                          setEditedReply('');
                                        }
                                      } catch (e) {
                                        showToast('Błąd połączenia.', 'error');
                                        setEditedReply('');
                                      } finally {
                                        setIsGeneratingManualReply(false);
                                      }
                                    }}
                                  >
                                    {isGeneratingManualReply
                                      ? <><RefreshCw size={11} className={styles['animate-spin']} /> Generowanie...</>
                                      : <><Sparkles size={11} /> Generuj AI</>}
                                  </button>
                                  <button
                                    style={{ background: 'none', border: 'none', color: 'var(--subtext)', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 8px' }}
                                    onClick={() => { setShowManualReply(false); setEditedReply(''); }}
                                  >
                                    Anuluj
                                  </button>
                                </div>
                              </div>
                              <textarea
                                className={styles.textarea}
                                value={editedReply}
                                onChange={(e) => setEditedReply(e.target.value)}
                                placeholder="Wpisz swoją odpowiedź lub kliknij 'Generuj AI'..."
                                rows={5}
                                autoFocus
                                disabled={isGeneratingManualReply}
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-primary"
                                  onClick={async () => { await handleSendReply(); setShowManualReply(false); }}
                                  disabled={sending || !editedReply.trim() || isGeneratingManualReply}
                                >
                                  {sending ? <RefreshCw className={styles['animate-spin']} size={16} /> : <Send size={16} />}
                                  Wyślij
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── REQUIRES_ATTENTION already handled by owner (isRepliedImportant) — always show extra reply option ── */}
                  {(selectedThread.status === 'REQUIRES_ATTENTION' && !isRepliedImportant) && null /* handled above */}

                </>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Contact Lead Modal (moved to root for proper fixed positioning) */}
      {contactingLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10, 37, 64, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="animate-fade-in" style={{ background: '#FFFFFF', border: '1px solid #E6EBF1', borderRadius: '24px', padding: '32px 24px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 50px -10px rgba(10,37,64,0.15)', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setContactingLead(null)} 
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0A2540'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0A2540', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.02em' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EEF2FF', border: '1px solid #E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#635BFF' }}>
                <Sparkles size={20} />
              </div>
              Napisz (Cold Email) do: {contactingLead.name}
            </h3>
            
            {isGeneratingEmail ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '20px 0', 
                color: '#64748B',
                gap: '20px'
              }}>
                {/* AI Pulse Scanner Graphic */}
                <div style={{ 
                  position: 'relative', 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: '#EEF2FF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #E0E7FF'
                }}>
                  <div className="animate-spin" style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '50%',
                    border: '1.5px dashed #635BFF',
                    animationDuration: '8s'
                  }}></div>
                  <Sparkles size={26} style={{ color: '#635BFF', animation: 'pulse 2s infinite ease-in-out' }} />
                </div>

                <div style={{ textAlign: 'center', width: '100%' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0A2540', letterSpacing: '-0.01em' }}>
                    Agent AI projektuje wiadomość
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>
                    Trwa dopasowywanie oferty do profilu firmy odbiorcy.
                  </p>
                </div>

                {/* Steps container */}
                <div style={{ 
                  width: '100%', 
                  background: '#F8FAFC', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '16px', 
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {[
                    "Skanowanie profilu i danych kontaktowych",
                    "Analizowanie oferty i branży odbiorcy",
                    "Ustalanie optymalnej strategii dotarcia",
                    "Generowanie treści wiadomości przez MESKIAI"
                  ].map((stepText, idx) => {
                    const isDone = generationStep > idx;
                    const isActive = generationStep === idx;
                    return (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        opacity: isDone || isActive ? 1 : 0.4,
                        transition: 'opacity 0.3s ease'
                      }}>
                        {isDone ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0' }}>
                            <CheckCircle size={12} />
                          </div>
                        ) : isActive ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                            <RefreshCw size={13} className="animate-spin" style={{ color: '#635BFF' }} />
                          </div>
                        ) : (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #CBD5E1' }}></div>
                        )}
                        <span style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: isActive ? 700 : 500, 
                          color: isActive ? '#0A2540' : '#64748B' 
                        }}>
                          {stepText}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(generationStep + 1) * 25}%`, 
                    background: '#635BFF', 
                    borderRadius: '2px',
                    transition: 'width 0.4s ease-in-out' 
                  }}></div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px' }}>E-mail Odbiorcy</label>
                  <input 
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="np. kontakt@firma.pl"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0A2540', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#635BFF'; e.currentTarget.style.background = '#FFFFFF'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px' }}>Temat Wiadomości</label>
                  <input 
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0A2540', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#635BFF'; e.currentTarget.style.background = '#FFFFFF'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0A2540', marginBottom: '6px' }}>Treść Wiadomości</label>
                  <textarea 
                    value={contactBody}
                    onChange={(e) => setContactBody(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0A2540', fontSize: '0.9rem', minHeight: '180px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#635BFF'; e.currentTarget.style.background = '#FFFFFF'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button 
                    onClick={() => setContactingLead(null)}
                    style={{ padding: '11px 20px', fontWeight: 600, fontSize: '0.88rem', borderRadius: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={handleSendLeadEmail}
                    disabled={isSendingEmail}
                    style={{ padding: '11px 24px', fontWeight: 600, fontSize: '0.88rem', background: '#635BFF', border: 'none', borderRadius: '10px', color: '#FFFFFF', cursor: isSendingEmail ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(99, 91, 255, 0.25)', transition: 'all 0.2s', opacity: isSendingEmail ? 0.6 : 1 }}
                    onMouseEnter={(e) => { if (!isSendingEmail) { e.currentTarget.style.background = '#5249E0'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#635BFF'; e.currentTarget.style.transform = 'none'; }}
                  >
                    {isSendingEmail ? <><RefreshCw size={16} className="animate-spin" /> Wysyłam...</> : <><Send size={16} /> Wyślij</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Toast Notification Overlay */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? 'var(--error-bg, rgba(255, 59, 48, 0.9))' : toast.type === 'success' ? 'var(--success-bg, rgba(52, 199, 89, 0.9))' : 'var(--card-bg)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 10000,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeInUpToast 0.3s ease-out forwards',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
          <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{toast.message}</span>
        </div>
      )}
    </div>
    </>
  );
}
