# 🧪 Test Rapide - Système de Thème

## ⚡ Test en 2 Minutes

### Étape 1 : Accéder aux Paramètres
```
1. Ouvrir http://localhost:3000
2. Se connecter avec un compte utilisateur
3. Naviguer vers : http://localhost:3000/settings
```

**✅ Vérifier :**
- Page Settings s'affiche correctement
- 5 sections visibles (Compte, Apparence, Notifications, Sécurité, Langue)
- Design moderne avec effet glassmorphism

---

### Étape 2 : Tester le Basculement de Thème
```
1. Trouver la section "Apparence" (2ème carte)
2. Cliquer sur le bouton avec l'icône Moon 🌙
3. Observer le changement
```

**✅ Vérifier :**
- [ ] Page devient sombre instantanément
- [ ] Icône change : Moon 🌙 → Sun ☀️
- [ ] Texte change : "Mode Sombre" → "Mode Clair"
- [ ] Arrière-plan passe au sombre
- [ ] Texte devient clair/blanc

---

### Étape 3 : Tester la Persistance
```
1. Mode sombre activé
2. Recharger la page (F5 ou Ctrl+R)
3. Observer
```

**✅ Vérifier :**
- [ ] Mode sombre conservé après rechargement
- [ ] Pas de "flash" de mode clair au chargement
- [ ] Icône Sun toujours visible

---

### Étape 4 : Vérifier localStorage (DevTools)
```
1. Ouvrir DevTools (F12)
2. Aller dans : Application > Local Storage
3. Chercher la clé "theme"
```

**✅ Vérifier :**
- [ ] Clé "theme" existe
- [ ] Valeur = "dark" (en mode sombre)
- [ ] Valeur change en "light" quand on bascule

---

### Étape 5 : Tester sur Toutes les Pages
```
1. En mode sombre, naviguer vers :
   - Dashboard
   - Profil
   - Cours
   - Quiz
```

**✅ Vérifier :**
- [ ] Thème sombre persistant sur toutes les pages
- [ ] Pas de retour au mode clair sur une page

---

## 🐛 Problèmes Courants

### Thème ne change pas
```jsx
// Vérifier dans Console DevTools :
document.documentElement.classList.contains('dark')
// Doit retourner true en mode sombre
```

### localStorage non fonctionnel
```jsx
// Tester manuellement :
localStorage.setItem('theme', 'dark')
localStorage.getItem('theme')
// Doit retourner "dark"
```

### Page Settings ne charge pas
```
// Vérifier les erreurs dans Console
// Vérifier que le fichier existe :
src/pages/Settings.jsx
```

---

## ✅ Checklist Finale

- [ ] Page Settings accessible sur /settings
- [ ] Bouton thème visible et clickable
- [ ] Changement instantané du thème
- [ ] Icône Moon/Sun mise à jour
- [ ] Persistance après rechargement
- [ ] localStorage contient la bonne valeur
- [ ] Thème appliqué globalement
- [ ] Pas de flash au chargement
- [ ] Transitions fluides

---

## 🎉 Succès !

Si tous les points sont vérifiés ✅, le système de thème fonctionne parfaitement !

**Prochaine étape :** Ajouter les variants `dark:` aux autres composants pour un dark mode complet.
