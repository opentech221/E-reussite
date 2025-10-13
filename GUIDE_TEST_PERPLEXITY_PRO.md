# 🧪 GUIDE DE TEST - PERPLEXITY SEARCH PRO

**Date**: 10 octobre 2025  
**Durée estimée**: 15 minutes  
**Prérequis**: App lancée (`npm run dev`)

---

## ✅ TEST 1: Recherche basique (2 min)

### **Étapes**

1. **Ouvrir l'app**
   ```
   http://localhost:3000
   ```

2. **Se connecter** (si pas déjà fait)

3. **Ouvrir Assistant IA**
   - Cliquer sur l'icône 🧠 (en haut à droite)

4. **Activer Mode Recherche**
   - Cliquer sur l'icône 🔍 **Recherche**
   - Le badge **PRO** doit être visible

5. **Poser une question**
   ```
   Programme officiel mathématiques BFEM 2025
   ```

6. **Vérifier le résultat**
   - ✅ Réponse affichée (1-3 secondes)
   - ✅ Section "Sources (X)" avec liens
   - ✅ Modèle utilisé: sonar-pro
   - ✅ Timestamp affiché

### **Résultat attendu**

```
┌─────────────────────────────────────────┐
│ [📋 Copier] [📥 PDF] [🔗 Partager]     │
├─────────────────────────────────────────┤
│ ✨ Réponse                              │
│ Le programme de mathématiques du BFEM...│
├─────────────────────────────────────────┤
│ 🔗 Sources (13)                         │
│ • https://education.gouv.sn/...         │
│ • https://fr.scribd.com/...             │
└─────────────────────────────────────────┘
Recherché avec sonar-pro • 14:35:22
```

---

## 📋 TEST 2: Bouton Copier (1 min)

### **Étapes**

1. **Après avoir reçu une réponse du Test 1**

2. **Cliquer sur 📋 Copier**
   - L'icône doit changer: 📋 → ✅
   - Retour à 📋 après 2 secondes

3. **Ouvrir Notepad**
   ```powershell
   notepad
   ```

4. **Coller le contenu**
   - Ctrl+V

### **Résultat attendu**

```
Le programme de mathématiques du BFEM 2025...

Sources:
1. https://education.gouv.sn/...
2. https://fr.scribd.com/...
3. https://www.youtube.com/...
```

**Validation** :
- ✅ Réponse complète copiée
- ✅ Sources numérotées présentes
- ✅ Format texte lisible

---

## 📥 TEST 3: Export PDF (2 min)

### **Étapes**

1. **Après avoir reçu une réponse**

2. **Cliquer sur 📥 PDF**
   - Fichier `recherche-[timestamp].pdf` se télécharge

3. **Ouvrir le PDF**
   - Double-clic sur le fichier téléchargé

### **Résultat attendu**

**Page 1** :
```
┌─────────────────────────────────────┐
│ Recherche E-réussite                │
│                                     │
│ Question:                           │
│ Programme officiel maths BFEM 2025 │
│                                     │
│ Réponse:                            │
│ Le programme de mathématiques...    │
│ [Texte complet]                     │
│                                     │
│ Sources (13):                       │
│ 1. https://...                      │
│ 2. https://...                      │
│ ...                                 │
│                                     │
│ E-réussite - Page 1/2               │
└─────────────────────────────────────┘
```

**Validation** :
- ✅ Titre "Recherche E-réussite" présent
- ✅ Question affichée
- ✅ Réponse complète
- ✅ Sources numérotées
- ✅ Pagination (Page X/Y)
- ✅ Footer avec date

---

## 🕒 TEST 4: Historique (3 min)

### **Étapes**

1. **Faire 3 recherches différentes**
   ```
   1. "Programme BFEM maths 2025"
   2. "Nouvelles épreuves BAC Sénégal"
   3. "Théorème de Pythagore applications"
   ```

2. **Cliquer sur 🕒 Historique** (en haut à droite)

3. **Vérifier l'affichage**
   - Les 3 recherches doivent apparaître
   - Format: Question + nombre sources + date/heure

4. **Cliquer sur une ancienne recherche**
   - La question doit se recharger dans l'input

### **Résultat attendu**

```
┌─────────────────────────────────────────┐
│ 🕒 Recherches récentes                  │
├─────────────────────────────────────────┤
│ Théorème de Pythagore applications     │
│ 8 sources • 10 oct. 14:35               │
├─────────────────────────────────────────┤
│ Nouvelles épreuves BAC Sénégal         │
│ 12 sources • 10 oct. 14:30              │
├─────────────────────────────────────────┤
│ Programme BFEM maths 2025               │
│ 13 sources • 10 oct. 14:25              │
└─────────────────────────────────────────┘
```

**Validation** :
- ✅ 3 recherches affichées
- ✅ Ordre chronologique (plus récent en haut)
- ✅ Nombre de sources correct
- ✅ Date/heure au format français
- ✅ Click recharge la question

---

## 🔗 TEST 5: Partage Dub.co (2 min)

### **⚠️ Prérequis**
Configuration API key Dub.co requise (voir `CONFIGURATION_DUB_CO.md`)

### **Étapes**

1. **Configurer .env** (si pas déjà fait)
   ```env
   VITE_DUB_API_KEY=dub_xxxxxxxxxxxxxx
   ```

2. **Relancer l'app**
   ```powershell
   npm run dev
   ```

3. **Faire une recherche**
   ```
   "Programme BFEM maths 2025"
   ```

4. **Cliquer sur 🔗 Partager**
   - Attendre 1-2 secondes
   - Un lien court apparaît
   - Le lien est automatiquement copié

