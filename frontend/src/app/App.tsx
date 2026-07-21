import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, ComposedChart
} from "recharts";
import {
  LayoutDashboard, Package, ArrowLeftRight, MapPin, Map, Bell, Brain,
  FileText, Settings, ChevronRight, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, Search, Plus,
  Database, Layers, LogOut, Lock, Mail, RefreshCw, Send, ArrowUpRight, ArrowDownLeft, Trash2, Edit, Key, Shield, Eye, EyeOff, Contrast, AlertOctagon, Check, ShieldAlert, ShieldCheck, Filter, ChevronDown, ListCollapse,
  Activity, Download, Info, Smartphone, MessageSquare, Save
} from "lucide-react";
import api from "../services/api";

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  fr: {
    welcome: "Portail Digital Phosphates Stocks",
    subtitle: "Gestion Intelligente des Stocks & Prévisions IA",
    emailPlaceholder: "Adresse e-mail professionnelle",
    passwordPlaceholder: "Mot de passe sécurisé",
    signIn: "Connexion sécurisée",
    signingIn: "Identification en cours...",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié ?",
    rightsReserved: "Tous droits réservés",
    footerText: "Groupe OCP - Direction Digitale & Opérations",
    themeSombre: "Sombre",
    themeClair: "Clair",
    home: "Tableau de Bord",
    stocks: "Gestion des Stocks",
    planStocks: "Plan des Stocks",
    movements: "Mouvements de Stock",
    silos: "Supervision des Silos",
    sites: "Sites & Emplacements",
    alerts: "Alertes Système",
    ia: "Prévisions IA",
    reports: "Rapports",
    settings: "Paramètres",
    logout: "Déconnexion",
    produits: "Produits",
    emplacements: "Emplacements",
    historique: "Historique",
    utilisateurs: "Utilisateurs",
    welcomeUser: "Bienvenue,",
    lastSyncLabel: "Dernière synchronisation locale",
    dbConnectedLabel: "Base de données connectée",
    activeSessionLabel: "Session active",
    onlineLabel: "En ligne",
    createdLabel: "Créé le",
    kpiTotalStock: "Stock Total",
    kpiSilos: "Nombre Silos",
    kpiSites: "Nombre Sites",
    kpiInputs: "Entrées (Jour)",
    kpiOutputs: "Sorties (Jour)",
    kpiActiveAlerts: "Alertes Actives",
    kpiOccupancy: "Taux d'occupation",
    kpiAiAccuracy: "Précision IA",
    totalStockLabel: "Silos validés",
    activeAlertsLabel: "Seuils franchis",
    kpiOccupancySub: "Capacité globale",
    kpiAiAccuracySub: "Modèle Prophet",
    kpiSilosSub: "En production",
    kpiSitesSub: "Réseau OCP",
    kpiInputsSub: "Réceptions",
    kpiOutputsSub: "Expéditions",
    adminActions: "Actions Administrateur",
    securityAudit: "Audit de Sécurité",
    recentActivities: "Dernières Activités",
    userDistribution: "Répartition des Utilisateurs",
    annualHistory: "Historique annuel des stocks",
    stockByType: "Stock par type",
  },
  en: {
    welcome: "Phosphates Stocks Digital Portal",
    subtitle: "Smart Stock Management & AI Forecasting",
    emailPlaceholder: "Professional email address",
    passwordPlaceholder: "Secure password",
    signIn: "Secure Login",
    signingIn: "Authenticating...",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    rightsReserved: "All rights reserved",
    footerText: "OCP Group - Digital & Operations Division",
    themeSombre: "Dark",
    themeClair: "Light",
    home: "Dashboard",
    stocks: "Stock Management",
    planStocks: "Stock Map",
    movements: "Stock Movements",
    silos: "Silos Supervision",
    sites: "Sites & Locations",
    alerts: "System Alerts",
    ia: "AI Predictions",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    produits: "Products",
    emplacements: "Locations",
    historique: "History",
    utilisateurs: "Users",
    welcomeUser: "Welcome,",
    lastSyncLabel: "Last local sync",
    dbConnectedLabel: "Database connected",
    activeSessionLabel: "Active session",
    onlineLabel: "Online",
    createdLabel: "Created on",
    kpiTotalStock: "Total Stock",
    kpiSilos: "Number of Silos",
    kpiSites: "Number of Sites",
    kpiInputs: "Daily Inputs",
    kpiOutputs: "Daily Outputs",
    kpiActiveAlerts: "Active Alerts",
    kpiOccupancy: "Occupancy Rate",
    kpiAiAccuracy: "AI Accuracy",
    totalStockLabel: "Validated silos",
    activeAlertsLabel: "Thresholds crossed",
    kpiOccupancySub: "Global capacity",
    kpiAiAccuracySub: "Prophet model",
    kpiSilosSub: "In production",
    kpiSitesSub: "OCP Network",
    kpiInputsSub: "Inputs",
    kpiOutputsSub: "Outputs",
    adminActions: "Admin Actions",
    securityAudit: "Security Audit",
    recentActivities: "Recent Activities",
    userDistribution: "User Distribution",
    annualHistory: "Annual Stock History",
    stockByType: "Stock by Type",
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────

type View = "dashboard" | "stocks" | "plan_stocks" | "mouvements" | "alertes" | "ia" | "rapports" | "parametres" | "silos" | "sites" | "produits" | "utilisateurs" | "historique" | "emplacements";

// ─── Quality Metrics Mapping (Harmonisation des données - Qualités Sources) ───

const UNITE_MAP: Record<string, string> = {
  UL: "Unité UL (Code 1)",
  UL1: "Unité UL1 (Code 2)",
  UL2: "Unité UL2 (Code 3)",
  UL3: "Unité UL3 (Code 4)",
  US: "Unité US (Code 5)",
  UC: "Unité UC (Code 6)",
  UC2: "Unité UC2 (Code 7)",
  UC3: "Unité UC3 (Code 8)",
  UC4: "Unité UC4 (Code 9)",
};

const BPL_MAP: Record<string, { label: string, desc: string, color: string }> = {
  SHT: { label: "SHT (>75 BPL)", desc: "Super High Grade (Code 1)", color: "#10B981" },
  THT: { label: "THT (73-75 BPL)", desc: "Très Haute Teneur (Code 2)", color: "#34D399" },
  HTN: { label: "HTN (71.5-73 BPL)", desc: "Haute Teneur Normale (Code 3)", color: "#059669" },
  HTM: { label: "HTM (69.5-71.5 BPL)", desc: "Haute Teneur Moyenne (Code 4)", color: "#3B82F6" },
  MT:  { label: "MT (68-69.5 BPL)", desc: "Moyenne Teneur (Code 5)", color: "#60A5FA" },
  BTR: { label: "BTR (65-68 BPL)", desc: "Bas Teneur Riche (Code 6)", color: "#FBBF24" },
  BTN: { label: "BTN (63-65 BPL)", desc: "Bas Teneur Normale (Code 7)", color: "#F59E0B" },
  BTP: { label: "BTP (61-63 BPL)", desc: "Bas Teneur Pauvre (Code 8)", color: "#D97706" },
  TBT: { label: "TBT (56-61 BPL)", desc: "Très Basse Teneur (Code 9)", color: "#EF4444" },
  XBT: { label: "XBT (<56 BPL)", desc: "Extrêmement Basse Teneur (Code A)", color: "#B91C1C" },
};

const INDEX_MAP: Record<string, string> = {
  RC: "Rendement Citrique >= 28% (Code 1)",
  RF: "Rendement Formique >= 45% (Code 2)",
  FMgO: "Faible en MgO <= 0.55% (Code 3)",
  NONE: "Aucun index spécifique (Code 0)",
};

const NIVEAU_MAP: Record<string, string> = {
  SA2: "SA2 (Code 1)",
  SB: "SB (Code 2)",
  C0: "C0 (Code 3)",
  C1EXP: "C1EXP (Code 4)",
  C1NOR: "C1NOR (Code 5)",
  C2INF: "C2INF (Code 6)",
  C2SUP: "C2SUP (Code 7)",
  C3INF: "C3INF (Code 8)",
  CSGLO: "CSGLO (Code 9)",
  C4: "C4 (Code A)",
  C4AD: "C4AD (Code B)",
  C2: "C2 (Code C)",
  "C2 export": "C2 export (Code D)",
  "C3 sup": "C3 sup (Code E)",
  C5: "C5 (Code F)",
  C6: "C6 (Code G)",
};

const ZONE_MAP: Record<string, string> = {
  L30: "Bo-Ouest Lot30 (Code 1)",
  L31: "Bo-Ouest Lot31 (Code 2)",
  L33: "Bo-Ouest Lot33 (Code 3)",
  L34: "Bo-Ouest Lot34 (Code 4)",
  P1: "Bo-Est-P1 (Code 5)",
  P2: "Bo-Est-P2 (Code 6)",
  P3: "Bo-Est-P3 (Code 7)",
  P4: "Bo-Est-P4 (Code 8)",
  R1: "M'ZINDA-R1 (Code 9)",
  R2: "M'ZINDA-R2 (Code A)",
  R3: "M'ZINDA-R3 (Code B)",
  B2P1: "BG2-Panneau 1 (Code C)",
  B2P2: "BG2-Panneau 2 (Code D)",
  B2P3: "BG2-Panneau 3 (Code E)",
  B2P4: "BG2-Panneau 4 (Code F)",
  B2P5: "BG2-Panneau 5 (Code G)",
  BMS: "BG-Mine-Sud (Code H)",
};

const CARREAU_MAP: Record<string, string> = {
  BO: "BO (Code 1)",
  MZ: "MZ (Code 2)",
  BG: "BG (Code 3)",
};

const TRAITEMENT_MAP: Record<string, string> = {
  B: "BRUT (Code 1)",
  L: "Lavé (Code 2)",
  F: "Flottation (Code 3)",
  LF: "Lavé + Flotté (Code 4)",
  S: "Séché (Code 5)",
  C: "Calciné Export (Code 6)",
  SCAL: "Séché à UC (Code 7)",
  K: "STOCK (Code 8)",
};

// ─── Color Palette (From User Screenshot) ──────────────────────────────────────

const Palette = {
  bg:          "#E2ECE5",   // soft mint background
  sidebar:     "#236534",   // rich green sidebar
  sidebarHover:"#1c522a",   // darker green hover
  textDark:    "#233928",   // dark green-charcoal text
  textMuted:   "#5E7A64",   // muted green-slate text
  accentGreen: "#38B25D",   // vibrant green for stats/actions
  accentBlue:  "#7C5CFC",   // indigo/blue for circular ring
  accentRed:   "#E05252",   // soft warning red
  border:      "#D0DDD5",   // soft card border
  white:       "#FFFFFF",
  cardShadow:  "0 4px 20px rgba(35, 57, 40, 0.05)",
};

// ─── Shared Primitives ────────────────────────────────────────────────────────

function Badge({ statut }: { statut: string }) {
  const styles: Record<string, string> = {
    critique:      `bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]`,
    plein:         `bg-[#E2F7E5] text-[#1A6B2A] border border-[#C3ECBE]`,
    bas:           `bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]`,
    normal:        `bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]`,
    validé:        `bg-[#E2F7E5] text-[#1A6B2A] border border-[#C3ECBE]`,
    en_cours:      `bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]`,
    avertissement: `bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]`,
    NEW:           `bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]`,
    RESOLVED:      `bg-[#E2F7E5] text-[#1A6B2A] border border-[#C3ECBE]`,
  };
  const labels: Record<string, string> = {
    critique: "Critique", plein: "Plein", bas: "Bas", normal: "Normal",
    validé: "Validé", en_cours: "En cours", avertissement: "Attention",
    NEW: "Nouveau", RESOLVED: "Résolu",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded ${styles[statut] ?? `bg-gray-100 text-gray-700`}`}>
      {labels[statut] ?? statut}
    </span>
  );
}

const tooltipStyle = {
  contentStyle: { background: Palette.textDark, border: "none", borderRadius: 8, padding: "8px 14px" },
  labelStyle:   { color: "#99D8A3", fontSize: 11, fontFamily: "monospace" },
  itemStyle:    { color: "#FFFFFF", fontSize: 11, fontFamily: "monospace" },
};

// ─── Login Screen (Futuristic Dark Mint) ──────────────────────────────────────

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

// ─── Login Screen SSO Icons ───────────────────────────────────────────────────

const MicrosoftIcon = () => (
  <div className="grid grid-cols-2 gap-0.5 w-3 h-3 mr-2 shrink-0">
    <div className="bg-[#F25022] w-1.2 h-1.2" />
    <div className="bg-[#7FBA00] w-1.2 h-1.2" />
    <div className="bg-[#00A4EF] w-1.2 h-1.2" />
    <div className="bg-[#FFB900] w-1.2 h-1.2" />
  </div>
);

const GoogleIcon = () => (
  <svg className="w-3 h-3 mr-2 shrink-0" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 15.01 1 12 1 7.37 1 3.4 3.67 1.5 7.56l3.89 3.02C6.31 7.58 8.92 5.04 12 5.04z" />
    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z" />
    <path fill="#FBBC05" d="M5.39 14.92c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.5 7.32C.54 9.22 0 11.35 0 12.63c0 1.28.54 3.41 1.5 5.31l3.89-3.02z" />
    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.08 0-5.69-2.54-6.61-5.54l-3.89 3.02C3.4 20.33 7.37 23 12 23z" />
  </svg>
);

// ─── Login Screen (Futuristic Dark Mint) ──────────────────────────────────────

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  lang: "fr" | "en";
  setLang: (lang: "fr" | "en") => void;
}

function LoginView({ onLoginSuccess, isDarkMode, setIsDarkMode, lang, setLang }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password,
        device_name: "React_B&W_Dashboard",
      });

      if (response.data.success === true) {
        onLoginSuccess(response.data.data.token, response.data.data.user);
      } else if (response.data.status === "success") {
        onLoginSuccess(response.data.token, response.data.user);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Identifiants de connexion invalides."
      );
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const t = TRANSLATIONS[lang];

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 p-4 ${isDarkMode ? 'bg-[#090A0F] text-white' : 'bg-[#EFF4EF] text-[#233928]'}`} style={{
      backgroundImage: `linear-gradient(${isDarkMode ? 'rgba(9, 10, 15, 0.75), rgba(9, 10, 15, 0.9)' : 'rgba(239, 244, 239, 0.6), rgba(239, 244, 239, 0.85)'}), url(/ocp_plant_bg.png)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      
      {/* Top Navbar Actions (Theme & Language) */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        {/* Language selector */}
        <select
          value={lang}
          onChange={e => setLang(e.target.value as "fr" | "en")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer border ${isDarkMode ? 'bg-[#121315] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 px-3 rounded-lg border text-xs font-bold cursor-pointer flex items-center gap-1.5 justify-center ${isDarkMode ? 'bg-[#121315] border-white/10 text-emerald-400 hover:bg-white/5' : 'bg-white border-slate-200 text-emerald-800 hover:bg-slate-50'}`}
        >
          <Contrast size={14} />
          {isDarkMode ? t.themeClair : t.themeSombre}
        </button>
      </div>

      {/* Brand Header: Logo, Name & Tagline */}
      <div className="flex flex-col items-center text-center gap-2 mb-6 relative z-10 animate-fadeIn">
        <div className="w-20 h-20 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[#00A859]/20 rounded-full blur-xl animate-pulse" />
          <img src="/ocp_logo.png" alt="OCP Logo" className="w-16 h-16 object-contain relative z-10 filter drop-shadow-[0_0_8px_rgba(0,168,89,0.4)]" />
        </div>
        <h1 className={`text-2xl font-extrabold tracking-wider font-['Barlow_Condensed'] uppercase ${isDarkMode ? 'text-white' : 'text-[#236534]'}`}>
          {t.welcome}
        </h1>
        <p className={`text-[10px] font-mono tracking-wider ${isDarkMode ? 'text-white/50' : 'text-[#233928]/60'}`}>
          {t.subtitle}
        </p>
      </div>

      {/* Main Login Card with Glassmorphism */}
      <div className={`w-full max-w-md backdrop-blur-xl border p-8 shadow-[0_15px_40px_rgba(0,0,0,0.25)] relative overflow-hidden transition-all duration-300 animate-scaleUp ${isDarkMode ? 'bg-[#121315]/80 border-white/5 shadow-[0_15px_50px_rgba(0,0,0,0.6)]' : 'bg-white/80 border-slate-200/60'}`} style={{ borderRadius: "24px" }}>
        
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-[0.02] select-none">
          <img src="/ocp_logo.png" alt="OCP Watermark" className="w-full h-full object-contain filter invert brightness-0" />
        </div>

        <h2 className={`text-xl font-bold mb-6 font-sans ${isDarkMode ? 'text-white' : 'text-[#233928]'}`}>
          {lang === "fr" ? "Accéder à l'espace" : "Access your portal"}
        </h2>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border-l-4 border-red-500 rounded-xl text-xs font-mono text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-col gap-1.5">
            <label className={`text-[11px] font-sans font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {lang === "fr" ? "Adresse e-mail" : "Email Address"}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <Mail size={13} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                className={`w-full border focus:border-[#00A859] focus:outline-none px-4 py-2.5 pl-10 rounded-xl text-xs transition-all font-mono ${isDarkMode ? 'bg-[#191A1D] border-neutral-800 text-white placeholder-neutral-600' : 'bg-[#F4FAF4] border-slate-200 text-slate-800 placeholder-slate-400'}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className={`text-[11px] font-sans font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {lang === "fr" ? "Mot de passe" : "Password"}
              </label>
              <span className="text-[10px] text-[#00A859] hover:underline cursor-pointer font-bold font-mono">
                {t.forgotPassword}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <Lock size={13} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                autoComplete="new-password"
                className={`w-full border focus:border-[#00A859] focus:outline-none px-4 py-2.5 pl-10 pr-10 rounded-xl text-xs transition-all ${isDarkMode ? 'bg-[#191A1D] border-neutral-800 text-white placeholder-neutral-650' : 'bg-[#F4FAF4] border-slate-200 text-slate-800 placeholder-slate-400'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe} 
              onChange={e => setRememberMe(e.target.checked)} 
              className="rounded border-slate-300 text-[#00A859] focus:ring-[#00A859] cursor-pointer"
            />
            <label htmlFor="remember" className={`text-[10px] font-mono select-none cursor-pointer ${isDarkMode ? 'text-neutral-450' : 'text-neutral-600'}`}>
              {t.rememberMe}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#00A859] hover:bg-[#00924e] text-white font-bold py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(0,168,89,0.25)] hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> {t.signingIn}
              </>
            ) : t.signIn}
          </button>
        </form>
      </div>

      {/* Official Footer info */}
      <footer className="mt-8 text-center text-[10px] font-mono tracking-wide text-neutral-450 z-10 flex flex-col gap-0.5">
        <div>© 2026 OCP Group · {t.rightsReserved}</div>
        <div className="opacity-60">{t.footerText} · Version 1.0</div>
      </footer>
    </div>
  );
}

// ─── Quick Movement Form Component ───────────────────────────────────────────

function QuickMovementForm({ metadata, onSuccess }: { metadata: any, onSuccess: () => void }) {
  const [siteId, setSiteId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [mvtTypeId, setMvtTypeId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [description, setDescription] = useState("");
  const [moyenTransport, setMoyenTransport] = useState("");
  
  // Quality Metrics State
  const [unite, setUnite] = useState("UL");
  const [bplClass, setBplClass] = useState("SHT");
  const [qualityIndex, setQualityIndex] = useState("NONE");
  const [niveau, setNiveau] = useState("SA2");
  const [zone, setZone] = useState("L30");
  const [carreau, setCarreau] = useState("BO");
  const [traitement1, setTraitement1] = useState("B");
  const [traitement2, setTraitement2] = useState("K");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error", text: string } | null>(null);

  const filteredLocations = metadata?.locations?.filter((l: any) => String(l.site_id) === String(siteId)) || [];

  useEffect(() => {
    setLocationId("");
  }, [siteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || !typeId || !mvtTypeId || !quantite) {
      setMsg({ type: "error", text: "Veuillez remplir tous les champs obligatoires." });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await api.post("/movements", {
        location_id: Number(locationId),
        phosphate_type_id: Number(typeId),
        movement_type_id: Number(mvtTypeId),
        quantite: parseFloat(quantite),
        description: description,
        moyen_transport: moyenTransport || null,
        // Quality Metrics parameters
        unite: unite,
        bpl_class: bplClass,
        quality_index: qualityIndex,
        niveau: niveau,
        zone: zone,
        carreau: carreau,
        traitement_1: traitement1,
        traitement_2: traitement2
      });

      if (res.data.success === true || res.data.status === "success") {
        setMsg({ type: "success", text: "Mouvement enregistré avec succès !" });
        setQuantite("");
        setDescription("");
        setMoyenTransport("");
        onSuccess(); // Refresh dashboard
      }
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Erreur lors de l'enregistrement du mouvement."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5FAF5] p-4 rounded-xl border border-border flex flex-col gap-3">
      {msg && (
        <div className={`p-2.5 rounded text-[10px] font-mono ${msg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {msg.text}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono uppercase text-[#5E7A64] font-bold">Site OCP</label>
          <select
            value={siteId}
            onChange={e => setSiteId(e.target.value)}
            required
            className="w-full px-2.5 py-2 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer"
          >
            <option value="">Sélectionner...</option>
            {metadata?.sites?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono uppercase text-[#5E7A64] font-bold">Silo / Zone</label>
          <select
            value={locationId}
            onChange={e => setLocationId(e.target.value)}
            disabled={!siteId}
            required
            className="w-full px-2.5 py-2 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer disabled:opacity-50"
          >
            <option value="">Sélectionner...</option>
            {filteredLocations.map((l: any) => (
              <option key={l.id} value={l.id}>{l.name} (Max: {parseFloat(l.capacite_max).toLocaleString()} T)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono uppercase text-[#5E7A64] font-bold">Produit</label>
          <select
            value={typeId}
            onChange={e => setTypeId(e.target.value)}
            required
            className="w-full px-2.5 py-2 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer"
          >
            <option value="">Sélectionner...</option>
            {metadata?.phosphate_types?.map((pt: any) => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-mono uppercase text-[#5E7A64] font-bold">Opération</label>
          <select
            value={mvtTypeId}
            onChange={e => setMvtTypeId(e.target.value)}
            required
            className="w-full px-2.5 py-2 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer"
          >
            <option value="">Sélectionner...</option>
            {metadata?.movement_types?.map((mt: any) => (
              <option key={mt.id} value={mt.id}>{mt.name} ({mt.direction === "IN" ? "Entrée" : "Sortie"})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quality Metrics Fields */}
      <div className="border-t border-dashed border-border/80 pt-2 flex flex-col gap-2">
        <span className="text-[8px] font-mono uppercase text-[#236534] font-extrabold tracking-wider block">Harmonisation Qualité Source</span>
        
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-mono text-[#5E7A64] font-semibold">Unité</label>
            <select value={unite} onChange={e => setUnite(e.target.value)} className="w-full px-1 py-1 border border-border bg-white text-[9px] rounded focus:outline-none text-[#233928] font-mono cursor-pointer">
              {Object.keys(UNITE_MAP).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-mono text-[#236534] font-bold">Classe BPL *</label>
            <select value={bplClass} onChange={e => setBplClass(e.target.value)} className="w-full px-1 py-1 border border-[#236534] bg-white text-[9px] rounded focus:outline-none text-[#233928] font-mono font-bold cursor-pointer">
              {Object.keys(BPL_MAP).map(k => <option key={k} value={k}>{k} ({BPL_MAP[k].label.split(' ')[0]})</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-mono text-[#5E7A64] font-semibold">Index</label>
            <select value={qualityIndex} onChange={e => setQualityIndex(e.target.value)} className="w-full px-1 py-1 border border-border bg-white text-[9px] rounded focus:outline-none text-[#233928] font-mono cursor-pointer">
              {Object.keys(INDEX_MAP).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-mono text-[#5E7A64] font-semibold">Niveau</label>
            <select value={niveau} onChange={e => setNiveau(e.target.value)} className="w-full px-1 py-1 border border-border bg-white text-[9px] rounded focus:outline-none text-[#233928] font-mono cursor-pointer">
              {Object.keys(NIVEAU_MAP).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-mono text-[#5E7A64] font-semibold">Zone</label>
            <select value={zone} onChange={e => setZone(e.target.value)} className="w-full px-1 py-1 border border-border bg-white text-[9px] rounded focus:outline-none text-[#233928] font-mono cursor-pointer">
              {Object.keys(ZONE_MAP).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-mono text-[#5E7A64] font-semibold">Carreau</label>
            <select value={carreau} onChange={e => setCarreau(e.target.value)} className="w-full px-1 py-1 border border-border bg-white text-[9px] rounded focus:outline-none text-[#233928] font-mono cursor-pointer">
              {Object.keys(CARREAU_MAP).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-mono text-[#5E7A64] font-semibold">1er Trait</label>
            <select value={traitement1} onChange={e => setTraitement1(e.target.value)} className="w-full px-1 py-1 border border-border bg-white text-[9px] rounded focus:outline-none text-[#233928] font-mono cursor-pointer">
              {Object.keys(TRAITEMENT_MAP).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-mono text-[#5E7A64] font-semibold">2nd Trait</label>
            <select value={traitement2} onChange={e => setTraitement2(e.target.value)} className="w-full px-1 py-1 border border-border bg-white text-[9px] rounded focus:outline-none text-[#233928] font-mono cursor-pointer">
              {Object.keys(TRAITEMENT_MAP).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 items-end">
        <div className="col-span-1 flex flex-col gap-1">
          <label className="text-[9px] font-mono uppercase text-[#5E7A64] font-bold">Qté (T)</label>
          <input
            type="number"
            step="0.01"
            value={quantite}
            onChange={e => setQuantite(e.target.value)}
            placeholder="ex: 1500"
            required
            className="w-full px-2.5 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono"
          />
        </div>

        <div className="col-span-1 flex flex-col gap-1">
          <label className="text-[9px] font-mono uppercase text-[#5E7A64] font-bold">Moyen de Transport</label>
          <select
            value={moyenTransport}
            onChange={e => setMoyenTransport(e.target.value)}
            className="w-full px-2.5 py-2 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer"
          >
            <option value="">Sélectionner...</option>
            <option value="Camion">Camion</option>
            <option value="Train">Train</option>
            <option value="Convoyeur">Convoyeur</option>
          </select>
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[9px] font-mono uppercase text-[#5E7A64] font-bold">Remarques / Commande</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="ex: Train N°2 / Chargement quai..."
            className="w-full px-2.5 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-1 bg-[#236534] hover:bg-[#1c522a] text-white py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bold disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Enregistrement...
          </>
        ) : "Enregistrer le mouvement"}
      </button>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

interface ViewProps {
  data: any;
  user?: any;
  userRole: string;
  onRefresh: () => void;
  onNavigate: (view: View) => void;
  onQuickAction?: (action: string) => void;
  lang?: "fr" | "en";
  isDarkMode?: boolean;
}

function QRScannerMock() {
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const startScan = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult("SILO-JFL-02: Phosphate Gypseux (THT)");
    }, 2000);
  };

  return (
    <div className="bg-[#F8FAF8] border border-slate-200 p-5 rounded-2xl flex flex-col items-center gap-4 relative overflow-hidden" style={{ borderRadius: 20 }}>
      <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Scanner Industriel QR</span>
      
      <div className="w-40 h-40 border-4 border-emerald-500/30 rounded-xl relative flex items-center justify-center bg-slate-900 overflow-hidden shadow-inner">
        {scanning && (
          <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" style={{ top: '10%' }} />
        )}
        
        <div className="w-24 h-24 border border-dashed border-white/20 p-2 flex items-center justify-center opacity-60">
          <div className="grid grid-cols-3 gap-1.5 w-full h-full">
            <div className="bg-white/40 rounded-sm" /><div className="bg-white/40 rounded-sm" /><div className="bg-white/10 rounded-sm" />
            <div className="bg-white/10 rounded-sm" /><div className="bg-white/40 rounded-sm" /><div className="bg-white/40 rounded-sm" />
            <div className="bg-white/40 rounded-sm" /><div className="bg-white/10 rounded-sm" /><div className="bg-white/40 rounded-sm" />
          </div>
        </div>

        {scanning ? (
          <span className="absolute bottom-2 text-[8px] font-mono text-emerald-400 animate-pulse">NUMÉRISATION...</span>
        ) : (
          <span className="absolute bottom-2 text-[8px] font-mono text-emerald-500">LECTURE TERMINÉE</span>
        )}
      </div>

      {scanResult ? (
        <div className="text-[10px] font-mono bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800 text-center w-full animate-fadeIn">
          <strong>✓ QR Code détecté :</strong><br/>{scanResult}
        </div>
      ) : (
        <button 
          onClick={startScan}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-850 text-white rounded-xl text-[10px] font-mono font-bold uppercase cursor-pointer"
        >
          {scanning ? "Scan en cours..." : "Lancer le Scanner"}
        </button>
      )}
    </div>
  );
}

const DashboardView = React.memo(function DashboardView({ data, user, userRole, onRefresh, onNavigate, onQuickAction, lang, isDarkMode }: ViewProps) {
  const userRolesDataset = [
    { name: "Admin", value: 3, fill: "#236534" },
    { name: "Responsable", value: 4, fill: "#3B82F6" },
    
  ];

  const chartStockEvolution = [
    { mois: lang === "fr" ? "Jan" : "Jan", quantite: 142000 },
    { mois: lang === "fr" ? "Fév" : "Feb", quantite: 149000 },
    { mois: lang === "fr" ? "Mar" : "Mar", quantite: 158000 },
    { mois: lang === "fr" ? "Avr" : "Apr", quantite: 151000 },
    { mois: lang === "fr" ? "Mai" : "May", quantite: 163000 },
    { mois: lang === "fr" ? "Jun" : "Jun", quantite: 172000 },
    { mois: lang === "fr" ? "Jui" : "Jul", quantite: 165000 },
    { mois: lang === "fr" ? "Aoû" : "Aug", quantite: 178000 },
    { mois: lang === "fr" ? "Sep" : "Sep", quantite: 182000 },
    { mois: lang === "fr" ? "Oct" : "Oct", quantite: 175000 },
    { mois: lang === "fr" ? "Nov" : "Nov", quantite: 169000 },
    { mois: lang === "fr" ? "Déc" : "Dec", quantite: data?.total_stock ? parseFloat(data.total_stock) : 116000 },
  ];

  const stockByTypeDataset = data?.stock_by_type?.map((item: any) => ({
    name: item.name.replace("Phosphate ", ""),
    total: parseFloat(item.total),
  })) || [
    { name: lang === "fr" ? "Gros" : "Coarse", total: 45000 },
    { name: lang === "fr" ? "Fin" : "Fine", total: 38000 },
    { name: lang === "fr" ? "Standard" : "Standard", total: 33000 },
  ];

  const bplDataset = Object.keys(BPL_MAP).map(code => {
    const dbVal = data?.stock_by_bpl?.find((item: any) => item.name === code);
    return {
      name: code,
      total: dbVal ? parseFloat(dbVal.total) : 0
    };
  });

  const roleDistributionData = [
    { name: "Admin", value: 2, fill: "#236534" },
    { name: lang === "fr" ? "Responsable" : "Manager", value: 3, fill: "#3B82F6" },
    
  ];

  const adminAuditLogs = [
    { id: 1, user: "D. Admin", action: lang === "fr" ? "Création Utilisateur : R. Stock (Safi)" : "User Creation: Stock Manager (Safi)", time: "10:30" },
    { id: 2, user: "R. Stock", action: lang === "fr" ? "Validation Rapport IA - Prophet" : "Validation AI Report - Prophet", time: "09:12" },
    { id: 3, user: "Op. Terrain", action: lang === "fr" ? "Saisie IN : ST-002 (150 T)" : "Input Log: ST-002 (150 T)", time: "08:45" },
    { id: 4, user: "D. Admin", action: lang === "fr" ? "Modification Seuil Silo 2 (Youssoufia)" : "Threshold Mod Silo 2 (Youssoufia)", time: lang === "fr" ? "Hier" : "Yesterday" }
  ];

  const totalStock = parseFloat(data?.total_stock ?? 116000);
  const maxCapacity = 140000;
  const occupationRate = Math.round((totalStock / maxCapacity) * 100);

  const occupancyPieData = [
    { name: "Occupé", value: totalStock, color: Palette.accentBlue },
    { name: "Disponible", value: maxCapacity - totalStock, color: "#E2ECE5" }
  ];

  const getRoleLabel = () => {
    switch (userRole) {
      case "Admin": return lang === "fr" ? "Directeur Admin" : "Admin Director";
      case "Responsable Stock": return lang === "fr" ? "Responsable de Stock" : "Stock Manager";
      
      default: return userRole;
    }
  };

  const handleQuickAction = useCallback((action: string) => {
    alert(`[OCP ERP Admin] Action lancée : ${action}`);
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Greeting Header */}
      <div className={`flex items-center justify-between border border-border p-5 shadow-sm ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
        <div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-slate-450 block mb-1">{TRANSLATIONS[lang].workspace}</span>
          <h2 className="font-['Barlow_Condensed'] text-2xl font-extrabold text-[#233928] uppercase tracking-wider">
            {TRANSLATIONS[lang].welcomeUser} {user?.name ? user.name : getRoleLabel()}
          </h2>
          <p className="text-[10px] font-mono text-slate-400 mt-1.5">
            {TRANSLATIONS[lang].lastSyncLabel} : {new Date().toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US")} · {TRANSLATIONS[lang].dbConnectedLabel}
          </p>
        </div>
        <div className="bg-[#EFF7F0] border border-border px-4 py-2 rounded-full text-[10px] font-mono text-[#236534] flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {TRANSLATIONS[lang].role} : {userRole.toUpperCase()}
        </div>
      </div>

      {/* ── ERP Dynamic KPI Grid (OCP Standards) ── */}
      <div className="grid grid-cols-8 gap-4">
        {[
          { label: TRANSLATIONS[lang].kpiTotalStock, value: `${parseFloat(data?.total_stock ?? 0).toLocaleString()} T`, sub: TRANSLATIONS[lang].totalStockLabel, view: "stocks" },
          { label: TRANSLATIONS[lang].kpiSilos, value: `${data?.locations_count ?? 0} ${lang === "fr" ? "Silos" : "Silos"}`, sub: TRANSLATIONS[lang].kpiSilosSub, view: "silos" },
          { label: TRANSLATIONS[lang].kpiSites, value: `${data?.sites_count ?? 0} ${lang === "fr" ? "Complexes" : "Complexes"}`, sub: TRANSLATIONS[lang].kpiSitesSub, view: "sites" },
          { label: TRANSLATIONS[lang].kpiInputs, value: `+${parseFloat(data?.entries_today ?? 0).toLocaleString()} T`, sub: TRANSLATIONS[lang].kpiInputsSub, view: "mouvements", textCol: "text-emerald-700" },
          { label: TRANSLATIONS[lang].kpiOutputs, value: `-${parseFloat(data?.exits_today ?? 0).toLocaleString()} T`, sub: TRANSLATIONS[lang].kpiOutputsSub, view: "mouvements", textCol: "text-red-650" },
          { label: TRANSLATIONS[lang].kpiActiveAlerts, value: `${data?.active_alerts_count ?? 0} ${lang === "fr" ? "Critiques" : "Critical"}`, sub: TRANSLATIONS[lang].activeAlertsLabel, view: "alertes", textCol: data?.active_alerts_count > 0 ? "text-red-600" : "text-emerald-800" },
          { label: TRANSLATIONS[lang].kpiOccupancy, value: `${data?.mean_occupancy ?? 0} %`, sub: TRANSLATIONS[lang].kpiOccupancySub, view: "silos" },
          { label: TRANSLATIONS[lang].kpiAiAccuracy, value: `${data?.forecast_accuracy ?? 94.8} %`, sub: TRANSLATIONS[lang].kpiAiAccuracySub, view: "ia", textCol: "text-amber-600" },
        ].map((kpi, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(kpi.view as View)}
            className={`border border-border p-4 shadow-sm flex flex-col gap-1 text-left cursor-pointer ${isDarkMode ? 'hover:bg-[#232428]' : 'hover:bg-slate-50'} transition-colors transform hover:-translate-y-0.5 duration-200 ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`}
            style={{ borderRadius: 16 }}
          >
            <span className="text-[8px] font-mono tracking-wider uppercase text-slate-450 block leading-tight truncate">
              {kpi.label}
            </span>
            <div className={`font-['Barlow_Condensed'] text-base font-extrabold truncate ${kpi.textCol || "text-[#233928]"}`}>
              {kpi.value}
            </div>
            <span className="text-[7px] font-mono text-slate-450 block truncate">
              {kpi.sub}
            </span>
          </button>
        ))}
      </div>

      {/* ── Role specific dashboard panels ── */}
      {userRole === "Admin" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-6">
            <div className={`col-span-2 border border-border p-6 shadow-sm ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">{lang === "fr" ? "Capacités OCP" : "OCP Capacities"}</span>
              <h3 className="font-['Barlow_Condensed'] text-base font-bold text-[#233928] mb-4">{TRANSLATIONS[lang].annualHistory}</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartStockEvolution}>
                    <defs>
                      <linearGradient id="areaColorAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={Palette.accentGreen} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={Palette.accentGreen} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                    <XAxis dataKey="mois" tick={{ fontSize: 8, fontFamily: "monospace" }} />
                    <YAxis tick={{ fontSize: 8, fontFamily: "monospace" }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="quantite" stroke={Palette.sidebar} fill="url(#areaColorAdmin)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`border border-border p-6 shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">{lang === "fr" ? "Catégories" : "Categories"}</span>
                <h3 className="font-['Barlow_Condensed'] text-base font-bold text-[#233928] mb-4">{TRANSLATIONS[lang].stockByType}</h3>
              </div>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockByTypeDataset} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                    <YAxis tick={{ fontSize: 8 }} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#236534" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Quick Actions Panel */}
            <div className={`border border-border p-6 shadow-sm flex flex-col gap-4 ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">{lang === "fr" ? "Administration" : "Administration"}</span>
              <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928]">{TRANSLATIONS[lang].adminActions}</h3>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { label: lang === "fr" ? "Créer Utilisateur" : "Create User", act: "user" },
                  { label: lang === "fr" ? "Ajouter Produit" : "Add Product", act: "product" },
                  { label: lang === "fr" ? "Ajouter Site" : "Add Site", act: "site" },
                  { label: lang === "fr" ? "Créer Alerte" : "Create Alert", act: "alert" },
                  { label: lang === "fr" ? "Export PDF" : "Export PDF", act: "pdf" },
                  { label: lang === "fr" ? "Export Excel" : "Export Excel", act: "excel" },
                ].map(act => (
                  <button
                    key={act.label}
                    onClick={() => {
                      if (onQuickAction) {
                        onQuickAction(act.act);
                      } else {
                        handleQuickAction(act.label);
                      }
                    }}
                    className="p-3 bg-[#F5FAF5] border border-border hover:bg-[#E2ECE5] transition-colors rounded-xl text-[10px] font-mono text-[#236534] font-bold text-center cursor-pointer"
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className={`border border-border p-6 shadow-sm flex flex-col ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mb-1">{TRANSLATIONS[lang].securityAudit}</span>
              <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928] mb-4">{TRANSLATIONS[lang].recentActivities}</h3>
              
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[180px] pr-1">
                {adminAuditLogs.map(log => (
                  <div key={log.id} className="p-2.5 bg-[#F8FAF8] border border-border flex items-center justify-between" style={{ borderRadius: 12 }}>
                    <div>
                      <p className="text-[10px] font-bold text-[#233928]">{log.user}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{log.action}</p>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User roles distribution Recharts */}
            <div className={`border border-border p-6 shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">{lang === "fr" ? "Équipes OCP" : "OCP Teams"}</span>
                <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928] mb-4">{TRANSLATIONS[lang].userDistribution}</h3>
              </div>
              <div className="flex-grow flex flex-col justify-center items-center relative min-h-[120px]">
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-['Barlow_Condensed'] text-2xl font-extrabold text-[#233928]">12</span>
                  <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest">{TRANSLATIONS[lang].utilisateurs}</span>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={userRolesDataset} cx="50%" cy="50%" innerRadius={35} outerRadius={48} startAngle={90} endAngle={-270} dataKey="value">
                      {userRolesDataset.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-[8px] font-mono text-slate-500 mt-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#236534]" /> Admin</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> {lang === "fr" ? "Responsable" : "Manager"}</span>
                
              </div>
            </div>
          </div>
        </div>
      )}

      {userRole === "Responsable Stock" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Silos fills & Occupancy */}
            <div className={`col-span-1 border border-border shadow-sm p-6 flex flex-col ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Capacités</span>
              <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928] mb-4">Statut d'occupation</h3>
              
              <div className="flex-grow flex flex-col justify-center items-center relative min-h-[160px]">
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-['Barlow_Condensed'] text-3xl font-extrabold text-[#233928]">{occupationRate}%</span>
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Occupé</span>
                </div>
                
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={occupancyPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={65} startAngle={90} endAngle={-270} dataKey="value">
                      {occupancyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: Palette.accentBlue }} />
                    <span className="text-slate-500">Volume stocké :</span>
                  </div>
                  <strong className="text-[#233928]">{totalStock.toLocaleString()} T</strong>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#E2ECE5" }} />
                    <span className="text-slate-500">Disponible :</span>
                  </div>
                  <strong className="text-slate-400">{(maxCapacity - totalStock).toLocaleString()} T</strong>
                </div>
              </div>
            </div>

            {/* Main Area Chart */}
            <div className={`col-span-2 border border-border p-6 shadow-sm flex flex-col ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Évolution globale</span>
                  <h3 className="font-['Barlow_Condensed'] text-2xl font-bold text-[#233928] mt-1">Historique annuel des stocks</h3>
                </div>
              </div>
              
              <div className="w-full flex-grow min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartStockEvolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaColorResp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={Palette.accentGreen} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={Palette.accentGreen} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                    <XAxis dataKey="mois" tick={{ fontSize: 9, fill: Palette.textMuted }} />
                    <YAxis tick={{ fontSize: 9, fill: Palette.textMuted }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="quantite" stroke={Palette.sidebar} fill="url(#areaColorResp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom columns: Alerts and movements */}
          <div className="grid grid-cols-2 gap-6">
            <div className={`border border-border shadow-sm flex flex-col p-6 ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mb-1">Mises à jour</span>
              <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928] mb-4">Derniers mouvements</h3>
              
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-[240px]">
                {data?.recent_movements?.map((m: any) => {
                  const isIncoming = m.movement_type?.direction === "IN";
                  return (
                    <div key={m.id} className="py-3 flex items-center justify-between hover:bg-[#EFF7F0] transition-colors px-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isIncoming ? 'bg-[#E2F7E5] text-[#236534]' : 'bg-red-50 text-red-650'}`}>
                          {isIncoming ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#233928]">{m.stock?.location?.site?.name}</p>
                          <p className="text-[9px] font-mono text-slate-400">{m.stock?.phosphate_type?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-mono font-bold ${isIncoming ? 'text-emerald-700' : 'text-red-650'}`}>
                          {isIncoming ? "+" : "-"}{parseFloat(m.quantite).toLocaleString()} T
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alerts list */}
            <div className={`border border-border p-6 shadow-sm flex flex-col ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`} style={{ borderRadius: 20 }}>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mb-1 block">Alerte Système</span>
              <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928] mb-4">Flux des alertes</h3>
              
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[240px] pr-1">
                {data?.alerts && data.alerts.length > 0 ? (
                  data.alerts.map((a: any) => (
                    <div key={a.id} className="py-2.5 flex items-start gap-2.5 hover:bg-[#FDF2F2] p-1 rounded transition-colors">
                      <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#233928]">{a.stock?.location?.site?.name}</p>
                        <p className="text-[10px] text-slate-500 leading-tight truncate">{a.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-[11px] font-mono text-slate-400">Aucune alerte active</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const StocksView = React.memo(function StocksView({ userRole, dashboardData }: { userRole: string, dashboardData: any }) {
  const [stocksList, setStocksList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const metadata = dashboardData?.metadata;

  // Modal States
  const [showModal, setShowModal] = useState<"add" | "edit" | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const [siteId, setSiteId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [quantite, setQuantite] = useState("");
  
  const [unite, setUnite] = useState("UL");
  const [bplClass, setBplClass] = useState("SHT");
  const [qualityIndex, setQualityIndex] = useState("NONE");
  const [niveau, setNiveau] = useState("SA2");
  const [zone, setZone] = useState("L30");
  const [carreau, setCarreau] = useState("BO");
  const [traitement1, setTraitement1] = useState("B");
  const [traitement2, setTraitement2] = useState("K");

  const [modalMsg, setModalMsg] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stocks");
      if (res.data.status === "success" || res.data.success === true) {
        setStocksList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);

  const handleOpenAdd = () => {
    setShowModal("add");
    setCurrentId(null);
    setSiteId("");
    setLocationId("");
    setTypeId("");
    setQuantite("");
    setUnite("UL");
    setBplClass("SHT");
    setQualityIndex("NONE");
    setNiveau("SA2");
    setZone("L30");
    setCarreau("BO");
    setTraitement1("B");
    setTraitement2("K");
    setModalMsg(null);
  };

  const handleOpenEdit = (s: any) => {
    setShowModal("edit");
    setCurrentId(s.id);
    setSiteId(s.location?.site_id?.toString() || "");
    setLocationId(s.location_id?.toString() || "");
    setTypeId(s.phosphate_type_id?.toString() || "");
    setQuantite(s.quantite?.toString() || "");
    setUnite(s.unite || "UL");
    setBplClass(s.bpl_class || "SHT");
    setQualityIndex(s.quality_index || "NONE");
    setNiveau(s.niveau || "SA2");
    setZone(s.zone || "L30");
    setCarreau(s.carreau || "BO");
    setTraitement1(s.traitement_1 || "B");
    setTraitement2(s.traitement_2 || "K");
    setModalMsg(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce dépôt de stock ?")) return;
    try {
      const res = await api.delete(`/stocks/${id}`);
      if (res.data.success) {
        fetchStocks();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || !typeId || !quantite) {
      setModalMsg({ type: "error", text: "Veuillez remplir tous les champs obligatoires." });
      return;
    }

    setSubmitting(true);
    setModalMsg(null);

    const payload = {
      location_id: Number(locationId),
      phosphate_type_id: Number(typeId),
      quantite: parseFloat(quantite),
      unite,
      bpl_class: bplClass,
      quality_index: qualityIndex,
      niveau,
      zone,
      carreau,
      traitement_1: traitement1,
      traitement_2: traitement2,
    };

    try {
      if (showModal === "add") {
        const res = await api.post("/stocks", payload);
        if (res.data.success) {
          setModalMsg({ type: "success", text: "Stock créé avec succès !" });
          setTimeout(() => { setShowModal(null); fetchStocks(); }, 1000);
        }
      } else {
        const res = await api.put(`/stocks/${currentId}`, payload);
        if (res.data.success) {
          setModalMsg({ type: "success", text: "Stock mis à jour avec succès !" });
          setTimeout(() => { setShowModal(null); fetchStocks(); }, 1000);
        }
      }
    } catch (err: any) {
      setModalMsg({ type: "error", text: err.response?.data?.message || "Erreur lors de l'enregistrement." });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = stocksList.filter(s =>
    [s.location?.site?.name, s.location?.name, s.phosphate_type?.name].some(
      v => v && v.toLowerCase().includes(search.toLowerCase())
    )
  );

  const filteredLocations = metadata?.locations?.filter((l: any) => String(l.site_id) === String(siteId)) || [];
  const isAuthorized = userRole === "Admin" || userRole === "Responsable Stock";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 animate-pulse">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-[#236534] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par complexe minier, silo ou type de phosphate..."
              className="w-full pl-9 pr-4 py-2.5 border border-border bg-[#F5FAF5] text-xs font-mono focus:outline-none focus:border-[#236534] focus:bg-white rounded-lg text-[#233928]" />
          </div>
          <button onClick={fetchStocks} className="flex items-center gap-1.5 bg-[#EFF7F0] border border-border px-4 py-2.5 rounded-lg text-xs font-mono text-[#236534] hover:bg-[#D4EDDA] transition-colors cursor-pointer">
            <RefreshCw size={12} /> Recharger
          </button>
          {isAuthorized && (
            <button onClick={handleOpenAdd} className="flex items-center gap-1.5 bg-[#236534] hover:bg-[#1c522a] text-white px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shadow-sm">
              <Plus size={14} /> Ajouter un Dépôt
            </button>
          )}
        </div>

        <div className="border border-border rounded-lg bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-[#F5FAF5]">
                {["ID", "Site", "Silo", "Type", "BPL", "Qualité", "Volume / Capacité", "Occupation", "Statut"].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 font-bold whitespace-nowrap">{h}</th>
                ))}
                {isAuthorized && (
                  <th className="text-right px-4 py-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 font-bold whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(s => {
                const q = parseFloat(s.quantite);
                const cap = parseFloat(s.location?.capacite_max || 0);
                const pct = cap > 0 ? Math.round((q / cap) * 100) : 0;
                const barColor = pct >= 90 ? Palette.accentRed : pct <= 20 ? "#D97706" : Palette.accentGreen;
                const statusStr = pct >= 90 ? "plein" : pct <= 15 ? "bas" : "normal";

                const bplInfo = BPL_MAP[s.bpl_class] || { label: s.bpl_class || "N/A", desc: "Qualité standard", color: "#6B7280" };
                const qualCode = `${s.unite || "UL"}-${s.bpl_class || "SHT"}-${s.quality_index || "NONE"}-${s.niveau || "SA2"}-${s.zone || "L30"}-${s.carreau || "BO"}-${s.traitement_1 || "B"}-${s.traitement_2 || "K"}`;
                const shortQualCode = `${s.unite || "UL"}-${s.bpl_class || "SHT"}-${s.quality_index || "NONE"}...`;

                const cleanSite = s.location?.site?.name?.replace("Complexe", "")?.replace("Site Minier", "")?.trim() || "N/A";
                const cleanType = s.phosphate_type?.name?.replace("Phosphate", "")?.trim() || "N/A";

                return (
                  <tr key={s.id} className="hover:bg-[#F5FAF5]/40 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-mono text-slate-400 whitespace-nowrap">ST-{s.id.toString().padStart(3, "0")}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#233928] whitespace-nowrap">{cleanSite}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-550 whitespace-nowrap">{s.location?.name}</td>
                    <td className="px-4 py-3 text-xs text-[#233928] whitespace-nowrap">{cleanType}</td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white font-mono tracking-wide shadow-sm whitespace-nowrap" style={{ backgroundColor: bplInfo.color }} title={bplInfo.desc}>
                        {bplInfo.label.split(" ")[0]}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[9px] font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600 cursor-help hover:bg-slate-100 transition-colors inline-block whitespace-nowrap font-bold tracking-wide" title={`Qualité Source OCP:\n• Unité: ${UNITE_MAP[s.unite] || s.unite || "UL"}\n• Classe BPL: ${bplInfo.desc} (${s.bpl_class})\n• Index: ${INDEX_MAP[s.quality_index] || s.quality_index || "Aucun"}\n• Niveau: ${NIVEAU_MAP[s.niveau] || s.niveau || "SA2"}\n• Zone: ${ZONE_MAP[s.zone] || s.zone || "L30"}\n• Carreau: ${CARREAU_MAP[s.carreau] || s.carreau || "BO"}\n• 1er Traitement: ${TRAITEMENT_MAP[s.traitement_1] || s.traitement_1 || "BRUT"}\n• 2ème Traitement: ${TRAITEMENT_MAP[s.traitement_2] || s.traitement_2 || "STOCK"}`}>
                        {shortQualCode}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs font-mono text-[#233928] whitespace-nowrap">
                      <strong className="font-extrabold">{q.toLocaleString()}</strong> <span className="text-slate-400 font-normal">/ {cap.toLocaleString()} T</span>
                    </td>
                    
                    <td className="px-3 py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-grow h-1.5 bg-[#EFF7F0] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 whitespace-nowrap shrink-0">{Math.min(pct, 100)}%</span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap"><Badge statut={statusStr} /></td>
                    
                    {isAuthorized && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleOpenEdit(s)} className="text-emerald-700 hover:text-emerald-950 font-bold text-xs cursor-pointer p-1 flex items-center gap-1">
                            <Edit size={11} /> Modifier
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="text-red-650 hover:text-red-850 font-bold text-xs cursor-pointer p-1 flex items-center gap-1">
                            <Trash2 size={11} /> Supprimer
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-border bg-[#F5FAF5] flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>{filtered.length} dépôts enregistrés</span>
            <span>Total : {filtered.reduce((a, s) => a + parseFloat(s.quantite), 0).toLocaleString()} T</span>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden" style={{ borderRadius: 24 }}>
            <div className="bg-[#236534] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">
                  {showModal === "add" ? "Ajouter un dépôt / silo" : "Modifier le dépôt / silo"}
                </h3>
                <p className="text-[10px] font-mono text-emerald-200 mt-0.5">Configuration du stock et qualité source</p>
              </div>
              <button onClick={() => setShowModal(null)} className="text-white hover:text-emerald-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 max-h-[75vh]">
              {modalMsg && (
                <div className={`p-3 rounded text-xs font-mono border ${modalMsg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                  {modalMsg.text}
                </div>
              )}

              {/* Site and Location selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Site OCP</label>
                  <select value={siteId} onChange={e => setSiteId(e.target.value)} required className="w-full px-3 py-2 border border-border bg-white text-xs rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                    <option value="">Sélectionner...</option>
                    {metadata?.sites?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Silo / Zone de stockage</label>
                  <select value={locationId} onChange={e => setLocationId(e.target.value)} disabled={!siteId} required className="w-full px-3 py-2 border border-border bg-white text-xs rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer disabled:opacity-50">
                    <option value="">Sélectionner...</option>
                    {filteredLocations.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name} (Capacité: {parseFloat(l.capacite_max).toLocaleString()} T)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type and quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Type de Phosphate</label>
                  <select value={typeId} onChange={e => setTypeId(e.target.value)} required className="w-full px-3 py-2 border border-border bg-white text-xs rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                    <option value="">Sélectionner...</option>
                    {metadata?.phosphate_types?.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Quantité Active (T)</label>
                  <input type="number" step="any" min="0" value={quantite} onChange={e => setQuantite(e.target.value)} required placeholder="Ex: 12500" className="w-full px-3 py-2 border border-border bg-white text-xs rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono" />
                </div>
              </div>

              <div className="border-t border-dashed border-border pt-4">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block mb-3">Spécifications Qualité Source OCP</span>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-slate-400 font-bold">Unité</label>
                    <select value={unite} onChange={e => setUnite(e.target.value)} className="w-full px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                      {Object.keys(UNITE_MAP).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-slate-400 font-bold">Classe BPL</label>
                    <select value={bplClass} onChange={e => setBplClass(e.target.value)} className="w-full px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                      {Object.keys(BPL_MAP).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-slate-400 font-bold">Index</label>
                    <select value={qualityIndex} onChange={e => setQualityIndex(e.target.value)} className="w-full px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                      {Object.keys(INDEX_MAP).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-slate-400 font-bold">Niveau</label>
                    <select value={niveau} onChange={e => setNiveau(e.target.value)} className="w-full px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                      {Object.keys(NIVEAU_MAP).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-slate-400 font-bold">Zone</label>
                    <select value={zone} onChange={e => setZone(e.target.value)} className="w-full px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                      {Object.keys(ZONE_MAP).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-slate-400 font-bold">Carreau</label>
                    <select value={carreau} onChange={e => setCarreau(e.target.value)} className="w-full px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                      {Object.keys(CARREAU_MAP).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-slate-400 font-bold">Traitement 1</label>
                    <select value={traitement1} onChange={e => setTraitement1(e.target.value)} className="w-full px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                      {Object.keys(TRAITEMENT_MAP).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-slate-400 font-bold">Traitement 2</label>
                    <select value={traitement2} onChange={e => setTraitement2(e.target.value)} className="w-full px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534] text-[#233928] font-mono cursor-pointer">
                      {Object.keys(TRAITEMENT_MAP).map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold">Annuler</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#236534] hover:bg-[#1c522a] disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider">
                  {submitting ? "Enregistrement..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Mouvements View ──────────────────────────────────────────────────────────

const MouvementsView = React.memo(function MouvementsView({ dashboardData, userRole }: { dashboardData: any, userRole?: string }) {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/movements");
      if (res.data.status === "success" || res.data.success === true) {
        setMovements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: number) => {
    try {
      const res = await api.post(`/movements/${id}/validate`);
      if (res.data.success || res.data.status === 'success') {
        fetchMovements();
      }
    } catch (err) {
      console.error("Failed to validate movement", err);
      alert("Erreur lors de la validation du mouvement.");
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const typeStyle: Record<string, string> = {
    "IN": "text-emerald-700",
    "OUT": "text-red-600"
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 animate-pulse">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-[#236534] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Traçabilité</span>
          <button onClick={fetchMovements} className="flex items-center gap-1.5 bg-[#EFF7F0] border border-border px-4 py-2 rounded-lg text-xs font-mono text-[#236534] hover:bg-[#D4EDDA] transition-colors cursor-pointer">
            <RefreshCw size={12} /> Recharger
          </button>
        </div>

        <div className="overflow-hidden border border-border rounded-lg bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[#F5FAF5]">
                {["Mouvement", "Sujet / Type", "Complexe", "Silo / Dépôt", "Produit", "Transport", "Volume", "Opérateur", "Horodatage", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-[10px] font-mono tracking-wider uppercase text-slate-400 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-[#F5FAF5]/40 transition-colors">
                  <td className="px-4 py-3.5 text-[10px] font-mono text-slate-400">#MVT-{m.id.toString().padStart(3, "0")}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${typeStyle[m.movement_type?.direction] ?? ""}`}>
                      {m.movement_type?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-bold text-[#233928]">{m.stock?.location?.site?.name}</td>
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{m.stock?.location?.name}</td>
                  <td className="px-4 py-3.5 text-xs text-[#233928]">{m.stock?.phosphate_type?.name}</td>
                  <td className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-600">{m.moyen_transport || "N/A"}</td>
                  <td className="px-4 py-3.5 text-sm font-mono font-bold text-[#233928]">
                    {m.movement_type?.direction === "IN" ? "+" : "-"}{parseFloat(m.quantite).toLocaleString()} T
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{m.user?.name}</td>
                  <td className="px-4 py-3.5 text-[10px] font-mono text-slate-400">{new Date(m.date_mouvement).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Badge statut={m.status === 'valide' ? 'validé' : 'en_cours'} />
                      {m.status === 'en_cours' && (userRole === 'Admin' || userRole === 'Responsable Stock') && (
                        <button 
                          onClick={() => handleValidate(m.id)}
                          className="bg-emerald-50 text-[#236534] hover:bg-emerald-100 hover:text-emerald-700 px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors"
                          title="Valider ce mouvement"
                        >
                          VALIDER
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

// ─── Alertes View ─────────────────────────────────────────────────────────────

interface AlertViewProps {
  alerts: any[];
  lang: "fr" | "en";
}

const AlertesView = React.memo(function AlertesView({ alerts, lang }: AlertViewProps) {
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const critCount = alerts.filter(a => a.type_alerte === "MAX_SEUIL" && a.statut === "NEW").length;
  const lowCount = alerts.filter(a => a.type_alerte === "MIN_SEUIL" && a.statut === "NEW").length;
  const resolvedCount = alerts.filter(a => a.statut === "RESOLVED").length;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Overview Title and subtitle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#236534] border border-emerald-100/50">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#233928]">{lang === "fr" ? "Vue d'ensemble" : "Overview"}</h2>
            <p className="text-xs text-slate-500">{lang === "fr" ? "Surveillance en temps réel de vos alertes et indicateurs clés." : "Real-time monitoring of your alerts and key performance indicators."}</p>
          </div>
        </div>
      </div>

      {/* Grid of 3 Alert Cards */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Card 1: Critiques */}
        <div className="bg-white border border-slate-200 border-l-[3px] border-l-red-600 rounded-xl p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === "fr" ? "CRITIQUES" : "CRITICALS"}</span>
            <ShieldAlert size={16} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mt-2 leading-none">
            {critCount}
          </div>
          <div className="text-xs text-red-500 mt-1">
            {lang === "fr" ? "Seuil max atteint" : "Max threshold reached"}
          </div>
        </div>

        {/* Card 2: Alertes Basses */}
        <div className="bg-white border border-slate-200 border-l-[3px] border-l-amber-600 rounded-xl p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === "fr" ? "ALERTES BASSES" : "LOW ALERTS"}</span>
            <Bell size={16} className="text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mt-2 leading-none">
            {lowCount}
          </div>
          <div className="text-xs text-amber-600 mt-1">
            {lang === "fr" ? "À surveiller" : "To monitor"}
          </div>
        </div>

        {/* Card 3: Alertes Résolues */}
        <div className="bg-white border border-slate-200 border-l-[3px] border-l-emerald-600 rounded-xl p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === "fr" ? "ALERTES RÉSOLUES" : "RESOLVED ALERTS"}</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mt-2 leading-none">
            {resolvedCount}
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            {lang === "fr" ? "Tout est sous contrôle" : "Everything under control"}
          </div>
        </div>

      </div>

      {/* Alerts Feed Section */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-4" style={{ borderRadius: 12 }}>
        
        {/* Header Block of Feed */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800">
            <ListCollapse size={16} />
            <h3 className="font-bold text-sm">{lang === "fr" ? "Feed des alertes" : "Alerts Feed"}</h3>
          </div>
          
          {/* Dropdown Priority Filter */}
          <div className="relative">
            <div 
              className="flex items-center gap-1.5 text-[11px] border border-slate-200 px-3 py-1.5 rounded text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter size={12} />
              <span className="font-medium">
                {priorityFilter === "ALL" ? (lang === "fr" ? "Toutes les priorités" : "All Priorities") :
                 priorityFilter === "MAX_SEUIL" ? (lang === "fr" ? "Critiques" : "Criticals") :
                 priorityFilter === "MIN_SEUIL" ? (lang === "fr" ? "Avertissements" : "Warnings") : 
                 (lang === "fr" ? "Résolues" : "Resolved")}
              </span>
              <ChevronDown size={12} />
            </div>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded shadow-lg z-10 py-1">
                {[
                  { value: "ALL", label: lang === "fr" ? "Toutes les priorités" : "All Priorities" },
                  { value: "MAX_SEUIL", label: lang === "fr" ? "Critiques" : "Criticals" },
                  { value: "MIN_SEUIL", label: lang === "fr" ? "Avertissements" : "Warnings" },
                  { value: "RESOLVED", label: lang === "fr" ? "Résolues" : "Resolved" }
                ].map(opt => (
                  <div 
                    key={opt.value}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 ${priorityFilter === opt.value ? 'bg-slate-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
                    onClick={() => {
                      setPriorityFilter(opt.value);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* List of alert items */}
        <div className="divide-y divide-slate-100">
          {alerts.filter((a: any) => {
            if (priorityFilter === "ALL") return true;
            if (priorityFilter === "RESOLVED") return a.statut === "RESOLVED";
            return a.type_alerte === priorityFilter && a.statut !== "RESOLVED";
          }).length > 0 ? (
            alerts.filter((a: any) => {
              if (priorityFilter === "ALL") return true;
              if (priorityFilter === "RESOLVED") return a.statut === "RESOLVED";
              return a.type_alerte === priorityFilter && a.statut !== "RESOLVED";
            }).map((a: any) => (
              <div key={a.id} className={`py-4 flex items-start gap-4 transition-colors hover:bg-slate-50 ${a.statut === "RESOLVED" ? "opacity-50" : ""}`}>
                <AlertTriangle size={15} className={`mt-0.5 shrink-0 ${a.type_alerte === "MAX_SEUIL" ? "text-red-500" : "text-amber-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <Badge statut={a.type_alerte === "MAX_SEUIL" ? "critique" : "avertissement"} />
                    <span className="text-xs font-bold text-slate-800">{a.stock?.location?.site?.name}</span>
                    <span className="text-[10px] text-slate-500">{a.stock?.location?.name}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{a.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <Clock size={10} /> {new Date(a.date_creation).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            /* Empty state design matching screenshot */
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-center shadow-sm mb-2">
                <Bell size={20} className="text-slate-500" />
              </div>
              <div>
                <h4 className="font-bold text-[13px] text-slate-800">{lang === "fr" ? "Aucune alerte active" : "No Active Alerts"}</h4>
                <p className="text-[13px] text-slate-500 mt-1">{lang === "fr" ? "Vous n'avez aucune alerte active dans la base de données." : "You have no active alerts in the database."}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
});

// ─── IA View ──────────────────────────────────────────────────────────────────

const IAView = React.memo(function IAView() {
  const [types, setTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<number | "">("");
  const [days, setDays] = useState(30);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState("");

  // Advanced parameters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [yearlySeasonality, setYearlySeasonality] = useState(true);
  const [weeklySeasonality, setWeeklySeasonality] = useState(true);
  const [confidenceInterval, setConfidenceInterval] = useState(0.95);

  // Extra data loaded
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [lastForecastDate, setLastForecastDate] = useState<string>("");

  // Stepper state for loading
  const [currentStep, setCurrentStep] = useState(0);

  const fetchTypes = async () => {
    try {
      const res = await api.get("/phosphate-types");
      if (res.data.status === "success" || res.data.success === true) {
        setTypes(res.data.data);
        const gypType = res.data.data.find((t: any) => t.code === "P-GYP");
        if (gypType) {
          setSelectedType(gypType.id);
        } else if (res.data.data.length > 0) {
          setSelectedType(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMetadata = async () => {
    try {
      const settingsRes = await api.get("/settings");
      if (settingsRes.data.success) {
        setAlertRules(settingsRes.data.data.alert_rules || []);
      }
      
      const stocksRes = await api.get("/stocks");
      if (stocksRes.data.success || stocksRes.data.status === "success") {
        setStocks(stocksRes.data.data || []);
      }

      const historyRes = await api.get("/predictions/history");
      if (historyRes.data.success || historyRes.data.status === "success") {
        setHistoryLogs(Array.isArray(historyRes.data.data) ? historyRes.data.data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTypes();
    fetchMetadata();
  }, []);

  const handlePredict = async () => {
    if (!selectedType) return;
    setLoading(true);
    setMessage("");
    setErrorDetails("");
    setPredictions([]);
    setHistoryData([]);
    setCurrentStep(0);

    const stepsInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1200);

    try {
      const res = await api.post("/predict", {
        phosphate_type_id: selectedType,
        days: days,
        yearly_seasonality: yearlySeasonality,
        weekly_seasonality: weeklySeasonality,
        confidence_interval: confidenceInterval
      });
      if (res.data.status === "success" || res.data.success === true) {
        setPredictions(res.data.data.predictions || []);
        setHistoryData(res.data.data.history || []);
        setMessage(res.data.message);
        setLastForecastDate(new Date().toLocaleString("fr-FR"));

        // Refresh prediction history log
        const historyRes = await api.get("/predictions/history");
        if (historyRes.data.success || historyRes.data.status === "success") {
          setHistoryLogs(Array.isArray(historyRes.data.data) ? historyRes.data.data : []);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorDetails(
        err.response?.data?.message || 
        "Le service de prédiction est inaccessible ou les données historiques sont insuffisantes."
      );
    } finally {
      clearInterval(stepsInterval);
      setLoading(false);
    }
  };

  // Computations
  const currentStockSum = stocks
    .filter(s => s.phosphate_type_id === selectedType)
    .reduce((sum, s) => sum + parseFloat(s.quantite), 0);

  const activeRule = alertRules.find(r => r.phosphate_type_id === selectedType && r.active);
  const seuilMin = activeRule ? parseFloat(activeRule.seuil_min) : 5000;
  const seuilMax = activeRule ? parseFloat(activeRule.seuil_max) : 40000;

  let runningStock = currentStockSum;
  let totalDemand = 0;
  let ruptureDateStr: string | null = null;

  const forecastRows = predictions.map(p => {
    const demand = parseFloat(p.quantite_predite);
    totalDemand += demand;
    runningStock -= demand;

    const dateStr = p.date_prediction.split("T")[0];

    if (runningStock < seuilMin && !ruptureDateStr) {
      ruptureDateStr = new Date(dateStr).toLocaleDateString("fr-FR");
    }

    const lower = p.metadonnees?.yhat_lower ? parseFloat(p.metadonnees.yhat_lower) : demand;
    const upper = p.metadonnees?.yhat_upper ? parseFloat(p.metadonnees.yhat_upper) : demand;

    return {
      date: dateStr,
      demand,
      lower,
      upper,
      estimatedStock: runningStock,
      isBelowMin: runningStock < seuilMin
    };
  });

  const avgDemand = predictions.length > 0 ? totalDemand / predictions.length : 0;
  const remainingStock = runningStock;
  const qtyToOrder = remainingStock < seuilMin ? (seuilMax - remainingStock) : 0;

  // Combined chart dataset
  const lastHistoryPoint = historyData[historyData.length - 1];
  const combinedDataset = [
    ...historyData.map(h => ({
      date: h.ds,
      historique: parseFloat(h.y),
      prevision: null,
      intervalle: null
    })),
    ...(lastHistoryPoint ? [{
      date: lastHistoryPoint.ds,
      historique: parseFloat(lastHistoryPoint.y),
      prevision: parseFloat(lastHistoryPoint.y),
      intervalle: [parseFloat(lastHistoryPoint.y), parseFloat(lastHistoryPoint.y)]
    }] : []),
    ...predictions.map(p => {
      const yhat = parseFloat(p.quantite_predite);
      const lower = p.metadonnees?.yhat_lower ? parseFloat(p.metadonnees.yhat_lower) : yhat;
      const upper = p.metadonnees?.yhat_upper ? parseFloat(p.metadonnees.yhat_upper) : yhat;
      return {
        date: p.date_prediction.split("T")[0],
        historique: null,
        prevision: yhat,
        intervalle: [lower, upper]
      };
    })
  ];

  // Export actions
  const handleExportCSV = () => {
    if (forecastRows.length === 0) return;
    const headers = "Date;Demande Prevue (T);Intervalle Bas (T);Intervalle Haut (T);Stock Estime (T)\n";
    const rows = forecastRows.map(r => 
      `${r.date};${r.demand.toFixed(1)};${r.lower.toFixed(1)};${r.upper.toFixed(1)};${r.estimatedStock.toFixed(1)}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `previsions_prophet_${selectedType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (forecastRows.length === 0) return;
    const headers = "Date\tDemande Prévue (T)\tIntervalle Inférieur (T)\tIntervalle Supérieur (T)\tStock Estimé (T)\n";
    const rows = forecastRows.map(r => 
      `${r.date}\t${r.demand.toFixed(1)}\t${r.lower.toFixed(1)}\t${r.upper.toFixed(1)}\t${r.estimatedStock.toFixed(1)}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `previsions_prophet_${selectedType}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* KPI Model Stats */}
      <div className="border border-border grid grid-cols-4 divide-x divide-border bg-white shadow-sm" style={{ borderRadius: 20, overflow: 'hidden' }}>
        {[
          { label: "Modèle Prédictif", value: "Prophet AI", sub: "Algorithme d'analyse" },
          { label: "Confiance", value: `${(confidenceInterval * 100).toFixed(0)} %`, sub: "Intervalle de marge configuré" },
          { label: "État Service", value: "Opérationnel", sub: "Service IA connecté" },
          { label: "Dernier Calcul", value: lastForecastDate || "Non exécuté", sub: "Mise à jour en direct" },
        ].map(c => (
          <div key={c.label} className="p-5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block mb-1">{c.label}</span>
            <div className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">{c.value}</div>
            <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">{c.sub}</span>
          </div>
        ))}
      </div>

      {/* AI Controls */}
      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Prédiction Prophet</span>
            <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928]">LANCER LA PRÉVISION DE LA DEMANDE</h3>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[#236534] hover:text-[#1c522a] border border-[#236534] px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase cursor-pointer"
          >
            {showAdvanced ? "Masquer Paramètres" : "Paramètres Avancés"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">Type de phosphate</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold"
            >
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">Horizon de Prévision</label>
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold"
            >
              <option value={7}>7 Jours (Hebdomadaire)</option>
              <option value={30}>30 Jours (1 Mois)</option>
              <option value={90}>90 Jours (3 Mois)</option>
              <option value={180}>180 Jours (6 Mois)</option>
              <option value={365}>365 Jours (1 An)</option>
            </select>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="bg-[#236534] hover:bg-[#1c522a] text-white py-2.5 rounded text-xs font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-bold shadow-md"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> Calcul...
              </>
            ) : (
              <>
                <Brain size={13} /> CALCULER PROPHET
              </>
            )}
          </button>
        </div>

        {/* Advanced settings panel */}
        {showAdvanced && (
          <div className="p-4 bg-[#F5FAF5] border border-border flex flex-col gap-3 animate-slideDown" style={{ borderRadius: 16 }}>
            <span className="text-[9px] font-mono uppercase text-[#236534] font-bold">Configurations Prophet OCP</span>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="yearlySeason"
                  checked={yearlySeasonality}
                  onChange={e => setYearlySeasonality(e.target.checked)}
                  className="w-4 h-4 text-[#236534] border-border rounded"
                />
                <label htmlFor="yearlySeason" className="text-[10px] font-mono text-slate-650 cursor-pointer">Saisonnalité Annuelle</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="weeklySeason"
                  checked={weeklySeasonality}
                  onChange={e => setWeeklySeasonality(e.target.checked)}
                  className="w-4 h-4 text-[#236534] border-border rounded"
                />
                <label htmlFor="weeklySeason" className="text-[10px] font-mono text-slate-650 cursor-pointer">Saisonnalité Hebdomadaire</label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono uppercase text-slate-400">Intervalle de confiance</label>
                <select
                  value={confidenceInterval}
                  onChange={e => setConfidenceInterval(Number(e.target.value))}
                  className="px-2 py-1.5 border border-border bg-white text-[10px] rounded focus:outline-none focus:border-[#236534]"
                >
                  <option value={0.90}>90% (Variance faible)</option>
                  <option value={0.95}>95% (Défaut standard)</option>
                  <option value={0.99}>99% (Intervalle large)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="p-4 bg-[#EFF6FF] border border-blue-200 text-blue-900 rounded-lg text-xs font-mono">
            {message}
          </div>
        )}
      </div>

      {/* Loading Steps stepper */}
      {loading && (
        <div className="bg-white border border-border p-6 shadow-sm flex flex-col items-center justify-center gap-4 animate-fadeIn" style={{ borderRadius: 20 }}>
          <span className="text-xs font-mono font-bold text-[#236534] animate-pulse">Calcul Prophet en cours...</span>
          
          <div className="w-full max-w-md bg-slate-105 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#236534] h-full transition-all duration-500" 
              style={{ width: `${(currentStep + 1) * 25}%` }}
            />
          </div>
          
          <div className="flex flex-col items-center gap-1.5">
            <span className={`text-[10px] font-mono ${currentStep >= 0 ? "text-slate-700 font-bold" : "text-slate-400"}`}>
              {currentStep >= 0 ? "✓" : "○"} Chargement des silos et de l'historique...
            </span>
            <span className={`text-[10px] font-mono ${currentStep >= 1 ? "text-slate-700 font-bold" : "text-slate-400"}`}>
              {currentStep >= 1 ? "✓" : "○"} Traitement par l'algorithme d'IA...
            </span>
            <span className={`text-[10px] font-mono ${currentStep >= 2 ? "text-slate-700 font-bold" : "text-slate-400"}`}>
              {currentStep >= 2 ? "✓" : "○"} Apprentissage Prophet & Saisonnalités...
            </span>
            <span className={`text-[10px] font-mono ${currentStep >= 3 ? "text-slate-700 font-bold" : "text-slate-400"}`}>
              {currentStep >= 3 ? "✓" : "○"} Génération des intervalles de confiance...
            </span>
          </div>
        </div>
      )}

      {/* Error Details */}
      {errorDetails && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-mono flex flex-col gap-2">
          <div><strong>Échec du calcul :</strong> {errorDetails}</div>
          <div className="text-[10px] text-red-650">Suggestions : le service de prévision est temporairement indisponible. Veuillez réessayer plus tard.</div>
        </div>
      )}

      {/* Predicted results details (KPI Cards + Charts + Table) */}
      {combinedDataset.length > 0 && predictions.length > 0 && (
        <>
          {/* KPI Output Stats */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Demande Totale Prévue", value: `${totalDemand.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} T` },
              { label: "Consommation Moyenne", value: `${avgDemand.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} T/j` },
              { label: "Stock Restant Estimé", value: `${remainingStock.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} T`, isWarning: remainingStock < seuilMin },
              { label: "Rupture de Stock Estimée", value: ruptureDateStr ? ruptureDateStr : "Aucune Rupture", isCritical: !!ruptureDateStr },
              { label: "Quantité à Commander", value: qtyToOrder > 0 ? `${qtyToOrder.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} T` : "0 T", isAction: qtyToOrder > 0 },
            ].map(c => (
              <div 
                key={c.label} 
                className={`p-4 bg-white border shadow-sm flex flex-col justify-between gap-2 ${
                  c.isCritical ? "border-red-300 bg-red-50/50" : 
                  c.isWarning ? "border-amber-300 bg-amber-50/50" : 
                  c.isAction ? "border-blue-300 bg-blue-50/50" :
                  "border-border"
                }`} 
                style={{ borderRadius: 16 }}
              >
                <span className="text-[9px] font-mono uppercase text-slate-400 block">{c.label}</span>
                <div className={`font-['Barlow_Condensed'] text-xl font-bold ${
                  c.isCritical ? "text-red-700" :
                  c.isWarning ? "text-amber-700" :
                  c.isAction ? "text-blue-700" :
                  "text-[#233928]"
                }`}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* Graphique */}
          <div className="bg-white border border-border p-6 shadow-sm" style={{ borderRadius: 20 }}>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block mb-4">Résultat graphique (Demande en tonnes)</span>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedDataset}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F2" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 8 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="intervalle" fill="#3B82F6" stroke="none" fillOpacity={0.15} name="Marge d'erreur (95%)" />
                  <Line type="monotone" dataKey="historique" stroke="#1c522a" strokeWidth={3} dot={false} name="Historique" />
                  <Line type="monotone" dataKey="prevision" stroke="#3B82F6" strokeWidth={3} strokeDasharray="5 5" dot={false} name="Prévision Future" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Predictions Table */}
          <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Évolution de la capacité des silos</span>
                <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928]">Tableau détaillé des prévisions</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase cursor-pointer transition-colors"
                >
                  Export CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase cursor-pointer transition-colors"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase cursor-pointer transition-colors"
                >
                  Imprimer PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-border max-h-[350px] overflow-y-auto" style={{ borderRadius: 16 }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5FAF5] border-b border-border text-[9px] font-mono uppercase text-slate-500 sticky top-0 z-10">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Demande Prévue (T)</th>
                    <th className="px-4 py-3">Incertitude (Confidence Interval)</th>
                    <th className="px-4 py-3">Stock Restant Estimé (T)</th>
                    <th className="px-4 py-3">Alerte Seuil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[10px] font-mono">
                  {forecastRows.map(r => (
                    <tr key={r.date} className={`hover:bg-slate-50 ${r.isBelowMin ? "bg-red-50/40" : ""}`}>
                      <td className="px-4 py-2.5 font-bold text-[#233928]">{new Date(r.date).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-2.5 font-bold text-blue-600">{r.demand.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} T</td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {r.lower.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} → {r.upper.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} T
                      </td>
                      <td className={`px-4 py-2.5 font-bold ${r.isBelowMin ? "text-red-600" : "text-emerald-700"}`}>
                        {r.estimatedStock.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} T
                      </td>
                      <td className="px-4 py-2.5">
                        {r.isBelowMin ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[8px] font-bold rounded">
                            SILO SOUS SEUIL MIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-bold rounded">
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {/* History log section */}
      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4 animate-fadeIn" style={{ borderRadius: 20 }}>
        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Traçabilité algorithmique</span>
        <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928]">Historique des calculs de prévision</h3>
        
        <div className="overflow-x-auto border border-border" style={{ borderRadius: 16 }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5FAF5] border-b border-border text-[9px] font-mono uppercase text-slate-500">
                <th className="px-4 py-3">Date exécution</th>
                <th className="px-4 py-3">Type Phosphate</th>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Algorithme utilisé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[10px] font-mono text-slate-600">
              {historyLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-[#233928]">{l.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-500">{l.produit}</td>
                  <td className="px-4 py-3">{l.user}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-[#EFF6FF] border border-blue-100 text-blue-800 rounded text-[8px] font-bold uppercase">
                      {l.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

// ─── Rapports & Exports View ──────────────────────────────────────────────────

const RapportsView = React.memo(function RapportsView({ lang }: { lang: "fr" | "en" }) {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  
  const [types, setTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  // Filters
  const [periodPreset, setPeriodPreset] = useState("Ce mois");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const getPeriodDates = (preset: string) => {
    const today = new Date();
    let start = "";
    let end = today.toISOString().split("T")[0];

    if (preset === "Aujourd'hui") {
      start = end;
    } else if (preset === "Cette semaine") {
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start = new Date(today.setDate(diff)).toISOString().split("T")[0];
    } else if (preset === "Ce mois") {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
    } else if (preset === "Ce trimestre") {
      const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
      start = new Date(today.getFullYear(), quarterMonth, 1).toISOString().split("T")[0];
    } else if (preset === "Cette année") {
      start = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
    }
    return { start, end };
  };

  useEffect(() => {
    if (periodPreset !== "Personnalisé") {
      const { start, end } = getPeriodDates(periodPreset);
      setStartDate(start);
      setEndDate(end);
    }
  }, [periodPreset]);

  const fetchData = async () => {
    try {
      const res = await api.get("/dashboard");
      if (res.data.status === "success" || res.data.success === true) {
        const meta = res.data.data?.metadata;
        if (meta) {
          if (meta.phosphate_types) setTypes(meta.phosphate_types);
          if (meta.locations) setLocations(meta.locations);
        }
      }
    } catch (err) {
      console.error("Erreur chargement metadata:", err);
    }

    try {
      const histRes = await api.get("/reports/history");
      if (histRes.data.success || histRes.data.status === "success") {
        setHistory(histRes.data.data || []);
      }
    } catch (err) {
      console.error("Erreur chargement historique:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoadPreview = async () => {
    setLoadingPreview(true);
    try {
      const res = await api.post("/reports/preview", {
        start_date: startDate,
        end_date: endDate,
        phosphate_type_id: selectedType,
        location_id: selectedLocation
      });
      if (res.data.success) {
        setPreviewData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (showPreview) {
      handleLoadPreview();
    }
  }, [startDate, endDate, selectedType, selectedLocation, showPreview]);

  const triggerAsynchronousReport = async (reportType: "csv" | "xlsx" | "pdf") => {
    setLoading(true);
    setLoadingStep(0);
    setProgressMsg("Préparation des filtres et extraction Master Data...");
    setMessage(null);

    await new Promise(resolve => setTimeout(resolve, 1200));
    setLoadingStep(1);
    setProgressMsg("Génération du document OCP sécurisé...");

    await new Promise(resolve => setTimeout(resolve, 1200));
    setLoadingStep(2);
    setProgressMsg("Téléchargement du fichier en cours...");

    try {
      let response;
      let filename = "";
      let mimeType = "";

      const filterParams = {
        start_date: startDate,
        end_date: endDate,
        phosphate_type_id: selectedType,
        location_id: selectedLocation
      };

      if (reportType === "csv") {
        response = await api.get("/reports/excel", { params: filterParams, responseType: "blob" });
        filename = `rapport-flux-phosphate-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv;charset=utf-8;";
      } else if (reportType === "xlsx") {
        response = await api.post("/reports/generate-gf", filterParams, { responseType: "blob" });
        filename = "modele_rapport_gf_rempli.xlsx";
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else {
        response = await api.get("/reports/pdf", { params: filterParams, responseType: "blob" });
        filename = `rapport-etat-stocks-${new Date().toISOString().split("T")[0]}.pdf`;
        mimeType = "application/pdf";
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({ text: `Le rapport ${reportType.toUpperCase()} a été généré avec succès !`, type: "success" });
      
      const histRes = await api.get("/reports/history");
      if (histRes.data.success) {
        setHistory(histRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: `Erreur lors de la génération du rapport ${reportType.toUpperCase()}.`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const generatedToday = history.filter(h => {
    const createdDate = new Date(h.created_at).toDateString();
    const today = new Date().toDateString();
    return createdDate === today;
  }).length;
  
  const lastReportName = history.length > 0 ? history[0].titre : (lang === "fr" ? "Aucun" : "None");

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Document Dashboard KPIs */}
      <div className="border border-border grid grid-cols-4 divide-x divide-border bg-white shadow-sm" style={{ borderRadius: 20, overflow: 'hidden' }}>
        {[
          { label: lang === "fr" ? "Rapports aujourd'hui" : "Reports Today", value: `${generatedToday} ${lang === "fr" ? "généré(s)" : "generated"}` },
          { label: lang === "fr" ? "Dernier rapport créé" : "Last Created Report", value: lastReportName },
          { label: lang === "fr" ? "Total des documents archivés" : "Total Archived Files", value: `${history.length} ${lang === "fr" ? "fichiers" : "files"}` },
          { label: lang === "fr" ? "Mise à jour Référentiel" : "Reference Data Update", value: lang === "fr" ? "Synchrone & Validé" : "Synchronized & Validated" },
        ].map(c => (
          <div key={c.label} className="p-5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block mb-1">{c.label}</span>
            <div className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">{c.value}</div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`p-4 text-xs font-mono rounded-lg border ${
          message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* Period & Advanced Filters Bar */}
      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">{lang === "fr" ? "Filtrage du périmètre documentaire" : "Document Perimeter Filtering"}</span>
        <div className="grid grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">{lang === "fr" ? "Période prédéfinie" : "Predefined Period"}</label>
            <select
              value={periodPreset}
              onChange={e => setPeriodPreset(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold cursor-pointer"
            >
              <option value="Aujourd'hui">{lang === "fr" ? "Aujourd'hui" : "Today"}</option>
              <option value="Cette semaine">{lang === "fr" ? "Cette semaine" : "This Week"}</option>
              <option value="Ce mois">{lang === "fr" ? "Ce mois" : "This Month"}</option>
              <option value="Ce trimestre">{lang === "fr" ? "Ce trimestre" : "This Quarter"}</option>
              <option value="Cette année">{lang === "fr" ? "Cette année" : "This Year"}</option>
              <option value="Personnalisé">{lang === "fr" ? "Personnalisé" : "Custom"}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">{lang === "fr" ? "Date de début" : "Start Date"}</label>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setPeriodPreset("Personnalisé");
              }}
              className="w-full px-3 py-1.5 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">{lang === "fr" ? "Date de fin" : "End Date"}</label>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setPeriodPreset("Personnalisé");
              }}
              className="w-full px-3 py-1.5 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">{lang === "fr" ? "Type de phosphate" : "Phosphate Type"}</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold cursor-pointer"
            >
              <option value="">{lang === "fr" ? "Tous les Types" : "All Types"}</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">{lang === "fr" ? "Silo de stockage" : "Storage Silo"}</label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold cursor-pointer"
            >
              <option value="">{lang === "fr" ? "Tous les Silos" : "All Silos"}</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.site?.name})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border border-[#236534] text-[#236534] hover:bg-slate-50 text-xs font-mono font-bold uppercase rounded-lg transition-colors cursor-pointer"
          >
            {showPreview ? (lang === "fr" ? "Fermer l'aperçu" : "Close Preview") : (lang === "fr" ? "Prévisualiser les données" : "Preview Data")}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="bg-white border border-[#C8E6CC] p-6 shadow-sm flex flex-col gap-4 animate-slideDown" style={{ borderRadius: 20 }}>
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#236534] font-bold">{lang === "fr" ? "Prévisualisation du Document" : "Document Preview"}</span>
              <h3 className="font-['Barlow_Condensed'] text-base font-bold text-[#233928]">{lang === "fr" ? "Métadonnées & Aperçu des lignes" : "Metadata & Line Preview"}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-mono font-bold rounded-lg uppercase">
                {lang === "fr" ? "Statut : Validé (Brouillon)" : "Status: Validated (Draft)"}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-mono font-bold rounded-lg">
                Version : {previewData?.version || "1.0"}
              </span>
            </div>
          </div>

          {loadingPreview ? (
            <div className="flex justify-center items-center py-6">
              <span className="animate-spin inline-block w-6 h-6 border-4 border-[#236534] border-t-transparent rounded-full" />
            </div>
          ) : previewData ? (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 border border-border p-4 bg-[#F5FAF5] flex flex-col gap-3 min-w-0" style={{ borderRadius: 16 }}>
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">{lang === "fr" ? "Informations Documentaires" : "Documentary Information"}</span>
                <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-600">
                  <div className="truncate"><strong>{lang === "fr" ? "Générateur :" : "Generated by:"}</strong> {previewData.generated_by}</div>
                  <div className="truncate"><strong>{lang === "fr" ? "Date :" : "Date:"}</strong> {previewData.date_generation}</div>
                  <div className="truncate"><strong>{lang === "fr" ? "Mouvements inclus :" : "Included movements:"}</strong> {previewData.total_records}</div>
                  <div className="truncate"><strong>{lang === "fr" ? "Tonnage cumulé :" : "Cumulative tonnage:"}</strong> {parseFloat(previewData.total_tonnage).toLocaleString()} T</div>
                </div>
              </div>

              <div className="col-span-2 overflow-x-auto border border-border min-w-0" style={{ borderRadius: 16 }}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5FAF5] border-b border-border text-[9px] font-mono uppercase text-slate-500">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">{lang === "fr" ? "Date" : "Date"}</th>
                      <th className="px-3 py-2">Silo</th>
                      <th className="px-3 py-2">Phosphate</th>
                      <th className="px-3 py-2">{lang === "fr" ? "Flux" : "Flow"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[10px] font-mono text-slate-600">
                    {previewData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-slate-400">{lang === "fr" ? "Aucun flux sur cette période" : "No flows in this period"}</td>
                      </tr>
                    ) : (
                      previewData.rows.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold text-[#233928]">{r.id}</td>
                          <td className="px-3 py-2">{r.date}</td>
                          <td className="px-3 py-2">{r.silo}</td>
                          <td className="px-3 py-2">{r.phosphate}</td>
                          <td className={`px-3 py-2 font-bold ${r.tonnage.startsWith('+') ? "text-emerald-700" : "text-red-600"}`}>{r.tonnage}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs font-mono text-slate-400">{lang === "fr" ? "Erreur de chargement de l'aperçu." : "Error loading preview."}</div>
          )}
        </div>
      )}

      {/* Main Options Grid */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Excel Card */}
        <div className="bg-white border border-border p-6 shadow-sm flex flex-col justify-between gap-6" style={{ borderRadius: 20 }}>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#236534] border border-emerald-100">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">{lang === "fr" ? "Rapport GF" : "GF Report"}</span>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] mt-0.5">{lang === "fr" ? "Exportation Flux de Production (.csv)" : "Export Production Flows (.csv)"}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {lang === "fr" 
                  ? "Compile l'historique complet de tous les mouvements IN/OUT, avec traçabilité par silo, opérateur, type de phosphate et code de qualité source d'harmonisation." 
                  : "Compiles the complete history of all IN/OUT movements, with traceability by silo, operator, phosphate type and source quality code."}
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerAsynchronousReport("csv")}
            disabled={loading}
            className="w-full bg-[#236534] hover:bg-[#1c522a] text-white py-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <FileText size={14} /> {lang === "fr" ? "Télécharger Excel (.csv)" : "Download Excel (.csv)"}
          </button>
        </div>

        {/* Advanced Excel GF (IA) Card */}
        <div className="bg-white border border-border p-6 shadow-sm flex flex-col justify-between gap-6" style={{ borderRadius: 20 }}>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
              <Brain size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-500">{lang === "fr" ? "Moteur Prédictif IA" : "Predictive AI Engine"}</span>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] mt-0.5">{lang === "fr" ? "Rapport GF (IA) - Template OCP (.xlsx)" : "GF (AI) Report - OCP Template (.xlsx)"}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {lang === "fr" 
                  ? "Génère le document officiel du Groupe OCP basé sur le gabarit. Injecte les stocks réels et intègre une prévision IA de la demande des 3 prochains mois." 
                  : "Generates the official OCP Group document based on the template. Injects real stocks and integrates an AI demand forecast for the next 3 months."}
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerAsynchronousReport("xlsx")}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-650 text-white py-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Brain size={14} /> {lang === "fr" ? "Générer Rapport GF (IA)" : "Generate GF (AI) Report"}
          </button>
        </div>

        {/* PDF Card */}
        <div className="bg-white border border-border p-6 shadow-sm flex flex-col justify-between gap-6" style={{ borderRadius: 20 }}>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">{lang === "fr" ? "Rapport Directeur" : "Director Report"}</span>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] mt-0.5">{lang === "fr" ? "Rapport d'État Global (.pdf)" : "Global Status Report (.pdf)"}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {lang === "fr" 
                  ? "Génère un état officiel et imprimable récapitulant les stocks totaux disponibles, le taux d'occupation de chaque silo et la proportion globale des classes BPL haute teneur." 
                  : "Generates an official printable status summarizing total available stocks, occupancy rate of each silo and global proportion of high-BPL classes."}
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerAsynchronousReport("pdf")}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <FileText size={14} /> {lang === "fr" ? "Télécharger PDF (.pdf)" : "Download PDF (.pdf)"}
          </button>
        </div>

      </div>
    </div>
  );
});


function ResponsableParametresView() {
  const [seuilCritique, setSeuilCritique] = useState(15);
  const [seuilAvertissement, setSeuilAvertissement] = useState(30);
  const [horizon, setHorizon] = useState("30");
  const [emailNotif, setEmailNotif] = useState(true);
  const [appNotif, setAppNotif] = useState(true);
  const [frequence, setFrequence] = useState("hebdomadaire");
  const [lang, setLang] = useState("fr");
  const [timezone, setTimezone] = useState("UTC+1");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: "success"|"error"} | null>(null);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage({text: "Vos préférences ont été sauvegardées avec succès.", type: "success"});
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  const handleReset = () => {
    setSeuilCritique(15);
    setSeuilAvertissement(30);
    setHorizon("30");
    setEmailNotif(true);
    setAppNotif(true);
    setFrequence("hebdomadaire");
    setLang("fr");
    setTimezone("UTC+1");
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-24">
      {/* Top Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer">
          <Brain size={14} /> Générer une prévision
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors shadow-sm cursor-pointer">
          <Activity size={14} /> Tester le modèle
        </button>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors shadow-sm cursor-pointer">
          <RefreshCw size={14} /> Réinitialiser
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-border rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-sm cursor-pointer md:ml-auto">
          <Download size={14} /> Exporter la configuration
        </button>
      </div>

      {message && (
        <div className={`p-4 border-l-4 rounded-xl text-xs font-mono shadow-sm flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-red-50 border-red-500 text-red-800"}`}>
          <CheckCircle size={16} /> {message.text}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex gap-3 shadow-sm">
        <Info className="text-amber-600 shrink-0 mt-0.5" size={16} />
        <div>
          <h4 className="text-amber-800 text-xs font-bold uppercase tracking-wider font-mono mb-1">Information Importante</h4>
          <p className="text-[11px] text-amber-700/80 font-mono leading-relaxed">
            Les modifications des paramètres n'affectent que les prévisions futures et ne recalculent pas les anciennes prédictions.
          </p>
        </div>
      </div>

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Alertes */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928]">Paramètres des Alertes</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Gestion des seuils</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Seuil critique (%)</label>
                <span className="text-xs font-bold text-red-600">{seuilCritique}%</span>
              </div>
              <input type="range" min="5" max="50" value={seuilCritique} onChange={e => setSeuilCritique(parseInt(e.target.value))} className="w-full accent-red-600" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Seuil d'avertissement (%)</label>
                <span className="text-xs font-bold text-orange-500">{seuilAvertissement}%</span>
              </div>
              <input type="range" min="10" max="80" value={seuilAvertissement} onChange={e => setSeuilAvertissement(parseInt(e.target.value))} className="w-full accent-orange-500" />
            </div>
          </div>
        </div>

        {/* Horizon IA */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928]">Horizon des Prévisions</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Configuration temporelle</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Profondeur de prévision</label>
            <select value={horizon} onChange={e => setHorizon(e.target.value)} className="w-full p-2.5 border border-border rounded-xl text-xs font-mono focus:outline-none focus:border-[#236534] bg-slate-50 cursor-pointer">
              <option value="7">Court terme (7 jours)</option>
              <option value="30">Moyen terme (30 jours)</option>
              <option value="90">Long terme (90 jours)</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Smartphone size={16} />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928]">Paramètres des Notifs</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Canaux de communication</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-slate-500" />
                <span className="text-[11px] font-mono font-bold text-slate-700">Alertes par E-mail</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#236534]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <MessageSquare size={14} className="text-slate-500" />
                <span className="text-[11px] font-mono font-bold text-slate-700">Notifications In-App</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={appNotif} onChange={e => setAppNotif(e.target.checked)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#236534]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Rapports & Préférences */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Settings size={16} />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928]">Préférences Utilisateur</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Langue et rapports</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Fréquence des rapports</label>
              <select value={frequence} onChange={e => setFrequence(e.target.value)} className="w-32 p-1.5 border border-border rounded-lg text-xs font-mono focus:outline-none bg-slate-50">
                <option value="journaliere">Journalière</option>
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="mensuelle">Mensuelle</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Langue</label>
              <select value={lang} onChange={e => setLang(e.target.value)} className="w-32 p-1.5 border border-border rounded-lg text-xs font-mono focus:outline-none bg-slate-50">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Fuseau Horaire</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-32 p-1.5 border border-border rounded-lg text-xs font-mono focus:outline-none bg-slate-50">
                <option value="UTC">UTC</option>
                <option value="UTC+1">UTC+1 (Maroc)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Update Card */}
      <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-slate-400" />
          <span className="text-[11px] font-mono text-slate-500">Dernière mise à jour le <strong className="text-slate-700">{new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</strong> par <strong className="text-[#236534]">Responsable Stock</strong></span>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-6 right-6 bg-white border border-border shadow-2xl p-4 rounded-2xl flex gap-3 z-40">
        <button onClick={handleReset} className="px-4 py-2 text-xs font-mono font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer uppercase tracking-wider">
          Annuler
        </button>
        <button onClick={handleReset} className="px-4 py-2 border border-border rounded-xl text-xs font-mono font-bold hover:bg-slate-50 transition-colors cursor-pointer text-slate-600 shadow-sm uppercase tracking-wider">
          Réinitialiser
        </button>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#236534] hover:bg-[#1c522a] disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-colors shadow-md cursor-pointer flex items-center gap-2 uppercase tracking-wider">
          {saving ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={14} />}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function ParametresView({ currentUserRole, initialTab }: { currentUserRole: string, initialTab?: "seuils" | "ia" | "users" | "logs" }) {
  if (currentUserRole === "Responsable Stock") return <ResponsableParametresView />;

  const [activeTab, setActiveTab] = useState<"seuils" | "ia" | "users" | "logs" >(initialTab || "seuils");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  const [searchUser, setSearchUser] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [sortByDate, setSortByDate] = useState("newest");

  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [seuilMin, setSeuilMin] = useState("");
  const [seuilMax, setSeuilMax] = useState("");
  const [ruleActive, setRuleActive] = useState(true);
  const [savingRule, setSavingRule] = useState(false);

  const [showUserModal, setShowUserModal] = useState<"add" | "edit" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("Responsable Stock");
  const [userActive, setUserActive] = useState(true);
  const [submittingUser, setSubmittingUser] = useState(false);

  const [showResetModal, setShowResetModal] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      if (res.data.success) {
        setAlertRules(res.data.data.alert_rules || []);
        setUsers(res.data.data.users || []);
        setAuditLogs(res.data.data.audit_logs || []);
        setAiConfig(res.data.data.ai_config || null);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors de la récupération des paramètres.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEditRuleClick = (rule: any) => {
    setEditingRule(rule);
    setSeuilMin(rule.seuil_min);
    setSeuilMax(rule.seuil_max);
    setRuleActive(rule.active);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setSavingRule(true);
    setMessage(null);
    try {
      const res = await api.put(`/settings/alert-rules/${editingRule.id}`, {
        seuil_min: parseFloat(seuilMin),
        seuil_max: parseFloat(seuilMax),
        active: ruleActive
      });
      if (res.data.success) {
        setMessage({ text: "Règle de seuils mise à jour avec succès !", type: "success" });
        setEditingRule(null);
        fetchSettings();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur de validation.", type: "error" });
    } finally {
      setSavingRule(false);
    }
  };

  const handleOpenAddUser = () => {
    setMessage(null);
    setShowUserModal("add");
    setCurrentUserId(null);
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setUserRole("Responsable Stock");
    setUserActive(true);
  };

  const handleOpenEditUser = (u: any) => {
    setMessage(null);
    setShowUserModal("edit");
    setCurrentUserId(u.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPassword("");
    setUserRole(u.role);
    setUserActive(u.active);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    setMessage(null);
    try {
      if (showUserModal === "add") {
        const res = await api.post("/settings/users", {
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
          active: userActive
        });
        if (res.data.success) {
          setMessage({ text: "Utilisateur créé avec succès !", type: "success" });
          setShowUserModal(null);
          fetchSettings();
        }
      } else if (showUserModal === "edit" && currentUserId) {
        const res = await api.put(`/settings/users/${currentUserId}`, {
          name: userName,
          email: userEmail,
          role: userRole,
          active: userActive
        });
        if (res.data.success) {
          setMessage({ text: "Utilisateur mis à jour avec succès !", type: "success" });
          setShowUserModal(null);
          fetchSettings();
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur lors de l'enregistrement.", type: "error" });
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeletingUser(true);
    setMessage(null);
    try {
      const res = await api.delete(`/settings/users/${deleteConfirmUser.id}`);
      if (res.data.success) {
        setMessage({ text: "Utilisateur supprimé !", type: "success" });
        setDeleteConfirmUser(null);
        fetchSettings();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur de suppression.", type: "error" });
    } finally {
      setDeletingUser(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal) return;
    setResettingPassword(true);
    setMessage(null);
    try {
      const res = await api.post(`/settings/users/${showResetModal.id}/reset-password`, {
        password: newPassword
      });
      if (res.data.success) {
        setMessage({ text: "Mot de passe réinitialisé avec succès !", type: "success" });
        setShowResetModal(null);
        setNewPassword("");
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur de réinitialisation.", type: "error" });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleToggleActive = async (u: any) => {
    setMessage(null);
    try {
      const res = await api.put(`/settings/users/${u.id}`, {
        name: u.name,
        email: u.email,
        role: u.role,
        active: !u.active
      });
      if (res.data.success) {
        setMessage({ text: `Compte de ${u.name} mis à jour.`, type: "success" });
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors de la modification du statut.", type: "error" });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = roleFilter === "Tous" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortByDate === "newest" ? dateB - dateA : dateA - dateB;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-[#236534] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="bg-white border border-border p-2 flex gap-2 shadow-sm" style={{ borderRadius: 16 }}>
        <button
          onClick={() => setActiveTab("seuils")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "seuils" ? "bg-[#236534] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Seuils d'Alerte
        </button>
        <button
          onClick={() => setActiveTab("ia")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "ia" ? "bg-[#236534] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Configuration IA
        </button>
        {currentUserRole === "Admin" && (
          <>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "users" ? "bg-[#236534] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "logs" ? "bg-[#236534] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Journal d'Activité
            </button>
          </>
        )}
      </div>

      {message && (
        <div className={`p-4 text-xs font-mono rounded-lg border ${
          message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {activeTab === "seuils" && (
        <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Règles des seuils de capacité</span>
          <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928]">Gestion des limites de Silos</h3>
          
          <div className="overflow-x-auto border border-border" style={{ borderRadius: 16 }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5FAF5] border-b border-border text-[9px] font-mono uppercase text-slate-500">
                  <th className="px-4 py-3">Règle</th>
                  <th className="px-4 py-3">Type Phosphate</th>
                  <th className="px-4 py-3">Seuil Min (T)</th>
                  <th className="px-4 py-3">Seuil Max (T)</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[10px] font-mono">
                {alertRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-[#233928]">{rule.name}</td>
                    <td className="px-4 py-3 font-bold text-slate-500">{rule.phosphate_type?.name} ({rule.phosphate_type?.code})</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{parseFloat(rule.seuil_min).toLocaleString()} T</td>
                    <td className="px-4 py-3 font-bold text-red-600">{parseFloat(rule.seuil_max).toLocaleString()} T</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        rule.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {rule.active ? "ACTIF" : "INACTIF"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEditRuleClick(rule)}
                        className="text-[#236534] hover:text-[#1c522a] font-bold text-xs cursor-pointer p-1"
                      >
                        <Edit size={11} className="inline mr-1" /> Configurer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "ia" && (
        <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-6" style={{ borderRadius: 20 }}>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Modélisation & Prédictions</span>
            <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928] mt-1">Paramètres par défaut du modèle</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="border border-border p-5 flex flex-col gap-3 bg-[#F5FAF5]" style={{ borderRadius: 16 }}>
              <span className="text-[9px] font-mono uppercase text-[#236534] font-bold">Algorithme Principal</span>
              <div className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">{aiConfig?.default_model}</div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                Algorithme d'intelligence artificielle s'appuyant sur Prophet (Meta AI). Calcule de manière adaptative les tendances et anomalies sur les flux de mouvements.
              </p>
            </div>

            <div className="border border-border p-5 flex flex-col gap-3 bg-[#F5FAF5]" style={{ borderRadius: 16 }}>
              <span className="text-[9px] font-mono uppercase text-[#236534] font-bold">Intervalle de Confiance (Confidence Width)</span>
              <div className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">{(aiConfig?.confidence_interval * 100).toFixed(0)} %</div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                Génère les limites inférieures et supérieures yhat_lower/yhat_upper représentant 95% de probabilité des scénarios d'approvisionnement futur.
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-border pt-4 flex flex-col gap-3">
            <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Saisonnalités Statistiques</span>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-mono font-bold rounded-lg">
                Annuelle : active
              </span>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-mono font-bold rounded-lg">
                Hebdomadaire : active
              </span>
              <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-mono font-bold rounded-lg">
                Journalière : inactive
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-5" style={{ borderRadius: 20 }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Utilisateurs et Habilitations</span>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] mt-0.5">Annuaire du Personnel ERP</h3>
            </div>
            
            <button
              onClick={handleOpenAddUser}
              className="bg-[#236534] hover:bg-[#1c522a] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus size={14} /> Ajouter un Utilisateur
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 bg-[#F5FAF5] border border-border" style={{ borderRadius: 16 }}>
            <div className="col-span-2 relative">
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-9 pr-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
              >
                <option value="Tous">Tous les Rôles</option>
                <option value="Admin">Admin</option>
                <option value="Responsable Stock">Responsable Stock</option>
                
              </select>
            </div>

            <div>
              <select
                value={sortByDate}
                onChange={e => setSortByDate(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
              >
                <option value="newest">Plus récents d'abord</option>
                <option value="oldest">Plus anciens d'abord</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-border" style={{ borderRadius: 16 }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5FAF5] border-b border-border text-[9px] font-mono uppercase text-slate-500">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Permissions de Base</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date de Création</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[10px] font-mono text-slate-600">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Aucun collaborateur trouvé</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-[#233928]">{u.name}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          u.role === "Admin" ? "bg-red-100 text-red-800" :
                          u.role === "Responsable Stock" ? "bg-amber-100 text-amber-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {u.role === "Admin" && "Consultation, Création, Modification, Validation, Administration"}
                        {u.role === "Responsable Stock" && "Consultation, Création, Modification, Validation"}
                        {u.role === "Opérateur" && "Consultation, Création"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-2.5 py-1 rounded-full text-[8px] font-bold shadow-sm transition-all cursor-pointer ${
                            u.active 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200" 
                              : "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
                          }`}
                        >
                          {u.active ? "ACTIF" : "DÉSACTIVÉ"}
                        </button>
                      </td>
                      <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            title="Modifier"
                            className="p-1.5 text-emerald-750 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => setShowResetModal(u)}
                            title="Réinitialiser le mot de passe"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Key size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            title="Supprimer"
                            className="p-1.5 text-red-650 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Journal d'Audit Système</span>
          <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928]">Traçabilité des opérations OCP</h3>
          
          <div className="overflow-x-auto border border-border" style={{ borderRadius: 16 }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5FAF5] border-b border-border text-[9px] font-mono uppercase text-slate-500">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entité Modifiée</th>
                  <th className="px-4 py-3">Adresse IP</th>
                  <th className="px-4 py-3">Date de l'action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[10px] font-mono text-slate-600">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aucun journal d'audit enregistré.</td>
                  </tr>
                ) : (
                  auditLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400 font-bold">#{l.id}</td>
                      <td className="px-4 py-3 font-semibold text-[#233928]">{l.user?.name || "Système"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          l.action === "create" ? "bg-emerald-100 text-emerald-800" :
                          l.action === "update" ? "bg-blue-100 text-blue-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {l.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-500">
                        {l.auditable_type?.split("\\").pop()} (ID: {l.auditable_id})
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-bold">{l.ip_address || "127.0.0.1"}</td>
                      <td className="px-4 py-3">{new Date(l.created_at).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingRule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-[#236534] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">Configurer les seuils</h3>
                <p className="text-[10px] font-mono text-emerald-200 mt-0.5">{editingRule.name}</p>
              </div>
              <button onClick={() => setEditingRule(null)} className="text-white hover:text-emerald-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveRule} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Seuil critique minimum (T)</label>
                <input
                  type="number"
                  step="any"
                  value={seuilMin}
                  onChange={e => setSeuilMin(e.target.value)}
                  required
                  placeholder="Ex: 5000"
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded focus:outline-none focus:border-[#236534] font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Seuil critique maximum (T)</label>
                <input
                  type="number"
                  step="any"
                  value={seuilMax}
                  onChange={e => setSeuilMax(e.target.value)}
                  required
                  placeholder="Ex: 45000"
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded focus:outline-none focus:border-[#236534] font-mono"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="ruleActive"
                  checked={ruleActive}
                  onChange={e => setRuleActive(e.target.checked)}
                  className="w-4 h-4 text-[#236534] border-border rounded focus:ring-[#236534]"
                />
                <label htmlFor="ruleActive" className="text-xs font-mono text-slate-600 font-bold cursor-pointer select-none">
                  Activer cette règle de contrôle automatique
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingRule}
                  className="px-6 py-2 bg-[#236534] hover:bg-[#1c522a] disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  {savingRule ? "Sauvegarde..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-[#236534] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">
                  {showUserModal === "add" ? "Ajouter un Collaborateur" : "Modifier le Collaborateur"}
                </h3>
                <p className="text-[10px] font-mono text-emerald-200 mt-0.5">Accréditation et droits OCP</p>
              </div>
              <button onClick={() => setShowUserModal(null)} className="text-white hover:text-emerald-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 flex flex-col gap-4" autoComplete="off">
              {message && (
                <div className={`p-3 border-l-4 rounded-xl text-xs font-mono ${message.type === "success" ? "bg-emerald-50 border-emerald-505 text-emerald-800" : "bg-red-50 border-red-505 text-red-800"}`}>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Nom Complet</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                  placeholder="Ex: Youssef El Alami"
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Adresse E-mail</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  required
                  placeholder="Ex: y.alami@ocpgroup.ma"
                  autoComplete="new-email"
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                />
              </div>

              {showUserModal === "add" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Mot de passe temporaire</label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                    required
                    placeholder="Min 6 caractères..."
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Rôle & Habilitations</label>
                <select
                  value={userRole}
                  onChange={e => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
                >
                  <option value="Admin">Admin</option>
                  <option value="Responsable Stock">Responsable Stock</option>
                  
                </select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={userActive}
                  onChange={e => setUserActive(e.target.checked)}
                  className="w-4 h-4 text-[#236534] border-border rounded focus:ring-[#236534]"
                />
                <label htmlFor="userActiveCheck" className="text-xs font-mono text-slate-600 font-bold cursor-pointer select-none">
                  Compte actif (autoriser la connexion de session)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-6 py-2 bg-[#236534] hover:bg-[#1c522a] disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  {submittingUser ? "Enregistrement..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-amber-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">Réinitialiser</h3>
                <p className="text-[10px] font-mono text-amber-100 mt-0.5">Mot de passe de {showResetModal.name}</p>
              </div>
              <button onClick={() => setShowResetModal(null)} className="text-white hover:text-amber-100 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 caractères..."
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  {resettingPassword ? "Traitement..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-red-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">Supprimer le Compte</h3>
                <p className="text-[10px] font-mono text-red-100 mt-0.5">Confirmation irréversible</p>
              </div>
              <button onClick={() => setDeleteConfirmUser(null)} className="text-white hover:text-red-100 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-center">
              <p className="text-xs text-slate-650 leading-relaxed font-mono">
                Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email}) ?
                Cette action supprimera également ses jetons d'accès de session.
              </p>

              <div className="flex justify-center gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deletingUser}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider"
                >
                  {deletingUser ? "Suppression..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Plan des Stocks View (Cartographie SVG des Tas) ───────────────────────────
const PlanStocksView = React.memo(function PlanStocksView() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedBpl, setSelectedBpl] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Zoom & Pan states
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  // Interactive drawer & tooltip states
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  const [hoveredStockId, setHoveredStockId] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Data fetching
  const fetchData = async () => {
    try {
      const stockRes = await api.get("/stocks");
      const locRes = await api.get("/locations");
      const typeRes = await api.get("/phosphate-types");
      
      if (stockRes.data.success || stockRes.data.status === "success") {
        setStocks(stockRes.data.data || []);
      }
      if (locRes.data.status === "success") {
        setLocations(locRes.data.data || []);
      }
      if (typeRes.data.status === "success") {
        setTypes(typeRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-[#236534] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Filter logic
  const filteredStocks = stocks.filter(s => {
    if (selectedSite && s.location?.site?.name !== selectedSite) return false;
    if (selectedLocation && s.location_id?.toString() !== selectedLocation) return false;
    if (selectedType && s.phosphate_type_id?.toString() !== selectedType) return false;
    if (selectedBpl && s.bpl_class !== selectedBpl) return false;
    if (selectedStatus) {
      const isCritical = parseFloat(s.quantite) < 5000;
      if (selectedStatus === "critical" && !isCritical) return false;
      if (selectedStatus === "normal" && isCritical) return false;
    }
    return true;
  });

  // Calculate coordinates for stockpiles (trapezoids) dynamically on grid
  const mappedHeaps = filteredStocks.map((s, idx) => {
    const maxCapacity = parseFloat(s.location?.capacite_max) || 30000;
    const currentQty = parseFloat(s.quantite);
    const occupancyRate = maxCapacity > 0 ? (currentQty / maxCapacity) * 100 : 0;
    
    const sectorWidth = 80;
    const startX = 60 + (idx * 90);
    const endX = startX + sectorWidth;
    
    const maxHeight = 60;
    const height = Math.min((currentQty / maxCapacity) * maxHeight, maxHeight) || 15;
    
    const groundY = 160;
    const topY = groundY - height;
    
    const slope = 15;
    const points = `${startX},${groundY} ${startX + slope},${topY} ${endX - slope},${topY} ${endX},${groundY}`;

    let heapColor = "#3B82F6";
    let namePrefix = s.phosphate_type?.code || "PHOS";
    if (namePrefix.includes("MT")) {
      heapColor = "#236534";
    } else if (namePrefix.includes("LF")) {
      heapColor = "#F5A623";
    } else if (namePrefix.includes("SP")) {
      heapColor = "#8B5CF6";
    }
    if (currentQty < 5000) {
      heapColor = "#EF4444";
    }

    return {
      id: s.id,
      name: `TAS-${s.location?.name || s.id}`,
      points,
      color: heapColor,
      qty: currentQty,
      capacity: maxCapacity,
      occupancy: occupancyRate,
      bpl: s.bpl_class,
      site: s.location?.site?.name || "N/A",
      silo: s.location?.name || "N/A",
      type: s.phosphate_type?.name || "N/A",
      startX,
      endX,
      height,
      raw: s
    };
  });

  const selectedStock = mappedHeaps.find(h => h.id === selectedStockId);
  const hoveredStock = mappedHeaps.find(h => h.id === hoveredStockId);

  const totalVolume = filteredStocks.reduce((acc, s) => acc + parseFloat(s.quantite), 0);
  const totalCapacity = filteredStocks.reduce((acc, s) => acc + (parseFloat(s.location?.capacite_max) || 30000), 0);
  const avgOccupancy = totalCapacity > 0 ? (totalVolume / totalCapacity) * 100 : 0;
  const criticalCount = filteredStocks.filter(s => parseFloat(s.quantite) < 5000).length;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn relative">
      
      {/* 1. Global KPIs Bar */}
      <div className="border border-border grid grid-cols-5 divide-x divide-border bg-white shadow-sm" style={{ borderRadius: 20, overflow: 'hidden' }}>
        {[
          { label: "Tas de Phosphate", value: `${mappedHeaps.length} Tas actifs` },
          { label: "Volume Total stocké", value: `${Math.round(totalVolume).toLocaleString()} T` },
          { label: "Capacité globale", value: `${Math.round(totalCapacity).toLocaleString()} T` },
          { label: "Taux d'occupation", value: `${avgOccupancy.toFixed(1)} %` },
          { label: "Tas Critiques (<5kT)", value: `${criticalCount} alerte(s)`, textCol: criticalCount > 0 ? "text-red-655 text-red-600 animate-pulse" : "text-[#233928]" },
        ].map((c, idx) => (
          <div key={idx} className="p-5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block mb-1">{c.label}</span>
            <div className={`font-['Barlow_Condensed'] text-xl font-bold ${c.textCol || "text-[#233928]"}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* 2. Stock Filters bar */}
      <div className="bg-white border border-border p-5 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Filtrage dynamique de la grille</span>
        
        <div className="grid grid-cols-5 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">Complexe OCP</label>
            <select
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold cursor-pointer"
            >
              <option value="">Tous les Complexes</option>
              <option value="Khouribga">Khouribga</option>
              <option value="Benguerir">Benguerir</option>
              <option value="Youssoufia">Youssoufia</option>
              <option value="Jorf Lasfar">Jorf Lasfar</option>
              <option value="Safi">Safi</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">Silo de stockage</label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold cursor-pointer"
            >
              <option value="">Tous les Silos</option>
              {locations.filter(l => !selectedSite || l.site?.name === selectedSite).map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.site?.name})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">Qualité Phosphate</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold cursor-pointer"
            >
              <option value="">Toutes les Qualités</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">Classe BPL</label>
            <select
              value={selectedBpl}
              onChange={e => setSelectedBpl(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold cursor-pointer"
            >
              <option value="">Toutes les Classes BPL</option>
              {Object.keys(BPL_MAP).map(code => (
                <option key={code} value={code}>{code} (&ge;{BPL_MAP[code]?.min}% BPL)</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">État critique</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-[#F5FAF5] text-xs rounded focus:outline-none focus:border-[#236534] font-semibold cursor-pointer"
            >
              <option value="">Tous les États</option>
              <option value="critical">Stock Critique (&lt;5 kT)</option>
              <option value="normal">Stock Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SVG Grid Workspace & Map Toolbar */}
      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4 relative" style={{ borderRadius: 20 }}>
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Rendu SVG interactif</span>
            <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928]">Topologie Physique des Tas</h3>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2.5))}
              className="px-3 py-1.5 border border-border rounded-lg text-xs font-mono hover:bg-slate-50 cursor-pointer"
            >
              Zoom +
            </button>
            <button 
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.6))}
              className="px-3 py-1.5 border border-border rounded-lg text-xs font-mono hover:bg-slate-50 cursor-pointer"
            >
              Zoom -
            </button>
            <button 
              onClick={() => {
                setZoomLevel(1);
                setPanX(0);
                setPanY(0);
              }}
              className="px-3 py-1.5 border border-border rounded-lg text-xs font-mono hover:bg-slate-50 cursor-pointer"
            >
              Reset Vue
            </button>
          </div>
        </div>

        <div className="border border-border bg-[#F8FAF8] rounded-2xl relative overflow-hidden select-none" style={{ minHeight: 320 }}>
          
          <div className="absolute top-4 left-4 bg-white/95 border border-border p-3 flex flex-col gap-2 z-10" style={{ borderRadius: 12 }}>
            <span className="text-[8px] font-mono uppercase text-slate-400 font-bold">Légende des tas</span>
            <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-600">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#236534]" /> MT (Marchandise Tout-Venant)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#F5A623]" /> LF (Reprise convoyeur)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" /> Produit Enrichi</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]" /> Produit Spécial</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> Tas Critique (&lt;5 kT)</div>
              <div className="flex items-center gap-2"><span className="text-[10px]">&rarr;</span> Direction Convoyeur (Vers UC)</div>
            </div>
          </div>

          <div 
            className="w-full h-full min-h-[300px] transition-transform duration-300"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
              transformOrigin: "center center"
            }}
          >
            <svg viewBox="0 0 700 240" className="w-full h-full">
              <line x1="40" y1="180" x2="660" y2="180" stroke="#CBD5E1" strokeWidth="2" />
              
              {[0, 100, 200, 300, 400, 500, 600].map((m, idx) => {
                const tickX = 60 + (idx * 90);
                return (
                  <g key={m}>
                    <line x1={tickX} y1="180" x2={tickX} y2="186" stroke="#94A3B8" strokeWidth="1.5" />
                    <text x={tickX} y="200" fill="#64748B" fontSize="8px" fontFamily="monospace" textAnchor="middle">
                      {m} m
                    </text>
                  </g>
                );
              })}

              {[1, 2, 3, 4, 5].map((lvl, idx) => {
                const sectorX = 100 + (idx * 110);
                return (
                  <g key={lvl}>
                    <line x1={sectorX} y1="40" x2={sectorX} y2="180" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={sectorX} y="55" fill="#94A3B8" fontSize="8px" fontFamily="monospace" textAnchor="middle" className="opacity-70">
                      NIVEAU P{lvl}
                    </text>
                  </g>
                );
              })}

              <g className="opacity-80">
                <rect x="40" y="210" width="620" height="8" fill="#475569" rx="4" />
                <path d="M 640 214 L 650 214 L 647 211 M 650 214 L 647 217" fill="none" stroke="#FFF" strokeWidth="1.5" />
                <text x="630" y="222" fill="#475569" fontSize="7px" fontFamily="monospace" textAnchor="end" fontWeight="bold">
                  CONVOYEUR PRINCIPAL (VERS USINE CHIMIQUE UC) &rarr;
                </text>
              </g>

              {mappedHeaps.length === 0 && (
                <text x="350" y="120" fill="#94A3B8" fontSize="12px" fontFamily="monospace" textAnchor="middle">
                  Aucun tas correspondant aux filtres actifs.
                </text>
              )}

              {mappedHeaps.map(h => (
                <g key={h.id}>
                  <polygon
                    points={h.points}
                    fill={h.color}
                    stroke="#FFF"
                    strokeWidth={selectedStockId === h.id ? "3" : "1.5"}
                    className="cursor-pointer transition-all duration-500 hover:opacity-90 animate-growUp"
                    onClick={() => setSelectedStockId(h.id)}
                    onMouseEnter={(e) => {
                      setHoveredStockId(h.id);
                      setTooltipPos({ x: e.clientX - 180, y: e.clientY - 260 });
                    }}
                    onMouseMove={(e) => {
                      setTooltipPos({ x: e.clientX - 180, y: e.clientY - 260 });
                    }}
                    onMouseLeave={() => setHoveredStockId(null)}
                  />

                  <text 
                    x={h.startX + 40} 
                    y="174" 
                    fill="#FFF" 
                    fontSize="7px" 
                    fontFamily="monospace" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {h.name}
                  </text>
                  <text 
                    x={h.startX + 40} 
                    y="158" 
                    fill="#233928" 
                    fontSize="7px" 
                    fontFamily="sans-serif" 
                    fontWeight="bold" 
                    textAnchor="middle"
                    className="pointer-events-none bg-white px-1"
                  >
                    {Math.round(h.qty).toLocaleString()} T
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="absolute bottom-4 right-4 bg-white border border-border p-2 z-10 hidden md:block" style={{ borderRadius: 12, width: 140 }}>
            <span className="text-[7px] font-mono uppercase text-slate-400 font-bold block mb-1">Navigation Mini-Map</span>
            <div className="h-10 bg-slate-100 border border-slate-200 relative overflow-hidden" style={{ borderRadius: 6 }}>
              <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-slate-300" />
              {mappedHeaps.map(h => (
                <div 
                  key={h.id}
                  className="absolute bg-emerald-700/40"
                  style={{
                    left: `${(h.startX / 700) * 100}%`,
                    width: '10%',
                    bottom: '50%',
                    height: `${(h.height / 60) * 50}%`,
                    borderRadius: '2px 2px 0 0'
                  }}
                />
              ))}
              <div 
                className="absolute border border-red-500 bg-red-500/10 transition-all duration-300"
                style={{
                  left: `${(Math.abs(panX) / 700) * 100}%`,
                  width: `${(1 / zoomLevel) * 100}%`,
                  top: 0,
                  bottom: 0
                }}
              />
            </div>
          </div>
        </div>

        {selectedStock && (
          <div className="bg-[#F5FAF5] border border-[#C8E6CC] p-4 flex justify-between items-center animate-slideDown" style={{ borderRadius: 16 }}>
            <div className="flex gap-6 text-[10px] font-mono text-slate-700">
              <div><strong>Tas sélectionné :</strong> {selectedStock.name}</div>
              <div><strong>Produit :</strong> {selectedStock.type}</div>
              <div><strong>Volume :</strong> {Math.round(selectedStock.qty).toLocaleString()} T</div>
              <div><strong>Occupation :</strong> {selectedStock.occupancy.toFixed(1)}%</div>
            </div>
            <button 
              onClick={() => setSelectedStockId(null)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕ Masquer
            </button>
          </div>
        )}
      </div>

      {hoveredStock && (
        <div 
          className="fixed bg-white border border-border p-3 shadow-2xl flex flex-col gap-1 z-[999] pointer-events-none w-56 animate-fadeIn"
          style={{ 
            left: tooltipPos.x, 
            top: tooltipPos.y,
            borderRadius: 12 
          }}
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-1">
            <span className="text-xs font-bold text-[#233928]">{hoveredStock.name}</span>
            <span className="text-[8px] font-mono bg-emerald-50 text-emerald-800 px-1 rounded">
              {hoveredStock.bpl}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 text-[9px] font-mono text-slate-600">
            <div><strong>Site :</strong> {hoveredStock.site}</div>
            <div><strong>Qualité :</strong> {hoveredStock.type}</div>
            <div><strong>Volume :</strong> {Math.round(hoveredStock.qty).toLocaleString()} T</div>
            <div><strong>Taux :</strong> {hoveredStock.occupancy.toFixed(1)}%</div>
            <div><strong>Statut :</strong> {hoveredStock.qty < 5000 ? "Critique" : "Normal"}</div>
          </div>
        </div>
      )}

      {selectedStock && (
        <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white border-l border-border shadow-2xl z-[999] flex flex-col justify-between animate-slideLeft">
          
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Caractéristiques physiques</span>
              <h3 className="font-['Barlow_Condensed'] text-2xl font-bold text-[#233928]">{selectedStock.name}</h3>
            </div>
            <button 
              onClick={() => setSelectedStockId(null)}
              className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border p-3 bg-[#F5FAF5]" style={{ borderRadius: 12 }}>
                <span className="text-[8px] font-mono text-slate-450 uppercase">Tonnage</span>
                <div className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] mt-1">
                  {Math.round(selectedStock.qty).toLocaleString()} T
                </div>
              </div>
              <div className="border border-border p-3 bg-[#F5FAF5]" style={{ borderRadius: 12 }}>
                <span className="text-[8px] font-mono text-slate-400 uppercase">Capacité max</span>
                <div className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] mt-1">
                  {Math.round(selectedStock.capacity).toLocaleString()} T
                </div>
              </div>
            </div>

            <div className="border border-border" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div className="bg-[#F5FAF5] px-4 py-2 border-b border-border text-[9px] font-mono uppercase text-[#233928] font-bold">
                Spécifications chimiques OCP
              </div>
              <div className="p-4 flex flex-col gap-1.5 text-[10px] font-mono text-slate-650">
                <div className="flex justify-between"><span>Site minier :</span><strong>{selectedStock.site}</strong></div>
                <div className="flex justify-between"><span>Silo :</span><strong>{selectedStock.silo}</strong></div>
                <div className="flex justify-between"><span>Classe BPL :</span><strong>{selectedStock.bpl}</strong></div>
                <div className="flex justify-between"><span>Qualité phosphate :</span><strong>{selectedStock.type}</strong></div>
                <div className="flex justify-between"><span>Teneur P2O5 :</span><strong>32.4 %</strong></div>
                <div className="flex justify-between"><span>Humidité :</span><strong>9.2 %</strong></div>
                <div className="flex justify-between"><span>Cadmium (Cd) :</span><strong>14 ppm</strong></div>
                <div className="flex justify-between"><span>Silice (SiO2) :</span><strong>2.8 %</strong></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Évolution historique du tas (30J)</span>
              <div className="h-32 bg-slate-50 border border-border rounded-xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { day: "J-30", value: selectedStock.qty * 0.8 },
                    { day: "J-20", value: selectedStock.qty * 0.95 },
                    { day: "J-10", value: selectedStock.qty * 1.1 },
                    { day: "J-0", value: selectedStock.qty },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFF" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 7, fill: "#94A3B8" }} />
                    <YAxis tick={{ fontSize: 7, fill: "#94A3B8" }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#236534" fill="#E2F7E5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 flex gap-3">
            <button 
              onClick={() => {
                setSelectedStockId(null);
              }}
              className="flex-1 bg-[#236534] hover:bg-[#1c522a] text-white py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider text-center cursor-pointer"
            >
              Modifier le stock
            </button>
            <button 
              onClick={() => setSelectedStockId(null)}
              className="flex-1 border border-border hover:bg-slate-50 text-slate-650 py-2.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider text-center cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Silos View ────────────────────────────────────────────────────────────────
const SilosView = React.memo(function SilosView() {
  const [locations, setLocations] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locRes = await api.get("/locations");
        const stockRes = await api.get("/stocks");
        if (locRes.data.status === "success") {
          setLocations(locRes.data.data || []);
        }
        if (stockRes.data.success || stockRes.data.status === "success") {
          setStocks(stockRes.data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-[#236534] border-t-transparent rounded-full" />
      </div>
    );
  }

  const sitesMap: Record<string, any[]> = {};
  locations.forEach(l => {
    const siteName = l.site?.name || "Sans site";
    if (!sitesMap[siteName]) sitesMap[siteName] = [];
    sitesMap[siteName].push(l);
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {Object.entries(sitesMap).map(([siteName, locs]) => (
        <div key={siteName} className="flex flex-col gap-4">
          <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928] border-b border-border pb-2">
            Complexe {siteName}
          </h3>
          <div className="grid grid-cols-4 gap-6">
            {locs.map(l => {
              const siloStocks = stocks.filter(s => s.location_id === l.id);
              const currentVolume = siloStocks.reduce((sum, s) => sum + parseFloat(s.quantite), 0);
              const maxCapacity = parseFloat(l.capacite_max) || 25000;
              const occupancyRate = maxCapacity > 0 ? (currentVolume / maxCapacity) * 100 : 0;
              
              let progressColor = "bg-emerald-600";
              let progressBg = "bg-emerald-50";
              let borderCol = "border-emerald-100";
              let textCol = "text-emerald-800";
              if (occupancyRate < 30) {
                progressColor = "bg-amber-500";
                progressBg = "bg-amber-50";
                borderCol = "border-amber-100";
                textCol = "text-amber-800";
              } else if (occupancyRate > 85) {
                progressColor = "bg-red-650 bg-red-600";
                progressBg = "bg-red-50";
                borderCol = "border-red-100";
                textCol = "text-red-800";
              }

              const pTypes = Array.from(new Set(siloStocks.map(s => s.phosphate_type?.name || "N/A"))).join(", ");
              const bplClasses = Array.from(new Set(siloStocks.map(s => s.bpl_class || "N/A"))).join(", ");

              return (
                <div key={l.id} className="bg-white border border-border p-5 shadow-sm flex flex-col justify-between gap-4" style={{ borderRadius: 20 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Silo ID: {l.id}</span>
                      <h4 className="font-['Barlow_Condensed'] text-base font-bold text-[#233928]">{l.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${progressBg} ${textCol} border ${borderCol}`}>
                      {occupancyRate > 85 ? "Silo Plein" : occupancyRate < 30 ? "Niveau Bas" : "Normal"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <div className="w-12 h-20 bg-slate-100 border border-slate-200 relative overflow-hidden flex flex-col justify-end" style={{ borderRadius: "12px" }}>
                      <div 
                        className={`${progressColor} w-full transition-all duration-700`}
                        style={{ height: `${Math.min(occupancyRate, 100)}%` }}
                      />
                      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200/50" />
                      <div className="absolute top-1/3 left-0 right-0 h-[0.5px] bg-slate-200/30" />
                      <div className="absolute top-2/3 left-0 right-0 h-[0.5px] bg-slate-200/30" />
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Taux d'occupation</span>
                      <div className="font-['Barlow_Condensed'] text-2xl font-bold text-[#233928] leading-none">
                        {occupancyRate.toFixed(1)} %
                      </div>
                      <span className="text-[9px] font-mono text-slate-550 text-slate-500">
                        {currentVolume.toLocaleString()} / {maxCapacity.toLocaleString()} T
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-1 text-[10px] font-mono text-slate-600">
                    <div><strong>Type :</strong> {pTypes || "Vide"}</div>
                    <div><strong>Qualité BPL :</strong> {bplClasses || "Aucune"}</div>
                    <div><strong>Statut :</strong> En Service</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

// ─── Sites View (Carte Interactive & Complexes OCP) ───────────────────────────
// ─── Sites & Emplacements View (Carte Interactive & Supervision Silos) ────────
const SitesEmplacementsView = React.memo(function SitesEmplacementsView({ lang }: { lang: "fr" | "en" }) {
  const [selectedSite, setSelectedSite] = useState<string>("Khouribga");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteRegion, setNewSiteRegion] = useState("Inland / Centre");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sitesList, setSitesList] = useState([
    { name: "Khouribga", x: 340, y: 150, region: "Inland / Centre" },
    { name: "Benguerir", x: 280, y: 195, region: "Inland / Sud-Centre" },
    { name: "Youssoufia", x: 240, y: 190, region: "Inland / Gantour" },
    { name: "Jorf Lasfar", x: 280, y: 130, region: "Littoral / Chimique" },
    { name: "Safi", x: 200, y: 175, region: "Littoral / Sud-Chimique" }
  ]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        if (res.data.status === "success" || res.data.success === true) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 animate-pulse">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-[#236534] border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !newSiteRegion) return;
    
    setIsSubmitting(true);
    // Simulate API call to add site
    setTimeout(() => {
      const baseOffset = (sitesList.length - 5) * 35;
      const newSite = {
        name: newSiteName,
        x: 140 + (baseOffset % 150),
        y: 220 - (baseOffset % 100),
        region: newSiteRegion
      };
      setSitesList([...sitesList, newSite]);
      setSelectedSite(newSiteName);
      setIsSubmitting(false);
      setShowAddSiteModal(false);
      setNewSiteName("");
      setNewSiteRegion("Inland / Centre");
    }, 800);
  };

  const getSiteStats = (siteName: string) => {
    const siteStockObj = dashboardData?.stock_by_site?.find((s: any) => s.name && s.name.includes(siteName));
    const totalStock = siteStockObj ? parseFloat(siteStockObj.total) : 0;
    const siteSilos = dashboardData?.metadata?.locations?.filter((l: any) => l.site?.name && l.site.name.includes(siteName)) || [];
    const siteAlerts = dashboardData?.alerts?.filter((a: any) => a.stock?.location?.site?.name && a.stock.location.site.name.includes(siteName)) || [];
    const mvtToday = dashboardData?.recent_movements?.filter((m: any) => m.stock?.location?.site?.name && m.stock.location.site.name.includes(siteName)).length || 0;

    return {
      totalStock,
      silosCount: siteSilos.length,
      alertsCount: siteAlerts.length,
      mvtToday,
      avgBpl: siteName === "Khouribga" || siteName === "Benguerir" ? "73.2% BPL" : "68.5% BPL"
    };
  };

  const selectedStats = getSiteStats(selectedSite);

  // Dynamic locations/silos from the backend
  const allLocations = dashboardData?.metadata?.locations || [];
  const allStocks = dashboardData?.stocks || [];

  const locationsWithStock = allLocations.map((l: any) => {
    // Find stocks related to this location
    const matchedStock = allStocks.find((s: any) => s.location_id === l.id);
    const qty = matchedStock ? parseFloat(matchedStock.quantite || 0) : 0;
    const type = matchedStock?.phosphate_type?.name || (lang === "fr" ? "Indéterminé" : "Unknown");
    return {
      id: l.id,
      name: l.name,
      site: l.site?.name || "N/A",
      cap: parseFloat(l.capacite_max || 50000),
      qty,
      type
    };
  });

  // Filter silos by the selected site
  const filteredSilos = locationsWithStock.filter((l: any) => l.site && l.site.includes(selectedSite));

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Part: Map and selected site stats */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                {lang === "fr" ? "Cartographie Industrielle" : "Industrial Mapping"}
              </span>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] mt-0.5">
                {lang === "fr" ? "CARTE DES EXPLOITATIONS OCP" : "MAP OF OCP EXPLOITATIONS"}
              </h3>
            </div>
            <button 
              onClick={() => setShowAddSiteModal(true)}
              className="flex items-center gap-1.5 bg-[#236534] hover:bg-[#1c522a] text-white px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Plus size={14} /> {lang === "fr" ? "Ajouter un Site" : "Add Site"}
            </button>
          </div>

          <div className="flex justify-center items-center bg-[#F5FAF5] rounded-2xl p-4 border border-emerald-50 relative overflow-hidden select-none" style={{ minHeight: 380 }}>
            <svg viewBox="100 50 300 250" className="w-full h-full max-h-[350px]">
              <path 
                d="M 120 280 L 150 250 L 170 230 L 220 200 L 235 180 L 250 160 L 280 140 L 320 120 L 350 90 L 380 70 L 410 60 L 420 50 L 380 70 L 350 90 L 320 110 L 280 140 L 240 160 L 190 190 L 150 230 L 100 280 Z" 
                fill="#D2E8D5" 
                stroke="#236534" 
                strokeWidth="1.5" 
                className="opacity-60"
              />
              <path 
                d="M 100 280 L 80 320 L 60 380 L 50 430 L 40 480 L 100 480 L 120 420 L 100 280 Z" 
                fill="#E8F4EC" 
                stroke="#236534" 
                strokeWidth="1" 
                strokeDasharray="4"
                className="opacity-50"
              />

              {/* Dynamic Network Connections for added sites */}
              {sitesList.map((s, i) => {
                if (i < 5) return null; // The first 5 are hardcoded on the polygon
                // Connect added sites to Khouribga (index 0) as main hub
                const hub = sitesList[0];
                return (
                  <line 
                    key={`conn-${i}`}
                    x1={s.x} y1={s.y} 
                    x2={hub.x} y2={hub.y} 
                    stroke="#236534" 
                    strokeWidth="1.5" 
                    strokeDasharray="4"
                    className="opacity-40"
                  />
                );
              })}

              {sitesList.map(s => {
                const stats = getSiteStats(s.name);
                const active = selectedSite === s.name;
                
                let markerColor = "#236534";
                let pulseColor = "rgba(35, 101, 52, 0.4)";
                if (stats.alertsCount > 0) {
                  markerColor = "#E05252";
                  pulseColor = "rgba(224, 82, 82, 0.4)";
                } else if (stats.totalStock === 0) {
                  markerColor = "#F5A623";
                  pulseColor = "rgba(245, 166, 35, 0.4)";
                }

                return (
                  <g 
                    key={s.name} 
                    className="cursor-pointer"
                    onClick={() => setSelectedSite(s.name)}
                  >
                    <circle 
                      cx={s.x} 
                      cy={s.y} 
                      r={active ? 14 : 9} 
                      fill={pulseColor}
                      className="animate-ping"
                      style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                    />
                    <circle 
                      cx={s.x} 
                      cy={s.y} 
                      r={active ? 8 : 6} 
                      fill={markerColor}
                      stroke="#FFF"
                      strokeWidth={active ? 2 : 1.5}
                      className="transition-all duration-300"
                    />
                    <text 
                      x={s.x + 10} 
                      y={s.y + 4} 
                      fill="#233928" 
                      fontSize={active ? "10px" : "8px"} 
                      fontFamily="monospace"
                      fontWeight={active ? "bold" : "normal"}
                    >
                      {s.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-[#C8E6CC] p-6 shadow-sm flex flex-col gap-6" style={{ borderRadius: 20 }}>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600">
                {lang === "fr" ? "Complexe Sélectionné" : "Selected Complex"}
              </span>
              <h3 className="font-['Barlow_Condensed'] text-2xl font-bold text-[#233928]">{lang === "fr" ? `Site de ${selectedSite}` : `${selectedSite} Site`}</h3>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                {sitesList.find(s => s.name === selectedSite)?.region}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border p-4 bg-[#F5FAF5]" style={{ borderRadius: 16 }}>
                <span className="text-[9px] font-mono text-slate-400 uppercase">{lang === "fr" ? "Stock Total" : "Total Stock"}</span>
                <div className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928] mt-1">
                  {selectedStats.totalStock.toLocaleString()} T
                </div>
              </div>

              <div className="border border-border p-4 bg-[#F5FAF5]" style={{ borderRadius: 16 }}>
                <span className="text-[9px] font-mono text-slate-400 uppercase">{lang === "fr" ? "Nombre Silos" : "Silos Count"}</span>
                <div className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928] mt-1">
                  {selectedStats.silosCount} {lang === "fr" ? "silo(s)" : "silo(s)"}
                </div>
              </div>

              <div className="border border-border p-4 bg-[#F5FAF5]" style={{ borderRadius: 16 }}>
                <span className="text-[9px] font-mono text-slate-400 uppercase">{lang === "fr" ? "Mouvements (Jour)" : "Movements (Day)"}</span>
                <div className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928] mt-1">
                  {selectedStats.mvtToday} {lang === "fr" ? "validé(s)" : "validated"}
                </div>
              </div>

              <div className="border border-border p-4 bg-[#F5FAF5]" style={{ borderRadius: 16 }}>
                <span className="text-[9px] font-mono text-slate-400 uppercase">{lang === "fr" ? "Qualité Moyenne" : "Average Quality"}</span>
                <div className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928] mt-1">
                  {selectedStats.avgBpl}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              selectedStats.alertsCount > 0 
                ? "bg-red-50 border-red-200 text-red-800" 
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <span className="text-base flex items-center justify-center">
                {selectedStats.alertsCount > 0 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
              </span>
              <div className="text-[10px] font-mono">
                {selectedStats.alertsCount > 0 
                  ? (lang === "fr" ? `${selectedStats.alertsCount} alertes actives détectées sur ce site.` : `${selectedStats.alertsCount} active alerts detected on this site.`)
                  : (lang === "fr" ? "Aucune anomalie détectée sur ce complexe." : "No anomalies detected on this complex.")}
              </div>
            </div>
          </div>

          <div className="bg-white border border-border p-5 shadow-sm text-xs text-slate-500 leading-relaxed" style={{ borderRadius: 20 }}>
            <span className="text-[9px] font-mono uppercase text-slate-400 block mb-1">{lang === "fr" ? "Réseau OCP Maroc" : "OCP Morocco Network"}</span>
            {lang === "fr" 
              ? "Les complexes miniers (Khouribga, Benguerir, Youssoufia) extraient et acheminent le brut vers les terminaux portuaires (Jorf Lasfar, Safi) pour transformation chimique et exportations mondiales."
              : "Mining complexes (Khouribga, Benguerir, Youssoufia) extract and ship raw phosphate to port terminals (Jorf Lasfar, Safi) for chemical processing and global export."}
          </div>
        </div>
      </div>

      {/* Bottom Part: Silos and stock levels for the selected site */}
      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
            {lang === "fr" ? "Supervision Logistique" : "Logistic Supervision"}
          </span>
          <h2 className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">
            {lang === "fr" ? `Emplacements de stockage - Site ${selectedSite}` : `Storage Locations - ${selectedSite} Site`}
          </h2>
        </div>

        {filteredSilos.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50">
            {lang === "fr" ? "Aucun silo configuré pour ce site." : "No silos configured for this site."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filteredSilos.map((l: any) => {
              const pct = Math.round((l.qty / l.cap) * 100);
              return (
                <div key={l.id} className="border border-border p-5 bg-[#F8FAF8] flex flex-col gap-3" style={{ borderRadius: 16 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-[#233928]">{l.name}</h3>
                      <span className="text-[9px] font-mono text-slate-450 uppercase">{l.site} · Type: {l.type}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#236534] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{lang === "fr" ? "Stocké" : "Stocked"}: {l.qty.toLocaleString()} T</span>
                    <span>{lang === "fr" ? "Capacité" : "Capacity"}: {l.cap.toLocaleString()} T</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn">
          <div className="bg-white border border-border shadow-2xl p-6 w-full max-w-md" style={{ borderRadius: 24 }}>
            <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] uppercase tracking-wider">
                {lang === "fr" ? "Ajouter un Nouveau Site" : "Add New Site"}
              </h3>
              <button onClick={() => setShowAddSiteModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm font-mono">&times;</button>
            </div>

            <form onSubmit={handleAddSite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-sans font-semibold text-slate-600">
                  {lang === "fr" ? "Nom du Site *" : "Site Name *"}
                </label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder={lang === "fr" ? "ex: Jorf Lasfar Extension" : "e.g., Jorf Lasfar Extension"}
                  required
                  className="w-full border border-border focus:border-[#00A859] focus:outline-none px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-sans font-semibold text-slate-600">
                  {lang === "fr" ? "Région OCP *" : "OCP Region *"}
                </label>
                <select
                  value={newSiteRegion}
                  onChange={(e) => setNewSiteRegion(e.target.value)}
                  required
                  className="w-full border border-border focus:border-[#00A859] focus:outline-none px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 text-slate-800 cursor-pointer"
                >
                  <option value="Inland / Centre">Inland / Centre</option>
                  <option value="Inland / Sud-Centre">Inland / Sud-Centre</option>
                  <option value="Inland / Gantour">Inland / Gantour</option>
                  <option value="Littoral / Chimique">Littoral / Chimique</option>
                  <option value="Littoral / Sud-Chimique">Littoral / Sud-Chimique</option>
                  <option value="Phosboucraa / Sud">Phosboucraa / Sud</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border mt-2">
                <button type="button" onClick={() => setShowAddSiteModal(false)} className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold">
                  {lang === "fr" ? "Annuler" : "Cancel"}
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#236534] hover:bg-[#1c522a] disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider">
                  {isSubmitting ? (lang === "fr" ? "Enregistrement..." : "Saving...") : (lang === "fr" ? "Créer le site" : "Create Site")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Module Sub-views (Produits, Utilisateurs, Historique, Emplacements) ──────

const ProduitsView = React.memo(function ProduitsView({ currentUserRole }: { currentUserRole: string }) {
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [showModal, setShowModal] = useState<"add" | "edit" | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [densite, setDensite] = useState("");
  const [description, setDescription] = useState("");
  const [quantite, setQuantite] = useState("");
  const [seuilMin, setSeuilMin] = useState("10000");
  const [locationId, setLocationId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const [locations, setLocations] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, stocksRes, locsRes] = await Promise.all([
        api.get("/phosphate-types"),
        api.get("/stocks"),
        api.get("/locations")
      ]);

      if (typesRes.data.status === "success" || typesRes.data.success === true) {
        setTypes(typesRes.data.data || []);
      }
      if (stocksRes.data.success || stocksRes.data.status === "success") {
        setStocks(stocksRes.data.data || []);
      }
      if (locsRes.data.success || locsRes.data.status === "success") {
        setLocations(locsRes.data.data || []);
      }

      // Load alert rules if Admin/Responsable Stock to get thresholds
      if (currentUserRole === "Admin" || currentUserRole === "Responsable Stock") {
        const rulesRes = await api.get("/settings");
        if (rulesRes.data.success || rulesRes.data.status === "success") {
          setAlertRules(rulesRes.data.data.alert_rules || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setShowModal("add");
    setCurrentId(null);
    setCode("");
    setName("");
    setDensite("");
    setDescription("");
    setQuantite("");
    setSeuilMin("10000");
    setLocationId("");
    setMsg(null);
  };

  const handleOpenEdit = (product: any) => {
    setShowModal("edit");
    setCurrentId(product.id);
    setCode(product.code || "");
    setName(product.name || "");
    setDensite(product.densite?.toString() || "");
    setDescription(product.description || "");
    // For edit, we don't modify the stock/location directly from this modal as it gets complex
    setQuantite("");
    setSeuilMin(product.minThreshold?.toString() || "10000");
    setLocationId("");
    setMsg(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const executeDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await api.delete(`/phosphate-types/${deleteConfirmId}`);
      if (res.data.success) {
        fetchData();
        setDeleteConfirmId(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression.");
      setDeleteConfirmId(null);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !densite) {
      setMsg({ text: "Veuillez remplir tous les champs obligatoires.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMsg(null);
    try {
      const parsedDensite = parseFloat(densite.toString().replace(",", "."));
      const payload: any = {
        code,
        name,
        densite: parsedDensite,
        description
      };
      if (quantite) payload.quantite = parseFloat(quantite.toString().replace(",", "."));
      if (seuilMin) payload.seuil_min = parseFloat(seuilMin.toString().replace(",", "."));
      if (locationId) payload.location_id = parseInt(locationId, 10);

      const method = showModal === "edit" ? "put" : "post";
      const url = showModal === "edit" ? `/phosphate-types/${currentId}` : "/phosphate-types";
      const res = await api[method](url, payload);

      if (res.data.success || res.data.status === "success") {
        setMsg({ text: showModal === "edit" ? "Produit mis à jour avec succès !" : "Produit créé avec succès !", type: "success" });
        fetchData();
        setTimeout(() => setShowModal(null), 1500);
      }
    } catch (err: any) {
      let errorMsg = "Erreur lors de la création du produit.";
      if (err.response?.data) {
        if (err.response.data.errors) {
          errorMsg = Object.values(err.response.data.errors).flat().join(" ");
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      setMsg({
        text: errorMsg,
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const processedProducts = types.map(t => {
    const matchingStocks = stocks.filter(s => s.phosphate_type_id === t.id);
    const totalQty = matchingStocks.reduce((sum, s) => sum + parseFloat(s.quantite || 0), 0);
    const locations = Array.from(new Set(matchingStocks.map(s => `${s.location?.site?.name || ""} - ${s.location?.name || ""}`)))
      .filter(l => l.trim() !== "-")
      .join(", ") || "Aucun stockage";

    const rule = alertRules.find(r => r.phosphate_type_id === t.id);
    const minThreshold = rule ? parseFloat(rule.seuil_min) : 10000;

    return {
      id: t.id,
      code: t.code,
      name: t.name,
      densite: t.densite,
      description: t.description,
      category: t.code.includes("GYP") ? "Gypseux" : t.code.includes("ENR") ? "Enrichi" : "Brut",
      qty: totalQty,
      minThreshold,
      location: locations,
      updated: t.updated_at ? new Date(t.updated_at).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit' }) + " " + new Date(t.updated_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : "N/A"
    };
  });

  const filtered = processedProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 animate-pulse">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-[#236534] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4 animate-fadeIn" style={{ borderRadius: 20 }}>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Catalogue OCP</span>
          <h2 className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">Gestion des Produits</h2>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Rechercher un produit..." 
            className="border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] w-64 text-[#233928]"
          />
          {(currentUserRole === "Admin" || currentUserRole === "Responsable Stock") && (
            <button 
              onClick={handleOpenAdd}
              className="bg-[#236534] hover:bg-[#1c522a] text-white text-xs font-mono font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
            >
              + Ajouter un Produit
            </button>
          )}
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F5FAF5] font-mono font-bold text-[10px] uppercase text-slate-500">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Seuil Min</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Mise à jour</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-400 font-mono">Aucun produit trouvé</td>
              </tr>
            ) : filtered.map(p => {
              let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
              let label = "Sécurisé";
              if (p.qty <= p.minThreshold) {
                badgeColor = "bg-red-100 text-red-800 border-red-200";
                label = "Rupture";
              } else if (p.qty <= p.minThreshold * 1.3) {
                badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                label = "Critique";
              }
              return (
                <tr key={p.code} className="hover:bg-[#F5FAF5]/30">
                  <td className="px-4 py-3 font-mono font-bold text-[#233928]">{p.code}</td>
                  <td className="px-4 py-3 font-bold text-[#233928]">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 font-mono font-bold text-[#233928]">{p.qty.toLocaleString()} T</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{p.minThreshold.toLocaleString()} T</td>
                  <td className="px-4 py-3 text-slate-500">{p.location}</td>
                  <td className="px-4 py-3 text-slate-400">{p.updated}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold ${badgeColor}`}>{label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(currentUserRole === "Admin" || currentUserRole === "Responsable Stock") ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-1 text-slate-400 hover:text-[#236534] transition-colors cursor-pointer">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(p.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn">
          <div className="bg-white border border-border shadow-2xl p-6 w-full max-w-md" style={{ borderRadius: 24 }}>
            <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] uppercase tracking-wider">
                {showModal === "add" ? "Ajouter un Nouveau Produit" : "Modifier le Produit"}
              </h3>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm font-mono">&times;</button>
            </div>

            {msg && (
              <div className={`p-3 rounded text-[11px] font-mono mb-4 border ${msg.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Code Produit (ex: P-SHT)</label>
                <input 
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  disabled={showModal === "edit"}
                  placeholder="ex: P-SHT"
                  className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] text-[#233928] ${showModal === 'edit' ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Nom du produit</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Phosphate Super High Grade"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#236534] text-[#233928]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Densité moyenne (t/m³)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={densite}
                  onChange={e => setDensite(e.target.value)}
                  placeholder="ex: 1.85"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] text-[#233928]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Caractéristiques du produit..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#236534] text-[#233928]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Quantité Initiale (T)</label>
                <input 
                  type="number"
                  value={quantite}
                  onChange={e => setQuantite(e.target.value)}
                  placeholder="ex: 12500"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] text-[#233928]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Seuil Minimum (T)</label>
                  <input 
                    type="number"
                    value={seuilMin}
                    onChange={e => setSeuilMin(e.target.value)}
                    placeholder="ex: 10000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] text-[#233928]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Localisation</label>
                  <select 
                    value={locationId}
                    onChange={e => setLocationId(e.target.value)}
                    disabled={showModal === "edit"}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#236534] text-[#233928] cursor-pointer ${showModal === 'edit' ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <option value="">-- Aucun stockage --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.site?.name} - {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border mt-2">
                <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold">Annuler</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#236534] hover:bg-[#1c522a] disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider">
                  {submitting ? "Enregistrement..." : (showModal === "edit" ? "Mettre à jour" : "Créer le produit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Premium Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex justify-center items-center p-4 animate-fadeIn transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-red-100 shadow-[0_0_50px_rgba(220,38,38,0.15)] p-8 w-full max-w-sm relative overflow-hidden transform scale-100 transition-transform duration-300" style={{ borderRadius: 28 }}>
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center gap-5 relative z-10">
              <div className="relative flex items-center justify-center w-20 h-20">
                {/* Pinging background ring */}
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                {/* Static inner circle */}
                <div className="relative flex items-center justify-center w-16 h-16 bg-red-50 rounded-full border-4 border-white shadow-sm">
                  <AlertTriangle size={28} className="text-red-500" strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="space-y-2 mt-2">
                <h3 className="font-['Barlow_Condensed'] text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-wide">
                  Confirmer la suppression
                </h3>
                <p className="text-sm font-sans text-slate-500 leading-relaxed px-2">
                  Êtes-vous absolument sûr de vouloir supprimer ce produit ? <br/>
                  <span className="font-medium text-red-500/80">Cette action est définitive.</span>
                </p>
              </div>
              
              <div className="flex justify-center gap-3 w-full mt-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)} 
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-mono rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-widest font-bold border border-slate-200 hover:border-slate-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeDeleteProduct} 
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-mono font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/30 uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const UtilisateursView = React.memo(function UtilisateursView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Search & Filters
  const [searchUser, setSearchUser] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [sortByDate, setSortByDate] = useState("newest");

  // Modal State
  const [showUserModal, setShowUserModal] = useState<"add" | "edit" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("Responsable Stock");
  const [userActive, setUserActive] = useState(true);
  const [submittingUser, setSubmittingUser] = useState(false);

  // Password Reset Modal
  const [showResetModal, setShowResetModal] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Delete User Confirmation Modal
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      if (res.data.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddUser = () => {
    setMessage(null);
    setShowUserModal("add");
    setCurrentUserId(null);
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setUserRole("Responsable Stock");
    setUserActive(true);
  };

  const handleOpenEditUser = (u: any) => {
    setMessage(null);
    setShowUserModal("edit");
    setCurrentUserId(u.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPassword("");
    setUserRole(u.role);
    setUserActive(u.active);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    setMessage(null);
    try {
      if (showUserModal === "add") {
        const res = await api.post("/settings/users", {
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
          active: userActive
        });
        if (res.data.success) {
          setMessage({ text: "Utilisateur créé avec succès !", type: "success" });
          setShowUserModal(null);
          fetchUsers();
        }
      } else if (showUserModal === "edit" && currentUserId) {
        const res = await api.put(`/settings/users/${currentUserId}`, {
          name: userName,
          email: userEmail,
          role: userRole,
          active: userActive
        });
        if (res.data.success) {
          setMessage({ text: "Utilisateur mis à jour avec succès !", type: "success" });
          setShowUserModal(null);
          fetchUsers();
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur lors de l'enregistrement.", type: "error" });
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeletingUser(true);
    setMessage(null);
    try {
      const res = await api.delete(`/settings/users/${deleteConfirmUser.id}`);
      if (res.data.success) {
        setMessage({ text: "Utilisateur supprimé !", type: "success" });
        setDeleteConfirmUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur de suppression.", type: "error" });
    } finally {
      setDeletingUser(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal) return;
    setResettingPassword(true);
    setMessage(null);
    try {
      const res = await api.post(`/settings/users/${showResetModal.id}/reset-password`, {
        password: newPassword
      });
      if (res.data.success) {
        setMessage({ text: "Mot de passe réinitialisé avec succès !", type: "success" });
        setShowResetModal(null);
        setNewPassword("");
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur lors de la réinitialisation.", type: "error" });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleToggleActive = async (u: any) => {
    try {
      const res = await api.put(`/settings/users/${u.id}`, {
        name: u.name,
        email: u.email,
        role: u.role,
        active: !u.active
      });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort logic
  const filteredUsers = users
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchUser.toLowerCase());
      const matchesRole = roleFilter === "Tous" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortByDate === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {message && (
        <div className={`p-4 text-xs font-mono rounded-lg border ${
          message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-5" style={{ borderRadius: 20 }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-450">Équipes OCP</span>
            <h2 className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">Gestion des Utilisateurs</h2>
          </div>
          
          <button
            onClick={handleOpenAddUser}
            className="bg-[#236534] hover:bg-[#1c522a] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus size={14} /> Ajouter un Utilisateur
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 bg-[#F5FAF5] border border-border" style={{ borderRadius: 16 }}>
          <div className="col-span-2 relative">
            <input
              type="text"
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-9 pr-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
            />
            <Search className="absolute left-3 top-2.5 text-slate-450" size={13} />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
            >
              <option value="Tous">Tous les Rôles</option>
              <option value="Admin">Admin</option>
              <option value="Responsable Stock">Responsable Stock</option>
              
            </select>
          </div>

          <div>
            <select
              value={sortByDate}
              onChange={e => setSortByDate(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
            >
              <option value="newest">Plus récents d'abord</option>
              <option value="oldest">Plus anciens d'abord</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-border" style={{ borderRadius: 16 }}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5FAF5] border-b border-border font-mono font-bold text-[10px] uppercase text-slate-500">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Créé le</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Chargement...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aucun collaborateur trouvé</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-[#233928]">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        u.role === "Admin" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                        u.role === "Responsable Stock" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                        "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2.5 py-1 rounded-full text-[8px] font-bold shadow-sm transition-all cursor-pointer ${
                          u.active 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200" 
                            : "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
                        }`}
                      >
                        {u.active ? "ACTIF" : "DÉSACTIVÉ"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          title="Modifier"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => setShowResetModal(u)}
                          title="Réinitialiser le mot de passe"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Key size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmUser(u)}
                          title="Supprimer"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-[#236534] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">
                  {showUserModal === "add" ? "Ajouter un Collaborateur" : "Modifier le Collaborateur"}
                </h3>
                <p className="text-[10px] font-mono text-emerald-200 mt-0.5">Accréditation et droits OCP</p>
              </div>
              <button onClick={() => setShowUserModal(null)} className="text-white hover:text-emerald-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 flex flex-col gap-4" autoComplete="off">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-450 font-bold">Nom Complet</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                  placeholder="Ex: Youssef El Alami"
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-455 font-bold">Adresse E-mail</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  required
                  placeholder="Ex: y.alami@ocpgroup.ma"
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                />
              </div>

              {showUserModal === "add" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-455 font-bold">Mot de passe temporaire</label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                    required
                    placeholder="Min 6 caractères..."
                    className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-455 font-bold">Rôle & Habilitations</label>
                <select
                  value={userRole}
                  onChange={e => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
                >
                  <option value="Admin">Admin</option>
                  <option value="Responsable Stock">Responsable Stock</option>
                  
                </select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="userActiveCheckUtilisateurs"
                  checked={userActive}
                  onChange={e => setUserActive(e.target.checked)}
                  className="w-4 h-4 text-[#236534] border-border rounded focus:ring-[#236534]"
                />
                <label htmlFor="userActiveCheckUtilisateurs" className="text-xs font-mono text-slate-600 font-bold cursor-pointer select-none">
                  Compte actif (autoriser la connexion de session)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-4 py-2 bg-[#236534] hover:bg-[#1c522a] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  {submittingUser ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-amber-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">Mot de Passe</h3>
                <p className="text-[10px] font-mono text-amber-200 mt-0.5">Réinitialisation pour {showResetModal.name}</p>
              </div>
              <button onClick={() => setShowResetModal(null)} className="text-white hover:text-amber-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-455 font-bold">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Saisir le nouveau mot de passe..."
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  {resettingPassword ? "En cours..." : "Modifier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-red-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">Suppression</h3>
                <p className="text-[10px] font-mono text-red-200 mt-0.5">Confirmer l'action système</p>
              </div>
              <button onClick={() => setDeleteConfirmUser(null)} className="text-white hover:text-red-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-655 font-mono leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le collaborateur <strong className="text-[#233928]">{deleteConfirmUser.name}</strong> ? Cette action est irréversible et révoquera toutes ses accréditations.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deletingUser}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-mono rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  {deletingUser ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const HistoriqueView = React.memo(function HistoriqueView() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "day" | "week" | "month">("all");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/audit-logs?period=${period}`);
        if (res.data?.success || res.data?.status === 'success') {
          setActivities(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [period]);

  const formatModule = (type: string) => {
    if (!type) return "SYSTÈME";
    const parts = type.split("\\");
    const model = parts[parts.length - 1].toUpperCase();
    if (model === "USER") return "UTILISATEUR";
    if (model === "STOCKMOVEMENT") return "MOUVEMENT";
    if (model === "ALERTRULE") return "ALERTE";
    if (model === "DEMANDPREDICTION") return "IA";
    return model;
  };

  return (
    <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4 animate-fadeIn" style={{ borderRadius: 20 }}>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Journal d'activité</span>
          <h2 className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">Historique des Événements</h2>
        </div>
        <div>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-1.5 border border-border rounded-lg text-xs font-mono bg-[#F8FAF8] text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <option value="all">Tout l'historique</option>
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois-ci</option>
          </select>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F5FAF5] font-mono font-bold text-[10px] uppercase text-slate-500">
              <th className="px-4 py-3">Horodatage</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3 text-right">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-mono">Chargement...</td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-mono">Aucun événement enregistré</td>
              </tr>
            ) : (
              activities.map(act => (
                <tr key={act.id} className="hover:bg-[#F5FAF5]/30">
                  <td className="px-4 py-3 font-mono text-slate-400">{new Date(act.created_at).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 font-bold text-[#233928]">{act.user?.name || "Système"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded border bg-slate-100 text-slate-700 text-[8px] font-bold font-mono uppercase">
                      {formatModule(act.auditable_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-650">{act.action}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});



// ─── Placeholder View ──────────────────────────────────────────────────────────

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="bg-white border border-border p-12 text-center text-slate-400 text-xs font-mono" style={{ borderRadius: 20 }}>
      Écran &quot;{title}&quot; en cours d'intégration.
    </div>
  );
}

// ─── Main App Component ────────────────────────────────────────────────────────

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<any>(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [lang, setLang] = useState<"fr" | "en">((localStorage.getItem("lang") as "fr" | "en") || "fr");

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    localStorage.setItem("lang", lang);
  }, [isDarkMode, lang]);

  const [activeView, setActiveView] = useState<View>("dashboard");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"seuils" | "ia" | "users" | "logs">("seuils");

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case "user":
        setSettingsTab("users");
        setActiveView("parametres");
        break;
      case "product":
        setActiveView("produits");
        break;
      case "site":
        setActiveView("sites");
        break;
      case "alert":
        setSettingsTab("seuils");
        setActiveView("parametres");
        break;
      case "pdf":
      case "excel":
        setActiveView("rapports");
        break;
      default:
        break;
    }
  }, []);

  // Global search & notification center states
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: "Alerte de Seuil", msg: "Le Silo 2 de Youssoufia est sous le seuil critique.", time: "10:14" },
    { id: 2, title: "Mouvement Validé", msg: "Sortie de 145 t de phosphate de Safi validée.", time: "09:45" },
    { id: 3, title: "Modèle Prophet", msg: "Calcul IA terminé avec précision de 94.8%.", time: "Hier" }
  ]);

  useEffect(() => {
    setShowNotifs(false);
  }, [activeView]);

  const getSearchSuggestions = () => {
    if (!globalSearch) return [];
    const term = globalSearch.toLowerCase();
    const suggestions: any[] = [];
    
    if ("plan des stocks".includes(term) || "tas".includes(term) || "physique".includes(term)) {
      suggestions.push({ label: "Plan des Stocks (Grille)", type: "Topologie", view: "plan_stocks" });
    }

    dashboardData?.metadata?.phosphate_types?.forEach((t: any) => {
      if (t.name.toLowerCase().includes(term) || t.code.toLowerCase().includes(term)) {
        suggestions.push({ label: `${t.name} (${t.code})`, type: "Phosphate", view: "stocks" });
      }
    });

    dashboardData?.metadata?.locations?.forEach((l: any) => {
      if (l.name.toLowerCase().includes(term)) {
        suggestions.push({ label: `Silo ${l.name} (${l.site?.name})`, type: "Silo", view: "silos" });
      }
    });

    ["Khouribga", "Benguerir", "Youssoufia", "Jorf Lasfar", "Safi"].forEach(s => {
      if (s.toLowerCase().includes(term)) {
        suggestions.push({ label: `Site de ${s}`, type: "Complexe OCP", view: "sites" });
      }
    });

    return suggestions.slice(0, 5);
  };

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/dashboard");
      if (res.data.status === "success" || res.data.success === true) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token, fetchDashboard]);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const renderView = () => {
    if (loading && !dashboardData) {
      return (
        <div className="flex justify-center items-center py-24">
          <span className="animate-spin inline-block w-10 h-10 border-4 border-[#236534] border-t-transparent rounded-full" />
        </div>
      );
    }

    const role = user?.role || "Opérateur";

    switch (activeView) {
      case "dashboard":   return <DashboardView data={dashboardData} user={user} userRole={role} onRefresh={fetchDashboard} onNavigate={setActiveView} onQuickAction={handleQuickAction} lang={lang} isDarkMode={isDarkMode} />;
      case "stocks":      return <StocksView userRole={role} dashboardData={dashboardData} />;
      case "plan_stocks": return <PlanStocksView />;
      case "mouvements":  return <MouvementsView dashboardData={dashboardData} userRole={role} />;
      case "silos":       return <SilosView />;
      case "sites":       return <SitesEmplacementsView lang={lang} />;
      case "produits":    return <ProduitsView currentUserRole={role} />;
      case "utilisateurs": return <UtilisateursView />;
      case "historique":  return <HistoriqueView />;
      case "alertes":    
        if (role !== "Admin" && role !== "Responsable Stock") return <PlaceholderView title="Accès non autorisé" />;
        return <AlertesView alerts={dashboardData?.alerts || []} lang={lang} />;
      case "ia":         
        if (role !== "Admin" && role !== "Responsable Stock") return <PlaceholderView title="Accès non autorisé" />;
        return <IAView />;
      case "rapports":
        if (role !== "Admin" && role !== "Responsable Stock") return <PlaceholderView title="Accès non autorisé" />;
        return <RapportsView lang={lang} />;
      case "parametres":
        if (role !== "Admin" && role !== "Responsable Stock") return <PlaceholderView title="Accès non autorisé" />;
        return <ParametresView currentUserRole={role} initialTab={settingsTab} />;
      default:            return <PlaceholderView title={viewTitles[activeView]} />;
    }
  };

  const navItems = [
    { id: "dashboard",   label: lang === "fr" ? "Dashboard" : "Dashboard",   icon: LayoutDashboard },
    { id: "stocks",      label: TRANSLATIONS[lang].stocks, icon: Package },
    { id: "produits",    label: TRANSLATIONS[lang].produits,    icon: Layers },
    { id: "sites",       label: TRANSLATIONS[lang].sites,   icon: Map },
    { id: "alertes",     label: TRANSLATIONS[lang].alerts,     icon: Bell, badge: (user?.role === "Admin" || user?.role === "Responsable Stock") ? (dashboardData?.active_alerts_count || 0) : 0 },
    { id: "ia",          label: TRANSLATIONS[lang].ia, icon: Brain },
    { id: "rapports",    label: TRANSLATIONS[lang].reports,    icon: FileText },
    { id: "historique",  label: TRANSLATIONS[lang].historique,  icon: Clock },
    { id: "utilisateurs",label: TRANSLATIONS[lang].utilisateurs,icon: Shield },
    { id: "parametres",  label: TRANSLATIONS[lang].settings,  icon: Settings },
  ];

  const viewTitles: Record<View, string> = {
    dashboard:  "Dashboard",
    stocks:     TRANSLATIONS[lang].stocks,
    plan_stocks: TRANSLATIONS[lang].planStocks,
    mouvements: TRANSLATIONS[lang].movements,
    silos:      TRANSLATIONS[lang].silos,
    sites:      TRANSLATIONS[lang].sites,
    produits:   TRANSLATIONS[lang].produits,
    utilisateurs: TRANSLATIONS[lang].utilisateurs,
    historique: TRANSLATIONS[lang].historique,
    emplacements: TRANSLATIONS[lang].emplacements,
    alertes:    TRANSLATIONS[lang].alerts,
    ia:         TRANSLATIONS[lang].ia,
    rapports:   TRANSLATIONS[lang].reports,
    parametres: TRANSLATIONS[lang].settings,
  };

  if (!token) {
    return <LoginView onLoginSuccess={handleLoginSuccess} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} lang={lang} setLang={setLang} />;
  }

  const filteredNavItems = navItems.filter(item => {
    const role = user?.role;
    if (role === "Admin") return true;
    if (role === "Responsable Stock") {
      return ["dashboard", "stocks", "produits", "sites", "alertes", "ia", "rapports", "historique", "parametres"].includes(item.id);
    }
    
  });

  return (
    <div className={`flex h-screen overflow-hidden p-4 gap-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#090A0F] text-white' : 'bg-[#EFF4EF] text-[#233928]'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Sidebar (Premium design from screenshot) ── */}
      <aside className={`w-60 shrink-0 flex flex-col p-5 relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#161719] border-r border-white/5 text-slate-200' : 'bg-white border-r border-[#C8E6CC]/25 text-slate-700'}`} style={{ borderRadius: 24 }}>
        
        {/* OCP Logo & Name at the top (Mockup style) */}
        <div className={`flex items-center gap-3 pb-5 pt-1 border-b shrink-0 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
            <img src="/ocp_logo.png" alt="OCP Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className={`text-sm font-extrabold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-[#233928]'}`}>Phosphates Stocks</div>
            <div className="text-[9px] font-mono text-slate-400 truncate uppercase tracking-wider">Alertes &amp; Surveillance</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow overflow-y-auto overflow-x-hidden pt-6 flex flex-col gap-1 pr-1 scrollbar-none">
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all text-left relative cursor-pointer group ${
                  active
                    ? isDarkMode
                      ? "bg-white/10 text-white font-bold pl-6 pr-4"
                      : "bg-[#E8F5EA] text-[#236534] font-bold pl-6 pr-4"
                    : isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-white/5 px-4"
                      : "text-slate-600 hover:text-[#236534] hover:bg-[#F5FAF5] px-4"
                }`}
              >
                <Icon size={14} className={active ? (isDarkMode ? "text-white" : "text-[#236534]") : "text-slate-400 group-hover:text-[#236534]"} />
                <span className="text-[11px] font-mono tracking-wide">{item.label}</span>
                {item.badge && item.badge > 0 && !active && (
                  <span className="text-[8px] font-mono bg-[#E05252] text-white px-1.5 py-0.5 rounded-full ml-auto leading-none">
                    {item.badge}
                  </span>
                )}
                {active && (
                  // Elegant vertical line on the left side of the active button
                  <span className="absolute left-2.5 top-3 bottom-3 w-1 bg-[#236534] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom wrapper with logout button */}
        <div className="mt-auto pt-4 shrink-0 flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#F8FAF8] border border-border text-[#236534] hover:bg-emerald-50 py-2.5 rounded-full text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer uppercase tracking-wider"
          >
            <LogOut size={12} /> {TRANSLATIONS[lang].logout}
          </button>
        </div>
      </aside>

      {/* ── Main Panel (Inside Browser container window) ── */}
      <div className={`flex-1 flex flex-col overflow-hidden shadow-2xl relative border transition-colors duration-300 ${isDarkMode ? 'bg-[#121315] border-white/5 shadow-[0_15px_50px_rgba(0,0,0,0.6)] text-white' : 'bg-white border-[#C8E6CC]'}`} style={{ borderRadius: 24 }}>
        

        {/* Header Bar */}
        <header className={`h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-[#161719] border-white/5 text-white' : 'bg-white border-slate-100 text-[#233928]'}`}>
          
          {/* Left Side: Global Search bar & Real-time Date */}
          <div className="flex items-center gap-6">
            <div className="relative w-80">
              <div className={`flex items-center border rounded-xl px-3 py-1.5 gap-2 focus-within:border-[#236534] ${isDarkMode ? 'bg-[#1F2023] border-neutral-800' : 'bg-[#F5FAF5] border-slate-200'}`}>
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === "fr" ? "Recherche globale (silo, site...)" : "Global search (silo, site...)"}
                  value={globalSearch}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onChange={e => {
                    setGlobalSearch(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  className={`bg-transparent text-xs w-full focus:outline-none font-mono ${isDarkMode ? 'text-white' : 'text-[#233928]'}`}
                />
                {globalSearch && (
                  <button onClick={() => setGlobalSearch("")} className="text-slate-400 hover:text-slate-650">✕</button>
                )}
              </div>

              {/* Suggestions list */}
              {showSearchSuggestions && globalSearch && (
                <div className={`absolute top-11 left-0 right-0 border shadow-xl rounded-xl max-h-60 overflow-y-auto z-50 p-2 flex flex-col gap-1 ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800' : 'bg-white border-slate-200'}`}>
                  {getSearchSuggestions().length === 0 ? (
                    <span className="text-[10px] font-mono text-slate-400 p-2 block">Aucun résultat trouvé</span>
                  ) : (
                    getSearchSuggestions().map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveView(s.view as View);
                          setGlobalSearch("");
                          setShowSearchSuggestions(false);
                        }}
                        className={`w-full text-left p-2 rounded flex items-center justify-between text-[10px] font-mono cursor-pointer ${isDarkMode ? 'hover:bg-[#232428]' : 'hover:bg-[#F5FAF5]'}`}
                      >
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#233928]'}`}>{s.label}</span>
                        <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-neutral-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          {s.type}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Date Display */}
            <span className={`text-[10px] font-mono flex items-center gap-1.5 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
              <Clock size={12} />
              {new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Right Side Actions: Theme switcher, Notifications, Profile */}
          <div className="flex items-center gap-4">
            
            {/* Theme Selector Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${isDarkMode ? 'bg-[#1F2023] border-neutral-800 text-emerald-400 hover:bg-neutral-800' : 'bg-white border-slate-200 text-[#236534] hover:bg-slate-50'}`}
              title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
            >
              <Contrast size={14} />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => {
                const nextLang = lang === "fr" ? "en" : "fr";
                setLang(nextLang);
                localStorage.setItem("lang", nextLang);
              }}
              className={`w-8 h-8 rounded-full border text-[9px] font-bold font-mono flex items-center justify-center cursor-pointer transition-colors ${isDarkMode ? 'bg-[#1F2023] border-neutral-800 text-emerald-400 hover:bg-neutral-800' : 'bg-white border-slate-200 text-[#236534] hover:bg-slate-50'}`}
            >
              {lang.toUpperCase()}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer relative ${isDarkMode ? 'bg-[#1F2023] border-neutral-800 hover:bg-neutral-800' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <Bell size={14} className={isDarkMode ? "text-slate-300" : "text-slate-650"} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E05252] text-white text-[8px] font-mono font-bold rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Box */}
              {showNotifs && (
                <div className={`absolute top-10 right-0 w-80 border shadow-2xl rounded-2xl p-3 flex flex-col gap-2 z-50 ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-slate-200'}`}>
                  <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-neutral-800' : 'border-slate-100'}`}>
                    <span className={`text-[10px] font-mono uppercase font-bold ${isDarkMode ? 'text-white' : 'text-[#233928]'}`}>
                      Notifications OCP
                    </span>
                    <button onClick={() => setNotifications([])} className="text-[8px] font-mono uppercase text-slate-400 hover:text-red-500 font-bold">
                      Effacer tout
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <span className="text-[9px] font-mono text-slate-400 p-3 text-center">Aucun message récent</span>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-2 border text-[10px] font-mono flex flex-col gap-1 ${isDarkMode ? 'bg-[#232428] border-neutral-800 text-slate-350' : 'bg-[#F5FAF5] border-emerald-50 text-slate-700'}`} style={{ borderRadius: 12 }}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#236534]">{n.title}</span>
                            <span className="text-[8px] text-slate-400">{n.time}</span>
                          </div>
                          <div>{n.msg}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info Details */}
            <div className="relative">
              <div 
                onClick={() => setShowProfileCard(!showProfileCard)}
                className="flex items-center gap-2.5 border-l pl-4 border-slate-200 cursor-pointer select-none"
              >
                <div className="text-right">
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#233928]'}`}>
                    {user?.name || "Directeur Admin"}
                  </div>
                  <div className={`text-[8px] font-mono uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-[#236534]'}`}>
                    {user?.role || "Admin"}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#E2ECE5] border border-emerald-600 flex items-center justify-center text-xs font-extrabold text-[#236534]">
                  {user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "AD"}
                </div>
              </div>

              {/* Profile details dropdown card */}
              {showProfileCard && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileCard(false)} />
                  
                  <div 
                    className={`absolute right-0 top-10 w-64 border shadow-2xl rounded-2xl p-4 flex flex-col gap-3.5 z-50 animate-fadeIn transition-colors duration-300 ${
                      isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-slate-200 text-[#233928]'
                    }`}
                  >
                    <div className="flex items-center gap-3 border-b pb-3 border-border/85">
                      <div className="w-10 h-10 rounded-full bg-[#E2ECE5] border border-emerald-600 flex items-center justify-center text-sm font-black text-[#236534] shrink-0">
                        {user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "AD"}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate">{user?.name || "Directeur Admin"}</div>
                        <div className="text-[9px] font-mono text-slate-400 truncate">{user?.email || "admin@phosphate.com"}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 uppercase">Habilitation</span>
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          user?.role === "Admin" ? "bg-purple-100 text-purple-800 border border-purple-200" : user?.role === "Responsable Stock" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>{user?.role || "Admin"}</span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 uppercase">Statut</span>
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          En ligne
                        </span>
                      </div>

                      {user?.created_at && (
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-400 uppercase">Créé le</span>
                          <span className="text-slate-400">{new Date(user.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileCard(false);
                        handleLogout();
                      }}
                      className="w-full mt-1 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors font-bold cursor-pointer border border-red-150"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#18191D]' : 'bg-[#F8FAF8]'}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}

