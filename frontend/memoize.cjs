const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src/app/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

const viewsToMemoize = [
  'DashboardView',
  'StocksView',
  'MouvementsView',
  'AlertesView',
  'IAView',
  'RapportsView',
  'PlanStocksView',
  'SilosView',
  'SitesEmplacementsView',
  'ProduitsView',
  'UtilisateursView',
  'HistoriqueView'
];

for (const view of viewsToMemoize) {
  // Find function start: function DashboardView(props) {
  const regexStart = new RegExp(`function ${view}\\((.*?)\\)\\s*\\{`, 'g');
  
  if (content.match(regexStart)) {
    // If it's already memoized, skip
    if (content.includes(`const ${view} = React.memo`)) continue;

    console.log(`Memoizing ${view}...`);
    // Replace start
    content = content.replace(regexStart, `const ${view} = React.memo(function ${view}($1) {`);
    
    // To replace the matching closing brace, we can't easily use regex.
    // Let's use a simple brace counting or find the next section comment!
    // Since each view is followed by `// ───` or the end of file.
    
    // A trick: We know the next top-level function or comment starts with `// ───` or `function`.
    // Actually, finding the closing brace is hard with regex. Let's just find the `}` right before the next `// ───`.
    
    // Easier approach: Just use replace with a custom function that finds the balanced brace.
    const startIndex = content.indexOf(`const ${view} = React.memo(function ${view}(`);
    if (startIndex !== -1) {
      let braceCount = 0;
      let i = content.indexOf('{', startIndex);
      if (i !== -1) {
        braceCount = 1;
        i++;
        while (i < content.length && braceCount > 0) {
          if (content[i] === '{') braceCount++;
          if (content[i] === '}') braceCount--;
          i++;
        }
        // i is now right after the closing brace.
        // Replace the '}' at i-1 with '});'
        content = content.substring(0, i - 1) + '});' + content.substring(i);
      }
    }
  }
}

fs.writeFileSync(appPath, content);
console.log("Memoization complete!");
