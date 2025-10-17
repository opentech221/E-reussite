# 🧪 TESTS COACH IA - ROADMAP BFEM/BAC
**Date** : 17 octobre 2025 - Version 2 (après reset)  
**Fichier modifié** : `src/lib/aiPromptBuilder.js`  
**Lignes ajoutées** : ~200 lignes de roadmap structuré

---

## 📋 CONTEXTE

Après un `git reset --hard origin/main` suite à un problème de secrets exposés dans les commits, nous avons réappliqué les modifications validées du roadmap BFEM/BAC dans `aiPromptBuilder.js`.

**Objectif** : Valider que le Coach IA donne des réponses complètes et précises sur la préparation aux examens.

---

## 🎯 QUESTIONS DE TEST (À tester dans /coach-ia)

### **Test 1 : Préparation BFEM**
**Question** : "Comment me préparer efficacement au BFEM ?"

**Critères de validation (Score /10)** :
- ✅ **Mention des 5 phases** (Diagnostic, Apprentissage, Entraînement, Révisions, Sprint) : **3 points**
- ✅ **Timing précis : 13h30/semaine pour BFEM** : **2 points**
- ✅ **3 routines détaillées** (Express, Standard, Intensive) : **2 points**
- ✅ **Répétitions Espacées** (J+1, J+3, J+7, J+14) : **1 point**
- ✅ **Badges prioritaires** (Marathon, Expert, Champion) : **1 point**
- ✅ **Fonctionnalités E-réussite** (examens blancs, coach IA, leaderboard) : **1 point**

**Score attendu** : ≥ 8/10

---

### **Test 2 : Routine quotidienne BAC**
**Question** : "Quelle routine quotidienne adopter pour préparer le BAC ?"

**Critères de validation (Score /10)** :
- ✅ **Routine Standard détaillée** (30min théorie + 45min quiz + 30min analyse + 15min plan) : **3 points**
- ✅ **Timing BAC : 22h30/semaine (2h30/jour)** : **2 points**
- ✅ **Technique Répétitions Espacées** : **2 points**
- ✅ **Fonctionnalités à utiliser** (/historique, Conseils IA, /study-plan) : **2 points**
- ✅ **Badges et motivation** : **1 point**

**Score attendu** : ≥ 8/10

---

### **Test 3 : Système de percentile**
**Question** : "C'est quoi le système de percentile sur E-réussite ?"

**Critères de validation (Score /10)** :
- ✅ **Correction factuelle : "TON PERCENTILE EST AFFICHÉ"** (pas "n'affiche pas") : **4 points**
- ✅ **5 badges de rang** (Bronze, Argent, Or, Platine, Diamant) avec percentiles : **3 points**
- ✅ **Interprétation claire** (ex: Or = Top 50%) : **2 points**
- ✅ **Objectif recommandé** (atteindre Or minimum) : **1 point**

**Score attendu** : ≥ 9/10

---

## 📊 RÉSULTATS ATTENDUS

| Test | Question | Score Cible | Validation |
|------|----------|-------------|------------|
| 1 | Préparation BFEM | ≥ 8/10 | ⏳ À tester |
| 2 | Routine BAC | ≥ 8/10 | ⏳ À tester |
| 3 | Percentile | ≥ 9/10 | ⏳ À tester |
| **MOYENNE** | - | **≥ 8.3/10** | ⏳ À tester |

---

## 🚀 PROCÉDURE DE TEST

1. **Ouvrir** http://localhost:3000/coach-ia
2. **Se connecter** avec un compte test
3. **Onglet Conversations** : Poser chaque question
4. **Analyser la réponse** selon les critères
5. **Noter sur 10** selon la grille
6. **Documenter** les résultats dans ce fichier

---

## 📝 NOTES IMPORTANTES

### ✅ Points validés dans le code
- Roadmap complet intégré lignes 254-450 de `aiPromptBuilder.js`
- 5 phases détaillées avec timing BFEM/BAC
- 3 routines (Express/Standard/Intensive)
- Technique Répétitions Espacées
- Correction percentile ("EST affiché")
- Badges prioritaires
- Fonctionnalités E-réussite par phase

### ⚠️ Points à vérifier
- Pas d'erreur JavaScript dans la console
- Réponses contextualisées selon niveau utilisateur
- Adaptation du roadmap selon `totalPoints`, `averageScore`, `weakSubjects`
- Mentions naturelles des fonctionnalités réelles

### 🎯 Objectif final
**Score moyen ≥ 8.5/10** pour valider que le Coach IA est prêt pour production avec le roadmap intégré.

---

## 📌 HISTORIQUE DES VERSIONS

### Version 1 (17 oct - 19h43)
- ✅ Roadmap intégré dans `aiPromptBuilder.js`
- ✅ Tests validés : 9.8/10 de moyenne
- ❌ Commit avec secrets exposés → Annulé

### Version 2 (17 oct - 20h30+)
- ✅ Reset vers `origin/main` propre
- ✅ Roadmap réappliqué sans secrets
- ⏳ Tests à refaire pour validation finale

---

**🔄 Prochaine étape** : Tester les 3 questions et remplir la section résultats ci-dessous.

---

## 📋 RÉSULTATS DES TESTS (À COMPLÉTER)

### Test 1 : Préparation BFEM
**Date du test** : _____  
**Réponse obtenue** :
```
[Copier-coller la réponse complète du Coach IA ici]
```

**Évaluation** :
- [ ] Mention des 5 phases (3 pts) : __/3
- [ ] Timing 13h30/semaine (2 pts) : __/2
- [ ] 3 routines détaillées (2 pts) : __/2
- [ ] Répétitions Espacées (1 pt) : __/1
- [ ] Badges prioritaires (1 pt) : __/1
- [ ] Fonctionnalités E-réussite (1 pt) : __/1

**Score total** : __/10

---

### Test 2 : Routine BAC
**Date du test** : _____  
**Réponse obtenue** :
```
[Copier-coller la réponse complète du Coach IA ici]
```

**Évaluation** :
- [ ] Routine Standard détaillée (3 pts) : __/3
- [ ] Timing 22h30/semaine (2 pts) : __/2
- [ ] Répétitions Espacées (2 pts) : __/2
- [ ] Fonctionnalités à utiliser (2 pts) : __/2
- [ ] Badges et motivation (1 pt) : __/1

**Score total** : __/10

---

### Test 3 : Percentile
**Date du test** : _____  
**Réponse obtenue** :
```
[Copier-coller la réponse complète du Coach IA ici]
```

**Évaluation** :
- [ ] Correction factuelle (4 pts) : __/4
- [ ] 5 badges de rang (3 pts) : __/3
- [ ] Interprétation claire (2 pts) : __/2
- [ ] Objectif recommandé (1 pt) : __/1

**Score total** : __/10

---

### 🎯 SCORE FINAL
**Moyenne des 3 tests** : __/10

**Validation** :
- [ ] ✅ Score ≥ 8.5/10 → Prêt pour commit
- [ ] ⚠️ Score 7-8.5/10 → Ajustements mineurs
- [ ] ❌ Score < 7/10 → Révision majeure nécessaire

---

## 🔗 FICHIERS LIÉS
- `src/lib/aiPromptBuilder.js` : Fichier principal modifié
- `src/hooks/useAIConversation.js` : Hook utilisant le prompt builder
- `src/pages/CoachIA.jsx` : Interface du Coach IA
- `ROADMAP_PREPARATION_EXAMENS.md` : Document source de référence
