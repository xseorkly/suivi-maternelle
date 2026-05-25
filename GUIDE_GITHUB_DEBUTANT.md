# 📚 GUIDE GITHUB COMPLET POUR DÉBUTANTS

## 🎯 Objectif

Mettre votre projet sur GitHub = avoir une "sauvegarde en ligne" + pouvoir le déployer facilement

---

## 📋 AVANT DE COMMENCER

Vous allez avoir besoin de :
1. **Un compte GitHub** (gratuit)
2. **Git** installé sur votre ordinateur (gratuit)
3. **VS Code** (gratuit et simple)

---

## ✅ ÉTAPE 1: Créer un compte GitHub (5 min)

### 1.1 Allez sur GitHub
- Ouvrez https://github.com
- Cliquez **"Sign up"** (en haut à droite)
- Remplissez :
  - Email: votre email
  - Password: un mot de passe fort
  - Username: `suivi-maternelle` (ou autre)
- Cliquez **"Create account"**
- Vérifiez votre email

### 1.2 Vous êtes maintenant sur GitHub ! ✅

---

## 📥 ÉTAPE 2: Installer Git (5 min)

### 2.1 Qu'est-ce que Git ?
Git = outil qui synchronise votre dossier local avec GitHub

### 2.2 Installer Git
- Allez sur https://git-scm.com
- Cliquez **"Download"**
- Téléchargez la version pour votre ordinateur (Windows/Mac/Linux)
- Ouvrez le fichier téléchargé
- Installez avec les paramètres par défaut (cliquez "Next" partout)

### 2.3 Vérifier que Git est installé
- Ouvrez **Terminal** (Mac/Linux) ou **PowerShell** (Windows)
- Tapez : `git --version`
- Vous devez voir un numéro de version ✅

---

## 🗂️ ÉTAPE 3: Organiser votre projet localement (10 min)

### 3.1 Créer le dossier principal

**Windows:**
```
C:\Users\VotreNom\Desktop\suivi-maternelle
```

**Mac:**
```
/Users/VotreNom/suivi-maternelle
```

Créez ce dossier sur votre **Bureau** pour que ce soit facile à trouver.

### 3.2 Arborescence complète à créer

```
suivi-maternelle/
├── pages/
│   ├── _app.tsx
│   ├── index.tsx
│   ├── login/
│   │   ├── admin.tsx
│   │   ├── teacher.tsx
│   │   └── parent.tsx
│   ├── admin/
│   │   ├── dashboard.tsx
│   │   ├── settings.tsx
│   │   ├── classes.tsx
│   │   ├── teachers.tsx
│   │   ├── students.tsx
│   │   ├── import.tsx
│   │   └── comments.tsx
│   ├── teacher/
│   │   ├── dashboard.tsx
│   │   ├── add-comment.tsx
│   │   └── my-comments.tsx
│   └── parent/
│       └── dashboard.tsx
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   └── excelUtils.ts
├── styles/
│   ├── globals.css
│   ├── home.module.css
│   ├── login.module.css
│   └── admin.module.css
├── public/
│   └── (vide pour le moment)
├── .env.local
├── .gitignore (à créer)
├── package.json
├── next.config.js
├── tsconfig.json
├── README.md
├── GUIDE_INSTALLATION.md
└── 01_create_tables.sql (+ autres fichiers SQL)
```

### 3.3 Comment créer les dossiers ?

**Option 1: Avec Windows Explorer/Finder**
- Clic droit → "Nouveau dossier"
- Nommez les dossiers
- Créez les sous-dossiers

**Option 2: Plus simple avec VS Code** (voir étape 4)

---

## 💻 ÉTAPE 4: Installer VS Code et ouvrir le projet (5 min)

### 4.1 Installer VS Code
- Allez sur https://code.visualstudio.com
- Cliquez **"Download"**
- Installez avec les paramètres par défaut

### 4.2 Ouvrir le projet dans VS Code
- Ouvrez VS Code
- Cliquez **"File"** → **"Open Folder"**
- Sélectionnez votre dossier `suivi-maternelle`
- Cliquez **"Select Folder"**

