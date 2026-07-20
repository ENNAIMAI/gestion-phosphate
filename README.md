# Plateforme Digitale de Suivi des Stocks de Phosphate (avec Prévisions IA)

Ce projet est une plateforme digitale professionnelle conçue pour le suivi des stocks de phosphate, intégrant un module d'intelligence artificielle pour la prévision de la demande.

## Architecture du Projet

Le projet utilise une architecture multi-conteneurs gérée par **Docker Compose** :

* **Frontend** : Application React (avec Vite) - Port `3001`
* **Backend API** : Laravel 11 (PHP 8.3-FPM) - Port `8085` (via Nginx)
* **AI Service** : FastAPI (Python 3.12, Pandas, Prophet, Scikit-Learn) - Port `8001`
* **Base de données** : MySQL 8 - Port `3306`
* **Administration DB** : phpMyAdmin - Port `8080`
* **Serveur Mail Local** : Mailpit - Port `8025` (Interface Web)

---

## Structure des Dossiers

```text
phosphate-stock/
├── backend/                 # Laravel 11 (API REST)
├── frontend/                # React.js & Vite (Tableau de bord)
├── ai-service/              # Service IA (FastAPI & Prophet)
├── docker/
│   ├── nginx/               # Configuration Nginx pour le Backend
│   │   └── default.conf
│   └── php/                 # Dockerfile PHP 8.3 FPM
│       └── Dockerfile
├── docker-compose.yml       # Orchestration des services automatisée
├── .env.example             # Modèle de variables d'environnement globales
├── .gitignore               # Fichier d'exclusion Git professionnel
└── README.md                # Le présent guide
```

---

## Installation et Démarrage Rapide (Zéro-Configuration)

Ce projet est conçu pour être lancé instantanément, sans aucune configuration manuelle de votre part. Les dépendances s'installent toutes seules et la base de données est automatiquement migrée et remplie (seeders).

### Prérequis
* Docker & Docker Compose installés sur votre machine.
* Git installé.

### Démarrage

1. **Cloner le dépôt** :
   ```bash
   git clone <url-du-depot>
   cd phosphate-stock
   ```

2. **Démarrer les services** :
   ```bash
   docker compose up -d
   ```
   > [!TIP]
   > Le premier démarrage prendra quelques minutes le temps de télécharger les images, construire le frontend, installer les packages Composer (backend) et initialiser la base de données de test.

L'application sera ensuite prête ! Vous n'avez pas besoin d'entrer dans les conteneurs pour exécuter des commandes `artisan` ou `npm`.

---

## Comptes de Démonstration (Seeders)

Pour vous connecter au Tableau de bord sur `http://localhost:3001`, utilisez l'un des comptes pré-configurés.
**Mot de passe commun :** `123456`

| Rôle | Adresse E-mail |
| :--- | :--- |
| **Admin** | `admin@phosphate.com` |
| **Responsable Stock** | `responsable@phosphate.com` |

> **Note de mise à jour :** Le rôle "Opérateur" a été retiré du système. Ses responsabilités (comme la saisie de flux rapide et les tâches de shift) sont désormais accessibles directement via le compte **Responsable Stock**.

---

## Configuration et Variables d'Environnement

Le projet utilise des valeurs par défaut robustes dans `docker-compose.yml` et les fichiers de configuration, incluant des adresses IP statiques pour contourner les problèmes de résolution DNS sous Alpine Linux. 
Si vous souhaitez personnaliser l'environnement (mots de passe, ports), vous pouvez copier les fichiers `.env.example` vers `.env` et les modifier :
- `.env.example` (racine) -> `.env`
- `backend/.env.example` -> `backend/.env`

---

## Dépannage

- **Le Dashboard ou l'API ne répond pas immédiatement après le démarrage ?** Patientez environ 30 secondes le temps que Laravel finisse son initialisation automatique (`composer install` et `migrate`).
- **Lenteurs sur l'API (Temps de chargement > 5s) ?** Les temps de chargement sont normalement optimisés (~150ms). Si vous rencontrez des lenteurs de résolution IPv6, assurez-vous que les sous-réseaux statiques `172.28.0.x` ne sont pas en conflit sur votre machine locale.
- **Remise à zéro de la base de données** : Si vous souhaitez réinitialiser toutes les données, supprimez les volumes :
  ```bash
  docker compose down -v
  docker compose up -d
  ```

---

**Auteur** : Projet de Gestion de Stocks de Phosphate.
