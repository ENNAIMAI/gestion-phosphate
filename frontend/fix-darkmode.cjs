const fs = require('fs');
const file = 'c:/Users/PC/Desktop/gestion-phosphate/frontend/src/app/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('function DashboardView');
const endIndex = content.indexOf('function StocksView');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find DashboardView boundaries.");
    process.exit(1);
}

let dashboardView = content.substring(startIndex, endIndex);

// Replace bg-white
dashboardView = dashboardView.replace(/className="([^"]*)bg-white([^"]*)"/g, (match, p1, p2) => {
    let classes = (p1 + p2).replace(/\s+/g, ' ').trim();
    return "className={`" + classes + " ${isDarkMode ? 'bg-[#1C1D21] border-neutral-800 text-white' : 'bg-white border-border text-[#233928]'}`}";
});

// Replace hover:bg-slate-50
dashboardView = dashboardView.replace(/hover:bg-slate-50/g, "${isDarkMode ? 'hover:bg-[#232428]' : 'hover:bg-slate-50'}");

// Replace KPI text color logic
dashboardView = dashboardView.replace(/kpi\.textCol \|\| "text-\\[#233928\\]"/g, 'kpi.textCol || (isDarkMode ? "text-white" : "text-[#233928]")');

// Replace standard text-[#233928] inside className=""
dashboardView = dashboardView.replace(/className="([^"]*)text-\\[#233928\\]([^"]*)"/g, (match, p1, p2) => {
    let classes = (p1 + p2).replace(/\s+/g, ' ').trim();
    return "className={`" + classes + " ${isDarkMode ? 'text-white' : 'text-[#233928]'}`}";
});

content = content.substring(0, startIndex) + dashboardView + content.substring(endIndex);
fs.writeFileSync(file, content);
console.log('Successfully updated DashboardView');
