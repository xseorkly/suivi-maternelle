# Suivi du Comportement en Maternelle

Plateforme web sécurisée et complète pour le suivi du comportement des élèves en maternelle, permettant aux enseignants de consigner des observations et aux parents de les consulter.

## 🎯 Objectifs

- **Administrateur** : Configuration complète du site et gestion des utilisateurs
- **Enseignants** : Saisir et consulter les observations sur les élèves
- **Parents** : Consulter les observations concernant leur enfant

## 🛠 Stack technique

- **Frontend** : Next.js 14 + React 18 + TypeScript
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Stockage** : Supabase Storage (pour le logo)
- **Déploiement** : Vercel ou Netlify
- **Sécurité** : Row Level Security (RLS)

## 📁 Structure du projet

```
suivi-maternelle/
├── pages/                    # Pages Next.js
│   ├── index.tsx            # Accueil
│   ├── login/               # Pages de connexion
│   ├── admin/               # Espace administrateur
│   ├── teacher/             # Espace enseignant
│   └── parent/              # Espace parent
├── lib/                     # Utilitaires
│   ├── supabase.ts         # Configuration Supabase
│   ├── auth.ts             # Fonctions d'auth
│   └── excelUtils.ts       # Import/Export Excel
├── styles/                 # Styles CSS
│   ├── globals.css        # Styles globaux
│   ├── home.module.css    # Page d'accueil
│   ├── login.module.css   # Pages de login
│   └── admin.module.css   # Interface admin
├── public/                # Fichiers statiques
├── .env.local            # Variables d'environnement
├── next.config.js        # Configuration Next.js
├── tsconfig.json         # Configuration TypeScript
├── package.json          # Dépendances
└── GUIDE_INSTALLATION.md # Guide d'installation
```

## 🚀 Démarrage rapide

### 1. Installation
```bash
npm install
npm run dev
```

### 2. Configuration
Voir **GUIDE_INSTALLATION.md** pour les étapes détaillées

### 3. Accès
- URL: `http://localhost:3000`
- Admin: `klabi5181@gmail.com` / `admin`

## 📚 Pages principales

### Espace Public
- **Home** (`/`) - Accueil avec 3 boutons de connexion
- **Login Admin** (`/login/admin`)
- **Login Enseignant** (`/login/teacher`)
- **Login Parent** (`/login/parent`)

### Espace Administrateur
- **Dashboard** (`/admin/dashboard`) - Vue d'ensemble
- **Paramètres** (`/admin/settings`) - Config établissement
- **Classes** (`/admin/classes`) - Gestion des classes
- **Enseignants** (`/admin/teachers`) - Gestion enseignants
- **Élèves & Parents** (`/admin/students`) - Gestion élèves/parents
- **Import** (`/admin/import`) - Import Excel
- **Commentaires** (`/admin/comments`) - Tous les commentaires

### Espace Enseignant
- **Dashboard** (`/teacher/dashboard`) - Vue d'ensemble
- **Ajouter commentaire** (`/teacher/add-comment`) - Saisir observation
- **Mes commentaires** (`/teacher/my-comments`) - Historique

### Espace Parent
- **Dashboard** (`/parent/dashboard`) - Observations de son enfant

## 🔑 Rôles et permissions

### Administrateur
- Configuration complète du site
- Gestion des utilisateurs (création, modification)
- Import/Export des données
- Accès à tous les commentaires

### Enseignant
- Création de commentaires pour ses élèves
- Consultation de ses observations
- Modification/suppression de ses propres commentaires
- Accès uniquement à ses classes

### Parent
- Lecture uniquement des observations de son enfant
- Aucune modification possible
- Accès sécurisé au profil

## 📊 Sécurité

✅ **Row Level Security (RLS)** activé sur toutes les tables
✅ **Authentification** via Supabase Auth
✅ **Politiques sécurité** spécifiques par rôle
✅ **Mots de passe** jamais stockés en clair
✅ **Protection des routes** selon le rôle utilisateur

## 🎨 Design

- **Couleurs personnalisables** : Bleu, Blanc, Rouge (par défaut)
- **Responsive** : Mobile, Tablette, Ordinateur
- **Interface simple** et intuitive
- **Textes configurables** : Accueil, RGPD, Légal

## 📋 Fichiers SQL

9 fichiers SQL pour initialiser la base de données (voir `GUIDE_INSTALLATION.md`):

1. `01_create_tables.sql` - Tables
2. `02_create_relations.sql` - Relations
3. `03_enable_rls.sql` - Row Level Security
4. `04_policies_admin.sql` - Politiques admin
5. `05_policies_teachers.sql` - Politiques enseignants
6. `06_policies_parents.sql` - Politiques parents
7. `07_storage_logo.sql` - Stockage logo
8. `08_seed_demo_data.sql` - Données de test
9. `09_first_admin_setup.sql` - Configuration admin

## 📊 Modèles Excel

### Enseignants.xlsx
- Nom de l'enseignant
- Prénom de l'enseignant
- Classe
- Identifiant enseignant
- Mot de passe enseignant

### Élèves_Parents.xlsx
- Nom de l'élève
- Prénom de l'élève
- Classe
- Nom du parent
- Prénom du parent
- Identifiant parent
- Mot de passe parent
- Lien parental

## 🔐 Comptes de test

```
Admin:
  Email: klabi5181@gmail.com
  Password: admin

Enseignant: À créer via admin
Parent: À créer via admin
```

## 🌐 Déploiement

### Vercel (Recommandé)
1. Pousser sur GitHub
2. Connecter Vercel à GitHub
3. Ajouter variables d'environnement
4. Déployer!

### Netlify
1. Même processus que Vercel
2. Ajouter variables d'environnement
3. Déployer!

## 📖 Documentation complète

Voir **GUIDE_INSTALLATION.md** pour:
- Installation détaillée
- Configuration Supabase
- Création des tables SQL
- Lancement en local
- Déploiement en production
- Dépannage

## 🤝 Support

Pour des questions:
- Documentation Supabase: https://supabase.com/docs
- Documentation Next.js: https://nextjs.org/docs
- Fichier d'aide: GUIDE_INSTALLATION.md

## 📝 Licence

Ce projet est fourni tel quel pour usage éducatif.

## ✨ Features principales

- ✅ Authentication sécurisée (Supabase Auth)
- ✅ Interface responsive
- ✅ Gestion des rôles (Admin, Enseignant, Parent)
- ✅ Row Level Security (RLS)
- ✅ Configuration flexible (couleurs, textes)
- ✅ Import/Export Excel
- ✅ Upload de logo
- ✅ Historique des commentaires
- ✅ Filtrage et recherche
- ✅ Messages utilisateur clairs

## 🎓 Cas d'usage

1. **Directeur/Admin** crée l'établissement et configure les classes
2. **Enseignants** ajoutent les observations des élèves
3. **Parents** consultent les progrès de leur enfant
4. **Admin** accède aux statistiques et gère les données

---

**Version**: 1.0.0
**Dernière mise à jour**: Janvier 2025
**Auteur**: Fehmi Klabi
