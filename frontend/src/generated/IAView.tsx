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


───────────────────────────────────────────────────────────────

export function IAView() {
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
      if (historyRes.data.success) {
        setHistoryLogs(historyRes.data.data || []);
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
        if (historyRes.data.success) {
          setHistoryLogs(historyRes.data.data || []);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorDetails(
        err.response?.data?.message || 
        "Le microservice d'IA Prophet est inaccessible ou les données d'historiques générées sont insuffisantes."
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
          { label: "Modèle Prédictif", value: "Prophet AI", sub: "Python microservice" },
          { label: "Confiance", value: `${(confidenceInterval * 100).toFixed(0)} %`, sub: "Intervalle de marge configuré" },
          { label: "État Service", value: "Opérationnel", sub: "FastAPI / Docker network" },
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
              {currentStep >= 1 ? "✓" : "○"} Transmission au microservice Python...
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
          <div className="text-[10px] text-red-650">Suggestions : vérifiez que le container `ai-service` tourne bien ou lancez `docker compose restart`.</div>
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
}

