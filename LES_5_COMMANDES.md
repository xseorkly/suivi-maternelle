# ✨ LES 5 COMMANDES MAGIQUES POUR GITHUB

## C'est facile: Copier → Coller → Appuyer Enter

---

## 🎬 AVANT LES COMMANDES (5 min)

### 1. Créer un compte GitHub
- Allez sur: https://github.com
- Cliquez "Sign up"
- Remplissez email + password + username
- Vérifiez votre email
- ✅ Vous avez un username GitHub

**Exemple:** Si vous choisissez username = `fklabi`, mémorisez-le!

---

### 2. Créer un dossier vide sur votre ordinateur
```
Windows: C:\Users\VotreNom\Desktop\suivi-maternelle
Mac: /Users/VotreNom/Desktop/suivi-maternelle
```

- Créez ce dossier vide
- ✅ Dossier créé

---

### 3. Télécharger TOUS les fichiers
- Vous avez 42 fichiers à télécharger (voir la liste)
- Mettez-les dans la bonne structure (voir guide arborescence)
- ✅ Fichiers téléchargés et organisés

---

## 🔥 LES 5 COMMANDES MAGIQUES

**Ouvrez VS Code avec votre dossier**
- Cliquez: File → Open Folder
- Sélectionnez: suivi-maternelle
- Cliquez: Terminal → New Terminal (en haut)

---

### COMMANDE 1: git init
```
Copiez ceci:
git init

Collez dans le Terminal
Appuyez Enter
```

---

### COMMANDE 2: git add .
```
Copiez ceci:
git add .

Collez dans le Terminal
Appuyez Enter
```

---

### COMMANDE 3: git commit -m "Initial commit"
```
Copiez ceci:
git commit -m "Initial commit"

Collez dans le Terminal
Appuyez Enter
```

---

### COMMANDE 4: git remote add origin
```
Vous devez remplacer VOTRE_USERNAME par votre username GitHub!

Exemple: Si votre username = "fklabi"
Alors tapez:
git remote add origin https://github.com/fklabi/suivi-maternelle.git

Si votre username = "marie2024"
Alors tapez:
git remote add origin https://github.com/marie2024/suivi-maternelle.git

Collez dans le Terminal
Appuyez Enter
```

---

### COMMANDE 5: git push
```
Copiez ceci:
git branch -M main
git push -u origin main

Collez ces 2 lignes
Appuyez Enter après chaque
```

---

## ✅ C'EST FINI!

Allez sur GitHub.com et vérifiez:
- Cherchez votre repo "suivi-maternelle"
- Vous voyez tous vos fichiers? ✅

---

## 🔄 APRÈS: À CHAQUE FOIS QUE VOUS MODIFIEZ

```
1. Modifiez vos fichiers
2. Sauvegardez (Ctrl+S)
3. Dans le Terminal:

   git add .
   git commit -m "Descriire ce que vous avez changé"
   git push

C'est tout! C'est sur GitHub!
```

---

## 💡 EXEMPLE CONCRET

### Scenario: Vous avez changé le titre de la page d'accueil

1. Vous éditez `pages/index.tsx`
2. Vous sauvegardez: Ctrl+S
3. Terminal:
```
git add .
git commit -m "Changer le titre de la page"
git push
```
4. Vous allez sur GitHub → vous voyez le changement ✅

---

## 🆘 BESOIN D'AIDE?

### "Je ne sais pas mon username GitHub"
Allez sur GitHub.com → en haut à droite → votre avatar → vous voyez @username

### "Erreur: command not found"
Vous n'avez pas Git installé. Installez-le d'abord: https://git-scm.com

### "Permission denied"
Vous avez tapé le mauvais username. Vérifiez dans l'URL GitHub!

### "Je vois pleins de messages dans Terminal"
C'est normal! Git montre ce qu'il fait. Attendez que ce soit fini.

---

## 📋 CHECKLIST FINALE

- [ ] J'ai un compte GitHub avec un username
- [ ] J'ai créé un dossier suivi-maternelle
- [ ] J'ai téléchargé et organisé les 42 fichiers
- [ ] Git est installé sur mon ordinateur
- [ ] J'ai ouvert VS Code avec mon dossier
- [ ] J'ai tapé les 5 commandes
- [ ] Je vais sur GitHub et je vois mes fichiers ✅

---

## 🎉 BRAVO!

Vous venez d'apprendre GitHub!

Maintenant, chaque fois que vous changez quelque chose:
```
git add .
git commit -m "description"
git push
```

C'est automatiquement sauvegardé en ligne! 🚀

---

**C'est vraiment tout ce qu'il y a à faire!**
