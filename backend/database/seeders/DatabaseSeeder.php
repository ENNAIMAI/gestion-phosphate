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
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::create([
            'name' => 'Directeur Admin',
            'email' => 'admin@phosphate.com',
            'password' => Hash::make('123456'),
            'role' => 'Admin',
        ]);

        $responsable = User::create([
            'name' => 'Responsable de Stock',
            'email' => 'responsable@phosphate.com',
            'password' => Hash::make('123456'),
            'role' => 'Responsable Stock',
        ]);

        $operateur = User::create([
            'name' => 'Opérateur Terrain',
            'email' => 'operateur@phosphate.com',
            'password' => Hash::make('123456'),
            'role' => 'Operateur',
        ]);


        // 2. Sites
        $siteJorf = Site::create([
            'name' => 'Complexe Jorf Lasfar',
            'code' => 'S-JL-01',
            'description' => 'Unité de production d\'acide phosphorique et d\'engrais.',
        ]);

        $siteKhouribga = Site::create([
            'name' => 'Site Minier Khouribga',
            'code' => 'S-KB-02',
            'description' => 'Zone d\'extraction de phosphate principale.',
        ]);

        $siteGantour = Site::create([
            'name' => 'Site Gantour',
            'code' => 'S-GT-03',
            'description' => 'Extraction et traitement du phosphate.',
        ]);

        // 3. Locations
        $locHangarA = Location::create([
            'site_id' => $siteJorf->id,
            'name' => 'Hangar A',
            'zone' => 'Zone Nord',
            'capacite_max' => 50000.00,
        ]);

        $locSilo1 = Location::create([
            'site_id' => $siteJorf->id,
            'name' => 'Silo 1',
            'zone' => 'Zone Est',
            'capacite_max' => 20000.00,
        ]);

        $locZoneA = Location::create([
            'site_id' => $siteKhouribga->id,
            'name' => 'Zone de Stockage A',
            'zone' => 'Secteur Ouest',
            'capacite_max' => 100000.00,
        ]);

        Location::create([
            'site_id' => $siteGantour->id,
            'name' => 'Silo Gantour A',
            'zone' => 'Zone Est',
            'capacite_max' => 40000.00,
        ]);

        Location::create([
            'site_id' => $siteGantour->id,
            'name' => 'Silo Gantour B',
            'zone' => 'Zone Ouest',
            'capacite_max' => 30000.00,
        ]);

        // 4. Phosphate Types
        $typeGyp = PhosphateType::create([
            'name' => 'Phosphate Gypseux',
            'code' => 'P-GYP',
            'densite' => 1.65,
            'description' => 'Phosphate à forte teneur en gypse pour engrais spécifiques.',
        ]);

        $typeRoc = PhosphateType::create([
            'name' => 'Phosphate Rocheux Brut',
            'code' => 'P-ROC',
            'densite' => 1.90,
            'description' => 'Phosphate brut directement extrait de la mine.',
        ]);

        $typeEnr = PhosphateType::create([
            'name' => 'Phosphate Enrichi',
            'code' => 'P-ENR',
            'densite' => 1.80,
            'description' => 'Phosphate traité et enrichi prêt à l\'exportation.',
        ]);

        // 5. Stocks
        $stock1 = Stock::create([
            'location_id' => $locHangarA->id,
            'phosphate_type_id' => $typeGyp->id,
            'quantite' => 12500.00,
            'unite' => 'UL1',
            'bpl_class' => 'THT',
            'quality_index' => 'RC',
            'niveau' => 'SA2',
            'zone' => 'L31',
            'carreau' => 'BO',
            'traitement_1' => 'L',
            'traitement_2' => 'K',
            'derniere_mise_a_jour' => now(),
        ]);

        $stock2 = Stock::create([
            'location_id' => $locSilo1->id,
            'phosphate_type_id' => $typeEnr->id,
            'quantite' => 18500.00,
            'unite' => 'UL2',
            'bpl_class' => 'SHT',
            'quality_index' => 'RF',
            'niveau' => 'C1EXP',
            'zone' => 'L33',
            'carreau' => 'MZ',
            'traitement_1' => 'F',
            'traitement_2' => 'S',
            'derniere_mise_a_jour' => now(),
        ]);

        $stock3 = Stock::create([
            'location_id' => $locZoneA->id,
            'phosphate_type_id' => $typeRoc->id,
            'quantite' => 85000.00,
            'unite' => 'UL3',
            'bpl_class' => 'BTR',
            'quality_index' => 'NONE',
            'niveau' => 'C2INF',
            'zone' => 'P1',
            'carreau' => 'BG',
            'traitement_1' => 'B',
            'traitement_2' => 'K',
            'derniere_mise_a_jour' => now(),
        ]);

        // 6. Movement Types
        $mvtRec = MovementType::create([
            'name' => 'Réception Mine',
            'code' => 'M-REC-01',
            'direction' => 'IN',
        ]);

        $mvtExp = MovementType::create([
            'name' => 'Expédition Port',
            'code' => 'M-EXP-01',
            'direction' => 'OUT',
        ]);

        // 7. Stock Movements (Historique)
        StockMovement::create([
            'stock_id' => $stock3->id,
            'movement_type_id' => $mvtRec->id,
            'quantite' => 5000.00,
            'date_mouvement' => now()->subDays(2),
            'user_id' => $responsable->id,
            'description' => 'Réception du train en provenance de la mine.',
        ]);

        StockMovement::create([
            'stock_id' => $stock2->id,
            'movement_type_id' => $mvtExp->id,
            'quantite' => 2000.00,
            'date_mouvement' => now()->subDay(),
            'user_id' => $responsable->id,
            'description' => 'Chargement navire quai N°3.',
        ]);

        // 8. Alert Rules
        $ruleGyp = AlertRule::create([
            'name' => 'Seuil critique Hangar A - Gypseux',
            'phosphate_type_id' => $typeGyp->id,
            'seuil_min' => 5000.00,
            'seuil_max' => 45000.00,
            'active' => true,
        ]);

        $ruleEnr = AlertRule::create([
            'name' => 'Silo 1 - Seuil Max Enrichi',
            'phosphate_type_id' => $typeEnr->id,
            'seuil_min' => 2000.00,
            'seuil_max' => 19000.00,
            'active' => true,
        ]);

        // 9. Alerts
        // Création d'une alerte sur Silo 1 qui est proche de son maximum
        Alert::create([
            'alert_rule_id' => $ruleEnr->id,
            'stock_id' => $stock2->id,
            'type_alerte' => 'MAX_SEUIL',
            'message' => 'Le Silo 1 approche de sa capacité maximale (18,500 tonnes / 19,000 tonnes autorisées).',
            'statut' => 'NEW',
            'date_creation' => now(),
        ]);
    }
}