5. **Tester le lien**
   - Ouvrir nouvel onglet
   - Coller le lien (Ctrl+V)
   - Vérifier la redirection

### **Résultat attendu**

```
┌─────────────────────────────────────────┐
│ 🔗 Lien de partage:                     │
│ https://dub.sh/ABC123                   │
│ (copié dans le presse-papier)           │
└─────────────────────────────────────────┘
```

**Validation** :
- ✅ Lien court généré (format `dub.sh/xxx`)
- ✅ Copié automatiquement
- ✅ Redirection fonctionne
- ✅ Visible dans Dashboard Dub.co

---

## 🎨 TEST 6: Interface UI (2 min)

### **Éléments à vérifier**

**Header** :
- ✅ Titre "Recherche Avancée"
- ✅ Badge "PRO" (violet/bleu)
- ✅ Bouton "Historique" (🕒)
- ✅ Gradient purple/blue background

**Input** :
- ✅ Placeholder descriptif
- ✅ Bouton "Rechercher" avec icône 🔍
- ✅ Disabled pendant recherche

**Résultats** :
- ✅ 3 boutons actions (Copier, PDF, Partager)
- ✅ Cadre "Réponse" avec icône ✨
- ✅ Cadre "Sources" avec icône 🔗
- ✅ Hover effects sur sources
- ✅ Liens cliquables (ouvrent nouvel onglet)

**Empty State** :
- ✅ Icône Search centrée
- ✅ Titre + description
- ✅ 3 exemples de questions cliquables

---

## 🚀 TEST 7: Performance (3 min)

### **Mesures à prendre**

1. **Ouvrir DevTools**
   - F12 → Onglet **Network**

2. **Faire une recherche**
   - Noter le temps de réponse

3. **Vérifier la requête**
   - Chercher: `perplexity-search`
   - Vérifier Status: **200 OK**
   - Noter la durée (Waiting time)

### **Résultat attendu**

```
Request URL: https://qbvdrkhdjjpuowthwinf.supabase.co/functions/v1/perplexity-search
Status: 200 OK
Time: 1500-3000ms
Size: ~10-50KB
```

**Validation** :
- ✅ Temps < 5 secondes
- ✅ Status 200 (pas 500 ou 404)
- ✅ Pas d'erreur CORS
- ✅ Response contient answer + citations

---

## 🐛 TEST 8: Gestion erreurs (2 min)

### **Test A: Question vide**

1. **Laisser l'input vide**
2. **Cliquer Rechercher**
3. **Vérifier**: Rien ne se passe (bouton disabled ou validation)

### **Test B: Réponse longue (pagination PDF)**

1. **Poser une question complexe**
   ```
   "Explique tous les théorèmes de mathématiques du programme BFEM avec exemples détaillés"
   ```
2. **Export PDF**
3. **Vérifier**: Plusieurs pages générées automatiquement

### **Test C: Pas de connexion (historique localStorage)**

1. **Se déconnecter**
2. **Faire une recherche**
3. **Vérifier historique**
4. **Valider**: Sauvegardé dans localStorage (pas Supabase)

---

## 📊 CHECKLIST COMPLÈTE

### **Fonctionnalités**
- [ ] Recherche basique fonctionne
- [ ] Badge PRO affiché
- [ ] Bouton Copier fonctionne
- [ ] Export PDF génère fichier correct
- [ ] Historique sauvegarde et affiche
- [ ] Partage Dub.co crée lien court (si API key configurée)

### **Interface**
- [ ] Header avec gradient
- [ ] 3 boutons actions visibles
- [ ] Icons Lucide React affichées
- [ ] Hover effects fonctionnent
- [ ] Empty state avec exemples
- [ ] Responsive (mobile/desktop)

### **Performance**
- [ ] Temps réponse < 5s
- [ ] Pas d'erreur CORS
- [ ] Status 200 OK
- [ ] 10-20 sources par réponse

### **Sécurité**
- [ ] RLS policies appliquées
- [ ] Clé API cachée (pas dans frontend)
- [ ] Historique user-specific

---

## 🎓 QUESTIONS DE VALIDATION

### **Question 1: Performance**
**Q**: Combien de sources reçois-tu en moyenne ?  
**Réponse attendue**: 10-20 sources

### **Question 2: Modèle**
**Q**: Quel modèle est affiché sous la réponse ?  
**Réponse attendue**: "sonar-pro"

### **Question 3: Historique**
**Q**: Où est stocké l'historique si tu es connecté ?  
**Réponse attendue**: Supabase table `perplexity_searches`

### **Question 4: PDF**
**Q**: Combien de sections contient le PDF ?  
**Réponse attendue**: 5 (Titre, Question, Réponse, Sources, Footer)

---

## 🎉 RÉSULTAT FINAL

**Si tous les tests passent** :
```
✅ Recherche Perplexity Pro: OPÉRATIONNEL
✅ Bouton Copier: OPÉRATIONNEL
✅ Export PDF: OPÉRATIONNEL
✅ Historique: OPÉRATIONNEL
✅ Interface UI: OPÉRATIONNEL
⏳ Partage Dub.co: EN ATTENTE API KEY

STATUS: 🟢 PRODUCTION READY (5/6 features)
```

**Si des erreurs** :
- Consulter `RECAPITULATIF_COMPLET_10_OCT_2025.md` section Dépannage
- Vérifier console (F12) pour erreurs
- Relancer l'app (`npm run dev`)

---

**Prochaine action**: Commence par le Test 1 maintenant ! 🚀
