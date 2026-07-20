const fs = require('fs');

const file = 'c:/Users/PC/Desktop/gestion-phosphate/frontend/src/app/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add missing lucide-react imports
if (!content.includes('Activity,')) {
    content = content.replace('from "lucide-react";', ', Activity, Download, Info, Smartphone, MessageSquare, Save, TrendingUp, Settings } from "lucide-react";');
}

const responsableComponent = `
function ResponsableParametresView() {
  const [seuilCritique, setSeuilCritique] = useState(15);
  const [seuilAvertissement, setSeuilAvertissement] = useState(30);
  const [horizon, setHorizon] = useState("30");
  const [emailNotif, setEmailNotif] = useState(true);
  const [appNotif, setAppNotif] = useState(true);
  const [frequence, setFrequence] = useState("hebdomadaire");
  const [lang, setLang] = useState("fr");
  const [timezone, setTimezone] = useState("UTC+1");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: "success"|"error"} | null>(null);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage({text: "Vos préférences ont été sauvegardées avec succès.", type: "success"});
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  const handleReset = () => {
    setSeuilCritique(15);
    setSeuilAvertissement(30);
    setHorizon("30");
    setEmailNotif(true);
    setAppNotif(true);
    setFrequence("hebdomadaire");
    setLang("fr");
    setTimezone("UTC+1");
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-24">
      {/* Top Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer">
          <Brain size={14} /> Générer une prévision
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors shadow-sm cursor-pointer">
          <Activity size={14} /> Tester le modèle
        </button>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors shadow-sm cursor-pointer">
          <RefreshCw size={14} /> Réinitialiser
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-border rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-sm cursor-pointer md:ml-auto">
          <Download size={14} /> Exporter la configuration
        </button>
      </div>

      {message && (
        <div className={\`p-4 border-l-4 rounded-xl text-xs font-mono shadow-sm flex items-center gap-3 \${message.type === "success" ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-red-50 border-red-500 text-red-800"}\`}>
          <CheckCircle size={16} /> {message.text}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex gap-3 shadow-sm">
        <Info className="text-amber-600 shrink-0 mt-0.5" size={16} />
        <div>
          <h4 className="text-amber-800 text-xs font-bold uppercase tracking-wider font-mono mb-1">Information Importante</h4>
          <p className="text-[11px] text-amber-700/80 font-mono leading-relaxed">
            Les modifications des paramètres n'affectent que les prévisions futures et ne recalculent pas les anciennes prédictions.
          </p>
        </div>
      </div>

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Alertes */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928]">Paramètres des Alertes</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Gestion des seuils</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Seuil critique (%)</label>
                <span className="text-xs font-bold text-red-600">{seuilCritique}%</span>
              </div>
              <input type="range" min="5" max="50" value={seuilCritique} onChange={e => setSeuilCritique(parseInt(e.target.value))} className="w-full accent-red-600" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Seuil d'avertissement (%)</label>
                <span className="text-xs font-bold text-orange-500">{seuilAvertissement}%</span>
              </div>
              <input type="range" min="10" max="80" value={seuilAvertissement} onChange={e => setSeuilAvertissement(parseInt(e.target.value))} className="w-full accent-orange-500" />
            </div>
          </div>
        </div>

        {/* Horizon IA */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928]">Horizon des Prévisions</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Configuration temporelle</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Profondeur de prévision</label>
            <select value={horizon} onChange={e => setHorizon(e.target.value)} className="w-full p-2.5 border border-border rounded-xl text-xs font-mono focus:outline-none focus:border-[#236534] bg-slate-50 cursor-pointer">
              <option value="7">Court terme (7 jours)</option>
              <option value="30">Moyen terme (30 jours)</option>
              <option value="90">Long terme (90 jours)</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Smartphone size={16} />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928]">Paramètres des Notifs</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Canaux de communication</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-slate-500" />
                <span className="text-[11px] font-mono font-bold text-slate-700">Alertes par E-mail</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#236534]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <MessageSquare size={14} className="text-slate-500" />
                <span className="text-[11px] font-mono font-bold text-slate-700">Notifications In-App</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={appNotif} onChange={e => setAppNotif(e.target.checked)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#236534]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Rapports & Préférences */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Settings size={16} />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928]">Préférences Utilisateur</h3>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Langue et rapports</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Fréquence des rapports</label>
              <select value={frequence} onChange={e => setFrequence(e.target.value)} className="w-32 p-1.5 border border-border rounded-lg text-xs font-mono focus:outline-none bg-slate-50">
                <option value="journaliere">Journalière</option>
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="mensuelle">Mensuelle</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Langue</label>
              <select value={lang} onChange={e => setLang(e.target.value)} className="w-32 p-1.5 border border-border rounded-lg text-xs font-mono focus:outline-none bg-slate-50">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase text-slate-600">Fuseau Horaire</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-32 p-1.5 border border-border rounded-lg text-xs font-mono focus:outline-none bg-slate-50">
                <option value="UTC">UTC</option>
                <option value="UTC+1">UTC+1 (Maroc)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Update Card */}
      <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-slate-400" />
          <span className="text-[11px] font-mono text-slate-500">Dernière mise à jour le <strong className="text-slate-700">{new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</strong> par <strong className="text-[#236534]">Responsable Stock</strong></span>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-6 right-6 bg-white border border-border shadow-2xl p-4 rounded-2xl flex gap-3 z-40">
        <button onClick={handleReset} className="px-4 py-2 text-xs font-mono font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer uppercase tracking-wider">
          Annuler
        </button>
        <button onClick={handleReset} className="px-4 py-2 border border-border rounded-xl text-xs font-mono font-bold hover:bg-slate-50 transition-colors cursor-pointer text-slate-600 shadow-sm uppercase tracking-wider">
          Réinitialiser
        </button>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#236534] hover:bg-[#1c522a] disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-colors shadow-md cursor-pointer flex items-center gap-2 uppercase tracking-wider">
          {saving ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={14} />}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function ParametresView`;

if (!content.includes('function ResponsableParametresView')) {
    content = content.replace('function ParametresView', responsableComponent);
}

const paramViewReturn = `
  if (currentUserRole === "Responsable Stock") {
    return <ResponsableParametresView />;
  }

  return (
`;

content = content.replace(/  return \(\n    <div className="flex flex-col gap-6 animate-fadeIn">\n      <div className="bg-white border/g, paramViewReturn + '    <div className="flex flex-col gap-6 animate-fadeIn">\n      <div className="bg-white border');

fs.writeFileSync(file, content);
console.log('done');
