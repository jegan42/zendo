# 🛍️ Zendo — Marketplace artisanale

Zendo est une application web fullstack permettant de mettre en relation des vendeurs et des acheteurs autour de produits artisanaux.

Ce projet a été réalisé en équipe dans le cadre d’une formation, avec pour objectif de concevoir une application complète incluant authentification, gestion de produits, panier et commandes.

---

## 🚀 Fonctionnalités

### 👤 Authentification

* Inscription / Connexion
* Authentification via Google OAuth
* Réinitialisation de mot de passe par email (Nodemailer)
* Gestion des tokens JWT

### 🛒 Expérience utilisateur

* Parcours catalogue produits
* Filtres par catégories / familles
* Fiche produit détaillée
* Ajout aux favoris
* Gestion du panier
* Passage de commande
* Gestion des adresses

### 🧑‍🎨 Espace vendeur

* Création et gestion de produits
* Modification des fiches produits

### 🤖 Fonctionnalités avancées

* Validation des formulaires (React Hook Form)

---

## 🧱 Architecture

Le projet est divisé en deux parties :

```
/client  → Frontend (React + TypeScript)
/server  → Backend (Node.js + Express + MongoDB)
```

### Frontend

* React
* TypeScript
* Vite
* Redux Toolkit
* React Router
* MUI (Material UI)
* Axios

### Backend

* Node.js
* Express
* TypeScript
* MongoDB (Mongoose)
* JWT (authentification)
* bcrypt (hash des mots de passe)
* Nodemailer (emails)
* Google OAuth

---

## ⚙️ Installation & Lancement

### 1. Cloner le projet

```bash
git clone https://github.com/Decayuki/zendo.git
cd zendo
```

---

### 2. Configuration des variables d’environnement

Créer un fichier `.env` dans `/server` et `/client` (selon besoins) :

#### Exemple `.env` backend

```env
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Exemple `.env` frontend

```env
VITE_API_URL=vite_api_url
VITE_GOOGLE_CLIENT_ID=vite_google_client_id
```

👉 Ne pas commit les fichiers `.env`

---

### 3. Lancer le backend

```bash
cd server
yarn
yarn dev
```

---

### 4. Lancer le frontend

```bash
cd client
yarn
yarn dev
```

---

## 🧪 Améliorations possibles

* Pagination des produits
* Dashboard vendeur (statistiques)
* Gestion du stock
* Amélioration UX mobile
* Tests (frontend / backend)
* Dockerisation
* Paiement en ligne (Stripe)

---

## 👥 Équipe

Projet réalisé en groupe (4 personnes) dans un contexte de formation.

### 🎯 Rôle personnel

* Définition de l’architecture globale (frontend / backend)
* Choix de la stack technique
* Structuration du projet et séparation des responsabilités
* Mise en place de bonnes pratiques (DRY, organisation des composants)
* Accompagnement technique de l’équipe (profils débutants)
* Intervention sur des correctifs critiques (logique métier & UX)
* Stabilisation de l’application en phase finale

---

## 📌 Contexte

* ⏱️ Durée : 5 semaines
* 📅 Rythme : 4 sessions de 3h / semaine
* 👨‍💻 Équipe : 4 personnes

---

## 📷 Aperçu

*(Ajouter ici des captures d’écran de l’application)*

---

## 🧠 Objectifs pédagogiques

* Concevoir une application fullstack
* Structurer un projet en équipe
* Mettre en place une API REST
* Gérer l’authentification et la sécurité
* Manipuler une base de données
* Implémenter une logique métier complète

---

## 📄 Licence

Projet réalisé dans un cadre pédagogique.
