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


───────────────────────────────────────────────

export function RapportsView({ lang }: { lang: "fr" | "en" }) {
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
}


export function ResponsableParametresView() {
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

export function ParametresView({ currentUserRole, initialTab }: { currentUserRole: string, initialTab?: "seuils" | "ia" | "users" | "logs" }) {
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
                Microservice Python autonome s'appuyant sur Prophet (Meta AI). Calcule de manière adaptative les tendances et anomalies sur les flux de mouvements.
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

