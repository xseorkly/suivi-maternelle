# Guide d'Installation Complet - Suivi Comportement Maternelle

## 📋 Table des matières
1. [Préparation Supabase](#préparation-supabase)
2. [Création des tables SQL](#création-des-tables-sql)
3. [Configuration du projet Next.js](#configuration-du-projet-nextjs)
4. [Lancement en local](#lancement-en-local)
5. [Création du premier administrateur](#création-du-premier-administrateur)
6. [Déploiement sur Vercel](#déploiement-sur-vercel)

---

## 🔧 Préparation Supabase

### 1. Créer le projet Supabase
- Allez sur https://supabase.com
- Connectez-vous ou créez un compte
- Créez un nouveau projet
- Notez votre **Project URL** et **Anon Key**

### 2. Créer le bucket de stockage
- Allez dans **Storage** (menu de gauche)
- Cliquez **Create a new bucket**
- Nommez-le: `logod`
- Rendez-le **Public** ✅
- Créez!

### 3. Copier vos infos Supabase
Récupérez depuis **Settings → API**:
```
URL: https://votre-id.supabase.co
ANON KEY: eyJhbGciOiJIUzI1NiIs...
```

---

## 📊 Création des tables SQL

### 1. Ouvrir l'éditeur SQL
- Allez dans **SQL Editor** (menu de gauche)
- Cliquez **Create a new query**

### 2. Copier et exécuter les fichiers SQL (DANS CET ORDRE)

#### Étape 1: Créer les tables
```
Copier le contenu de: 01_create_tables.sql
Coller dans Supabase SQL Editor
Cliquer RUN
```

#### Étape 2: Créer les relations
```
Copier le contenu de: 02_create_relations.sql
Coller dans Supabase SQL Editor
Cliquer RUN
```

#### Étape 3: Activer RLS
```
Copier le contenu de: 03_enable_rls.sql
Coller dans Supabase SQL Editor
Cliquer RUN
```

#### Étape 4: Politiques Admin
```
Copier le contenu de: 04_policies_admin.sql
Coller dans Supabase SQL Editor
Cliquer RUN
```

#### Étape 5: Politiques Enseignants
```
Copier le contenu de: 05_policies_teachers.sql
Coller dans Supabase SQL Editor
Cliquer RUN
```

#### Étape 6: Politiques Parents
```
Copier le contenu de: 06_policies_parents.sql
Coller dans Supabase SQL Editor
Cliquer RUN
```

#### Étape 7: Configuration Stockage
```
Copier le contenu de: 07_storage_logo.sql
Coller dans Supabase SQL Editor
Cliquer RUN
```

#### Étape 8: Données de démonstration (OPTIONNEL)
```
Copier le contenu de: 08_seed_demo_data.sql
Coller dans Supabase SQL Editor
Cliquer RUN
```

### ✅ Vérification
Allez dans **Table Editor** et vérifiez que les tables sont créées:
- settings
- profiles
- classes
- enseignants
- parents
- eleves
- commentaires

---

## 💻 Configuration du projet Next.js

### 1. Cloner ou créer le projet
```bash
# Option 1: Créer un nouveau projet Next.js
npx create-next-app@latest suivi-maternelle --typescript

# Option 2: Utiliser les fichiers fournis
# Placer tous les fichiers dans le dossier du projet
```

### 2. Installer les dépendances
```bash
cd suivi-maternelle
npm install
```

### 3. Configurer les variables d'environnement
Créer `.env.local` à la racine du projet:

```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-ici

# URL de redirection
NEXT_PUBLIC_REDIRECT_URL=http://localhost:3000

# Bucket
NEXT_PUBLIC_LOGO_BUCKET=logod
```

### 4. Structure des fichiers
Votre dossier doit ressembler à:
```
suivi-maternelle/
├── pages/
│   ├── index.tsx
│   ├── login/
│   │   ├── admin.tsx
│   │   ├── teacher.tsx
│   │   └── parent.tsx
│   ├── admin/
│   │   ├── dashboard.tsx
│   │   └── settings.tsx
│   ├── teacher/
│   │   ├── dashboard.tsx
│   │   ├── add-comment.tsx
│   │   └── my-comments.tsx
│   ├── parent/
│   │   └── dashboard.tsx
│   └── _app.tsx
├── lib/
│   ├── supabase.ts
│   └── auth.ts
├── styles/
│   ├── globals.css
│   ├── home.module.css
│   ├── login.module.css
│   └── admin.module.css
├── .env.local
├── package.json
├── next.config.js
└── tsconfig.json
```

---

## 🚀 Lancement en local

### 1. Démarrer le serveur de développement
```bash
npm run dev
```

### 2. Ouvrir dans le navigateur
```
http://localhost:3000
```

### 3. Vous devriez voir:
- La page d'accueil avec 3 boutons
- Boutons: Connexion Admin, Enseignant, Parent

---

## 👤 Création du premier administrateur

### 1. Créer le compte admin dans Supabase Auth
- Allez dans **Authentication → Users**
- Cliquez **Create user**
- Remplissez:
  - Email: `klabi5181@gmail.com`
  - Password: `admin`
  - Auto-confirm: Cochez ✅
- Créez!

### 2. Copier l'UUID de l'admin
- Cliquez sur l'utilisateur créé
- Copiez l'**UUID** (long code en haut)

### 3. Exécuter le script de setup
- Allez dans **SQL Editor**
- Créez une nouvelle query
- Remplacez l'UUID dans le fichier `09_first_admin_setup.sql`
  - Cherchez: `550e8400-e29b-41d4-a716-446655440000`
  - Remplacez par l'UUID copié
- Exécutez!

### 4. Tester la connexion
- Allez à http://localhost:3000
- Cliquez "Connexion Administrateur"
- Identifiant: `klabi5181@gmail.com`
- Mot de passe: `admin`
- Connectez-vous!

### 5. Configurer l'établissement
- Dans le dashboard admin, cliquez "Paramètres"
- Remplissez:
  - Nom de l'établissement
  - Année scolaire
  - Email et téléphone
  - Logo (optionnel)
  - Couleurs
  - Textes d'accueil
- Enregistrez!

---

## 📥 Importer les premiers enseignants et élèves

### Via l'interface admin

**Ajouter manuellement:**
1. Tableau de bord → Enseignants
2. Cliquez "Ajouter un enseignant"
3. Remplissez le formulaire
4. L'enseignant reçoit un identifiant et peut se connecter

**Importer par Excel:**
1. Préparez un fichier Excel avec les colonnes:
   - Nom
   - Prénom
   - Classe
   - Identifiant
   - Mot de passe
2. Allez dans "Importation des données"
3. Uploadez le fichier
4. Validez!

---

## 🌐 Déploiement sur Vercel

### 1. Créer un compte Vercel
- Allez sur https://vercel.com
- Créez un compte gratuit
- Connectez votre GitHub

### 2. Pousser le projet sur GitHub
```bash
# Si pas encore fait
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-user/suivi-maternelle.git
git push -u origin main
```

### 3. Importer le projet dans Vercel
- Allez sur Vercel Dashboard
- Cliquez "New Project"
- Sélectionnez votre repo GitHub
- Cliquez "Import"

### 4. Configurer les variables d'environnement
- Dans Vercel, allez à **Settings → Environment Variables**
- Ajoutez:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://votre-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-ici
  NEXT_PUBLIC_REDIRECT_URL=https://votre-domaine.vercel.app
  NEXT_PUBLIC_LOGO_BUCKET=logod
  ```

### 5. Déployer
- Cliquez "Deploy"
- Attendez le déploiement
- Votre site est en ligne! 🎉

### 6. Mettre à jour Supabase Auth
- Allez dans Supabase → **Authentication → Providers → Email**
- Scroll jusqu'à "Redirect URLs"
- Ajoutez votre URL Vercel:
  ```
  https://votre-domaine.vercel.app/auth/callback
  ```

---

## 🔑 Comptes de test

### Admin
```
Email: klabi5181@gmail.com
Password: admin
```

### Enseignant (à créer)
```
Depuis le dashboard admin → Enseignants
Créez manuellement
```

### Parent (à créer)
```
Depuis le dashboard admin → Élèves & Parents
Créez manuellement
```

---

## 📝 Modèles Excel

Prêts à télécharger depuis l'interface admin:

### 1. Enseignants.xlsx
Colonnes:
- Nom de l'enseignant
- Prénom de l'enseignant
- Classe
- Identifiant enseignant
- Mot de passe enseignant

### 2. Élèves_Parents.xlsx
Colonnes:
- Nom de l'élève
- Prénom de l'élève
- Classe
- Nom du parent
- Prénom du parent
- Identifiant parent
- Mot de passe parent
- Lien parental

---

## ❓ Dépannage

### "Connexion refusée"
- Vérifiez vos identifiants
- Assurez-vous que l'utilisateur est confirmé dans Supabase Auth

### "Logo ne s'affiche pas"
- Vérifiez le bucket `logod` est PUBLIC
- Vérifiez l'URL du logo est correcte

### "Erreur RLS"
- Vérifiez que les politiques SQL ont été exécutées
- Allez dans **Security Policies** et vérifiez les règles

### "Page blanche"
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs
- Vérifiez que les variables d'environnement sont correctes

---

## 📞 Support

Pour toute question:
- Consultez la documentation Supabase: https://supabase.com/docs
- Documentation Next.js: https://nextjs.org/docs
- Email du projet: contact@maternelle.fr

---

**Installation terminée! 🎉**

Votre site est maintenant prêt à suivre le comportement des enfants en maternelle!
