const fs = require('fs');

let file = 'c:/Users/PC/Desktop/gestion-phosphate/frontend/src/app/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove quick login button
content = content.replace(/<button[^>]*onClick=\{[^}]*setUserRole\(\"Opérateur\"\)[^}]*\}[^>]*>\s*<Settings[^>]*>\s*Connexion rapide Opérateur\s*<\/button>/g, '');

// 2. Remove options from forms
content = content.replace(/<option value=\"Opérateur\">Opérateur<\/option>/g, '');

// 3. Remove roles legend
content = content.replace(/<span className=\"flex items-center gap-1\"><span className=\"w-2 h-2 rounded-full bg-\[\#F5A623\]\" \/> \{lang === \"fr\" \? \"Opérateur\" : \"Operator\"\}<\/span>/g, '');

// 4. Update Pie Charts to remove Opérateur
content = content.replace(/\{\s*name:\s*\"Opérateur\",\s*value:\s*5,\s*fill:\s*\"#F5A623\"\s*\},?/g, '');
content = content.replace(/\{\s*name:\s*lang === \"fr\" \? \"Opérateur\" : \"Operator\",\s*value:\s*7,\s*fill:\s*\"#F5A623\"\s*\},?/g, '');

// 5. getRoleLabel modification
content = content.replace(/case \"Opérateur\": return lang === \"fr\" \? \"Opérateur de Terrain\" : \"Field Operator\";/g, '');

// 6. Default states
content = content.replace(/const \[userRole, setUserRole\] = useState\(\"Opérateur\"\);/g, 'const [userRole, setUserRole] = useState("Responsable Stock");');
content = content.replace(/setUserRole\(\"Opérateur\"\);/g, 'setUserRole("Responsable Stock");');

// 7. Extracting Operator's tools into MouvementsView
const opBlockStart = '{userRole === "Opérateur" && (';
const opBlockIndex = content.indexOf(opBlockStart);
if (opBlockIndex !== -1) {
    let blockLevel = 1;
    let i = opBlockIndex + opBlockStart.length;
    while (i < content.length && blockLevel > 0) {
        if (content.substring(i, i+2) === '&&') { i += 2; continue; }
        if (content[i] === '(') blockLevel++;
        else if (content[i] === ')') blockLevel--;
        i++;
    }
    const opBlock = content.substring(opBlockIndex, i);
    content = content.replace(opBlock, '');
}

const qrAndForm = `
        {/* Intégration des outils Opérateur */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="col-span-1">
            <QRScannerMock />
          </div>
          <div className="col-span-1 border border-border p-6 shadow-sm flex flex-col gap-4 bg-white" style={{ borderRadius: 20 }}>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block mb-1">Opérations</span>
              <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928]">Saisie de Flux Rapide</h3>
            </div>
            <QuickMovementForm metadata={{}} onSuccess={fetchMovements} />
          </div>
        </div>
`;

const mouvementsViewStart = '<div className="flex items-center justify-between">\n          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Traçabilité</span>';
content = content.replace(mouvementsViewStart, qrAndForm + '\n        ' + mouvementsViewStart);

const consignes = `
      {/* Tâches de Shift / Consignes */}
      <div className="border border-border p-6 shadow-sm flex flex-col bg-white mb-6" style={{ borderRadius: 20 }}>
        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mb-1 block">Tâches de Shift</span>
        <h3 className="font-['Barlow_Condensed'] text-sm tracking-wider uppercase font-bold text-[#233928] mb-4">Mes Consignes Terrain</h3>
        
        <div className="flex flex-col gap-3 font-mono text-[10px] text-slate-600">
          {[
            { task: "Inspection des niveaux du Silo JFL-01", done: true },
            { task: "Étalonnage du pont-bascule principal", done: false },
            { task: "Contrôle d'humidité sur Phosphate Gypseux", done: true },
            { task: "Validation visuelle du Tas P2 de Safi", done: false }
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-[#F8FAF8] border border-border" style={{ borderRadius: 12 }}>
              <input type="checkbox" readOnly checked={t.done} className="rounded text-emerald-700 cursor-pointer" />
              <span className={t.done ? "line-through text-slate-400" : "font-bold text-[#233928]"}>{t.task}</span>
            </div>
          ))}
        </div>
      </div>
`;

const kpiGridEnd = '</div>\n\n      {/* ── Main ERP Panels ── */}';
content = content.replace(kpiGridEnd, '</div>\n\n' + consignes + '\n      {/* ── Main ERP Panels ── */}');

// 8. Navigation constraints
content = content.replace(/\/\/ Opérateur\s*return \[[^\]]*\]\.includes\(item\.id\);/g, '');

fs.writeFileSync(file, content);
console.log('Frontend files updated successfully.');
