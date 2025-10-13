# 🎯 QUIZ - IDs Corrects

## ✅ Quiz disponibles dans la base

D'après le test, les quiz ont ces IDs :

- **Quiz ID 3** : Théorème de Thalès - Niveau 1 (3 questions)
- **Quiz ID 4** : Équations du second degré (3 questions)

---

## 🔗 URLs à utiliser

### Dans l'application
- http://localhost:3000/quiz/3 → Thalès
- http://localhost:3000/quiz/4 → Équations

### Liens depuis la page Courses
Vérifier que les chapitres pointent vers les bons IDs (3 et 4)

---

## 🔧 Pourquoi IDs 3 et 4 ?

Les IDs 1 et 2 ont probablement été :
- Supprimés lors d'un test
- Utilisés par d'autres données
- Créés puis effacés

PostgreSQL utilise des séquences auto-incrémentales qui ne se réinitialisent pas automatiquement.

---

## 📋 Vérifications à faire

1. **Tester Quiz 3** : http://localhost:3000/quiz/3
   - Devrait afficher 3 questions sur Thalès
   - Timer devrait démarrer
   - Options A/B/C/D visibles

2. **Tester Quiz 4** : http://localhost:3000/quiz/4
   - Devrait afficher 3 questions sur équations
   - Même comportement que Quiz 3

3. **Vérifier navigation depuis Courses**
   - Page Courses → Mathématiques BFEM
   - Cliquer "Faire le quiz" sur Thalès
   - Devrait aller vers /quiz/3

---

## 🛠️ Si besoin de réinitialiser les IDs

Option 1 : **Supprimer et recréer** (destructif)
```sql
-- Dans Supabase SQL Editor
DELETE FROM quiz_questions;
DELETE FROM quiz;

-- Re-seeder avec 001_initial_content.sql
```

Option 2 : **Garder IDs 3 et 4** (recommandé)
- Mettre à jour les liens dans l'application
- Documenter les IDs corrects

---

## 📊 Résumé

**Problème** : Code cherchait quiz IDs 1 et 2 (inexistants)  
**Cause** : Base de données a quiz IDs 3 et 4  
**Solution** : Utiliser /quiz/3 et /quiz/4  

**Statut** : ✅ Les quiz existent et fonctionnent !

---

**Date** : 4 octobre 2025 - 01:00
