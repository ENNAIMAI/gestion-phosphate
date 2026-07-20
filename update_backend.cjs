const fs = require('fs');

// 1. SettingsController
let file = 'c:/Users/PC/Desktop/gestion-phosphate/backend/app/Http/Controllers/API/SettingsController.php';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/in:Admin,Responsable Stock,Opérateur/g, 'in:Admin,Responsable Stock');
fs.writeFileSync(file, content);

// 2. StockController
file = 'c:/Users/PC/Desktop/gestion-phosphate/backend/app/Http/Controllers/API/StockController.php';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/'Opérateur'/g, "'Responsable Stock'");
fs.writeFileSync(file, content);

// 3. StockMovementPolicy
file = 'c:/Users/PC/Desktop/gestion-phosphate/backend/app/Policies/StockMovementPolicy.php';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/Only Operators \(Opérateur\)/g, 'Only Responsable Stock');
content = content.replace(/\$user->isOperator\(\)/g, '$user->isManager()');
fs.writeFileSync(file, content);

// 4. Migration
file = 'c:/Users/PC/Desktop/gestion-phosphate/backend/database/migrations/0001_01_01_000000_create_users_table.php';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/enum\('role', \['Admin', 'Responsable Stock', 'Opérateur'\]\)->default\('Opérateur'\)/g, "enum('role', ['Admin', 'Responsable Stock'])->default('Responsable Stock')");
fs.writeFileSync(file, content);

// 5. Seeder
file = 'c:/Users/PC/Desktop/gestion-phosphate/backend/database/seeders/DatabaseSeeder.php';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/\s*User::create\(\[\s*'name' => 'Opérateur Terrain',[\s\S]*?\}\);/g, '');
fs.writeFileSync(file, content);

// 6. Tests
file = 'c:/Users/PC/Desktop/gestion-phosphate/backend/tests/Feature/AuthenticationTest.php';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/'Opérateur'/g, "'Responsable Stock'");
fs.writeFileSync(file, content);

file = 'c:/Users/PC/Desktop/gestion-phosphate/backend/tests/Feature/StockTest.php';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/'Opérateur'/g, "'Responsable Stock'");
fs.writeFileSync(file, content);

console.log('Backend files updated successfully.');
