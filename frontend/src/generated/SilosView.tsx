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


─────────────────────────────────────────────────────────────
export function SilosView() {
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
}

