const fs = require('fs');
let f = 'c:/Users/PC/Desktop/gestion-phosphate/frontend/src/app/App.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/\s*if \(currentUserRole === "Responsable Stock"\) \{\s*return <ResponsableParametresView \/>;\s*\}/g, '');

// Now we need to make sure ParametresView still has it if it needs it.
// Actually, in ParametresView, if the role is Responsable Stock, maybe we shouldn't return ResponsableParametresView?
// Let's see if ResponsableParametresView is a real component.
// We can just add it back properly in ParametresView if it exists.
// Wait, ParametresView has `if (currentUserRole === "Responsable Stock")` logic inside it manually?
// I will just remove all of them. If the Responsable is trying to access ParametresView, they will just see the Admin view or we can add it back safely.
// Let's add it back at the top of ParametresView:
c = c.replace(
  /function ParametresView\(\{\s*currentUserRole,\s*initialTab\s*\}\s*:\s*\{\s*currentUserRole:\s*string,\s*initialTab\?:\s*"seuils"\s*\|\s*"ia"\s*\|\s*"users"\s*\|\s*"logs"\s*\}\)\s*\{/,
  `function ParametresView({ currentUserRole, initialTab }: { currentUserRole: string, initialTab?: "seuils" | "ia" | "users" | "logs" }) {\n  if (currentUserRole === "Responsable Stock") return <ResponsableParametresView />;\n`
);

fs.writeFileSync(f, c);
console.log("Done");