### 4.3 VS Code affiche maintenant votre projet
À gauche, vous voyez l'arborescence des fichiers ✅

### 4.4 Créer les fichiers

**Pour créer un fichier:**
- Clic droit sur le dossier → **"New File"**
- Nommez le fichier (ex: `supabase.ts`)
- Collez le contenu dedans

**Exemple pour `lib/supabase.ts`:**
1. Clic droit sur dossier `lib` → "New File"
2. Nommez `supabase.ts`
3. Ouvrez le fichier `supabase.ts` depuis vos téléchargements
4. Copiez tout le contenu (Ctrl+A, Ctrl+C)
5. Collez dans VS Code (Ctrl+V)
6. Enregistrez (Ctrl+S)

---

## 📝 ÉTAPE 5: Créer le fichier `.gitignore` (2 min)

Cet fichier dit à Git quoi **NE PAS** envoyer à GitHub

### 5.1 Créer le fichier
- Dans VS Code, clic droit sur la racine
- **"New File"**
- Nommez exactement : `.gitignore` (avec le point au début)

### 5.2 Contenu du fichier
Collez ceci :

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
.coverage
.nyc_output

# Next.js
.next/
out/
build/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
```

Enregistrez (Ctrl+S) ✅

---

## 🚀 ÉTAPE 6: Initialiser Git dans votre projet (3 min)

### 6.1 Ouvrir le Terminal
- Dans VS Code, cliquez **"Terminal"** → **"New Terminal"** (en haut)
- Un petit terminal s'ouvre en bas

### 6.2 Vérifier que vous êtes dans le bon dossier
Vous devez voir quelque chose comme :
```
C:\Users\VotreNom\Desktop\suivi-maternelle>
```

### 6.3 Initialiser Git
Tapez cette commande :
```
git init
```

Vous devez voir :
```
Initialized empty Git repository in C:\Users\...\suivi-maternelle\.git
```

### 6.4 Configurer Git (première fois seulement)
```
git config user.name "Votre Nom"
git config user.email "votre.email@gmail.com"
```

---

## 📤 ÉTAPE 7: Créer le dépôt GitHub (3 min)

### 7.1 Sur GitHub, créer un nouveau dépôt
- Allez sur GitHub.com
- Cliquez le **+** (en haut à droite) → **"New repository"**

### 7.2 Remplissez les infos
- **Repository name:** `suivi-maternelle`
- **Description:** "Plateforme de suivi du comportement en maternelle"
- **Public** ou **Private** ? → **Public** (tout le monde peut voir)
- **Cochez:** "Add a README file"
- Cliquez **"Create repository"**

### 7.3 Vous êtes redirigé sur votre repo
Vous voyez une page avec votre code ✅

---

## 🔗 ÉTAPE 8: Connecter votre dossier local à GitHub (5 min)

### 8.1 Sur GitHub, trouvez le bouton "Code"
- Cliquez le bouton vert **"< > Code"**
- Copiez l'URL HTTPS (elle ressemble à `https://github.com/VotreUsername/suivi-maternelle.git`)

### 8.2 Dans VS Code Terminal, ajoutez le dépôt distant
```
git remote add origin https://github.com/VotreUsername/suivi-maternelle.git
```

