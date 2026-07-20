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


────────────────────────
export function PlanStocksView() {
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
}

