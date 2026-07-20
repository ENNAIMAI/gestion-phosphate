import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, ComposedChart, Scatter, ScatterChart, ZAxis, Cell, PieChart, Pie,
  ReferenceLine
} from 'recharts';
import * as Lucide from 'lucide-react';
import { 
  Shield, Database, Settings, Contrast, Mail, Lock, Eye, EyeOff, LayoutDashboard, Layers, Box, AlertTriangle, Activity, FileText, Menu, Search, Filter, RefreshCw, LogOut, Bell, FileDown, Plus, Edit2, Trash2, X, CheckCircle, Clock, Truck, ChevronDown, Download, Users, Sliders
} from 'lucide-react';
import axios from 'axios';
import { format, parseISO, addDays, formatDistanceToNow, isAfter, isBefore, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';


───────────────────────────────────

export interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  lang: "fr" | "en";
  setLang: (lang: "fr" | "en") => void;
}

export function LoginView({ onLoginSuccess, isDarkMode, setIsDarkMode, lang, setLang }: LoginProps) {
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

