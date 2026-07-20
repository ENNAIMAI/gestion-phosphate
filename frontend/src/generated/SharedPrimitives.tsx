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


─────────────────────────────────────────────────────

export function Badge({ statut }: { statut: string }) {
  const styles: Record<string, string> = {
    critique:      `bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]`,
    plein:         `bg-[#E2F7E5] text-[#1A6B2A] border border-[#C3ECBE]`,
    bas:           `bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]`,
    normal:        `bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]`,
    validé:        `bg-[#E2F7E5] text-[#1A6B2A] border border-[#C3ECBE]`,
    en_cours:      `bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]`,
    avertissement: `bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]`,
    NEW:           `bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]`,
    RESOLVED:      `bg-[#E2F7E5] text-[#1A6B2A] border border-[#C3ECBE]`,
  };
  const labels: Record<string, string> = {
    critique: "Critique", plein: "Plein", bas: "Bas", normal: "Normal",
    validé: "Validé", en_cours: "En cours", avertissement: "Attention",
    NEW: "Nouveau", RESOLVED: "Résolu",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded ${styles[statut] ?? `bg-gray-100 text-gray-700`}`}>
      {labels[statut] ?? statut}
    </span>
  );
}

export const tooltipStyle = {
  contentStyle: { background: Palette.textDark, border: "none", borderRadius: 8, padding: "8px 14px" },
  labelStyle:   { color: "#99D8A3", fontSize: 11, fontFamily: "monospace" },
  itemStyle:    { color: "#FFFFFF", fontSize: 11, fontFamily: "monospace" },
};

