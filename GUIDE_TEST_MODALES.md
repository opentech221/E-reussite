# 🧪 GUIDE DE TEST - MODALES PARTAGE & EXPORT

**Date**: 10 octobre 2025  
**URL**: http://localhost:3000/coach-ia → Onglet "Recherche Web"

---

## 🚀 TESTS À EFFECTUER

### ✅ TEST 1: Modale Partage

1. **Faire une recherche** (ex: "Comment fonctionnent les mitochondries ?")
2. **Cliquer** sur le bouton "Partager" (icône Share2)
3. **Vérifier** que la modale s'ouvre avec animation

#### Actions à tester :

**A. Copie du lien**
- Cliquer sur "Copier"
- Vérifier notification "Lien copié"
- Coller dans un éditeur → Vérifier format `https://dub.sh/xxxxx`

**B. QR Code**
- Cliquer sur "QR Code" pour afficher
- Vérifier génération du QR Code (carré purple)
- Cliquer "Télécharger le QR Code"
- Vérifier téléchargement PNG

**C. Réseaux sociaux**
- Cliquer sur "WhatsApp" → Vérifier popup `wa.me`
- Cliquer sur "Facebook" → Vérifier popup `facebook.com/sharer`
- Cliquer sur "Twitter" → Vérifier popup `twitter.com/intent/tweet`
- Cliquer sur "LinkedIn" → Vérifier popup `linkedin.com/sharing`
- Cliquer sur "Telegram" → Vérifier popup `t.me/share`
- Cliquer sur "Email" → Vérifier ouverture client mail

**D. Code d'intégration**
- Cliquer sur "Code d'intégration" pour afficher
- Vérifier affichage du code `<iframe>`
- Cliquer sur l'icône "Copier" du code
- Vérifier notification "Code copié"

**E. Fermeture**
- Cliquer sur la croix (X) → Modale se ferme
- Cliquer sur le fond sombre → Modale se ferme

---

### ✅ TEST 2: Modale Export

1. **Cliquer** sur le bouton "Exporter" (icône Download)
2. **Vérifier** que la modale s'ouvre avec animation

#### Actions à tester :

**A. Configuration PDF**
- Changer "Qualité" → Standard / Haute
- Changer "Orientation" → Portrait / Paysage
- Changer "Format de page" → A4 / Lettre
- Changer "Taille de police" → Petite / Normale / Grande
- Décocher "Inclure les sources"
- Décocher "Inclure les métadonnées"

**B. Export PDF**
- Cliquer sur le bouton "PDF" (card rouge)
- **Vérifier téléchargement** d'un fichier `.pdf`
- **Ouvrir le PDF** et vérifier :
  - ✅ Header coloré "E-réussite"
  - ✅ Métadonnées (si option activée)
  - ✅ Question complète
  - ✅ Réponse complète
  - ✅ Sources cliquables (si option activée)
  - ✅ Footer sur chaque page
  - ✅ Options respectées (orientation, police)

**C. Export Markdown**
- Cliquer sur le bouton "Markdown" (card bleue)
- **Vérifier téléchargement** d'un fichier `.md`
- **Ouvrir avec éditeur** (VSCode, Notepad++) et vérifier :
  - ✅ Titre en `# `
  - ✅ Métadonnées (`**Date**: ...`)
  - ✅ Section "## Réponse"
  - ✅ Section "## Sources" avec liens `[URL](URL)`

**D. Export TXT**
- Cliquer sur le bouton "Texte brut" (card grise)
- **Vérifier téléchargement** d'un fichier `.txt`
- **Ouvrir avec Notepad** et vérifier :
  - ✅ Question
  - ✅ Séparateurs `===`
  - ✅ Réponse
  - ✅ Sources numérotées

**E. Impression**
- Cliquer sur le bouton "Imprimer" (card purple)
- **Vérifier ouverture** fenêtre d'aperçu
- **Vérifier contenu** :
  - ✅ Header stylisé
  - ✅ Question + Réponse
  - ✅ Sources
- **Fermer** la fenêtre (ou imprimer si vous voulez tester)

---

## ⚠️ ERREURS POTENTIELLES

### Erreur 1: QR Code ne s'affiche pas
**Symptôme** : Zone vide après clic "QR Code"  
**Cause** : Package `qr-code-styling` non installé  
**Solution** :
```bash
npm install qr-code-styling
```

