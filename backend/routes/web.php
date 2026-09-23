<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/docs/api.json', function () {
    return response()->file(storage_path('api-docs/api-docs.json'));
});

Route::get('/api-docs', function () {
    return view('l5-swagger::index', [
        'documentation' => 'default',
        'documentationTitle' => 'API Docs',
        'secure' => false,
        'urlsToDocs' => ['API Docs' => '/docs/api.json'],
        'operationsSorter' => null,
        'configUrl' => null,
        'validatorUrl' => null,
        'useAbsolutePath' => true,
    ]);
});
