<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a user can authenticate with valid credentials', function () {
    $user = User::create([
        'name' => 'John Operator',
        'email' => 'john@phosphate.com',
        'password' => Hash::make('password'),
        'role' => 'Responsable Stock',
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'john@phosphate.com',
        'password' => 'password',
        'device_name' => 'TestDevice',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Connexion réussie.',
        ])
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role'
                ]
            ]
        ]);
});

test('authentication fails with invalid credentials', function () {
    $response = $this->postJson('/api/login', [
        'email' => 'unknown@phosphate.com',
        'password' => 'wrongpassword',
        'device_name' => 'TestDevice',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'success' => false,
            'message' => 'Les identifiants saisis sont incorrects.',
        ]);
});
