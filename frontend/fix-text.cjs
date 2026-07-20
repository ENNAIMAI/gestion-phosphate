const fs = require('fs');
const file = 'c:/Users/PC/Desktop/gestion-phosphate/frontend/src/app/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('function DashboardView');
const endIndex = content.indexOf('function StocksView');
let dashboardView = content.substring(startIndex, endIndex);

dashboardView = dashboardView.replace(/text-\\[#233928\\]/g, "${isDarkMode ? 'text-white' : 'text-[#233928]'}");

content = content.substring(0, startIndex) + dashboardView + content.substring(endIndex);
fs.writeFileSync(file, content);
console.log('Fixed text colors');
