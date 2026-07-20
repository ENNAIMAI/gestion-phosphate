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


────────────────────────────────────────────────────────

export interface ViewProps {
  data: any;
  user?: any;
  userRole: string;
  onRefresh: () => void;
  onNavigate: (view: View) => void;
  onQuickAction?: (action: string) => void;
  lang?: "fr" | "en";
  isDarkMode?: boolean;
}

export function QRScannerMock() {
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

export function DashboardView({ data, user, userRole, onRefresh, onNavigate, onQuickAction, lang, isDarkMode }: ViewProps) {
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

  const handleQuickAction = (action: string) => {
    alert(`[OCP ERP Admin] Action lancée : ${action}`);
  };

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
}

export function StocksView({ userRole }: { userRole: string }) {
  const [stocksList, setStocksList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [metadata, setMetadata] = useState<any>(null);

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

  const fetchMetadata = async () => {
    try {
      const res = await api.get("/dashboard");
      if (res.data.status === "success" || res.data.success === true) {
        setMetadata(res.data.data?.metadata);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchMetadata();
  }, []);

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

  const filteredLocations = metadata?.locations?.filter((l: any) => l.site_id === Number(siteId)) || [];
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
}

