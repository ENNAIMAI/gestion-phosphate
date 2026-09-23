<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Site;
use App\Models\Location;
use App\Models\PhosphateType;
use App\Models\Stock;
use App\Models\MovementType;
use App\Models\StockMovement;
use App\Models\AlertRule;
use App\Models\Alert;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $admin = User::create([
            'name' => 'Directeur Admin',
            'email' => 'admin@phosphate.com',
            'password' => '123456',
            'role' => 'Admin',
        ]);

        $responsable = User::create([
            'name' => 'Responsable de Stock',
            'email' => 'responsable@phosphate.com',
            'password' => '123456',
            'role' => 'Responsable Stock',
        ]);

        $operateur = User::create([
            'name' => 'Opérateur Terrain',
            'email' => 'operateur@phosphate.com',
            'password' => '123456',
            'role' => 'Operateur',
        ]);

        // 2. Sites
        $siteKhouribga = Site::create([
            'name' => 'Site Minier de Khouribga',
            'code' => 'S-KB-01',
            'description' => 'Khouribga, Maroc',
        ]);

        $siteJorf = Site::create([
            'name' => 'Complexe de Jorf Lasfar',
            'code' => 'S-JL-02',
            'description' => 'El Jadida, Maroc',
        ]);

        // 3. Phosphate Types
        $typeRoc = PhosphateType::create([
            'name' => 'Rocheux Brut',
            'code' => 'P-ROC',
            'densite' => 1.90,
            'description' => 'Phosphate brut extrait de la mine.',
        ]);

        $typeEnr = PhosphateType::create([
            'name' => 'Enrichi',
            'code' => 'P-ENR',
            'densite' => 1.80,
            'description' => 'Phosphate traité et enrichi.',
        ]);

        $typeGyp = PhosphateType::create([
            'name' => 'Gypseux',
            'code' => 'P-GYP',
            'densite' => 1.65,
            'description' => 'Phosphate à forte teneur en gypse.',
        ]);

        // 4. Locations & Stocks
        $siloKAlpha = Location::create([
            'site_id' => $siteKhouribga->id,
            'name' => 'Silo K-Nord Alpha',
            'zone' => 'Nord',
            'capacite_max' => 50000.00,
        ]);

        $stockKAlpha = Stock::create([
            'location_id' => $siloKAlpha->id,
            'phosphate_type_id' => $typeRoc->id,
            'quantite' => 42000.00,
            'unite' => 'UL1',
            'bpl_class' => 'MT',
            'quality_index' => 'NONE',
            'niveau' => 'SA2',
            'zone' => 'L31',
            'carreau' => 'BG',
            'traitement_1' => 'B',
            'traitement_2' => 'K',
            'derniere_mise_a_jour' => now(),
        ]);

        $siloKBeta = Location::create([
            'site_id' => $siteKhouribga->id,
            'name' => 'Silo K-Sud Beta',
            'zone' => 'Sud',
            'capacite_max' => 30000.00,
        ]);

        $stockKBeta = Stock::create([
            'location_id' => $siloKBeta->id,
            'phosphate_type_id' => $typeEnr->id,
            'quantite' => 8500.00,
            'unite' => 'UL2',
            'bpl_class' => 'HTN',
            'quality_index' => 'RC',
            'niveau' => 'C1EXP',
            'zone' => 'L33',
            'carreau' => 'BG',
            'traitement_1' => 'L',
            'traitement_2' => 'S',
            'derniere_mise_a_jour' => now(),
        ]);

        $siloJ1 = Location::create([
            'site_id' => $siteJorf->id,
            'name' => 'Silo Portuaire J1',
            'zone' => 'Port',
            'capacite_max' => 80000.00,
        ]);

        $stockJ1 = Stock::create([
            'location_id' => $siloJ1->id,
            'phosphate_type_id' => $typeGyp->id,
            'quantite' => 78000.00,
            'unite' => 'UL3',
            'bpl_class' => 'BTR',
            'quality_index' => 'RF',
            'niveau' => 'C2INF',
            'zone' => 'P1',
            'carreau' => 'MZ',
            'traitement_1' => 'F',
            'traitement_2' => 'K',
            'derniere_mise_a_jour' => now(),
        ]);

        // 5. Movements
        $mvtEntree = MovementType::create(['name' => 'Entrée', 'code' => 'IN', 'direction' => 'IN']);
        $mvtSortie = MovementType::create(['name' => 'Sortie', 'code' => 'OUT', 'direction' => 'OUT']);

        StockMovement::create([
            'stock_id' => $stockKAlpha->id,
            'movement_type_id' => $mvtEntree->id,
            'quantite' => 5000.00,
            'moyen_transport' => 'Train Train-Minerai-04',
            'date_mouvement' => now()->subDays(2),
            'user_id' => $responsable->id,
            'description' => 'Saisie par Ahmed M. Validé par Responsable Stock Khouribga.',
        ]);

        StockMovement::create([
            'stock_id' => $stockJ1->id,
            'movement_type_id' => $mvtSortie->id,
            'quantite' => 12000.00,
            'moyen_transport' => 'Navire Vraquier Atlantic',
            'date_mouvement' => now()->subHours(4),
            'user_id' => $operateur->id,
            'description' => 'Saisie par Youssef K. (En attente de validation).',
        ]);

        // 6. Alerts
        $ruleBeta = AlertRule::create([
            'name' => 'Seuil Critique Silo K-Sud Beta',
            'phosphate_type_id' => $typeEnr->id,
            'seuil_min' => 9000.00,
            'seuil_max' => 29000.00,
            'active' => true,
        ]);

        Alert::create([
            'alert_rule_id' => $ruleBeta->id,
            'stock_id' => $stockKBeta->id,
            'type_alerte' => 'CRITIQUE',
            'message' => 'Le stock du Silo K-Sud Beta est descendu en dessous du seuil critique (8500 T < 9000 T).',
            'statut' => 'NEW',
            'date_creation' => now(),
        ]);

        $ruleJ1 = AlertRule::create([
            'name' => 'Seuil Max Silo Portuaire J1',
            'phosphate_type_id' => $typeGyp->id,
            'seuil_min' => 15000.00,
            'seuil_max' => 75000.00,
            'active' => true,
        ]);

        Alert::create([
            'alert_rule_id' => $ruleJ1->id,
            'stock_id' => $stockJ1->id,
            'type_alerte' => 'MAX_SEUIL',
            'message' => 'Le Silo Portuaire J1 approche de sa capacité maximale (97.5% rempli).',
            'statut' => 'NEW',
            'date_creation' => now(),
        ]);
    }
}
