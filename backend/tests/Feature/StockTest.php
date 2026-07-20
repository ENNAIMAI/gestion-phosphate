<?php

use App\Models\User;
use App\Models\Site;
use App\Models\Location;
use App\Models\PhosphateType;
use App\Models\Stock;
use App\Models\MovementType;
use App\Services\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('operator can successfully record an incoming stock movement within capacity', function () {
    $operator = User::create([
        'name' => 'Operator A',
        'email' => 'operatora@phosphate.com',
        'password' => Hash::make('password'),
        'role' => 'Responsable Stock',
    ]);

    $site = Site::create(['name' => 'Site A', 'code' => 'SA-01']);
    $location = Location::create([
        'site_id' => $site->id,
        'name' => 'Hangar 1',
        'capacite_max' => 10000.00
    ]);
    $type = PhosphateType::create(['name' => 'Type A', 'code' => 'TA-01']);
    $mvtType = MovementType::create(['name' => 'Entrée', 'code' => 'IN_MVT', 'direction' => 'IN']);

    Sanctum::actingAs($operator);

    $response = $this->postJson('/api/movements', [
        'location_id' => $location->id,
        'phosphate_type_id' => $type->id,
        'movement_type_id' => $mvtType->id,
        'quantite' => 4500.00,
        'description' => 'Test incoming movement',
        'unite' => 'UL',
        'bpl_class' => 'SHT',
        'quality_index' => 'NONE',
        'niveau' => 'SA2',
        'zone' => 'L30',
        'carreau' => 'BO',
        'traitement_1' => 'B',
        'traitement_2' => 'K'
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('stocks', [
        'location_id' => $location->id,
        'phosphate_type_id' => $type->id,
        'quantite' => 4500.00
    ]);
});

test('incoming stock movement fails if it exceeds maximum capacity limit', function () {
    $operator = User::create([
        'name' => 'Operator B',
        'email' => 'operatorb@phosphate.com',
        'password' => Hash::make('password'),
        'role' => 'Responsable Stock',
    ]);

    $site = Site::create(['name' => 'Site B', 'code' => 'SB-01']);
    $location = Location::create([
        'site_id' => $site->id,
        'name' => 'Hangar 2',
        'capacite_max' => 5000.00
    ]);
    $type = PhosphateType::create(['name' => 'Type B', 'code' => 'TB-01']);
    $mvtType = MovementType::create(['name' => 'Entrée', 'code' => 'IN_MVT2', 'direction' => 'IN']);

    Sanctum::actingAs($operator);

    // Attempting to store 6000 tons in a 5000 tons capacity hangar
    $response = $this->postJson('/api/movements', [
        'location_id' => $location->id,
        'phosphate_type_id' => $type->id,
        'movement_type_id' => $mvtType->id,
        'quantite' => 6000.00,
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});
