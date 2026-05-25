# ⚡ GITHUB EN 10 MINUTES - VERSION SIMPLE

## Les 5 étapes ESSENTIELLES

### 1️⃣ Créer un compte GitHub (2 min)
```
Allez sur: https://github.com
Cliquez "Sign up"
Remplissez vos infos
Vérifiez votre email
✅ Vous avez un compte GitHub
```

### 2️⃣ Installer Git (3 min)
```
Allez sur: https://git-scm.com
Téléchargez et installez
Acceptez tout par défaut (cliquez "Next")
✅ Git est installé
```

### 3️⃣ Organiser votre dossier (3 min)
```
Créez ce dossier:
  C:\Users\VotreNom\Desktop\suivi-maternelle

Dedans, créez ces sous-dossiers:
  pages/
  lib/
  styles/
  public/

Mettez les fichiers à la bonne place
✅ Dossier organisé
```

### 4️⃣ Créer un dépôt GitHub (2 min)
```
Allez sur GitHub.com
Cliquez le + en haut à droite
"New repository"
Nommez: suivi-maternelle
Cliquez "Create repository"
✅ Dépôt créé
```

### 5️⃣ Envoyer votre code (1 min)
```
Ouvrez VS Code avec votre dossier
Terminal > New Terminal
Tapez ces 4 commandes:

git init

git add .

git commit -m "Initial commit"

git remote add origin https://github.com/VOTRE_USERNAME/suivi-maternelle.git

git branch -M main

git push -u origin main

✅ Votre code est sur GitHub!
```

---

## C'est tout ! 🎉

Maintenant, chaque fois que vous modifiez quelque chose:

```
1. Sauvegardez (Ctrl+S)
2. Terminal:
   git add .
   git commit -m "Description du changement"
   git push
3. C'est sur GitHub ✅
```

---

## ⚠️ IMPORTANT

Avant de faire `git push`, remplacez `VOTRE_USERNAME` par votre **vrai nom d'utilisateur GitHub**.

Exemple:
```
Si votre username est "fklabi", alors:
git remote add origin https://github.com/fklabi/suivi-maternelle.git
```

---

## 🆘 En cas de problème

**"Je ne sais pas mon username GitHub"**
- Allez sur GitHub.com
- En haut à droite, cliquez votre avatar
- Vous voyez votre @username
- C'est celui-là!

**"Ça ne marche pas"**
- Vérifiez l'URL avec votre vrai username
- Vérifiez que vous êtes dans le bon dossier (Terminal doit montrer: `suivi-maternelle>`)
- Relisez le GUIDE_GITHUB_DEBUTANT.md pour plus de détails

---

## 📌 Les 4 commandes à retenir

```
git add .              (Préparer les fichiers)
git commit -m "..."    (Créer une sauvegarde)
git push               (Envoyer à GitHub)
git pull               (Télécharger depuis GitHub)
```

---

**C'est tout! Vous êtes prêt à utiliser GitHub! 🚀**
