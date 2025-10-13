# 🧪 Test Rapide : Corrections Responsive Perplexity (2 minutes)

**Date**: 11 octobre 2025  
**Durée totale**: 2 minutes  
**Objectif**: Vérifier que le débordement horizontal est résolu partout

---

## 🎯 Test Unique : Page Coach IA → Recherche Web

### Préparation (10 secondes)
```powershell
# Si serveur pas lancé
npm run dev

# Ouvrir navigateur
http://localhost:3000
```

---

### Étape 1 : Navigation (10 secondes)
1. ✅ Se connecter (si pas déjà connecté)
2. ✅ Cliquer sur **"Coach IA"** dans le menu principal
3. ✅ Cliquer sur l'onglet **"Recherche Web"**

**Vérification visuelle** :
```
✅ Card "Recherche Web Intelligente" visible
✅ Header Perplexity avec icône Globe visible
✅ Input de recherche visible
✅ Pas de scroll horizontal (vérifier barre de scroll navigateur)
```

---

### Étape 2 : Test Mobile (30 secondes)

**Activer Responsive Mode** :
- Chrome/Edge : `F12` → `Ctrl+Shift+M`
- Sélectionner : **iPhone SE (375px)**

**Vérifications** :
```
Mobile Layout (375px)
┌────────────────────┐
│ 🌐 Recherche Web   │  ← Header compact
│ Intelligente       │
├────────────────────┤
│ Input recherche    │  ← Pleine largeur
│ [Rechercher]       │  ← Bouton en dessous
└────────────────────┘
     NO SCROLL X ✅
```

**Checklist** :
- [ ] Pas de scroll horizontal
- [ ] Input prend toute la largeur
- [ ] Bouton "Rechercher" en dessous de l'input
- [ ] Texte "Recherche Avancée" visible

---

### Étape 3 : Faire une Recherche (1 minute)

**Query de test** :
```
Quelles sont les nouvelles épreuves du BAC 2026 au Sénégal ?
```

**Attendre la réponse** (5-10 secondes)

---

### Étape 4 : Vérification Après Réponse (30 secondes)

**Sur Mobile (375px)** :
```
Résultat Affiché
┌────────────────────┐
│ 📤 Lien: dub.co/.. │  ← Tronqué ✅
├────────────────────┤
│ Réponse:           │
│ Le BAC 2026 au     │  ← Wrap ✅
│ Sénégal comprend...│
├────────────────────┤
│ 🔗 Sources (3)     │
│ education.gouv...  │  ← Tronqué ✅
└────────────────────┘
     NO SCROLL X ✅
```

**Checklist Critique** :
- [ ] **Pas de scroll horizontal** (barre de scroll disparue)
- [ ] Réponse wrap sur plusieurs lignes (pas de débordement)
- [ ] URLs des sources tronquées avec "..."
- [ ] Lien court Dub.co tronqué
- [ ] Scroll vertical uniquement (si réponse longue)

---

### Étape 5 : Test Tablet & Desktop (20 secondes)

**Changer résolution** :
- **iPad (768px)** :
  ```
  ✅ Pas de scroll horizontal
  ✅ Input + bouton côte à côte
  ✅ Labels visibles ("Rechercher", "Copier", etc.)
  ```

- **Desktop (1920px)** :
  ```
  ✅ Pas de scroll horizontal
  ✅ Layout expansé
  ✅ URLs sources plus larges mais tronquées si trop longues
  ```

---

## ✅ Résultat Attendu

### Sur TOUTES les résolutions (375px → 1920px)
```
✅ Aucun scroll horizontal
✅ Contenu reste dans le conteneur
✅ URLs tronquées avec ellipsis "..."
✅ Texte wrap correctement
✅ Scroll vertical seulement si nécessaire
```

---

## 🚨 Si Problème Détecté

### Symptôme : Scroll horizontal encore présent

**Diagnostic** :
1. Ouvrir DevTools (F12)
2. Inspecter l'élément qui déborde
3. Vérifier dans Console :
   ```javascript
   document.body.scrollWidth > window.innerWidth
   // Si true → il y a un débordement
   ```

**Solutions** :
- Rafraîchir la page (`Ctrl+R`)
- Vider le cache (`Ctrl+Shift+R`)
- Vérifier que les modifications sont bien compilées :
  ```powershell
  # Voir les logs du serveur
  # Chercher "✓ built in XXms"
  ```

---

### Symptôme : Réponse ne s'affiche pas

**Diagnostic** :
1. Ouvrir DevTools → Onglet Console
2. Chercher erreurs rouges
3. Vérifier Network → Rechercher appel à Perplexity API

**Solutions** :
- Vérifier clé API Perplexity dans `.env`
- Vérifier Edge Function déployée
- Voir logs Supabase Functions

---

## 📊 Comparaison Avant/Après

### AVANT (Débordement)
```
Mobile 375px
┌────────────────────┐
│ Réponse: Longwordthatdoesnotbreakandcausesoverflow >>>
│ Source: https://education.gouv.sn/very/long/url/that/goes/off/screen >>>
└────────────────────┘
     ^^^^^^^^^^^^^^^^^ DÉBORDE = SCROLL HORIZONTAL ❌
```

### APRÈS (Corrigé)
```
Mobile 375px
┌────────────────────┐
│ Réponse: Longword  │
│ thatdoesnotbreak   │
│ andcausesoverflow  │
│ Source:            │
│ education.gouv.s...│
└────────────────────┘
     TOUT CONTENU ✅
```

---

## 🎯 Critère de Succès

**TEST RÉUSSI si** :
```
✅ Aucun scroll horizontal à 375px
✅ Aucun scroll horizontal à 768px
✅ Aucun scroll horizontal à 1920px
✅ Réponse affichée complètement avec wrap
✅ URLs tronquées proprement
✅ Scroll vertical fonctionne
```

**TEST ÉCHOUÉ si** :
```
❌ Barre de scroll horizontal visible
❌ Contenu déborde visuellement
❌ URLs poussent le layout hors écran
❌ Double scrollbar (page + composant)
```

---

## 🔧 Fichiers Modifiés

Pour référence si besoin de vérifier :

1. **PerplexitySearchMode.jsx** (ligne ~199)
   ```jsx
   <div className="flex flex-col h-full min-h-[500px] max-h-[calc(100vh-12rem)]">
   ```

2. **CoachIA.jsx** (lignes ~659, ~674)
   ```jsx
   <Card className="...overflow-hidden">
     <CardContent className="p-0 overflow-hidden">
   ```

3. **CORRECTION_DEBORDEMENT_REPONSES_PERPLEXITY.md** (doc réponses)
4. **CORRECTION_RESPONSIVE_PAGE_COACH_IA.md** (doc page Coach IA)

---

## ⏱️ Timing Recap

```
Préparation        : 10s  (lancer serveur + ouvrir page)
Navigation         : 10s  (aller sur Coach IA → Recherche Web)
Test Mobile        : 30s  (activer responsive, vérifier layout)
Faire recherche    : 60s  (query + attendre réponse)
Vérif après réponse: 30s  (scroll, débordement, troncature)
Test autres tailles: 20s  (tablet + desktop)
─────────────────────────
TOTAL              : 2min 40s
```

---

**Date de test recommandé** : Immédiatement après déploiement  
**Fréquence** : À chaque modification du layout responsive  
**Priorité** : 🔴 Haute (bloquant UX mobile)
