# Analyse des besoins – Projet de fin d'études

## Contexte

Je souhaite développer une plateforme web intelligente de gestion des stocks de phosphate pour une entreprise industrielle (inspirée de l'OCP). L'objectif est de permettre le suivi des stocks en temps réel, la gestion des mouvements de stock, la visualisation des données et l'intégration d'un module d'intelligence artificielle capable de prévoir la demande future afin d'aider à la prise de décision.

Le projet sera développé avec les technologies suivantes :

* Front-end : React.js + Bootstrap
* Back-end : Laravel 11 (API REST)
* Base de données : MySQL
* Intelligence artificielle : Python (Flask/FastAPI + Scikit-learn ou Prophet)

---

# Objectifs du projet

La plateforme doit permettre de :

* Centraliser toutes les informations relatives aux stocks de phosphate.
* Gérer plusieurs sites de stockage.
* Gérer plusieurs zones de stockage (locations).
* Gérer différents types de phosphate.
* Suivre toutes les entrées, sorties et transferts de stock.
* Générer automatiquement des alertes lorsque le stock devient critique.
* Afficher des tableaux de bord interactifs.
* Prévoir la demande future grâce à un modèle d'intelligence artificielle.

---

# Acteurs

## 1. Administrateur

L'administrateur est responsable de l'administration complète du système.

Il peut :

* Se connecter.
* Gérer les utilisateurs.
* Ajouter, modifier et supprimer des sites.
* Ajouter, modifier et supprimer des localisations.
* Gérer les types de phosphate.
* Consulter tous les stocks.
* Consulter les mouvements.
* Configurer les seuils d'alerte.
* Consulter les prévisions de l'IA.
* Consulter les statistiques.
* Gérer les documents.
* Gérer les rôles et permissions.

---

## 2. Responsable de stock

Le responsable de stock peut :

* Se connecter.
* Consulter les stocks.
* Ajouter un nouveau stock.
* Modifier les informations d'un stock.
* Enregistrer une entrée de stock.
* Enregistrer une sortie de stock.
* Effectuer un transfert entre deux zones.
* Consulter les alertes.
* Consulter les tableaux de bord.
* Consulter les prévisions IA.

---

## 3. Opérateur

L'opérateur peut :

* Se connecter.
* Consulter les stocks.
* Enregistrer les mouvements de stock.
* Consulter son historique.
* Ajouter des observations.

---

# Fonctionnalités principales

## Authentification

Le système doit permettre :

* Connexion sécurisée.
* Déconnexion.
* Gestion des rôles.
* Gestion des permissions.

---

## Gestion des sites

Le système doit permettre :

* Ajouter un site.
* Modifier un site.
* Supprimer un site.
* Consulter la liste des sites.
* Rechercher un site.

Chaque site possède :

* Code
* Nom
* Région
* Coordonnées GPS

---

## Gestion des localisations

Chaque site contient plusieurs localisations.

Une localisation possède :

* Nom
* Code
* Type
* Capacité maximale
* Coordonnées GPS

Le système doit permettre :

* Ajouter
* Modifier
* Supprimer
* Rechercher

---

## Gestion des types de phosphate

Chaque type possède :

* Code
* Nom
* Catégorie
* BPL standard
* Humidité minimale
* Humidité maximale
* Description

Le système doit permettre :

* Ajouter
* Modifier
* Supprimer
* Consulter

---

## Gestion des stocks

Le système doit permettre :

* Créer un stock.
* Modifier un stock.
* Consulter les stocks.
* Rechercher un stock.
* Afficher la quantité actuelle.
* Afficher le statut.
* Afficher la qualité.
* Afficher le niveau d'humidité.

---

## Gestion des mouvements

Chaque mouvement peut être :

* Entrée
* Sortie
* Transfert
* Ajustement

Pour chaque mouvement :

* Date
* Quantité
* Opérateur
* Stock concerné
* Localisation source
* Localisation destination
* Observation

Le système doit conserver l'historique complet.

---

## Gestion des alertes

Le système doit générer automatiquement des alertes lorsque :

* Le stock est inférieur au seuil minimal.
* Le stock dépasse la capacité maximale.
* Aucun mouvement n'a été effectué pendant une période définie.

Chaque alerte possède :

* Niveau
* Date
* Message
* État (traitée ou non)

---

## Tableau de bord

Le tableau de bord doit afficher :

* Quantité totale disponible.
* Nombre de sites.
* Nombre de localisations.
* Nombre de mouvements.
* Nombre d'alertes.
* Stock critique.
* Graphique des entrées.
* Graphique des sorties.
* Graphique de l'évolution des stocks.
* Prévision IA.

---

## Intelligence artificielle

Le système doit intégrer un modèle d'intelligence artificielle permettant :

* L'analyse de l'historique des mouvements.
* La prévision de la demande future.
* L'estimation des besoins futurs.
* L'aide à la décision.

Le modèle reçoit :

* Date
* Quantité
* Type de phosphate
* Site
* Historique

Le modèle retourne :

* Demande prévue
* Niveau de confiance
* Date de prévision

---

## Gestion documentaire

Le système doit permettre :

* Importer des documents.
* Associer un document à un mouvement ou à un stock.
* Télécharger les documents.

Formats :

* PDF
* Excel
* Images

---

## Recherche

Le système doit permettre une recherche par :

* Site
* Localisation
* Type de phosphate
* Date
* Statut
* Quantité

---

## Rapports

Le système doit permettre :

* Export PDF.
* Export Excel.
* Rapport journalier.
* Rapport mensuel.
* Rapport annuel.
* Historique complet.

---

# Exigences non fonctionnelles

Le système doit être :

* Sécurisé.
* Rapide.
* Responsive.
* Facile à utiliser.
* Évolutif.
* Maintenable.
* Disponible 24h/24.
* Compatible avec les principaux navigateurs.
* Conforme à une architecture REST API.

---

# Architecture souhaitée

Frontend :

* React.js
* Bootstrap
* Axios
* Chart.js

Backend :

* Laravel 11
* API REST
* Laravel Sanctum pour l'authentification

Base de données :

* MySQL

Intelligence artificielle :

* Python
* Pandas
* Scikit-learn
* Prophet
* Flask ou FastAPI

---

# Livrables attendus

Le projet doit comprendre :

* Une base de données relationnelle complète.
* Une API REST sécurisée.
* Une interface web moderne et responsive.
* Un tableau de bord interactif.
* Un module d'intelligence artificielle pour la prévision de la demande.
* Une documentation technique.
* Une documentation utilisateur.
* Les diagrammes UML (cas d'utilisation, classes, séquences, ERD).
