# 🔍 DIAGNOSTIC PAGE BLANCHE

## Problème
Page s'affiche complètement blanche, pas d'erreur visible

## ✅ Causes possibles (par ordre de probabilité)

### 1. **Erreur JavaScript silencieuse** (90% des cas)
**Symptômes:**
- Page blanche
- Console peut montrer des erreurs rouges
- React ne monte pas l'application

**Solutions:**
```powershell
# Dans le navigateur (F12 → Console)
# Regardez les erreurs en rouge
```

**Erreurs fréquentes:**
- `Cannot read property of undefined`
- `Unexpected token`
- `Module not found`
- Import circulaire

---

### 2. **Problème de Context Provider**
**Symptômes:**
- Page blanche
- Erreur: "Cannot read useContext of null"

**Fichiers à vérifier:**
- `src/contexts/SupabaseAuthContext.jsx`
- `src/hooks/useCart.jsx`

**Test rapide:**
```javascript
// Dans main.jsx, commentez temporairement les providers
// Et gardez juste <App />
```

---

### 3. **Erreur dans un composant lazy loaded**
**Symptômes:**
- Page blanche après navigation
- Erreur: "Loading chunk failed"

**Solution:**
```powershell
# Vider le cache navigateur: CTRL + SHIFT + DELETE
# Ou hard refresh: CTRL + SHIFT + R
```

---

### 4. **Problème de Route/Layout**
**Symptômes:**
- Page blanche sur routes spécifiques
- Home fonctionne mais pas /dashboard

**Fichiers à vérifier:**
- `src/components/layouts/PublicLayout.jsx`
- `src/components/layouts/PrivateLayout.jsx`

---

### 5. **CSS qui cache tout**
**Symptômes:**
- Page blanche mais HTML présent dans DevTools

**Test:**
```javascript
// Dans la console navigateur
document.body.style.display = 'block';
document.body.style.opacity = '1';
```

---

## 🚀 ACTIONS IMMÉDIATES

### Étape 1: Console JavaScript
1. Ouvrir http://localhost:3000
2. Appuyer sur **F12**
3. Aller dans l'onglet **Console**
4. Chercher des lignes rouges (erreurs)
5. **ME COPIER LA PREMIÈRE ERREUR ROUGE**

### Étape 2: Network (Réseau)
1. Dans DevTools, onglet **Network**
2. Recharger la page (F5)
3. Vérifier si **main.jsx** charge (200 OK)
4. Vérifier si des fichiers sont en erreur (rouge, 404)

### Étape 3: Elements (HTML)
1. Onglet **Elements** dans DevTools
2. Vérifier si `<div id="root">` est vide ou rempli
3. Si vide → erreur React
4. Si rempli → problème CSS

### Étape 4: Version minimale
Tester avec une version ultra-simple:

```javascript
// Créer test-minimal.html à la racine
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <h1>SI VOUS VOYEZ CECI, LE SERVEUR FONCTIONNE</h1>
  <div id="root"></div>
  <script type="module">
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      React.createElement('div', null, 'React fonctionne!')
    );
  </script>
</body>
</html>
```

Ouvrir: http://localhost:3000/test-minimal.html

---

## 🔧 SOLUTIONS RAPIDES

### Solution 1: Restart propre
```powershell
# Arrêter le serveur (CTRL+C)
npm run dev
```

### Solution 2: Vider cache navigateur
- Chrome: CTRL + SHIFT + DELETE
- Cocher "Images et fichiers en cache"
- Valider

### Solution 3: Mode navigation privée
- CTRL + SHIFT + N (Chrome)
- Ouvrir http://localhost:3000
- Si ça marche → problème de cache

### Solution 4: Vérifier imports
```powershell
# Rechercher imports cassés
npx eslint src --ext .jsx,.js
```

---

## 📋 CHECKLIST DE VÉRIFICATION

- [ ] Console: Pas d'erreur rouge
- [ ] Network: main.jsx charge (200)
- [ ] Elements: `<div id="root">` contient du HTML
- [ ] Cache: Vidé avec CTRL+SHIFT+R
- [ ] Serveur: Tourne sur :3000
- [ ] .env: Variables correctes

---

## 🆘 SI RIEN NE MARCHE

**Me donner ces informations:**

1. **Console errors** (copier-coller la première erreur rouge)
2. **Network tab**: Est-ce que main.jsx charge? (200 ou erreur?)
3. **Elements tab**: Le `<div id="root">` est vide ou rempli?
4. **URL actuelle**: http://localhost:3000 ou autre?
5. **Navigateur**: Chrome, Firefox, Edge?

---

## 🎯 SOLUTION TEMPORAIRE

Si vraiment bloqué, tester avec une page statique:

```powershell
# Créer un test rapide
New-Item -Path "public/test.html" -ItemType File -Force -Value @"
<!DOCTYPE html>
<html><body><h1>TEST OK</h1></body></html>
"@
```

Ouvrir: http://localhost:3000/test.html

Si ça marche → Problème dans le code React
Si ça ne marche pas → Problème serveur Vite

---

**Date:** 3 octobre 2025  
**Statut:** En diagnostic
