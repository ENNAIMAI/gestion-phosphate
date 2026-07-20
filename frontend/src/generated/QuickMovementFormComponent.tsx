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


────────────────────────────────────────

export function QuickMovementForm({ metadata, onSuccess }: { metadata: any, onSuccess: () => void }) {
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

  const filteredLocations = metadata?.locations?.filter((l: any) => l.site_id === Number(siteId)) || [];

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

