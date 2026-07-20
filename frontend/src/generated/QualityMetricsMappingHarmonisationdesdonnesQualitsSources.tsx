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




export const UNITE_MAP: Record<string, string> = {
  UL: "Unité UL (Code 1)",
  UL1: "Unité UL1 (Code 2)",
  UL2: "Unité UL2 (Code 3)",
  UL3: "Unité UL3 (Code 4)",
  US: "Unité US (Code 5)",
  UC: "Unité UC (Code 6)",
  UC2: "Unité UC2 (Code 7)",
  UC3: "Unité UC3 (Code 8)",
  UC4: "Unité UC4 (Code 9)",
};

export const BPL_MAP: Record<string, { label: string, desc: string, color: string }> = {
  SHT: { label: "SHT (>75 BPL)", desc: "Super High Grade (Code 1)", color: "#10B981" },
  THT: { label: "THT (73-75 BPL)", desc: "Très Haute Teneur (Code 2)", color: "#34D399" },
  HTN: { label: "HTN (71.5-73 BPL)", desc: "Haute Teneur Normale (Code 3)", color: "#059669" },
  HTM: { label: "HTM (69.5-71.5 BPL)", desc: "Haute Teneur Moyenne (Code 4)", color: "#3B82F6" },
  MT:  { label: "MT (68-69.5 BPL)", desc: "Moyenne Teneur (Code 5)", color: "#60A5FA" },
  BTR: { label: "BTR (65-68 BPL)", desc: "Bas Teneur Riche (Code 6)", color: "#FBBF24" },
  BTN: { label: "BTN (63-65 BPL)", desc: "Bas Teneur Normale (Code 7)", color: "#F59E0B" },
  BTP: { label: "BTP (61-63 BPL)", desc: "Bas Teneur Pauvre (Code 8)", color: "#D97706" },
  TBT: { label: "TBT (56-61 BPL)", desc: "Très Basse Teneur (Code 9)", color: "#EF4444" },
  XBT: { label: "XBT (<56 BPL)", desc: "Extrêmement Basse Teneur (Code A)", color: "#B91C1C" },
};

export const INDEX_MAP: Record<string, string> = {
  RC: "Rendement Citrique >= 28% (Code 1)",
  RF: "Rendement Formique >= 45% (Code 2)",
  FMgO: "Faible en MgO <= 0.55% (Code 3)",
  NONE: "Aucun index spécifique (Code 0)",
};

export const NIVEAU_MAP: Record<string, string> = {
  SA2: "SA2 (Code 1)",
  SB: "SB (Code 2)",
  C0: "C0 (Code 3)",
  C1EXP: "C1EXP (Code 4)",
  C1NOR: "C1NOR (Code 5)",
  C2INF: "C2INF (Code 6)",
  C2SUP: "C2SUP (Code 7)",
  C3INF: "C3INF (Code 8)",
  CSGLO: "CSGLO (Code 9)",
  C4: "C4 (Code A)",
  C4AD: "C4AD (Code B)",
  C2: "C2 (Code C)",
  "C2 export": "C2 export (Code D)",
  "C3 sup": "C3 sup (Code E)",
  C5: "C5 (Code F)",
  C6: "C6 (Code G)",
};

export const ZONE_MAP: Record<string, string> = {
  L30: "Bo-Ouest Lot30 (Code 1)",
  L31: "Bo-Ouest Lot31 (Code 2)",
  L33: "Bo-Ouest Lot33 (Code 3)",
  L34: "Bo-Ouest Lot34 (Code 4)",
  P1: "Bo-Est-P1 (Code 5)",
  P2: "Bo-Est-P2 (Code 6)",
  P3: "Bo-Est-P3 (Code 7)",
  P4: "Bo-Est-P4 (Code 8)",
  R1: "M'ZINDA-R1 (Code 9)",
  R2: "M'ZINDA-R2 (Code A)",
  R3: "M'ZINDA-R3 (Code B)",
  B2P1: "BG2-Panneau 1 (Code C)",
  B2P2: "BG2-Panneau 2 (Code D)",
  B2P3: "BG2-Panneau 3 (Code E)",
  B2P4: "BG2-Panneau 4 (Code F)",
  B2P5: "BG2-Panneau 5 (Code G)",
  BMS: "BG-Mine-Sud (Code H)",
};

export const CARREAU_MAP: Record<string, string> = {
  BO: "BO (Code 1)",
  MZ: "MZ (Code 2)",
  BG: "BG (Code 3)",
};

export const TRAITEMENT_MAP: Record<string, string> = {
  B: "BRUT (Code 1)",
  L: "Lavé (Code 2)",
  F: "Flottation (Code 3)",
  LF: "Lavé + Flotté (Code 4)",
  S: "Séché (Code 5)",
  C: "Calciné Export (Code 6)",
  SCAL: "Séché à UC (Code 7)",
  K: "STOCK (Code 8)",
};

