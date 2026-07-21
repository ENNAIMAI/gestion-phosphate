# Plateforme Digitale de Suivi des Stocks de Phosphate (avec Prévisions IA)

Ce projet est une plateforme digitale professionnelle conçue pour le suivi des stocks de phosphate, intégrant un module d'intelligence artificielle pour la prévision de la demande, ainsi qu'un système complet de traçabilité et de validation des mouvements.

## 🚀 Architecture du Projet

Le projet utilise une architecture multi-conteneurs moderne, gérée par **Docker Compose** :

* **Frontend** : Application React (avec Vite & TypeScript) - Port `3001`
* **Backend API** : Laravel 11 (PHP 8.3-FPM) - Port `8085` (via Nginx)
* **AI Service** : FastAPI (Python 3.12, Pandas, Prophet, Scikit-Learn) - Port `8001`
* **Base de données** : MySQL 8 - Port `3306` (Sécurisé en local)
* **Serveur Mail Local** : Mailpit - Port `8025` (Interface Web, sécurisé en local)
* **Administration DB** : phpMyAdmin - Port `8080` (Sécurisé en local)

---

## 🛠️ Structure des Dossiers

```text
gestion-phosphate/
├── backend/                 # Laravel 11 (API REST, Logique Métier, Authentification)
├── frontend/                # React.js & Vite (Tableau de bord, UI/UX, Dark Mode)
├── ai-service/              # Service IA (FastAPI & Prophet)
├── docker/
│   ├── nginx/               # Configuration proxy Nginx
│   └── php/                 # Configuration PHP 8.3 FPM
├── docker-compose.yml       # Orchestration des services automatisée
├── README.md                # Documentation principale du projet
```

---

## ⚙️ Installation et Démarrage Rapide (Zéro-Configuration)

Ce projet est conçu pour être lancé instantanément. Les dépendances s'installent toutes seules et la base de données est automatiquement migrée et remplie avec des données de test réalistes.

### 1. Prérequis
* Docker & Docker Compose installés sur la machine.
* Git installé.

### 2. Démarrage du projet

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/ENNAIMAI/gestion-phosphate.git
   cd gestion-phosphate
   ```

2. **Démarrer les services** :
   ```bash
   docker compose up -d
   ```
   > **Note** : Le premier démarrage prendra quelques minutes le temps de télécharger les images, construire le frontend, installer les packages Composer (backend) et initialiser la base de données de test.

L'application sera ensuite prête ! Aucune configuration manuelle ou installation locale de NodeJS/PHP n'est requise.

---

## 👥 Comptes de Démonstration (Pour l'Encadrant)

Pour vous connecter au **Tableau de bord** (accessible sur [http://localhost:3001](http://localhost:3001)), utilisez l'un des comptes pré-configurés ci-dessous. 

**Mot de passe commun pour tous les comptes :** `123456`

| Rôle | Adresse E-mail | Fonctionnalités clés |
| :--- | :--- | :--- |
| **Admin** | `admin@phosphate.com` | Accès total, Gestion des utilisateurs, Paramètres, Validation des flux, IA. |
| **Responsable Stock** | `responsable@phosphate.com` | Alertes, Validation des flux, Génération de Rapports PDF/Excel, Suivi des Silos. |
| **Opérateur** | `operateur@phosphate.com` | Saisie des mouvements de stocks (mis en attente de validation). |

---

## ✨ Fonctionnalités Principales Développées

1. **Tableau de Bord Dynamique** : Vue d'ensemble avec statistiques clés (Volume total, types de phosphate, alertes de capacité). Support du mode sombre (Dark Mode) et multilinguisme (Français/Anglais).
2. **Gestion des Mouvements (Entrées/Sorties)** : Traçabilité complète des expéditions et réceptions par navire/camion.
3. **Workflow de Validation 🔒** : 
   - Les Opérateurs saisissent de nouveaux mouvements (Statut : *En cours*).
   - Les Admins et Responsables de Stock peuvent les approuver (Bouton *Valider*).
4. **Sécurité Appliquée** : 
   - Mots de passe sécurisés (Bcrypt).
   - Ports sensibles (Base de données, phpMyAdmin) inaccessibles depuis l'extérieur (bind strict sur `127.0.0.1`).
   - Autorisations (Policies) vérifiées côté serveur pour éviter la fraude.
5. **Génération de Rapports** : Export des données de flux au format CSV/Excel pour traitement analytique.
6. **Intelligence Artificielle** : Module connecté en arrière-plan pour prédire les besoins de production (Python/FastAPI).

---

## 🔧 Dépannage

- **Le Dashboard ou l'API ne répond pas immédiatement après le démarrage ?** Patientez environ 30 à 60 secondes le temps que Laravel finisse son initialisation automatique (`composer install` et `migrate --seed`).
- **Remise à zéro de la base de données** : Si vous souhaitez réinitialiser toutes les données pour repartir de zéro :
  ```bash
  docker compose down -v
  docker compose up -d
  ```

---

*Projet développé dans le cadre de la gestion et du suivi des stocks de Phosphate.*
