# 🧪 Test Rapide - Dark Mode Global

## ⚡ Test en 3 Minutes

### ✅ Avant de commencer
```bash
# Assurez-vous que l'app tourne
npm run dev
```

---

## 🎯 Test Principal

### Étape 1 : Activer le Dark Mode
```
1. Ouvrir http://localhost:3000
2. Se connecter
3. Aller sur /settings (ou cliquer "Paramètres" dans sidebar)
4. Section "Apparence" → Cliquer sur bouton Moon 🌙
```

**✅ Vérifier :**
- [ ] Page Settings devient sombre instantanément
- [ ] Icône change : Moon → Sun
- [ ] Fond passe au gris foncé

---

### Étape 2 : Tester Toutes les Pages

#### Dashboard
```
Naviguer vers /dashboard
```
**✅ Vérifier :**
- [ ] Fond de la page : gris foncé (slate-900)
- [ ] Sidebar : sombre avec menu bien visible
- [ ] Cards : fond gris foncé (slate-800)
- [ ] Texte : blanc/clair (bien lisible)
- [ ] Breadcrumb en haut : texte clair

---

#### Sidebar (Menu Latéral)
```
Observer le menu de navigation à gauche
```
**✅ Vérifier :**
- [ ] Fond du sidebar : gris foncé (slate-800)
- [ ] Logo "E-Réussite" : texte blanc
- [ ] Items de menu : texte clair
- [ ] Item actif : fond bleu foncé + texte bleu clair
- [ ] Hover sur item : fond devient plus clair
- [ ] Section utilisateur en bas : fond adapté
- [ ] Bouton "Paramètres" : bien visible
- [ ] Bouton déconnexion : rouge adapté

---

#### Profil
```
Cliquer sur "Profil" dans le sidebar
```
**✅ Vérifier :**
- [ ] Fond de page : sombre
- [ ] Cards : sombres avec bordures visibles
- [ ] Texte : bien lisible
- [ ] Boutons : variants sombres

---

#### Mes Cours
```
Cliquer sur "Mes Cours" dans le sidebar
```
**✅ Vérifier :**
- [ ] Fond de page : sombre
- [ ] Cartes de cours : sombres
- [ ] Thumbnails : bien contrastés
- [ ] Progression : visible

---

### Étape 3 : Tester le Breadcrumb
```
Naviguer entre différentes pages
```
**✅ Vérifier dans la barre en haut :**
- [ ] Texte "Dashboard / Page" : clair et lisible
- [ ] Liens cliquables : bien visibles
- [ ] Séparateurs "/" : visibles
- [ ] Hover sur lien : couleur change

---

### Étape 4 : Tester les Boutons
```
Sur n'importe quelle page, observer les boutons
```
**✅ Vérifier :**
- [ ] Boutons "outline" : bordure visible, fond adapté
- [ ] Boutons "ghost" : hover visible
- [ ] Boutons "destructive" : rouge adapté au dark
- [ ] Boutons primaires : gardent leur couleur

---

### Étape 5 : Persistance
```
1. Mode sombre activé
2. Recharger la page (F5)
3. Naviguer entre 3-4 pages différentes
```
**✅ Vérifier :**
- [ ] Mode sombre conservé après F5
- [ ] Pas de "flash" de mode clair au chargement
- [ ] Mode sombre sur toutes les pages visitées
- [ ] localStorage contient "theme": "dark"

---

### Étape 6 : Retour au Mode Clair
```
1. Retourner sur /settings
2. Cliquer sur bouton Sun ☀️
```
**✅ Vérifier :**
- [ ] Tout redevient clair instantanément
- [ ] Icône change : Sun → Moon
- [ ] Navigation entre pages : mode clair conservé
- [ ] localStorage contient "theme": "light"

---

## 🐛 Points de Contrôle Critiques

### Contraste et Lisibilité
```
En mode sombre, vérifier :
```
- [ ] Texte principal : facile à lire (blanc sur fond sombre)
- [ ] Texte secondaire : visible mais moins dominant (gris clair)
- [ ] Bordures des cards : bien visibles
- [ ] Icônes : toutes visibles
- [ ] Liens : couleur adaptée (bleu clair)

---

### Transitions et Animations
```
Observer :
```
- [ ] Changement de thème : instantané (pas de lag)
- [ ] Navigation : fluide en mode sombre
- [ ] Hover effects : bien visibles
- [ ] Item actif dans sidebar : indicateur bleu visible

---

### Composants Spéciaux
```
Tester :
```
- [ ] Modals/Dialogs : fond sombre si ouvert
- [ ] Dropdowns : fond et texte adaptés
- [ ] Tooltips : lisibles en sombre
- [ ] Notifications/Toast : bien visibles

---

## 📋 Checklist Finale

### Sidebar
- [ ] Fond sombre
- [ ] Logo visible
- [ ] Menu lisible
- [ ] Items actifs bien marqués
- [ ] Hover visible
- [ ] Section user adaptée

### Pages
- [ ] Dashboard sombre
- [ ] Profil sombre
- [ ] Cours sombres
- [ ] Settings sombre
- [ ] Toutes les autres pages

### Navigation
- [ ] Breadcrumb lisible
- [ ] Liens cliquables visibles
- [ ] Indicateurs actifs clairs

### Composants UI
- [ ] Cards sombres
- [ ] Buttons adaptés
- [ ] Textes lisibles
- [ ] Bordures visibles

### Persistance
- [ ] Thème sauvegardé
- [ ] Pas de flash
- [ ] Conservé entre pages

---

## ❌ Problèmes Possibles

### Si le sidebar reste blanc
```bash
# Vider le cache du navigateur
Ctrl + Shift + R (ou Cmd + Shift + R sur Mac)
```

### Si certaines pages restent claires
```
# Vérifier que le composant utilise PrivateLayout
# Ou qu'il a les classes dark: sur ses éléments
```

### Si le thème ne persiste pas
```jsx
// Vérifier dans DevTools > Console
localStorage.getItem('theme')
// Doit retourner "dark" ou "light"

// Vérifier classe sur HTML
document.documentElement.classList.contains('dark')
// Doit retourner true en mode sombre
```

---

## ✅ Résultats Attendus

### Si Tous les Tests Passent ✅
```
🎉 Dark mode global fonctionne parfaitement !
✅ Toutes les pages supportent le thème
✅ Navigation fluide et cohérente
✅ Persistance fonctionnelle
✅ Lisibilité excellente
```

### Prochaines Actions
```
- Montrer aux utilisateurs la fonctionnalité
- Documenter dans le guide utilisateur
- Optionnel : ajouter dark mode aux pages restantes
- Optionnel : mode automatique (selon heure du jour)
```

---

## 📸 Points de Vérification Visuels

### Mode Clair → Mode Sombre

**Sidebar**
```
Blanc → Gris foncé (slate-800)
Texte noir → Texte blanc
Bordure grise → Bordure gris foncé
```

**Pages**
```
Fond blanc/gris clair → Fond gris très foncé (slate-900)
Cards blanches → Cards gris foncé (slate-800)
Texte noir → Texte blanc/clair
```

**Navigation**
```
Breadcrumb noir → Breadcrumb clair
Liens bleus foncés → Liens bleus clairs
```

---

## 🎉 Félicitations !

Si tous les tests sont ✅, votre application a maintenant un **dark mode global professionnel** !

**Temps de test** : 3-5 minutes  
**Pages testées** : Toutes les principales  
**Statut** : Production Ready 🚀
