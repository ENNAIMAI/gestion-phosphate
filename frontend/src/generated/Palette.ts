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


───────────────────────────────────

export const Palette = {
  bg:          "#E2ECE5",   // soft mint background
  sidebar:     "#236534",   // rich green sidebar
  sidebarHover:"#1c522a",   // darker green hover
  textDark:    "#233928",   // dark green-charcoal text
  textMuted:   "#5E7A64",   // muted green-slate text
  accentGreen: "#38B25D",   // vibrant green for stats/actions
  accentBlue:  "#7C5CFC",   // indigo/blue for circular ring
  accentRed:   "#E05252",   // soft warning red
  border:      "#D0DDD5",   // soft card border
  white:       "#FFFFFF",
  cardShadow:  "0 4px 20px rgba(35, 57, 40, 0.05)",
};

