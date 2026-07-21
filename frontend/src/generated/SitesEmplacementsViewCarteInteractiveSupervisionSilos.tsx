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


─────
export function SitesEmplacementsView({ lang }: { lang: "fr" | "en" }) {
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

  const handleDeleteSite = () => {
    if (sitesList.length <= 1) return; // Prevent deleting the last site
    if (window.confirm(lang === "fr" ? `Voulez-vous vraiment supprimer le site "${selectedSite}" ?` : `Are you sure you want to delete the site "${selectedSite}"?`)) {
      const updatedSites = sitesList.filter(s => s.name !== selectedSite);
      setSitesList(updatedSites);
      setSelectedSite(updatedSites[0].name);
    }
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
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600">
                  {lang === "fr" ? "Complexe Sélectionné" : "Selected Complex"}
                </span>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold text-[#233928]">{lang === "fr" ? `Site de ${selectedSite}` : `${selectedSite} Site`}</h3>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                  {sitesList.find(s => s.name === selectedSite)?.region}
                </span>
              </div>
              <button 
                onClick={handleDeleteSite}
                title={lang === "fr" ? "Supprimer ce site" : "Delete this site"}
                className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100 shadow-sm"
              >
                <Trash2 size={16} />
              </button>
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
}

