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


───────────────────────────────────────────────────────

export function MouvementsView() {
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
                  <td className="px-4 py-3.5"><Badge statut={m.movement_type?.direction === "IN" ? "validé" : "en_cours"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