### Erreur 2: Partage réseaux sociaux ne fonctionne pas
**Symptôme** : Popup bloquée  
**Cause** : Bloqueur de popups navigateur  
**Solution** : Autoriser les popups pour localhost:3000

### Erreur 3: PDF vide ou mal formaté
**Symptôme** : PDF téléchargé mais contenu manquant  
**Cause** : `result` null ou données incomplètes  
**Solution** : Faire une recherche complète avant d'exporter

### Erreur 4: Lien court pas créé
**Symptôme** : Modale Partage affiche URL longue  
**Cause** : Edge Function Dub.co non déployée ou erreur API  
**Console** : `❌ [Dub] Erreur création lien`  
**Solution** : Vérifier Edge Function `dub-create-link` déployée

---

## ✅ RÉSULTATS ATTENDUS

### Modale Partage
```
┌─────────────────────────────────────────┐
│ 🌐 Partager la recherche                │
│ Choisissez votre méthode de partage    │
├─────────────────────────────────────────┤
│ 📎 Lien court                           │
│ [https://dub.sh/xxxxx] [Copier ✅]     │
│                                         │
│ QR Code (cliquez pour afficher)        │
│                                         │
│ 🌐 Réseaux sociaux                      │
│ [WhatsApp] [Facebook] [Twitter]        │
│ [LinkedIn] [Telegram] [Email]          │
│                                         │
│ Code d'intégration (pour développeurs) │
└─────────────────────────────────────────┘
```

### Modale Export
```
┌─────────────────────────────────────────┐
│ 📥 Exporter la recherche                │
│ Personnalisez votre export              │
├─────────────────────────────────────────┤
│ ⚙️ Options PDF                          │
│ Qualité: [Haute ▼]                     │
│ Orientation: [Portrait ▼]              │
│ Format: [A4 ▼]                          │
│ Police: [Normale ▼]                     │
│ ☑ Inclure sources                       │
│ ☑ Inclure métadonnées                   │
│                                         │
│ 📦 Formats disponibles                  │
│ [PDF 📄] [Markdown 📝]                  │
│ [TXT 📃] [Imprimer 🖨️]                 │
└─────────────────────────────────────────┘
```

---

## 📊 CHECKLIST COMPLÈTE

### Modale Partage
- [ ] Ouverture modale avec animation
- [ ] Copie lien → Notification
- [ ] QR Code généré
- [ ] QR Code téléchargeable
- [ ] WhatsApp popup
- [ ] Facebook popup
- [ ] Twitter popup
- [ ] LinkedIn popup
- [ ] Telegram popup
- [ ] Email ouvert
- [ ] Code embed affiché
- [ ] Code embed copiable
- [ ] Fermeture croix
- [ ] Fermeture fond

### Modale Export
- [ ] Ouverture modale avec animation
- [ ] Options PDF changeables
- [ ] PDF téléchargé
- [ ] PDF contenu correct
- [ ] Markdown téléchargé
- [ ] Markdown formaté correct
- [ ] TXT téléchargé
- [ ] TXT lisible
- [ ] Impression fenêtre ouverte
- [ ] Impression contenu correct
- [ ] Fermeture modale

### Responsive
- [ ] Mobile (< 768px) : 1 colonne
- [ ] Tablet (768-1024px) : 2 colonnes
- [ ] Desktop (> 1024px) : 3 colonnes
- [ ] Scroll fonctionnel
- [ ] Modales centrées

### Performance
- [ ] Animations fluides (60 fps)
- [ ] QR Code généré en < 1s
- [ ] PDF généré en < 2s
- [ ] Pas de lag UI

---

## 🎉 VALIDATION FINALE

Si tous les tests passent :

```
✅ MODALE PARTAGE : 100% FONCTIONNELLE
✅ MODALE EXPORT  : 100% FONCTIONNELLE
✅ ANIMATIONS     : FLUIDES
✅ RESPONSIVE     : ADAPTATIF
✅ PERFORMANCE    : OPTIMALE

🎉 FONCTIONNALITÉS PRÊTES POUR PRODUCTION !
```

---

**Testez maintenant** : http://localhost:3000/coach-ia → Recherche Web 🚀
