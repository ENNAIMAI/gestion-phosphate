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


──────────────────────────────────────────────────────────

export interface AlertViewProps {
  alerts: any[];
  lang: "fr" | "en";
}

export function AlertesView({ alerts, lang }: AlertViewProps) {
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
          <div className="flex items-center gap-1.5 text-[11px] border border-slate-200 px-3 py-1.5 rounded text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
            <Filter size={12} />
            <span className="font-medium">{lang === "fr" ? "Toutes les priorités" : "All Priorities"}</span>
            <ChevronDown size={12} />
          </div>
        </div>

        {/* List of alert items */}
        <div className="divide-y divide-slate-100">
          {alerts.length > 0 ? (
            alerts.map((a: any) => (
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
                <p className="text-[13px] text-slate-500 mt-1">{lang === "fr" ? "Vous n'avez aucune alerte active pour le moment." : "You have no active alerts at the moment."}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

