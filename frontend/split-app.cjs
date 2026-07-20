const fs = require('fs');
const path = require('path');

const fileContent = fs.readFileSync(path.join(__dirname, 'src/app/App.tsx'), 'utf8');

const sections = fileContent.split(/\/\/ ─── (.*?) ───/g);
// sections[0] is everything before the first comment (imports)
// sections[1] is the name of the first comment
// sections[2] is the content of the first comment
// and so on...

const imports = sections[0].trim();

const generatedDir = path.join(__dirname, 'src/generated');
if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

let indexExports = '';

const sharedImports = `import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
`;

for (let i = 1; i < sections.length; i += 2) {
  let name = sections[i].trim();
  let content = sections[i + 1];
  
  if (name.includes('App Component') || name.includes('Main App')) {
    continue; 
  }

  let fileName = name.replace(/[^a-zA-Z0-9]/g, '') + '.tsx';
  if (name.includes('Translations')) fileName = 'Translations.ts';
  if (name.includes('Types')) fileName = 'Types.ts';
  if (name.includes('Palette')) fileName = 'Palette.ts';
  
  // Try to export the main components/constants
  let exportContent = content.replace(/^(const|function|interface|type)\s+([a-zA-Z0-9_]+)/gm, 'export $1 $2');
  
  fs.writeFileSync(path.join(generatedDir, fileName), sharedImports + '\n\n' + exportContent);
  indexExports += `export * from './${fileName.replace('.tsx', '').replace('.ts', '')}';\n`;
}

fs.writeFileSync(path.join(generatedDir, 'index.ts'), indexExports);

console.log("Successfully split sections into src/generated/");
