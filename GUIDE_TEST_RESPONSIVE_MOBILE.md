# 🧪 GUIDE TEST RAPIDE - RESPONSIVE MOBILE

**Durée**: 5 minutes  
**Objectif**: Vérifier que les modales Perplexity et Dub sont responsive sur mobile

---

## ✅ PRÉ-REQUIS

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Ouvrir dans le navigateur
http://localhost:3000
```

---

## 📱 TEST 1: ShareModal (Modale Partage) - 2 min

### Étapes

1. **Ouvrir** la page Coach IA (`/coach-ia`)
2. **Cliquer** sur l'onglet "Recherche Web" (2ème onglet)
3. **Faire** une recherche (ex: "Programme BFEM maths")
4. **Cliquer** sur le bouton "Partager" 📤
5. **Ouvrir** DevTools (F12)
6. **Activer** le mode responsive (Ctrl+Shift+M)
7. **Tester** les largeurs suivantes:

#### 📏 Mobile (375px - iPhone SE)
```
✅ Modale occupe 95% de la largeur
✅ Header avec titre "Partager" visible
✅ Input lien + Bouton "Copier" en colonne (stack vertical)
✅ Grid réseaux sociaux: 2 colonnes
✅ Boutons réseaux: icône + texte visible
✅ Pas de scroll horizontal
✅ QR Code (si affiché) adapté à la largeur
```

#### 📱 Tablet (768px - iPad)
```
✅ Modale largeur optimale (max-w-xl)
✅ Input + Bouton sur même ligne
✅ Grid réseaux: 3 colonnes
✅ Padding augmenté (sm:p-6)
```

#### 💻 Desktop (1920px)
```
✅ Modale centrée avec max-w-2xl
✅ Tous éléments bien espacés
✅ Grid 3 colonnes stable
```

---

## 📤 TEST 2: ExportModal (Modale Export) - 2 min

### Étapes

1. **Même recherche** que Test 1
2. **Cliquer** sur "Exporter" 📥
3. **Tester** responsive:

#### 📏 Mobile (375px)
```
✅ Modale 95vw
✅ Header "Exporter" tronqué si nécessaire
✅ Options PDF: 1 colonne (select full width)
✅ Boutons formats: 1 colonne (PDF, Markdown, TXT, Imprimer)
✅ Icônes + texte visibles
✅ Pas de débordement
```

#### 📱 Tablet (768px)
```
✅ Options PDF: 2 colonnes
✅ Boutons formats: 2 colonnes
✅ Labels "Format universel" visibles
```

#### 💻 Desktop (1920px)
```
✅ Modale max-w-3xl
✅ Layout optimal
✅ Tous textes secondaires visibles
```

---

## 🔍 TEST 3: PerplexitySearchMode (Interface recherche) - 1 min

### Étapes

1. **Ouvrir** Coach IA > Recherche Web
2. **Vérifier** interface sans résultat (empty state):

#### 📏 Mobile (375px)
```
✅ Header compact: icône + "Recherche Avancée" + badge PRO
✅ Texte descriptif court: "Recherche web avec sources vérifiées 📚"
✅ Input recherche full width
✅ Bouton "Rechercher" full width en dessous (stack vertical)
✅ Placeholder court: "Ex: Programme maths BFEM 2026"
✅ Exemples de questions: 3 cartes empilées
✅ Texte exemples raccourci
```

3. **Faire** une recherche et vérifier résultats:

```
✅ Actions bar (Copier, Exporter, Partager): flex-wrap avec icônes seules
✅ Textes boutons cachés sur mobile, visibles sur sm+
✅ Réponse: padding réduit (p-3), texte lisible
✅ Citations: 
   - Liens tronqués avec ellipsis
   - Padding adapté
   - Icônes flex-shrink-0
```

#### 📱 Tablet (768px)
```
✅ Input + Bouton sur même ligne
✅ Texte descriptif long visible
✅ Boutons avec texte: "Copier", "Exporter", "Partager"
✅ Padding normal
```

---

## 🎯 CHECKLIST GLOBALE

### Aucun débordement horizontal
```bash
# Vérifier dans DevTools Console:
document.body.scrollWidth > window.innerWidth
# Doit retourner: false
```

### Tailles d'écran testées
- [ ] 375px (iPhone SE) ✅
- [ ] 414px (iPhone Pro Max) ✅
- [ ] 768px (iPad) ✅
- [ ] 1024px (iPad Pro) ✅
- [ ] 1920px (Desktop) ✅

### Fonctionnalités mobiles
- [ ] Modales s'ouvrent correctement
- [ ] Boutons tapables (min 44x44px)
- [ ] Texte lisible (≥ 12px)
- [ ] Scroll vertical fonctionne
- [ ] Animations fluides
- [ ] QR Code responsive

---

## 🐛 PROBLÈMES POTENTIELS

### Si scroll horizontal apparaît:
```bash
# Dans DevTools Console, trouver l'élément responsable:
document.querySelectorAll('*').forEach(el => {
  if (el.scrollWidth > el.clientWidth) {
    console.log('Débordement:', el);
  }
});
```

### Si modale trop large:
- Vérifier: `max-w-[95vw]` appliqué sur mobile
- Vérifier: `p-2` au lieu de `p-4` sur mobile

### Si texte coupé:
- Ajouter: `truncate` ou `break-all`
- Vérifier: `min-w-0` sur conteneur flex

### Si grid déborde:
- Vérifier: `grid-cols-1` sur mobile
- Utiliser: `sm:grid-cols-2` pour tablet+

---

## ✅ RÉSULTAT ATTENDU

Après ces 3 tests (5 min), vous devez constater:

1. ✅ **Aucun scroll horizontal** sur aucune largeur d'écran
2. ✅ **Modales adaptées** à tous les écrans (mobile → desktop)
3. ✅ **Textes lisibles** avec tailles progressives
4. ✅ **Boutons tapables** et bien espacés sur mobile
5. ✅ **Layout cohérent** avec le reste de l'application (Dashboard, Quiz)
6. ✅ **Performance fluide** sur mobile (60fps)

---

## 📞 SI PROBLÈME PERSISTE

1. **Vider le cache** du navigateur (Ctrl+Shift+Del)
2. **Redémarrer** le serveur de développement
3. **Vérifier** les fichiers modifiés:
   - `src/components/ShareModal.jsx`
   - `src/components/ExportModal.jsx`
   - `src/components/PerplexitySearchMode.jsx`

---

**Test réussi ?** 🎉 Vos modales sont maintenant parfaitement responsive Mobile First !
