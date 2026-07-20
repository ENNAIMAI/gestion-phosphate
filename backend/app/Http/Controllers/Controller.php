<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "Phosphate Stock Management API",
    version: "1.0.0",
    description: "API REST professionnelle pour la gestion des stocks de phosphate et les prévisions de la demande."
)]
#[OA\Server(
    url: "http://localhost:8085",
    description: "Serveur de développement local Nginx"
)]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Entrez votre jeton d'accès Sanctum obtenu via /api/login"
)]
abstract class Controller
{
    //
}
