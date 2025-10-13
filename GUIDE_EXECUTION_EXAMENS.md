# 🚀 GUIDE D'EXÉCUTION - SYSTÈME D'EXAMENS

## ⚡ ÉTAPES RAPIDES

### 1️⃣ Exécuter la migration SQL

Ouvrez **Supabase SQL Editor** et exécutez :

```sql
-- Copier et exécuter le contenu de :
-- database/migrations/015_exam_system_complete.sql
```

### 2️⃣ Vérifier que tout fonctionne

```sql
-- Vérifier les examens disponibles
SELECT id, title, type, difficulty, duration_minutes 
FROM examens 
ORDER BY created_at DESC;

-- Vérifier la fonction RPC
SELECT add_user_points(
  'b8fe56ad-e6e8-44f8-940f-a9e1d1115097'::uuid,
  100,
  'Test points',
  'test'
);
```

### 3️⃣ Tester dans l'application

1. **Accéder à la liste** : http://localhost:3000/exam
2. **Choisir un examen** et cliquer sur "Commencer"
3. **Répondre aux questions** (le timer démarre automatiquement)
4. **Terminer l'examen** et voir les résultats

---

## 🎯 FONCTIONNALITÉS CLÉS

### Liste des Examens (`/exam`)
- Filtres par niveau, type, difficulté
- Recherche par titre
- Statistiques utilisateur
- Badge "Complété" + score si déjà passé

### Simulation d'Examen (`/exam/:examId`)
- Timer avec décompte
- Questions QCM interactives
- Navigation entre questions
- Auto-soumission si temps écoulé
- Résultats + points gagnés

---

## 🔧 RÉSOLUTION DE PROBLÈMES

### Erreur: "exam_results table does not exist"
→ Exécuter la migration 015

### Erreur: "function add_user_points does not exist"
→ Exécuter la migration 015

### Aucun examen affiché
→ Vérifier que la migration 009 a été exécutée (seed des examens)

### Route "/exam" affiche le Dashboard
→ Déjà corrigé dans App.jsx

---

## ✅ CHECKLIST

- [ ] Migration 015 exécutée
- [ ] Examens visibles dans `/exam`
- [ ] Timer fonctionne
- [ ] Soumission enregistre les résultats
- [ ] Points ajoutés au profil

---

**Tout est prêt !** 🎉