(Remplacez VotreUsername par votre nom d'utilisateur GitHub)

---

## 📤 ÉTAPE 9: Envoyer votre code à GitHub (LA PREMIÈRE FOIS)

### 9.1 Dans le Terminal, ajoutez tous vos fichiers
```
git add .
```

### 9.2 Créez un "commit" (message de sauvegarde)
```
git commit -m "Initial commit: projet complet"
```

Vous devez voir :
```
[main ...] Initial commit: projet complet
 45 files changed, 3500+ insertions(+)
```

### 9.3 Envoyez à GitHub
```
git branch -M main
git push -u origin main
```

Vous devez voir :
```
Enumerating objects: 45, done.
...
 * [new branch]      main -> main
```

### 9.4 Allez sur GitHub pour vérifier
- Rafraîchissez la page GitHub
- Vous devez voir tous vos fichiers ! ✅

---

## 💾 ÉTAPE 10: Après, à chaque modification (rapide)

### Quand vous modifiez un fichier

1. **Sauvegardez le fichier** (Ctrl+S)

2. **Dans le Terminal:**
```
git add .
git commit -m "Décrire ce que vous avez changé"
git push
```

**Exemple:**
```
git add .
git commit -m "Ajout de la page classes"
git push
```

C'est tout ! ✅

---

## 🎓 EXEMPLE CONCRET: Votre première modification

### Scenario: Vous avez changé le titre du site

1. Vous modifiez `pages/index.tsx`
2. Vous sauvegardez (Ctrl+S)
3. Vous allez au Terminal
4. Vous tapez :
```
git add .
git commit -m "Modifier le titre de la page d'accueil"
git push
```
5. Allez sur GitHub → vous voyez le changement ! ✅

---

## 🆘 COMMANDES UTILES

| Commande | Que ça fait |
|----------|-----------|
| `git status` | Voir les fichiers modifiés |
| `git add .` | Ajouter tous les fichiers |
| `git commit -m "message"` | Créer une sauvegarde avec un message |
| `git push` | Envoyer à GitHub |
| `git pull` | Télécharger depuis GitHub |
| `git log` | Voir l'historique des changements |

---

## 📊 VUE D'ENSEMBLE: Workflow complet

```
Vous modifiez des fichiers
        ↓
Vous sauvegardez (Ctrl+S)
        ↓
git add .
        ↓
git commit -m "message"
        ↓
git push
        ↓
Code apparaît sur GitHub ✅
        ↓
Plus tard, vous pouvez déployer sur Vercel
```

---

## 🚀 ENSUITE: Déployer sur Vercel

Une fois votre code sur GitHub, déployer sur Vercel est **super facile** :

1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez **"Import Project"**
4. Sélectionnez votre dépôt `suivi-maternelle`
5. Cliquez **"Deploy"**
6. Votre site est en ligne ! 🎉

---

## ❓ QUESTIONS COURANTES

### Q: Qu'est-ce que je dois mettre sur GitHub ?
**R:** Tous vos fichiers `.tsx`, `.ts`, `.css`, `.json`, `.sql`, `.md` SAUF les dossiers :
- `node_modules/` (le `.gitignore` l'exclut automatiquement)
- `.next/` (généré automatiquement)
- `.env.local` (contient vos secrets Supabase)

### Q: Et si j'oublie un fichier ?
**R:** Aucun problème ! Vous pouvez l'ajouter plus tard avec `git add .`

### Q: Puis-je avoir un dépôt privé ?
**R:** Oui ! Sur GitHub, mettez-le en **Private** au lieu de **Public**

### Q: Je viens de faire une erreur, je peux revenir en arrière ?
**R:** Oui ! Avec `git revert` ou `git reset`, mais c'est avancé.

---

## ✅ CHECKLIST: VOUS ÊTES PRÊT !

- [ ] Compte GitHub créé
- [ ] Git installé et configuré
- [ ] Dossier `suivi-maternelle` créé
- [ ] VS Code installé
- [ ] Tous les fichiers créés dans le dossier
- [ ] Fichier `.gitignore` créé
- [ ] `git init` exécuté
- [ ] Dépôt GitHub créé
- [ ] `git remote add origin ...` exécuté
- [ ] `git push` réussi une première fois
- [ ] Vous voyez vos fichiers sur GitHub ✅

---

## 🎉 RÉSUMÉ EN 30 SECONDES

1. **Créez un dossier** `suivi-maternelle`
2. **Mettez-y tous les fichiers** (pages, lib, styles, etc.)
3. **Installez Git**
4. **Ouvrez VS Code**
5. **Tapez dans le Terminal:**
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VotreUsername/suivi-maternelle.git
   git push -u origin main
   ```
6. **Voilà !** Votre code est sur GitHub ✅

---

**Besoin d'aide ? Dites-moi à quelle étape vous êtes bloqué !** 🆘
