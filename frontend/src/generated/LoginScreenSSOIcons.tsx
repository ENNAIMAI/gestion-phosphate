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


────────────────────────────────────────────────

export const MicrosoftIcon = () => (
  <div className="grid grid-cols-2 gap-0.5 w-3 h-3 mr-2 shrink-0">
    <div className="bg-[#F25022] w-1.2 h-1.2" />
    <div className="bg-[#7FBA00] w-1.2 h-1.2" />
    <div className="bg-[#00A4EF] w-1.2 h-1.2" />
    <div className="bg-[#FFB900] w-1.2 h-1.2" />
  </div>
);

export const GoogleIcon = () => (
  <svg className="w-3 h-3 mr-2 shrink-0" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 15.01 1 12 1 7.37 1 3.4 3.67 1.5 7.56l3.89 3.02C6.31 7.58 8.92 5.04 12 5.04z" />
    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z" />
    <path fill="#FBBC05" d="M5.39 14.92c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.5 7.32C.54 9.22 0 11.35 0 12.63c0 1.28.54 3.41 1.5 5.31l3.89-3.02z" />
    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.08 0-5.69-2.54-6.61-5.54l-3.89 3.02C3.4 20.33 7.37 23 12 23z" />
  </svg>
);

